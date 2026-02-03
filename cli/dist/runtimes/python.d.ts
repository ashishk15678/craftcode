import { Runtime, type RuntimeResult } from './base.js';
import type { EnvironmentConfig } from '../types/index.js';
/**
 * Python Runtime - handles pip install and python execution
 */
export declare class PythonRuntime extends Runtime {
    constructor(config: EnvironmentConfig, workDir?: string);
    needsCompilation(): boolean;
    prepare(): Promise<RuntimeResult>;
    getExecutablePath(): string;
    getRunCommand(): string;
}
