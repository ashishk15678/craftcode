// Lesson Validation Library
// Validates lessons before publishing to prevent ambiguous or malicious code

import type { TestRunnerType } from "@prisma/client";

export interface ValidationError {
  field: string;
  message: string;
  severity: "error" | "warning";
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

export interface LessonData {
  id: string;
  order: number;
  title: string;
  instructionsMd: string;
  testScript?: string | null;
  testScriptUrl?: string | null;
  targetImageUrl?: string | null; // For CSS challenges
  testCases?: Array<{
    input?: string | null;
    expectedOutput?: string | null;
    testScript?: string | null;
  }>;
}

export interface ChallengeData {
  id: string;
  title: string;
  testRunnerType: TestRunnerType;
  lessons: LessonData[];
}

// Dangerous command patterns to block
const DANGEROUS_PATTERNS = [
  /rm\s+(-rf?|--recursive)\s+[\/~]/i, // rm -rf / or rm -r ~
  /rmdir\s+(-p\s+)?[\/~]/i, // rmdir dangerous paths
  /sudo\s+/i, // Any sudo usage
  /chmod\s+777/i, // Overly permissive chmod
  /curl\s+.*\|\s*(sh|bash)/i, // Piping curl to shell
  /wget\s+.*\|\s*(sh|bash)/i, // Piping wget to shell
  /eval\s*\(/i, // JavaScript eval
  /exec\s*\(/i, // exec calls
  /child_process/i, // Node child_process module
  /process\.env/i, // Environment variable access
  /require\s*\(\s*['"]fs['"]\s*\)/i, // Direct fs require
  /import\s+.*from\s+['"]fs['"]/i, // fs import
  /DROP\s+TABLE/i, // SQL injection patterns
  /DELETE\s+FROM/i, // Mass deletion
  /TRUNCATE\s+/i, // Table truncation
  /--\s*$/, // SQL comment at end (potential injection)
  /;\s*--/, // SQL comment after statement
];

// Assertion patterns to look for in test scripts
const ASSERTION_PATTERNS: Record<TestRunnerType, RegExp[]> = {
  BASH: [
    /\[\s*.*\s*\]/, // [ test ]
    /test\s+/, // test command
    /assert/, // assert keyword
    /expect/, // expect pattern
    /exit\s+[1-9]/, // exit with error code
    /\|\|\s*exit/, // OR exit pattern
    /grep\s+-q/, // silent grep check
  ],
  NODE: [
    /expect\s*\(/, // Jest/Chai expect
    /assert\s*\(/, // Node assert
    /\.to(Be|Equal|Have|Match|Throw)/, // Jest matchers
    /\.should\./, // Chai should
    /describe\s*\(/, // Test block
    /it\s*\(/, // Test case
    /test\s*\(/, // Jest test
  ],
  PYTHON: [
    /assert\s+/, // Python assert
    /assertEqual/, // unittest
    /assertTrue/, // unittest
    /assertFalse/, // unittest
    /pytest\./, // pytest markers
    /def\s+test_/, // test functions
  ],
  IO_MATCHING: [
    /./, // I/O matching always has implicit assertions
  ],
  CSS: [
    /./, // CSS uses image comparison, always valid
  ],
  CUSTOM: [
    /assert/, // Generic assert
    /expect/, // Generic expect
    /test/, // Generic test
  ],
};

/**
 * Check if test script contains dangerous patterns
 */
function checkDangerousPatterns(script: string): ValidationError[] {
  const errors: ValidationError[] = [];

  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(script)) {
      errors.push({
        field: "testScript",
        message: `Potentially dangerous pattern detected: ${pattern.source}`,
        severity: "error",
      });
    }
  }

  return errors;
}

/**
 * Check if test script contains assertions
 */
function checkAssertions(
  script: string,
  runnerType: TestRunnerType
): ValidationError[] {
  const patterns = ASSERTION_PATTERNS[runnerType] || ASSERTION_PATTERNS.CUSTOM;
  const hasAssertion = patterns.some((pattern) => pattern.test(script));

  if (!hasAssertion) {
    return [
      {
        field: "testScript",
        message:
          "No assertion patterns found in test script. Tests should verify expected behavior.",
        severity: "warning",
      },
    ];
  }

  return [];
}

/**
 * Validate a single lesson
 */
export function validateLesson(
  lesson: LessonData,
  runnerType: TestRunnerType
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // Check title
  if (!lesson.title || lesson.title.trim().length < 3) {
    errors.push({
      field: "title",
      message: "Lesson title must be at least 3 characters",
      severity: "error",
    });
  }

  // Check instructions
  if (!lesson.instructionsMd || lesson.instructionsMd.trim().length < 50) {
    errors.push({
      field: "instructionsMd",
      message:
        "Instructions must be at least 50 characters to provide meaningful guidance",
      severity: "error",
    });
  }

  // CSS challenges use image comparison
  if (runnerType === "CSS") {
    if (!lesson.targetImageUrl) {
      errors.push({
        field: "targetImageUrl",
        message: "CSS challenges require a target image URL",
        severity: "error",
      });
    }
    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  // Check for test script or test cases
  const hasTestScript = lesson.testScript && lesson.testScript.trim().length > 0;
  const hasTestCases = lesson.testCases && lesson.testCases.length > 0;
  const hasTestScriptUrl =
    lesson.testScriptUrl && lesson.testScriptUrl.trim().length > 0;

  if (!hasTestScript && !hasTestCases && !hasTestScriptUrl) {
    errors.push({
      field: "testScript",
      message:
        "Lesson must have a test script, test cases, or test script URL",
      severity: "error",
    });
  }

  // Validate test script content
  if (hasTestScript && lesson.testScript) {
    // Check for dangerous patterns
    const dangerousErrors = checkDangerousPatterns(lesson.testScript);
    errors.push(...dangerousErrors);

    // Check for assertions
    const assertionWarnings = checkAssertions(lesson.testScript, runnerType);
    warnings.push(...assertionWarnings);

    // Basic syntax checks
    if (runnerType === "NODE") {
      // Check for basic JS/TS structure
      if (
        !lesson.testScript.includes("function") &&
        !lesson.testScript.includes("=>") &&
        !lesson.testScript.includes("describe") &&
        !lesson.testScript.includes("test")
      ) {
        warnings.push({
          field: "testScript",
          message:
            "Node test script may be missing test structure (describe/test/it blocks)",
          severity: "warning",
        });
      }
    }

    if (runnerType === "PYTHON") {
      // Check for basic Python test structure
      if (
        !lesson.testScript.includes("def test_") &&
        !lesson.testScript.includes("class Test")
      ) {
        warnings.push({
          field: "testScript",
          message:
            "Python test script may be missing test functions (def test_*)",
          severity: "warning",
        });
      }
    }
  }

  // Validate test cases for I/O matching
  if (runnerType === "IO_MATCHING" && hasTestCases && lesson.testCases) {
    for (let i = 0; i < lesson.testCases.length; i++) {
      const tc = lesson.testCases[i];
      if (!tc.input && !tc.expectedOutput && !tc.testScript) {
        errors.push({
          field: `testCases[${i}]`,
          message: `Test case ${i + 1} has no input, expected output, or script`,
          severity: "error",
        });
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate an entire challenge
 */
export function validateChallenge(challenge: ChallengeData): ValidationResult {
  const allErrors: ValidationError[] = [];
  const allWarnings: ValidationError[] = [];

  // Check challenge has at least one lesson
  if (!challenge.lessons || challenge.lessons.length === 0) {
    allErrors.push({
      field: "lessons",
      message: "Challenge must have at least one lesson/stage",
      severity: "error",
    });
    return {
      valid: false,
      errors: allErrors,
      warnings: allWarnings,
    };
  }

  // Validate each lesson
  for (const lesson of challenge.lessons) {
    const result = validateLesson(lesson, challenge.testRunnerType);

    // Prefix errors/warnings with lesson identifier
    for (const error of result.errors) {
      allErrors.push({
        ...error,
        field: `Stage ${lesson.order}: ${error.field}`,
      });
    }
    for (const warning of result.warnings) {
      allWarnings.push({
        ...warning,
        field: `Stage ${lesson.order}: ${warning.field}`,
      });
    }
  }

  return {
    valid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings,
  };
}

/**
 * Quick validation check for a single field
 */
export function validateField(
  fieldName: string,
  value: string,
  runnerType?: TestRunnerType
): ValidationError | null {
  switch (fieldName) {
    case "title":
      if (!value || value.trim().length < 3) {
        return {
          field: "title",
          message: "Title must be at least 3 characters",
          severity: "error",
        };
      }
      break;

    case "instructionsMd":
      if (!value || value.trim().length < 50) {
        return {
          field: "instructionsMd",
          message: "Instructions must be at least 50 characters",
          severity: "error",
        };
      }
      break;

    case "testScript":
      if (value) {
        const dangerousErrors = checkDangerousPatterns(value);
        if (dangerousErrors.length > 0) {
          return dangerousErrors[0];
        }
      }
      break;
  }

  return null;
}
