// Type definitions for CraftCode CLI

export interface EnvironmentConfig {
  type: "wsl" | "msys" | "mac" | "bash";
  version?: string;
  name: "cpp" | "c" | "js" | "ts" | "py" | "bash";
  compiler?: "node" | "python3" | "bash" | "gcc" | "g++" | "cc";
  compilerFlags?: string[];
  linkerFlags?: string[];
  sourceFiles?: string[];
  headerFiles?: string[];
  outputBinary?: string;
  buildDir?: string;
  entryPoint?: string;
  packageManager?: string;
  installCommand?: string;
  runCommand?: string;
}

export interface CraftCodeConfig {
  $schema: string;
  version: string;
  challenge: {
    id: string;
    slug: string;
    title: string;
    lessonId: string;
    lessonOrder: number;
    lessonTitle: string;
  };
  environment: EnvironmentConfig;
  build: {
    command: string;
    timeout: number;
  };
  testing: {
    serverUrl: string;
    testEndpoint: string;
    resultEndpoint: string;
    timeout: number;
    stopOnFirstFailure: boolean;
  };
  scaffold?: {
    files: Array<{
      path: string;
      content: string;
    }>;
  };
}

export interface TestCase {
  id: string;
  order: number;
  name?: string;
  description?: string;
  input?: string;
  expectedOutput?: string;
  testScript?: string;
  timeout?: number;
  isHidden?: boolean;
}

export interface TestsResponse {
  tests: TestCase | TestCase[];
  metadata: {
    testRunnerType?: string;
    lessonId: string;
    lessonTitle: string;
    lessonOrder: number;
    totalTests: number;
    challengeSlug: string;
    challengeTitle: string;
    environmentType: string | null;
  };
}

export interface TestResult {
  testId: string;
  passed: boolean;
  duration: number;
  output?: string;
  error?: string;
}

export interface ResultResponse {
  success: boolean;
  message: string;
  progress: {
    completed: number;
    total: number;
    percentage: number;
  };
  lessonComplete: boolean;
  challengeComplete: boolean;
  nextLesson?: {
    id: string;
    order: number;
    title: string;
  } | null;
  stats: {
    testsPassed: number;
    testsFailed: number;
    totalTests: number;
    duration: number;
  };
}

export interface CompileResult {
  success: boolean;
  output: string;
  errors?: string;
  duration: number;
}

export interface RunResult {
  exitCode: number;
  success: boolean;
  stdout: string;
  stderr: string;
  duration: number;
  timedOut?: boolean;
}
