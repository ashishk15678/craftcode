import { spawn } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";
/**
 * Execute a bash script and stream output to terminal
 */
export async function runScript(script) {
    // Create temporary file
    const tempDir = os.tmpdir();
    const tempFile = path.join(tempDir, `craftcode-test-${Date.now()}.sh`);
    try {
        // Write script to temp file
        fs.writeFileSync(tempFile, script, { mode: 0o755 });
        return new Promise((resolve) => {
            const child = spawn("bash", [tempFile], {
                stdio: "inherit",
                cwd: process.cwd(),
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
    }
    finally {
        // Cleanup temp file
        try {
            if (fs.existsSync(tempFile)) {
                fs.unlinkSync(tempFile);
            }
        }
        catch {
            // Ignore cleanup errors
        }
    }
}
/**
 * Run a script from a URL
 */
export async function runScriptFromUrl(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch script: ${response.status}`);
    }
    const script = await response.text();
    return runScript(script);
}
