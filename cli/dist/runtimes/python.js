// Python Runtime implementation
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { Runtime } from './base.js';
const execAsync = promisify(exec);
/**
 * Python Runtime - handles pip install and python execution
 */
export class PythonRuntime extends Runtime {
    constructor(config, workDir = process.cwd()) {
        super(config, workDir);
    }
    needsCompilation() {
        return false;
    }
    async prepare() {
        const startTime = Date.now();
        // Check for requirements.txt and install if needed
        const requirementsPath = path.join(this.workDir, 'requirements.txt');
        if (fs.existsSync(requirementsPath)) {
            try {
                const installCommand = this.config.installCommand || 'pip install -r requirements.txt';
                const { stdout, stderr } = await execAsync(installCommand, {
                    cwd: this.workDir,
                    timeout: 120000, // 2 minute timeout
                });
                return {
                    success: true,
                    output: stdout || 'Dependencies installed successfully',
                    errors: stderr || undefined,
                    duration: Date.now() - startTime
                };
            }
            catch (error) {
                // pip install might fail but we can continue
                return {
                    success: true, // Continue anyway, might not need all deps
                    output: 'Warning: Some dependencies may not have installed',
                    errors: error.message,
                    duration: Date.now() - startTime
                };
            }
        }
        // No preparation needed
        return {
            success: true,
            output: 'Python runtime ready',
            duration: Date.now() - startTime
        };
    }
    getExecutablePath() {
        // For Python, return the entry point file
        return this.config.entryPoint || 'main.py';
    }
    getRunCommand() {
        // Return the command to run Python
        if (this.config.runCommand) {
            return this.config.runCommand;
        }
        const entryPoint = this.getExecutablePath();
        // Use python3 by default, fall back to python
        const pythonCmd = this.config.version?.startsWith('2') ? 'python' : 'python3';
        return `${pythonCmd} ${entryPoint}`;
    }
}
