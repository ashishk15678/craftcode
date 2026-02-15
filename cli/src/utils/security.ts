/**
 * Security utilities for CraftCode CLI
 * 
 * These functions help prevent RCE and other security issues when
 * executing user-provided or server-fetched scripts.
 */

import path from "path";

/**
 * Dangerous patterns to reject in shell scripts
 * These patterns could indicate malicious content
 */
const DANGEROUS_SCRIPT_PATTERNS = [
  // Recursive delete of system paths
  /rm\s+(-[rf]+\s+|--recursive\s+|--force\s+)*[\/~]/i,
  // Pipe downloaded content to shell
  /curl\s+[^|]*\|\s*(ba)?sh/i,
  /wget\s+[^|]*\|\s*(ba)?sh/i,
  // Write to sensitive system directories
  />\s*\/etc\//,
  />\s*\/usr\//,
  />\s*\/var\//,
  />\s*\/bin\//,
  />\s*\/lib\//,
  // Sudo usage (should not need elevated privileges)
  /\bsudo\s+/i,
  // Dangerous chmod permissions
  /chmod\s+(777|[0-7]{3}\s+\/)/,
  // Attempt to access SSH keys or config
  /\.ssh\//,
  // Modify shell configs
  />\s*~\/\.(bashrc|profile|zshrc|bash_profile)/,
  // Reverse shells
  /\/dev\/tcp\//,
  /nc\s+(-e|-c)/,
  /ncat\s+(-e|-c)/,
  // Encoded payloads
  /base64\s+(-d|--decode)\s*\|/,
  // Fork bombs
  /:\(\)\{:\|:&\}/,
];

/**
 * Validate a shell script content for dangerous patterns
 * @returns Object with valid status and optional reason
 */
export function validateScriptContent(script: string): { valid: boolean; reason?: string } {
  if (!script || typeof script !== "string") {
    return { valid: false, reason: "Script content is empty or invalid" };
  }

  // Check for dangerous patterns
  for (const pattern of DANGEROUS_SCRIPT_PATTERNS) {
    if (pattern.test(script)) {
      return { 
        valid: false, 
        reason: `Script contains potentially dangerous pattern: ${pattern.source}` 
      };
    }
  }

  return { valid: true };
}

/**
 * Validate a file path is safe (no path traversal attacks)
 */
export function isPathSafe(filePath: string): boolean {
  if (!filePath || typeof filePath !== "string") return false;
  
  // Normalize path separators
  const normalized = path.normalize(filePath).replace(/\\/g, "/");
  
  // Reject: absolute paths, parent directory refs, excessively long paths
  if (path.isAbsolute(normalized)) return false;
  if (normalized.startsWith("..") || normalized.includes("/../") || normalized.endsWith("/..")) return false;
  if (normalized.length > 256) return false;
  
  // Reject paths to sensitive locations
  const dangerous = ["/etc/", "/usr/", "/bin/", "/var/", "/.ssh/", "/.git/"];
  if (dangerous.some((d) => normalized.includes(d))) return false;
  
  return true;
}

/**
 * Validate path is contained within a base directory
 */
export function isPathContained(filePath: string, baseDir: string): boolean {
  const resolvedPath = path.resolve(baseDir, filePath);
  const resolvedBase = path.resolve(baseDir);
  
  return resolvedPath.startsWith(resolvedBase + path.sep) || resolvedPath === resolvedBase;
}

/**
 * Sanitize command arguments to prevent shell injection
 * This escapes special shell characters
 */
export function sanitizeArg(arg: string): string {
  if (!arg || typeof arg !== "string") return "";
  
  // For simple alphanumeric args, return as-is
  if (/^[a-zA-Z0-9_\-\.\/]+$/.test(arg)) {
    return arg;
  }
  
  // Escape special characters by wrapping in single quotes
  // and escaping any single quotes within
  return `'${arg.replace(/'/g, "'\\''")}'`;
}
