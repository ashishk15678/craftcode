import { spawn, type ChildProcess } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";
import { validateScriptContent } from "./security.js";

export interface RunResult {
  exitCode: number;
  success: boolean;
}

/**
 * Execute a bash script and stream output to terminal
 * SECURITY: Validates script content before execution
 */
export async function runScript(script: string): Promise<RunResult> {
  // Security: Validate script content before execution
  const validation = validateScriptContent(script);
  if (!validation.valid) {
    console.error(`Security error: ${validation.reason}`);
    return { exitCode: 1, success: false };
  }

  // Create temporary file
  const tempDir = os.tmpdir();
  const tempFile = path.join(tempDir, `craftcode-test-${Date.now()}.sh`);

  try {
    // Write script to temp file
    fs.writeFileSync(tempFile, script, { mode: 0o755 });

    return new Promise((resolve) => {
      const child: ChildProcess = spawn("bash", [tempFile], {
        stdio: "inherit",
        cwd: process.cwd(),
        // Security: Do not use shell - run bash directly
      });

      child.on("error", (err) => {
        console.error("Failed to run script:", err.message);
        resolve({ exitCode: 1, success: false });
      });

      child.on("close", (code) => {
        resolve({
          exitCode: code ?? 1,
          success: code === 0,
        });
      });
    });
  } finally {
    // Cleanup temp file
    try {
      if (fs.existsSync(tempFile)) {
        fs.unlinkSync(tempFile);
      }
    } catch {
      // Ignore cleanup errors
    }
  }
}

/**
 * Run a script from a URL
 * SECURITY: Validates script content before execution
 */
export async function runScriptFromUrl(url: string): Promise<RunResult> {
  // Security: Validate URL format
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
    // Only allow HTTPS for remote scripts
    if (parsedUrl.protocol !== "https:") {
      console.error("Security error: Only HTTPS URLs are allowed for scripts");
      return { exitCode: 1, success: false };
    }
  } catch {
    console.error("Security error: Invalid URL format");
    return { exitCode: 1, success: false };
  }

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch script: ${response.status}`);
  }

  const script = await response.text();
  return runScript(script);
}
