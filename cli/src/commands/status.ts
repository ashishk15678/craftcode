import * as p from '@clack/prompts';
import pc from 'picocolors';
import { isAuthenticated } from '../utils/config.js';
import { apiRequest } from '../utils/api.js';

interface StageResponse {
  stage?: {
    id: string;
    order: number;
    title: string;
    challengeTitle: string;
    challengeSlug: string;
  };
  message?: string;
  challengeComplete?: boolean;
  challenge?: {
    title: string;
    slug: string;
  };
  noChallenge?: boolean;
}

export async function status(): Promise<void> {
  p.intro(pc.bgBlue(pc.black(' CraftCode Status ')));

  if (!isAuthenticated()) {
    p.log.error('Not logged in. Run `craftcode login` first.');
    process.exit(1);
  }

  const spinner = p.spinner();
  spinner.start('Fetching status...');

  const response = await apiRequest<StageResponse>('/api/cli/stage');

  if (!response.ok) {
    spinner.stop('Failed to fetch status');
    p.log.error(response.error || 'Failed to get status');
    process.exit(1);
  }

  const data = response.data!;
  spinner.stop('Status retrieved');

  if (data.noChallenge) {
    p.log.info('No active challenge.');
    p.log.info('');
    p.log.info('Start a challenge on the website:');
    p.log.info(pc.cyan('  https://craftcode.dev/challenges'));
    return;
  }

  if (data.challengeComplete && data.challenge) {
    p.log.success(`🎉 Challenge "${data.challenge.title}" complete!`);
    p.log.info('');
    p.log.info('Start a new challenge on the website.');
    return;
  }

  if (data.stage) {
    const stage = data.stage;
    
    p.log.info(pc.bold('Current Challenge'));
    p.log.info(`  ${pc.cyan(stage.challengeTitle)}`);
    p.log.info('');
    p.log.info(pc.bold('Current Stage'));
    p.log.info(`  Stage ${stage.order}: ${stage.title}`);
    p.log.info('');
    p.log.info(`Run ${pc.cyan('craftcode test')} to test your implementation.`);
  }

  p.outro('');
}
