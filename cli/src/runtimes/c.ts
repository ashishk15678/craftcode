// C/C++ Runtime implementation
import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import { glob } from "glob";
import { Runtime, type RuntimeResult } from "./base.js";
import type { EnvironmentConfig } from "../types/index.js";

/**
 * C/C++ Runtime - handles compilation with gcc/g++
 */
export class CRuntime extends Runtime {
  constructor(config: EnvironmentConfig, workDir: string = process.cwd()) {
    super(config, workDir);
  }

  needsCompilation(): boolean {
    return true;
  }

  async prepare(): Promise<RuntimeResult> {
    const startTime = Date.now();

    // Determine compiler
    const compiler =
      this.config.compiler || (this.config.name === "cpp" ? "g++" : "gcc");

    // Find source files
    const sourcePatterns =
      this.config.sourceFiles ||
      (this.config.name === "cpp" ? ["*.cpp", "*.cc"] : ["*.c"]);
    let sourceFiles: string[] = [];

    for (const pattern of sourcePatterns) {
      const matches = await glob(pattern, { cwd: this.workDir });
      sourceFiles.push(...matches);
    }

    if (sourceFiles.length === 0) {
      return {
        success: false,
        output: "",
        errors: `No source files found matching patterns: ${sourcePatterns.join(", ")}`,
        duration: Date.now() - startTime,
      };
    }

    // Build command arguments
    const args: string[] = [];

    // Compiler flags
    if (this.config.compilerFlags) {
      args.push(...this.config.compilerFlags);
    }

    // Source files
    args.push(...sourceFiles);

    // Linker flags
    if (this.config.linkerFlags) {
      args.push(...this.config.linkerFlags);
    }

    // Output path
    const outputPath = this.getExecutablePath();
    args.push("-o", outputPath);

    // Ensure output directory exists
    const outputDir = path.dirname(outputPath);
    if (outputDir && outputDir !== "." && !fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    return new Promise((resolve) => {
      let stdout = "";
      let stderr = "";

      const child = spawn(compiler, args, {
        cwd: this.workDir,
        shell: false,
      });

      child.stdout.on("data", (data) => {
        stdout += data.toString();
      });

      child.stderr.on("data", (data) => {
        stderr += data.toString();
      });

      child.on("error", (err) => {
        resolve({
          success: false,
          output: stdout,
          errors: `Failed to run compiler: ${err.message}`,
          duration: Date.now() - startTime,
        });
      });

      child.on("close", (code) => {
        const duration = Date.now() - startTime;

        if (code === 0) {
          resolve({
            success: true,
            output:
              stdout || `Compiled ${sourceFiles.length} file(s) successfully`,
            duration,
          });
        } else {
          resolve({
            success: false,
            output: stdout,
            errors: stderr || `Compiler exited with code ${code}`,
            duration,
          });
        }
      });
    });
  }

  getExecutablePath(): string {
    if (this.config.outputBinary) {
      return path.join(this.workDir, this.config.outputBinary);
    }
    return path.join(this.workDir, "solution");
  }
}
