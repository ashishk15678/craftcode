import { CompileResult, EnvironmentConfig } from "../types/index.js";
import { CCompiler } from "./c.js";
import { PyCompiler } from "./py.js";

export interface Compiler {
  compile(): Promise<CompileResult>;
  getOutputPath(): string | undefined;
}

export function getCompiler(
  config: EnvironmentConfig,
  workDir?: string,
): Compiler | null {
  const type = config.name.toLowerCase();

  switch (type) {
    case "c":
    case "cpp":
      return new CCompiler(config, workDir);
    case "py":
      return new PyCompiler(config);
    default:
      return null;
  }
}

/**
 * Check if the environment requires compilation
 */
export function requiresCompilation(config: EnvironmentConfig): boolean {
  const type = config.type.toLowerCase();
  return ["c", "cpp"].includes(type);
}
