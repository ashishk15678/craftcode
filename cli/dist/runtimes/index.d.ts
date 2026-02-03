import type { EnvironmentConfig } from '../types/index.js';
import { Runtime } from './base.js';
export { Runtime, type RuntimeResult } from './base.js';
export { CRuntime } from './c.js';
export { NodeRuntime } from './node.js';
export { PythonRuntime } from './python.js';
/**
 * Factory function to get the appropriate runtime for an environment config
 */
export declare function getRuntime(config: EnvironmentConfig, workDir?: string): Runtime;
/**
 * Check if the environment type requires compilation
 */
export declare function requiresCompilation(config: EnvironmentConfig): boolean;
/**
 * Get all supported environment types
 */
export declare function getSupportedTypes(): string[];
