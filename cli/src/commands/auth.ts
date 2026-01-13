import * as p from '@clack/prompts';
import pc from 'picocolors';
import { saveConfig, loadConfig, clearConfig, isAuthenticated } from '../utils/config.js';
import { apiRequest } from '../utils/api.js';

interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name?: string;
  };
}

export async function login(): Promise<void> {
  p.intro(pc.bgCyan(pc.black(' CraftCode Login ')));

  if (isAuthenticated()) {
    const config = loadConfig();
    const shouldLogout = await p.confirm({
      message: `Already logged in as ${config.user?.email}. Log out?`
    });

    if (p.isCancel(shouldLogout)) {
      p.cancel('Cancelled');
      process.exit(0);
    }

    if (shouldLogout) {
      clearConfig();
      p.log.success('Logged out successfully');
    }
    return;
  }

  // For now, we use a simple flow where user logs in via browser
  // and enters a token. A more advanced flow would open browser and use OAuth.
  
  p.log.info('To log in, you need to generate a CLI token from the website.');
  p.log.info(`Visit: ${pc.cyan(loadConfig().apiUrl + '/profile/tokens')}`);
  p.log.info('');

  const token = await p.text({
    message: 'Enter your CLI token:',
    placeholder: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
    validate: (value) => {
      if (!value || value.length < 10) {
        return 'Please enter a valid token';
      }
    }
  });

  if (p.isCancel(token)) {
    p.cancel('Cancelled');
    process.exit(0);
  }

  const spinner = p.spinner();
  spinner.start('Verifying token...');

  // Save token temporarily to make the API request
  const config = loadConfig();
  config.token = token;
  saveConfig(config);

  // Verify by making a request
  const response = await apiRequest<{ stage?: object; noChallenge?: boolean }>('/api/cli/stage');

  if (!response.ok) {
    clearConfig();
    spinner.stop('Token verification failed');
    p.log.error(response.error || 'Invalid token');
    process.exit(1);
  }

  spinner.stop('Token verified!');
  p.log.success('Successfully logged in!');
  p.outro('Run `craftcode test` to start testing your code.');
}

export async function logout(): Promise<void> {
  if (!isAuthenticated()) {
    p.log.warning('Not logged in');
    return;
  }

  clearConfig();
  p.log.success('Logged out successfully');
}

export async function whoami(): Promise<void> {
  const config = loadConfig();

  if (!config.token) {
    p.log.warning('Not logged in. Run `craftcode login` to authenticate.');
    return;
  }

  if (config.user) {
    p.log.info(`Logged in as: ${pc.cyan(config.user.email)}`);
    if (config.user.name) {
      p.log.info(`Name: ${config.user.name}`);
    }
  } else {
    p.log.info('Logged in (checking status...)');
    
    const response = await apiRequest('/api/cli/stage');
    if (!response.ok) {
      p.log.warning('Session may have expired. Run `craftcode login` to re-authenticate.');
    } else {
      p.log.success('Session is valid');
    }
  }
}
