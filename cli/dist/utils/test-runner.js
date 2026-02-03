import { spawn } from "child_process";
/**
 * Run a binary with input and capture output
 */
export async function runBinary(binaryPath, input, timeout = 10000, args = []) {
    const startTime = Date.now();
    return new Promise((resolve) => {
        let stdout = "";
        let stderr = "";
        let timedOut = false;
        const child = spawn(binaryPath, args, {
            cwd: process.cwd(),
            shell: false,
        });
        // Set up timeout
        const timeoutId = setTimeout(() => {
            timedOut = true;
            child.kill("SIGKILL");
        }, timeout);
        child.stdout.on("data", (data) => {
            stdout += data.toString();
        });
        child.stderr.on("data", (data) => {
            stderr += data.toString();
        });
        // Send input
        if (input) {
            child.stdin.write(input);
            child.stdin.end();
        }
        child.on("error", (err) => {
            clearTimeout(timeoutId);
            resolve({
                exitCode: 1,
                success: false,
                stdout,
                stderr: err.message,
                duration: Date.now() - startTime,
                timedOut: false,
            });
        });
        child.on("close", (code) => {
            clearTimeout(timeoutId);
            const duration = Date.now() - startTime;
            resolve({
                exitCode: code ?? 1,
                success: code === 0 && !timedOut,
                stdout,
                stderr,
                duration,
                timedOut,
            });
        });
    });
}
/**
 * Run a script-based test (for non-IO tests)
 */
export async function runScript(script, timeout = 10000) {
    const startTime = Date.now();
    return new Promise((resolve) => {
        let stdout = "";
        let stderr = "";
        let timedOut = false;
        const child = spawn("bash", ["-c", script], {
            cwd: process.cwd(),
            shell: false,
        });
        const timeoutId = setTimeout(() => {
            timedOut = true;
            child.kill("SIGKILL");
        }, timeout);
        child.stdout.on("data", (data) => {
            stdout += data.toString();
        });
        child.stderr.on("data", (data) => {
            stderr += data.toString();
        });
        child.on("error", (err) => {
            clearTimeout(timeoutId);
            resolve({
                exitCode: 1,
                success: false,
                stdout,
                stderr: err.message,
                duration: Date.now() - startTime,
                timedOut: false,
            });
        });
        child.on("close", (code) => {
            clearTimeout(timeoutId);
            resolve({
                exitCode: code ?? 1,
                success: code === 0 && !timedOut,
                stdout,
                stderr,
                duration: Date.now() - startTime,
                timedOut,
            });
        });
    });
}
/**
 * Compare expected output with actual output
 */
export function compareOutput(expected, actual) {
    // Normalize line endings and trim
    const normalizedExpected = expected.replace(/\r\n/g, "\n").trim();
    const normalizedActual = actual.replace(/\r\n/g, "\n").trim();
    return normalizedExpected === normalizedActual;
}
/**
 * Run a single test case
 */
export async function runTestCase(testCase, binaryPath, config) {
    const startTime = Date.now();
    // Script-based test
    if (testCase.testScript) {
        const result = await runScript(testCase.testScript, testCase.timeout);
        return {
            testId: testCase.id,
            passed: result.success,
            duration: result.duration,
            output: result.stdout,
            error: result.success
                ? undefined
                : result.stderr || `Exit code: ${result.exitCode}`,
        };
    }
    // IO-matching test
    if (testCase.input !== undefined && testCase.expectedOutput !== undefined) {
        const result = await runBinary(binaryPath, testCase.input, testCase.timeout);
        if (result.timedOut) {
            return {
                testId: testCase.id,
                passed: false,
                duration: result.duration,
                output: result.stdout,
                error: `Test timed out after ${testCase.timeout}ms`,
            };
        }
        if (!result.success && result.exitCode !== 0) {
            return {
                testId: testCase.id,
                passed: false,
                duration: result.duration,
                output: result.stdout,
                error: result.stderr || `Process exited with code ${result.exitCode}`,
            };
        }
        const passed = compareOutput(testCase.expectedOutput, result.stdout);
        return {
            testId: testCase.id,
            passed,
            duration: result.duration,
            output: result.stdout,
            error: passed
                ? undefined
                : `Output mismatch.\nExpected:\n${testCase.expectedOutput}\n\nActual:\n${result.stdout}`,
        };
    }
    // No test data available
    return {
        testId: testCase.id,
        passed: false,
        duration: Date.now() - startTime,
        error: "Test case has no input/output or script defined",
    };
}
/**
 * Run all test cases in sequence, stopping on first failure if configured
 */
export async function runAllTests(tests, binaryPath, config, stopOnFirstFailure = true, onTestComplete) {
    const results = [];
    for (let i = 0; i < tests.length; i++) {
        const test = tests[i];
        const result = await runTestCase(test, binaryPath, config);
        results.push(result);
        if (onTestComplete) {
            onTestComplete(result, i, tests.length);
        }
        if (!result.passed && stopOnFirstFailure) {
            break;
        }
    }
    return results;
}
