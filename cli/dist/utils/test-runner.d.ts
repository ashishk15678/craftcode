import type { TestCase, TestResult, RunResult, EnvironmentConfig } from "../types/index.js";
/**
 * Run a binary with input and capture output
 */
export declare function runBinary(binaryPath: string, input: string, timeout?: number, args?: string[]): Promise<RunResult>;
/**
 * Run a script-based test (for non-IO tests)
 */
export declare function runScript(script: string, timeout?: number): Promise<RunResult>;
/**
 * Compare expected output with actual output
 */
export declare function compareOutput(expected: string, actual: string): boolean;
/**
 * Run a single test case
 */
export declare function runTestCase(testCase: TestCase, binaryPath: string, config: EnvironmentConfig): Promise<TestResult>;
/**
 * Run all test cases in sequence, stopping on first failure if configured
 */
export declare function runAllTests(tests: TestCase[], binaryPath: string, config: EnvironmentConfig, stopOnFirstFailure?: boolean, onTestComplete?: (result: TestResult, index: number, total: number) => void): Promise<TestResult[]>;
