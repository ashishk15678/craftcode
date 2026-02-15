/**
 * Judge0 CE Code Execution Service
 * Uses the public Judge0 CE instance at ce.judge0.com
 */

// Judge0 CE public API endpoint
const JUDGE0_API_URL = process.env.JUDGE0_API_URL || "https://ce.judge0.com";

// Default code templates for each language
export const CODE_TEMPLATES: Record<string, string> = {
  javascript: `// JavaScript (Node.js)
console.log("Hello, World!");

// Example: Sum of two numbers
function add(a, b) {
    return a + b;
}

console.log("2 + 3 =", add(2, 3));
`,
  typescript: `// TypeScript
const greeting: string = "Hello, World!";
console.log(greeting);

// Example: Sum of two numbers
function add(a: number, b: number): number {
    return a + b;
}

console.log(\`2 + 3 = \${add(2, 3)}\`);
`,
  python: `# Python 3
print("Hello, World!")

# Example: Sum of two numbers
def add(a, b):
    return a + b

print(f"2 + 3 = {add(2, 3)}")
`,
  java: `// Java
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");

        // Example: Sum of two numbers
        int result = add(2, 3);
        System.out.println("2 + 3 = " + result);
    }

    public static int add(int a, int b) {
        return a + b;
    }
}
`,
  c: `// C
#include <stdio.h>

int add(int a, int b) {
    return a + b;
}

int main() {
    printf("Hello, World!\\n");

    // Example: Sum of two numbers
    printf("2 + 3 = %d\\n", add(2, 3));

    return 0;
}
`,
  cpp: `// C++
#include <iostream>
using namespace std;

int add(int a, int b) {
    return a + b;
}

int main() {
    cout << "Hello, World!" << endl;

    // Example: Sum of two numbers
    cout << "2 + 3 = " << add(2, 3) << endl;

    return 0;
}`,
  rust: `// Rust
fn add(a: i32, b: i32) -> i32 {
    a + b
}

fn main() {
    println!("Hello, World!");

    // Example: Sum of two numbers
    println!("2 + 3 = {}", add(2, 3));
}
`,
  ruby: `# Ruby
puts "Hello, World!"

# Example: Sum of two numbers
def add(a, b)
    a + b
end

puts "2 + 3 = #{add(2, 3)}"
`,
  php: `<?php
// PHP
echo "Hello, World!\\n";

// Example: Sum of two numbers
function add($a, $b) {
    return $a + $b;
}

echo "2 + 3 = " . add(2, 3) . "\\n";
?>
`,
  bash: `#!/bin/bash
# Bash
echo "Hello, World!"

# Example: Sum of two numbers
add() {
    echo $(($1 + $2))
}

echo "2 + 3 = $(add 2 3)"
`,
};

export interface ExecutionRequest {
  sourceCode: string;
  languageId: number;
  stdin?: string;
  expectedOutput?: string;
  cpuTimeLimit?: number; // seconds
  memoryLimit?: number; // KB
}

export interface ExecutionResult {
  stdout: string | null;
  stderr: string | null;
  compileOutput: string | null;
  message: string | null;
  status: {
    id: number;
    description: string;
  };
  time: string | null;
  memory: number | null;
  exitCode: number | null;
  token?: string;
}

export interface SubmissionResponse {
  token: string;
}

/**
 * Submit code for execution to Judge0 CE
 */
export async function submitCode(
  request: ExecutionRequest,
): Promise<SubmissionResponse> {
  const body = {
    source_code: Buffer.from(request.sourceCode).toString("base64"),
    language_id: request.languageId,
    stdin: request.stdin ? Buffer.from(request.stdin).toString("base64") : null,
    expected_output: request.expectedOutput
      ? Buffer.from(request.expectedOutput).toString("base64")
      : null,
    cpu_time_limit: request.cpuTimeLimit || 5,
    memory_limit: request.memoryLimit || 128000, // 128MB
  };

  console.log("[Judge0] Submitting code:", {
    languageId: request.languageId,
    codeLength: request.sourceCode.length,
  });

  const response = await fetch(
    `${JUDGE0_API_URL}/submissions?base64_encoded=true&wait=false`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    },
  );

  console.log("[Judge0] Submit response status:", response.status);

  if (!response.ok) {
    const error = await response.text();
    console.error("[Judge0] Submit error:", error);
    throw new Error(`Judge0 submission failed: ${response.status} - ${error}`);
  }

  const result = await response.json();
  console.log("[Judge0] Submit result:", result);
  return result;
}

/**
 * Get the result of a submission by token
 */
export async function getSubmission(token: string): Promise<ExecutionResult> {
  const url = `${JUDGE0_API_URL}/submissions/${token}?base64_encoded=true&fields=stdout,stderr,compile_output,message,status,time,memory,exit_code,token`;

  console.log("[Judge0] Getting submission:", token);

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  console.log("[Judge0] Get submission response status:", response.status);

  if (!response.ok) {
    const error = await response.text();
    console.error("[Judge0] Get submission error:", error);
    throw new Error(`Failed to get submission: ${response.status} - ${error}`);
  }

  const data = await response.json();
  console.log("[Judge0] Submission data:", data);

  return {
    stdout: data.stdout
      ? Buffer.from(data.stdout, "base64").toString("utf-8")
      : null,
    stderr: data.stderr
      ? Buffer.from(data.stderr, "base64").toString("utf-8")
      : null,
    compileOutput: data.compile_output
      ? Buffer.from(data.compile_output, "base64").toString("utf-8")
      : null,
    message: data.message,
    status: data.status,
    time: data.time,
    memory: data.memory,
    exitCode: data.exit_code,
    token: data.token,
  };
}

/**
 * Execute code and wait for result (polling)
 */
export async function executeCode(
  request: ExecutionRequest,
  maxAttempts = 30,
): Promise<ExecutionResult> {
  const submission = await submitCode(request);

  if (!submission.token) {
    throw new Error("No token received from Judge0");
  }

  console.log("[Judge0] Polling for result, token:", submission.token);

  // Poll for result
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second between polls

    try {
      const result = await getSubmission(submission.token);

      // Status IDs: 1 = In Queue, 2 = Processing
      if (result.status && result.status.id > 2) {
        console.log("[Judge0] Execution complete:", result.status);
        return result;
      }

      console.log("[Judge0] Still processing, attempt:", i + 1);
    } catch (err) {
      console.error("[Judge0] Poll error:", err);
      // Continue polling on error
    }
  }

  throw new Error("Execution timed out after " + maxAttempts + " attempts");
}

/**
 * Execute code with wait=true parameter (synchronous, might timeout on public instance)
 */
export async function executeCodeSync(
  request: ExecutionRequest,
): Promise<ExecutionResult> {
  const body = {
    source_code: Buffer.from(request.sourceCode).toString("base64"),
    language_id: request.languageId,
    stdin: request.stdin ? Buffer.from(request.stdin).toString("base64") : null,
    cpu_time_limit: request.cpuTimeLimit || 5,
    memory_limit: request.memoryLimit || 128000,
  };

  console.log("[Judge0] Sync execution, language:", request.languageId);

  const response = await fetch(
    `${JUDGE0_API_URL}/submissions?base64_encoded=true&wait=true`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    },
  );

  console.log("[Judge0] Sync response status:", response.status);

  if (!response.ok) {
    const error = await response.text();
    console.error("[Judge0] Sync error:", error);
    throw new Error(`Judge0 execution failed: ${response.status} - ${error}`);
  }

  const data = await response.json();
  console.log("[Judge0] Sync result:", data);

  return {
    stdout: data.stdout
      ? Buffer.from(data.stdout, "base64").toString("utf-8")
      : null,
    stderr: data.stderr
      ? Buffer.from(data.stderr, "base64").toString("utf-8")
      : null,
    compileOutput: data.compile_output
      ? Buffer.from(data.compile_output, "base64").toString("utf-8")
      : null,
    message: data.message,
    status: data.status,
    time: data.time,
    memory: data.memory,
    exitCode: data.exit_code,
    token: data.token,
  };
}

/**
 * Judge0 status codes
 */
export const STATUS_CODES = {
  1: { name: "In Queue", color: "yellow" },
  2: { name: "Processing", color: "yellow" },
  3: { name: "Accepted", color: "green" },
  4: { name: "Wrong Answer", color: "red" },
  5: { name: "Time Limit Exceeded", color: "red" },
  6: { name: "Compilation Error", color: "red" },
  7: { name: "Runtime Error (SIGSEGV)", color: "red" },
  8: { name: "Runtime Error (SIGXFSZ)", color: "red" },
  9: { name: "Runtime Error (SIGFPE)", color: "red" },
  10: { name: "Runtime Error (SIGABRT)", color: "red" },
  11: { name: "Runtime Error (NZEC)", color: "red" },
  12: { name: "Runtime Error (Other)", color: "red" },
  13: { name: "Internal Error", color: "red" },
  14: { name: "Exec Format Error", color: "red" },
} as const;
