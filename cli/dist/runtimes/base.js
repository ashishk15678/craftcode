/**
 * Abstract base class for all language runtimes.
 * Each runtime handles preparation (compilation/setup) and execution.
 */
export class Runtime {
    config;
    workDir;
    constructor(config, workDir = process.cwd()) {
        this.config = config;
        this.workDir = workDir;
    }
    /**
     * Get the command to run the program (for interpreted languages)
     */
    getRunCommand() {
        return this.config.runCommand || null;
    }
}
