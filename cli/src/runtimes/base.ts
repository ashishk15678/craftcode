// Base runtime interface for all language runtimes
import type { EnvironmentConfig, CompileResult } from '../types/index.js';

export interface RuntimeResult {
  success: boolean;
  output: string;
  errors?: string;
  duration: number;
}

/**
 * Abstract base class for all language runtimes.
 * Each runtime handles preparation (compilation/setup) and execution.
 */
export abstract class Runtime {
  protected config: EnvironmentConfig;
  protected workDir: string;

  constructor(config: EnvironmentConfig, workDir: string = process.cwd()) {
    this.config = config;
    this.workDir = workDir;
  }

  /**
   * Prepare the runtime (compile, install dependencies, etc.)
   */
  abstract prepare(): Promise<RuntimeResult>;

  /**
   * Get the path to the executable (binary for compiled, entry file for interpreted)
   */
  abstract getExecutablePath(): string;

  /**
   * Check if this runtime requires compilation
   */
  abstract needsCompilation(): boolean;

  /**
   * Get the command to run the program (for interpreted languages)
   */
  getRunCommand(): string | null {
    return this.config.runCommand || null;
  }
}
