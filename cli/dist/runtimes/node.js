// Node.js Runtime implementation
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { Runtime } from './base.js';
const execAsync = promisify(exec);
/**
 * Node.js Runtime - handles npm install and node execution
 */
export class NodeRuntime extends Runtime {
    constructor(config, workDir = process.cwd()) {
        super(config, workDir);
    }
    needsCompilation() {
        return false;
    }
    async prepare() {
        const startTime = Date.now();
        // Check if package.json exists and run npm install if needed
        const packageJsonPath = path.join(this.workDir, 'package.json');
        if (fs.existsSync(packageJsonPath)) {
            // Check if node_modules exists
            const nodeModulesPath = path.join(this.workDir, 'node_modules');
            if (!fs.existsSync(nodeModulesPath)) {
                try {
                    const installCommand = this.config.installCommand || 'npm install';
                    const { stdout, stderr } = await execAsync(installCommand, {
                        cwd: this.workDir,
                        timeout: 120000, // 2 minute timeout for npm install
                    });
                    return {
                        success: true,
                        output: stdout || 'Dependencies installed successfully',
                        errors: stderr || undefined,
                        duration: Date.now() - startTime
                    };
                }
                catch (error) {
                    return {
                        success: false,
                        output: error.stdout || '',
                        errors: error.message || 'Failed to install dependencies',
                        duration: Date.now() - startTime
                    };
                }
            }
        }
        // No preparation needed
        return {
            success: true,
            output: 'Node.js runtime ready',
            duration: Date.now() - startTime
        };
    }
    getExecutablePath() {
        // For Node.js, return the entry point file
        return this.config.entryPoint || 'index.js';
    }
    getRunCommand() {
        // Return the command to run Node.js
        if (this.config.runCommand) {
            return this.config.runCommand;
        }
        const entryPoint = this.getExecutablePath();
        return `node ${entryPoint}`;
    }
}
