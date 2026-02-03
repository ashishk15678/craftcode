import type { EnvironmentConfig, CompileResult } from '../types/index.js';
export interface Compiler {
    compile(): Promise<CompileResult>;
    getOutputPath(): string;
}
/**
 * C/C++ Compiler implementation
 */
export declare class CCompiler implements Compiler {
    private config;
    private workDir;
    constructor(config: EnvironmentConfig, workDir?: string);
    compile(): Promise<CompileResult>;
    getOutputPath(): string;
}
/**
 * Get the appropriate compiler for the environment type
 */
export declare function getCompiler(config: EnvironmentConfig, workDir?: string): Compiler | null;
/**
 * Check if the environment requires compilation
 */
export declare function requiresCompilation(config: EnvironmentConfig): boolean;
