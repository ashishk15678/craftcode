import { spawn } from "child_process";
import { glob } from "glob";
import type { EnvironmentConfig, CompileResult } from "../types/index.js";
import { Compiler } from "./index.js";

/**
 * Python Compiler implementation
 */
export class PyCompiler implements Compiler {
  private config: EnvironmentConfig;
  private workDir: string;

  constructor(config: EnvironmentConfig, workDir: string = process.cwd()) {
    this.config = config;
    this.workDir = workDir;
  }

  async compile(): Promise<CompileResult> {
    const startTime = Date.now();
    const compiler = this.config.compiler || "python3";
    const sourcePatterns = "*.py";
    let sourceFiles: string[] = [];

    for (const pattern of sourcePatterns) {
      const matches = await glob(pattern, { cwd: this.workDir });
      sourceFiles.push(...matches);
    }

    if (sourceFiles.length === 0) {
      return {
        success: false,
        output: "",
        errors: `No source files found matching patterns: ${sourcePatterns}`,
        duration: Date.now() - startTime,
      };
    }
    const args: string[] = [];

    if (this.config.compilerFlags) {
      args.push(...this.config.compilerFlags);
    }
    args.push(...sourceFiles);

    if (this.config.linkerFlags) {
      args.push(...this.config.linkerFlags);
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
          errors: `Failed to run interpreter: ${err.message}`,
          duration: Date.now() - startTime,
        });
      });

      child.on("close", (code) => {
        const duration = Date.now() - startTime;

        if (code === 0) {
          resolve({
            success: true,
            output:
              stdout ||
              `Interpreted ${sourceFiles.length} file(s) successfully`,
            duration,
          });
        } else {
          resolve({
            success: false,
            output: stdout,
            errors: stderr || `Interpreter exited with code ${code}`,
            duration,
          });
        }
      });
    });
  }
  getOutputPath(): string | undefined {
    return undefined;
  }
}
