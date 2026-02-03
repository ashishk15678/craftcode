// Runtime factory and exports
import { CRuntime } from './c.js';
import { NodeRuntime } from './node.js';
import { PythonRuntime } from './python.js';
export { Runtime } from './base.js';
export { CRuntime } from './c.js';
export { NodeRuntime } from './node.js';
export { PythonRuntime } from './python.js';
/**
 * Factory function to get the appropriate runtime for an environment config
 */
export function getRuntime(config, workDir) {
    const type = config.type.toLowerCase();
    switch (type) {
        case 'c':
        case 'cpp':
        case 'c++':
            return new CRuntime(config, workDir);
        case 'node':
        case 'nodejs':
        case 'javascript':
        case 'js':
        case 'typescript':
        case 'ts':
            return new NodeRuntime(config, workDir);
        case 'python':
        case 'python3':
        case 'py':
            return new PythonRuntime(config, workDir);
        default:
            throw new Error(`Unsupported environment type: ${config.type}`);
    }
}
/**
 * Check if the environment type requires compilation
 */
export function requiresCompilation(config) {
    const type = config.type.toLowerCase();
    return ['c', 'cpp', 'c++', 'rust', 'go', 'golang'].includes(type);
}
/**
 * Get all supported environment types
 */
export function getSupportedTypes() {
    return [
        'c', 'cpp', 'c++',
        'node', 'nodejs', 'javascript', 'js', 'typescript', 'ts',
        'python', 'python3', 'py'
    ];
}
