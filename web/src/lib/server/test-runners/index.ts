// Test Runner Abstraction Layer
import type { TestRunnerType } from "@prisma/client";
import { executeCode, LANGUAGE_IDS } from "../judge0";

export interface TestRunnerConfig {
  type: TestRunnerType;
  script?: string;
  scriptUrl?: string;
  timeout?: number;
  language?: string; // For Judge0 runner
  expectedOutput?: string; // For I/O matching with Judge0
}

export interface TestResult {
  success: boolean;
  output: string;
  error?: string;
  duration: number;
  memory?: number; // KB
  executionTime?: string; // seconds
}

export abstract class TestRunner {
  protected config: TestRunnerConfig;

  constructor(config: TestRunnerConfig) {
    this.config = config;
  }

  abstract execute(
    workingDir: string,
    userCode: string,
    stdin?: string,
  ): Promise<TestResult>;
}

// Bash Test Runner (existing behavior)
export class BashTestRunner extends TestRunner {
  async execute(workingDir: string, userCode: string): Promise<TestResult> {
    const startTime = Date.now();

    try {
      const { exec } = await import("child_process");
      const { promisify } = await import("util");
      const execAsync = promisify(exec);

      const script = this.config.script || "";
      const { stdout, stderr } = await execAsync(script, {
        cwd: workingDir,
        timeout: this.config.timeout || 30000,
      });

      return {
        success: !stderr,
        output: stdout,
        error: stderr || undefined,
        duration: Date.now() - startTime,
      };
    } catch (error: any) {
      return {
        success: false,
        output: "",
        error: error.message,
        duration: Date.now() - startTime,
      };
    }
  }
}

// Node.js Test Runner (Jest/Mocha)
export class NodeTestRunner extends TestRunner {
  async execute(workingDir: string, userCode: string): Promise<TestResult> {
    const startTime = Date.now();

    try {
      const { exec } = await import("child_process");
      const { promisify } = await import("util");
      const execAsync = promisify(exec);

      // Run npm test or the provided script
      const command = this.config.script || "npm test";
      const { stdout, stderr } = await execAsync(command, {
        cwd: workingDir,
        timeout: this.config.timeout || 60000,
      });

      // Check if tests passed (look for common success indicators)
      const success = stdout.includes("PASS") || stdout.includes("passing");

      return {
        success,
        output: stdout,
        error: stderr || undefined,
        duration: Date.now() - startTime,
      };
    } catch (error: any) {
      return {
        success: false,
        output: error.stdout || "",
        error: error.message,
        duration: Date.now() - startTime,
      };
    }
  }
}

// Python Test Runner (pytest)
export class PythonTestRunner extends TestRunner {
  async execute(workingDir: string, userCode: string): Promise<TestResult> {
    const startTime = Date.now();

    try {
      const { exec } = await import("child_process");
      const { promisify } = await import("util");
      const execAsync = promisify(exec);

      const command = this.config.script || "pytest";
      const { stdout, stderr } = await execAsync(command, {
        cwd: workingDir,
        timeout: this.config.timeout || 60000,
      });

      const success = !stdout.includes("FAILED") && !stdout.includes("ERROR");

      return {
        success,
        output: stdout,
        error: stderr || undefined,
        duration: Date.now() - startTime,
      };
    } catch (error: any) {
      return {
        success: false,
        output: error.stdout || "",
        error: error.message,
        duration: Date.now() - startTime,
      };
    }
  }
}

// I/O Matching Test Runner (for competitive programming)
export class IOMatchingTestRunner extends TestRunner {
  async execute(workingDir: string, userCode: string): Promise<TestResult> {
    const startTime = Date.now();

    try {
      const { spawn } = await import("child_process");
      const fs = await import("fs/promises");
      const path = await import("path");

      // Read test cases from input/output files
      const testCasesDir = path.join(workingDir, "test_cases");
      const files = await fs.readdir(testCasesDir);
      const inputFiles = files.filter((f) => f.endsWith(".in")).sort();

      let allPassed = true;
      let output = "";

      for (const inputFile of inputFiles) {
        const baseName = inputFile.replace(".in", "");
        const outputFile = `${baseName}.out`;

        const input = await fs.readFile(
          path.join(testCasesDir, inputFile),
          "utf-8",
        );
        const expectedOutput = await fs.readFile(
          path.join(testCasesDir, outputFile),
          "utf-8",
        );

        // Execute user's solution with input using spawn for stdin support
        const command = this.config.script || "./solution";
        const [cmd, ...args] = command.split(" ");

        const result = await new Promise<{ stdout: string; stderr: string }>(
          (resolve, reject) => {
            const child = spawn(cmd, args, {
              cwd: workingDir,
              timeout: this.config.timeout || 5000,
            });

            let stdout = "";
            let stderr = "";

            child.stdout.on("data", (data) => {
              stdout += data.toString();
            });

            child.stderr.on("data", (data) => {
              stderr += data.toString();
            });

            child.on("close", (code) => {
              resolve({ stdout, stderr });
            });

            child.on("error", (error) => {
              reject(error);
            });

            // Write input to stdin
            child.stdin.write(input);
            child.stdin.end();
          },
        );

        const passed = result.stdout.trim() === expectedOutput.trim();
        allPassed = allPassed && passed;

        output += `Test ${baseName}: ${passed ? "PASS" : "FAIL"}\n`;
        if (!passed) {
          output += `  Expected: ${expectedOutput.trim()}\n`;
          output += `  Got: ${result.stdout.trim()}\n`;
        }
      }

      return {
        success: allPassed,
        output,
        duration: Date.now() - startTime,
      };
    } catch (error: any) {
      return {
        success: false,
        output: "",
        error: error.message,
        duration: Date.now() - startTime,
      };
    }
  }
}

// CSS Test Runner (client-side image comparison)
export class CSSTestRunner extends TestRunner {
  async execute(workingDir: string, userCode: string): Promise<TestResult> {
    const startTime = Date.now();

    // CSS tests are validated client-side by comparing rendered output to target image
    // The server receives the match percentage from the client and validates it
    // This is a placeholder that returns success - actual validation happens in the API endpoint
    return {
      success: true,
      output: "CSS validation is performed client-side",
      duration: Date.now() - startTime,
    };
  }
}

// Judge0 Test Runner (online code execution)
export class Judge0TestRunner extends TestRunner {
  async execute(
    workingDir: string,
    userCode: string,
    stdin?: string,
  ): Promise<TestResult> {
    const startTime = Date.now();

    try {
      // Determine language from config or try to detect from code
      const language = this.config.language || this.detectLanguage(userCode);
      const languageId = LANGUAGE_IDS[language.toLowerCase()];

      if (!languageId) {
        return {
          success: false,
          output: "",
          error: `Unsupported language: ${language}. Supported: ${Object.keys(LANGUAGE_IDS).join(", ")}`,
          duration: Date.now() - startTime,
        };
      }

      console.log("[Judge0TestRunner] Executing:", {
        language,
        languageId,
        codeLength: userCode.length,
      });

      const result = await executeCode({
        sourceCode: userCode,
        languageId,
        stdin: stdin || "",
        cpuTimeLimit: Math.ceil((this.config.timeout || 10000) / 1000),
      });

      // Check if expected output is specified (I/O matching mode)
      let success = result.status?.id === 3; // Accepted
      let output = result.stdout || "";

      if (success && this.config.expectedOutput) {
        const expected = this.config.expectedOutput.trim();
        const actual = output.trim();
        success = expected === actual;

        if (!success) {
          output = `Expected Output:\n${expected}\n\nActual Output:\n${actual}`;
        }
      }

      // Handle compilation errors
      if (result.compileOutput) {
        return {
          success: false,
          output: "",
          error: `Compilation Error:\n${result.compileOutput}`,
          duration: Date.now() - startTime,
          executionTime: result.time || undefined,
          memory: result.memory || undefined,
        };
      }

      // Handle runtime errors
      if (result.stderr && result.status?.id !== 3) {
        return {
          success: false,
          output: output,
          error: result.stderr,
          duration: Date.now() - startTime,
          executionTime: result.time || undefined,
          memory: result.memory || undefined,
        };
      }

      return {
        success,
        output,
        error: result.stderr || result.message || undefined,
        duration: Date.now() - startTime,
        executionTime: result.time || undefined,
        memory: result.memory || undefined,
      };
    } catch (error: any) {
      console.error("[Judge0TestRunner] Error:", error);
      return {
        success: false,
        output: "",
        error: error.message,
        duration: Date.now() - startTime,
      };
    }
  }

  private detectLanguage(code: string): string {
    // Simple heuristics to detect language from code
    if (
      code.includes("#include") &&
      (code.includes("int main") || code.includes("void main"))
    ) {
      return code.includes("iostream") ||
        code.includes("cout") ||
        code.includes("cin")
        ? "cpp"
        : "c";
    }
    if (
      code.includes("def ") ||
      code.includes("print(") ||
      code.includes("import ")
    ) {
      return "python";
    }
    if (
      code.includes("public class") ||
      code.includes("public static void main")
    ) {
      return "java";
    }
    if (code.includes("fn main") || code.includes("println!")) {
      return "rust";
    }
    if (code.includes("package main") || code.includes("func main")) {
      return "go";
    }
    if (
      code.includes("console.log") ||
      code.includes("const ") ||
      code.includes("let ") ||
      code.includes("function ")
    ) {
      return code.includes(": string") ||
        code.includes(": number") ||
        code.includes(": boolean")
        ? "typescript"
        : "javascript";
    }
    if (code.includes("<?php") || code.includes("echo ")) {
      return "php";
    }
    if (
      code.includes("puts ") ||
      (code.includes("def ") && code.includes("end"))
    ) {
      return "ruby";
    }
    if (code.startsWith("#!/bin/bash") || code.includes("echo ")) {
      return "bash";
    }

    // Default to JavaScript
    return "javascript";
  }
}

// Factory function to create appropriate test runner
export function createTestRunner(config: TestRunnerConfig): TestRunner {
  switch (config.type) {
    case "BASH":
      return new BashTestRunner(config);
    case "NODE":
      return new NodeTestRunner(config);
    case "PYTHON":
      return new PythonTestRunner(config);
    case "IO_MATCHING":
      return new IOMatchingTestRunner(config);
    case "CSS":
      return new CSSTestRunner(config);
    case "JUDGE0":
      return new Judge0TestRunner(config);
    case "CUSTOM":
      return new BashTestRunner(config); // Fallback to bash for custom
    default:
      throw new Error(`Unsupported test runner type: ${config.type}`);
  }
}
