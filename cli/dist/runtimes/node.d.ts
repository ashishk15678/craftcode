import { Runtime, type RuntimeResult } from './base.js';
import type { EnvironmentConfig } from '../types/index.js';
/**
 * Node.js Runtime - handles npm install and node execution
 */
export declare class NodeRuntime extends Runtime {
    constructor(config: EnvironmentConfig, workDir?: string);
    needsCompilation(): boolean;
    prepare(): Promise<RuntimeResult>;
    getExecutablePath(): string;
    getRunCommand(): string;
}
