#!/usr/bin/env node
import { Command } from 'commander';
import { login, logout, whoami } from './commands/auth.js';
import { test } from './commands/test.js';
import { status } from './commands/status.js';
const program = new Command();
program
    .name('craftcode')
    .description('CLI for CraftCode - Learn by building complex systems')
    .version('1.0.0');
// Auth commands
program
    .command('login')
    .description('Log in to CraftCode')
    .action(login);
program
    .command('logout')
    .description('Log out of CraftCode')
    .action(logout);
program
    .command('whoami')
    .description('Show current user')
    .action(whoami);
// Test command
program
    .command('test')
    .description('Run tests for your current stage')
    .option('-c, --challenge <slug>', 'Specify a challenge to test')
    .action(test);
// Status command
program
    .command('status')
    .description('Show your current progress')
    .action(status);
program.parse();
