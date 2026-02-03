import { Runtime, type RuntimeResult } from './base.js';
import type { EnvironmentConfig } from '../types/index.js';
/**
 * C/C++ Runtime - handles compilation with gcc/g++
 */
export declare class CRuntime extends Runtime {
    constructor(config: EnvironmentConfig, workDir?: string);
    needsCompilation(): boolean;
    prepare(): Promise<RuntimeResult>;
    getExecutablePath(): string;
}
