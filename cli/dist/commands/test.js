import * as p from '@clack/prompts';
import pc from 'picocolors';
import { isAuthenticated } from '../utils/config.js';
import { apiRequest } from '../utils/api.js';
import { runScript, runScriptFromUrl } from '../utils/runner.js';
export async function test(options) {
    p.intro(pc.bgMagenta(pc.black(' CraftCode Test Runner ')));
    if (!isAuthenticated()) {
        p.log.error('Not logged in. Run `craftcode login` first.');
        process.exit(1);
    }
    const spinner = p.spinner();
    spinner.start('Fetching current stage...');
    // Get current stage
    const endpoint = options.challenge
        ? `/api/cli/stage?challenge=${encodeURIComponent(options.challenge)}`
        : '/api/cli/stage';
    const stageResponse = await apiRequest(endpoint);
    if (!stageResponse.ok) {
        spinner.stop('Failed to fetch stage');
        p.log.error(stageResponse.error || 'Failed to get current stage');
        process.exit(1);
    }
    const data = stageResponse.data;
    if (data.noChallenge) {
        spinner.stop('No active challenge');
        p.log.warning('No active challenge found.');
        p.log.info('Start a challenge on the website, then run:');
        p.log.info(pc.cyan('  craftcode test --challenge <slug>'));
        process.exit(0);
    }
    if (data.challengeComplete) {
        spinner.stop('Challenge complete!');
        p.log.success(`🎉 Congratulations! You've completed the challenge!`);
        process.exit(0);
    }
    const stage = data.stage;
    spinner.stop(`Stage ${stage.order}: ${stage.title}`);
    p.log.info(`Challenge: ${pc.cyan(stage.challengeTitle)}`);
    p.log.info('');
    // Get the test script
    const testScript = stage.testScript || null;
    const testScriptUrl = stage.testScriptUrl || null;
    if (!testScript && !testScriptUrl) {
        p.log.warning('No test script available for this stage.');
        p.log.info('The challenge author may still be working on it.');
        process.exit(0);
    }
    // Security warning
    p.log.warning(pc.yellow('⚠️  Security Notice'));
    p.log.info('You are about to run a test script from the server.');
    p.log.info('This script will execute bash commands on your machine.');
    p.log.info('');
    const proceed = await p.confirm({
        message: 'Do you want to proceed?',
        initialValue: true
    });
    if (p.isCancel(proceed) || !proceed) {
        p.cancel('Test cancelled');
        process.exit(0);
    }
    p.log.info('');
    p.log.step('Running tests...');
    p.log.info(pc.dim('─'.repeat(50)));
    p.log.info('');
    // Run the test script
    let result;
    try {
        if (testScript) {
            result = await runScript(testScript);
        }
        else if (testScriptUrl) {
            result = await runScriptFromUrl(testScriptUrl);
        }
        else {
            throw new Error('No test script available');
        }
    }
    catch (err) {
        p.log.error(`Failed to run test: ${err instanceof Error ? err.message : 'Unknown error'}`);
        process.exit(1);
    }
    p.log.info('');
    p.log.info(pc.dim('─'.repeat(50)));
    if (result.success) {
        p.log.success(pc.green('✓ All tests passed!'));
        // Report completion to server
        const completeSpinner = p.spinner();
        completeSpinner.start('Reporting progress...');
        const completeResponse = await apiRequest('/api/cli/complete', {
            method: 'POST',
            body: JSON.stringify({ stageId: stage.id })
        });
        if (completeResponse.ok && completeResponse.data) {
            const data = completeResponse.data;
            completeSpinner.stop('Progress saved!');
            p.log.success(`Stage ${stage.order} complete!`);
            p.log.info(`Progress: ${data.progress.completed}/${data.progress.total} stages`);
            if (data.challengeComplete) {
                p.log.info('');
                p.log.success(pc.bold('🎉 Challenge Complete! Congratulations!'));
            }
            else if (data.nextStage) {
                p.log.info('');
                p.log.info(`Next: Stage ${data.nextStage.order} - ${data.nextStage.title}`);
                p.log.info(`Run ${pc.cyan('craftcode test')} when ready.`);
            }
        }
        else {
            completeSpinner.stop('Failed to save progress');
            p.log.warning('Test passed but failed to save progress. Try again later.');
        }
    }
    else {
        p.log.error(pc.red(`✗ Tests failed (exit code: ${result.exitCode})`));
        p.log.info('');
        p.log.info('Review the output above and try again.');
        process.exit(1);
    }
    p.outro('Happy coding! 🚀');
}
