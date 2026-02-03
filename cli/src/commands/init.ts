import * as p from "@clack/prompts";
import pc from "picocolors";
import fs from "fs";
import path from "path";
import { isAuthenticated } from "../utils/config.js";
import { apiRequest } from "../utils/api.js";
import type { CraftCodeConfig } from "../types/index.js";
import * as os from "os";

interface InitOptions {
  challenge: string;
  noScaffold?: boolean;
}

export async function init(options: InitOptions): Promise<void> {
  p.intro(pc.bgBlue(pc.black(" CraftCode Init ")));

  if (!isAuthenticated()) {
    p.log.error("Not logged in. Run `craftcode login` first.");
    process.exit(1);
  }

  const { challenge, noScaffold } = options;

  if (!challenge) {
    p.log.error("Challenge slug is required. Use --challenge <slug>");
    process.exit(1);
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

  // Fetch config from server
  const scaffoldParam = noScaffold ? "?scaffold=false" : "";
  const endpoint = `/api/cli/challenge/${encodeURIComponent(challenge)}/config${scaffoldParam}`;

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
      const filePath = path.join(process.cwd(), file.path);
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
