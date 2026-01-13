export interface RunResult {
    exitCode: number;
    success: boolean;
}
/**
 * Execute a bash script and stream output to terminal
 */
export declare function runScript(script: string): Promise<RunResult>;
/**
 * Run a script from a URL
 */
export declare function runScriptFromUrl(url: string): Promise<RunResult>;
