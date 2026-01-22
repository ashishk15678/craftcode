// Test Runner Abstraction Layer
import type { TestRunnerType } from "@prisma/client";

export interface TestRunnerConfig {
  type: TestRunnerType;
  script?: string;
  scriptUrl?: string;
  timeout?: number;
}

export interface TestResult {
  success: boolean;
  output: string;
  error?: string;
  duration: number;
}

export abstract class TestRunner {
  protected config: TestRunnerConfig;

  constructor(config: TestRunnerConfig) {
    this.config = config;
  }

  abstract execute(workingDir: string, userCode: string): Promise<TestResult>;
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
      const inputFiles = files.filter(f => f.endsWith(".in")).sort();

      let allPassed = true;
      let output = "";

      for (const inputFile of inputFiles) {
        const baseName = inputFile.replace(".in", "");
        const outputFile = `${baseName}.out`;

        const input = await fs.readFile(path.join(testCasesDir, inputFile), "utf-8");
        const expectedOutput = await fs.readFile(path.join(testCasesDir, outputFile), "utf-8");

        // Execute user's solution with input using spawn for stdin support
        const command = this.config.script || "./solution";
        const [cmd, ...args] = command.split(" ");
        
        const result = await new Promise<{ stdout: string; stderr: string }>((resolve, reject) => {
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
        });

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
    case "CUSTOM":
      return new BashTestRunner(config); // Fallback to bash for custom
    default:
      throw new Error(`Unsupported test runner type: ${config.type}`);
  }
}
