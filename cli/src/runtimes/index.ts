// Runtime factory and exports
import { CRuntime } from "./c.js";
import { NodeRuntime } from "./node.js";
import { PythonRuntime } from "./python.js";
import type { EnvironmentConfig } from "../types/index.js";
import { Runtime } from "./base.js";

export { Runtime, type RuntimeResult } from "./base.js";
export { CRuntime } from "./c.js";
export { NodeRuntime } from "./node.js";
export { PythonRuntime } from "./python.js";

/**
 * Factory function to get the appropriate runtime for an environment config
 */
export function getRuntime(
  config: EnvironmentConfig,
  workDir?: string,
): Runtime {
  const type = config.name.toLowerCase();

  switch (type) {
    case "c":
    case "cpp":
    case "c++":
      return new CRuntime(config, workDir);

    case "node":
    case "nodejs":
    case "javascript":
    case "js":
    case "typescript":
    case "ts":
      return new NodeRuntime(config, workDir);

    case "python":
    case "python3":
    case "py":
      return new PythonRuntime(config, workDir);

    default:
      throw new Error(`Unsupported language: ${config.name}`);
  }
}

/**
 * Check if the language requires compilation
 */
export function requiresCompilation(config: EnvironmentConfig): boolean {
  const type = config.name.toLowerCase();
  return ["c", "cpp", "c++", "rust", "go", "golang"].includes(type);
}

/**
 * Get all supported environment types
 */
export function getSupportedTypes(): string[] {
  return [
    "c",
    "cpp",
    "c++",
    "node",
    "nodejs",
    "javascript",
    "js",
    "typescript",
    "ts",
    "python",
    "python3",
    "py",
  ];
}
