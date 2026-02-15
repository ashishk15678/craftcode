import * as p from "@clack/prompts";
import pc from "picocolors";
import fs from "fs";
import path from "path";
import { isAuthenticated } from "../utils/config.js";
import { apiRequest } from "../utils/api.js";
import type { CraftCodeConfig } from "../types/index.js";
import * as os from "os";

// Supported programming languages
const SUPPORTED_LANGUAGES = [
  { value: "c", label: "C" },
  { value: "cpp", label: "C++" },
  { value: "node", label: "Node.js / JavaScript" },
  { value: "python", label: "Python" },
  { value: "rust", label: "Rust" },
  { value: "go", label: "Go" },
  { value: "bash", label: "Bash" },
] as const;

interface InitOptions {
  challenge: string;
  language?: string;
  noScaffold?: boolean;
}

/**
 * Validate a file path is safe (no path traversal attacks)
 */
function isPathSafe(filePath: string): boolean {
  if (!filePath || typeof filePath !== "string") return false;
  
  // Normalize path separators
  const normalized = path.normalize(filePath).replace(/\\/g, "/");
  
  // Reject: absolute paths, parent directory refs, excessively long paths
  if (path.isAbsolute(normalized)) return false;
  if (normalized.startsWith("..") || normalized.includes("/../") || normalized.endsWith("/..")) return false;
  if (normalized.length > 256) return false;
  
  // Reject paths to sensitive locations
  const dangerous = ["/etc/", "/usr/", "/bin/", "/var/", "/.ssh/", "/.git/"];
  if (dangerous.some((d) => normalized.includes(d))) return false;
  
  return true;
}

export async function init(options: InitOptions): Promise<void> {
  p.intro(pc.bgBlue(pc.black(" CraftCode Init ")));

  if (!isAuthenticated()) {
    p.log.error("Not logged in. Run `craftcode login` first.");
    process.exit(1);
  }

  const { challenge, noScaffold } = options;
  let { language } = options;

  if (!challenge) {
    p.log.error("Challenge slug is required. Use --challenge <slug>");
    process.exit(1);
  }

  // Validate or prompt for language
  if (language) {
    const validLang = SUPPORTED_LANGUAGES.find(
      (l) => l.value === language?.toLowerCase()
    );
    if (!validLang) {
      p.log.error(
        `Invalid language "${language}". Supported: ${SUPPORTED_LANGUAGES.map((l) => l.value).join(", ")}`
      );
      process.exit(1);
    }
    language = validLang.value;
  } else {
    // Interactive language selection
    const selectedLang = await p.select({
      message: "Select programming language:",
      options: SUPPORTED_LANGUAGES.map((l) => ({
        value: l.value,
        label: l.label,
      })),
    });

    if (p.isCancel(selectedLang)) {
      p.cancel("Initialization cancelled");
      process.exit(0);
    }

    language = selectedLang as string;
  }

  // Check if craftcode.json already exists
  const configPath = path.join(process.cwd(), "craftcode.json");
  if (fs.existsSync(configPath)) {
    const overwrite = await p.confirm({
      message: "craftcode.json already exists. Overwrite?",
      initialValue: false,
    });

    if (p.isCancel(overwrite) || !overwrite) {
      p.cancel("Initialization cancelled");
      process.exit(0);
    }
  }

  const spinner = p.spinner();
  spinner.start("Fetching challenge configuration...");

  // Build query parameters safely
  const params = new URLSearchParams();
  if (language) params.set("language", language);
  if (noScaffold) params.set("scaffold", "false");
  
  const queryString = params.toString();
  const endpoint = `/api/cli/challenge/${encodeURIComponent(challenge)}/config${queryString ? `?${queryString}` : ""}`;

  const response = await apiRequest<CraftCodeConfig>(endpoint);

  if (!response.ok) {
    spinner.stop("Failed to fetch configuration");
    p.log.error(response.error || "Failed to fetch challenge configuration");
    process.exit(1);
  }

  const config = response.data!;
  const platform = process.platform;

  // windows
  if (platform === "win32") {
    p.log.info("Windows detected");
    const isWSL = () => {
      if (process.platform !== "linux") return false;
      return os.release().toLowerCase().includes("microsoft");
    };

    if (isWSL()) {
      p.log.info("Using wsl , wsl detected");
      config.environment.type = "wsl";
    } else {
      p.log.info("Wsl not detected, falling back to git (msys)");
      config.environment.type = "msys";
    }
  } else if (platform === "darwin") {
    p.log.info("Mac detected , using zsh");
    config.environment.type = "mac";
  } else if (platform === "linux") {
    p.log.info("Linux detected , using bash");
    config.environment.type = "bash";
  }
  spinner.stop("Configuration fetched!");

  // Write config file
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  p.log.success("Created craftcode.json");

  // Create scaffold files if provided
  if (config.scaffold?.files && config.scaffold.files.length > 0) {
    p.log.info("");
    p.log.step("Creating scaffold files...");

    for (const file of config.scaffold.files) {
      // Security: Validate file path before creating
      if (!isPathSafe(file.path)) {
        p.log.warning(`Skipped unsafe path: ${file.path}`);
        continue;
      }

      const filePath = path.join(process.cwd(), file.path);
      
      // Double-check the resolved path is still within cwd
      const resolvedPath = path.resolve(filePath);
      const cwd = process.cwd();
      if (!resolvedPath.startsWith(cwd + path.sep) && resolvedPath !== cwd) {
        p.log.warning(`Skipped path outside project: ${file.path}`);
        continue;
      }

      const fileDir = path.dirname(filePath);

      // Create directory if needed
      if (!fs.existsSync(fileDir)) {
        fs.mkdirSync(fileDir, { recursive: true });
      }

      // Check if file exists
      if (fs.existsSync(filePath)) {
        const overwrite = await p.confirm({
          message: `${file.path} already exists. Overwrite?`,
          initialValue: false,
        });

        if (p.isCancel(overwrite) || !overwrite) {
          p.log.warning(`Skipped ${file.path}`);
          continue;
        }
      }

      fs.writeFileSync(filePath, file.content);
      p.log.success(`Created ${file.path}`);
    }
  }

  // Display challenge info
  p.log.info("");
  p.note(
    `Challenge: ${pc.cyan(config.challenge.title)}\n` +
      `Lesson ${config.challenge.lessonOrder}: ${config.challenge.lessonTitle}\n` +
      `Environment: ${pc.yellow(config.environment.type.toUpperCase())}`,
    "Challenge Info",
  );

  // Display build command
  p.log.info("");
  p.log.info(`Build command: ${pc.dim(config.build.command)}`);

  // Next steps
  p.log.info("");
  p.log.step("Next steps:");
  p.log.info("  1. Write your solution code");
  p.log.info(`  2. Run ${pc.cyan("craftcode test")} to run tests`);

  p.outro("Happy coding! 🚀");
}
