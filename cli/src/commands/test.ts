import * as p from "@clack/prompts";
import pc from "picocolors";
import fs from "fs";
import path from "path";
import { isAuthenticated } from "../utils/config.js";
import { apiRequest } from "../utils/api.js";
import { getRuntime, requiresCompilation } from "../runtimes/index.js";
import { runAllTests } from "../utils/test-runner.js";
import type {
  CraftCodeConfig,
  TestsResponse,
  TestResult,
  ResultResponse,
} from "../types/index.js";

interface TestOptions {
  challenge?: string;
  verbose?: boolean;
}

export async function test(options: TestOptions): Promise<void> {
  p.intro(pc.bgMagenta(pc.black(" CraftCode Test Runner ")));

  if (!isAuthenticated()) {
    p.log.error("Not logged in. Run `craftcode login` first.");
    process.exit(1);
  }

  // Check for craftcode.json in current directory
  const configPath = path.join(process.cwd(), "craftcode.json");

  if (!fs.existsSync(configPath)) {
    p.log.error("No craftcode.json found in current directory.");
    p.log.info(
      "Run `craftcode init --challenge <slug>` first to initialize a challenge.",
    );
    process.exit(1);
  }

  // Load config
  let config: CraftCodeConfig;
  try {
    const configContent = fs.readFileSync(configPath, "utf-8");
    config = JSON.parse(configContent);
  } catch (err) {
    p.log.error("Failed to read craftcode.json");
    process.exit(1);
  }

  // Display challenge info
  p.log.info(`Challenge: ${pc.cyan(config.challenge.title)}`);
  p.log.info(
    `Lesson ${config.challenge.lessonOrder}: ${config.challenge.lessonTitle}`,
  );
  p.log.info(
    `Environment: ${pc.yellow(config.environment.type.toUpperCase())}`,
  );
  p.log.info("");

  // Step 1: Prepare runtime (compile if needed, install deps, etc.)
  let binaryPath = "";

  try {
    const runtime = getRuntime(config.environment);
    
    if (runtime.needsCompilation()) {
      const compileSpinner = p.spinner();
      compileSpinner.start("Compiling...");

      const prepareResult = await runtime.prepare();

      if (!prepareResult.success) {
        compileSpinner.stop("Compilation failed");
        p.log.error("Compilation errors:");
        p.log.info(pc.red(prepareResult.errors || "Unknown error"));
        process.exit(1);
      }

      binaryPath = runtime.getExecutablePath();
      compileSpinner.stop(`Compiled in ${prepareResult.duration}ms`);
    } else {
      // For interpreted languages, prepare dependencies if needed
      const prepareSpinner = p.spinner();
      prepareSpinner.start("Preparing runtime...");
      
      const prepareResult = await runtime.prepare();
      prepareSpinner.stop(prepareResult.success ? "Runtime ready" : "Warning: Some preparation failed");
      
      // Use the run command or executable path
      binaryPath = runtime.getRunCommand() || runtime.getExecutablePath();
    }
  } catch (error: any) {
    p.log.error(`Unsupported environment type: ${config.environment.type}`);
    process.exit(1);
  }


  // Step 2: Fetch tests from server
  const testSpinner = p.spinner();
  testSpinner.start("Fetching tests from server...");

  const testsResponse = await apiRequest<TestsResponse>(
    config.testing.testEndpoint,
  );
  if (!testsResponse.ok || !testsResponse.data) {
    testSpinner.stop("Failed to fetch tests");
    p.log.error(testsResponse.error || "Failed to fetch test cases");
    process.exit(1);
  }

  const { metadata } = testsResponse.data;
  
  // Normalize tests to array (API returns single object)
  const rawTests = testsResponse.data.tests;
  const tests = (Array.isArray(rawTests) ? rawTests : [rawTests]).map((t) => ({
    ...t,
    name: t.name || `Test ${t.order}`,
    timeout: t.timeout || config.testing.timeout || 30000,
    isHidden: t.isHidden ?? false,
  }));
  
  testSpinner.stop(`Fetched ${tests.length} test(s)`);

  if (tests.length === 0) {
    p.log.warning("No test cases found for this lesson.");
    p.log.info("The challenge author may still be working on it.");
    process.exit(0);
  }


  // Step 3: Run tests
  p.log.info("");
  p.log.step("Running tests...");
  p.log.info(pc.dim("─".repeat(50)));
  p.log.info("");

  const startTime = Date.now();

  const results = await runAllTests(
    tests,
    binaryPath,
    config.environment,
    config.testing.stopOnFirstFailure,
    (result, index, total) => {
      const testNum = index + 1;
      const testCase = tests[index];

      if (result.passed) {
        p.log.success(
          `${pc.green("✓")} Test ${testNum}/${total}: ${testCase.name} ${pc.dim(`(${result.duration}ms)`)}`,
        );
      } else {
        p.log.error(
          `${pc.red("✗")} Test ${testNum}/${total}: ${testCase.name} ${pc.dim(`(${result.duration}ms)`)}`,
        );

        if (options.verbose && result.error) {
          p.log.info(pc.dim(result.error));
        }
      }
    },
  );

  const totalDuration = Date.now() - startTime;
  const allPassed = results.every((r) => r.passed);
  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = results.filter((r) => !r.passed).length;

  p.log.info("");
  p.log.info(pc.dim("─".repeat(50)));

  // Show summary
  if (allPassed) {
    p.log.success(
      pc.green(`✓ All ${passedCount} tests passed!`) +
        pc.dim(` (${totalDuration}ms)`),
    );
  } else {
    p.log.error(pc.red(`✗ ${failedCount} of ${results.length} tests failed`));

    // Show first failure details
    const firstFailure = results.find((r) => !r.passed);
    if (firstFailure && firstFailure.error) {
      p.log.info("");
      const failedTest = tests.find((t) => t.id === firstFailure.testId);
      p.note(
        firstFailure.error,
        `Failure: ${failedTest?.name || "Unknown test"}`,
      );
    }
  }

  // Step 4: Report results to server
  p.log.info("");
  const reportSpinner = p.spinner();
  reportSpinner.start("Reporting results...");

  const resultResponse = await apiRequest<ResultResponse>(
    config.testing.resultEndpoint,
    {
      method: "POST",
      body: JSON.stringify({
        lessonId: config.challenge.lessonId,
        results: results.map((r) => ({
          testId: r.testId,
          passed: r.passed,
          duration: r.duration,
          output: r.output,
          error: r.error,
        })),
        allPassed,
        totalDuration,
      }),
    },
  );

  if (resultResponse.ok && resultResponse.data) {
    const data = resultResponse.data;
    reportSpinner.stop("Progress saved!");

    p.log.info(
      `Progress: ${data.progress.completed}/${data.progress.total} lessons (${data.progress.percentage}%)`,
    );

    if (data.lessonComplete) {
      p.log.info("");
      p.log.success(
        pc.bold(`🎉 Lesson ${config.challenge.lessonOrder} complete!`),
      );

      if (data.challengeComplete) {
        p.log.success(pc.bold("🏆 Challenge Complete! Congratulations!"));
      } else if (data.nextLesson) {
        p.log.info("");
        p.log.info(
          `Next: Lesson ${data.nextLesson.order} - ${data.nextLesson.title}`,
        );
        
        // Auto-progression: Ask if user wants to continue
        const continueNext = await p.confirm({
          message: "Continue with next lesson?",
          initialValue: true,
        });

        if (!p.isCancel(continueNext) && continueNext) {
          const updateSpinner = p.spinner();
          updateSpinner.start("Fetching next lesson config...");

          // Fetch updated config for next lesson
          const configResponse = await apiRequest<CraftCodeConfig>(
            `/api/cli/challenge/${encodeURIComponent(config.challenge.slug)}/config`,
          );

          if (configResponse.ok && configResponse.data) {
            // Update local config file
            fs.writeFileSync(configPath, JSON.stringify(configResponse.data, null, 2));
            updateSpinner.stop("Config updated!");
            
            p.log.success(`Ready for Lesson ${data.nextLesson.order}: ${data.nextLesson.title}`);
            p.log.info(`Run ${pc.cyan("craftcode test")} to start the next lesson.`);
          } else {
            updateSpinner.stop("Failed to fetch config");
            p.log.warning("Could not auto-update config. Run init manually.");
            p.log.info(
              `Run ${pc.cyan("craftcode init --challenge " + config.challenge.slug)} to update your config.`,
            );
          }
        }
      }
    }
  } else {
    reportSpinner.stop("Failed to save progress");
    p.log.warning(
      "Tests ran locally but failed to save progress. Try again later.",
    );
  }

  p.log.info("");

  if (allPassed) {
    p.outro("Great work! 🚀");
  } else {
    p.outro("Keep trying! 💪");
    process.exit(1);
  }
}
