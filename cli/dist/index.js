#!/usr/bin/env node
import { Command } from "commander";
import { login, logout, whoami } from "./commands/auth.js";
import { init } from "./commands/init.js";
import { test } from "./commands/test.js";
import { status } from "./commands/status.js";
const program = new Command();
program
    .name("craftcode")
    .description("CLI for CraftCode - Learn by building complex systems")
    .version("1.0.0");
// Auth commands
program.command("login").description("Log in to CraftCode").action(login);
program.command("logout").description("Log out of CraftCode").action(logout);
program.command("whoami").description("Show current user").action(whoami);
// Init command
program
    .command("init")
    .description("Initialize a challenge in current directory")
    .requiredOption("-c, --challenge <slug>", "Challenge slug to initialize")
    .option("--no-scaffold", "Skip scaffolding starter files")
    .action(init);
// Test command
program
    .command("test")
    .description("Run tests for your current stage")
    .option("-c, --challenge <slug>", "Specify a challenge to test (deprecated, use init)")
    .option("-v, --verbose", "Show detailed error output")
    .action(test);
// Status command
program
    .command("status")
    .description("Show your current progress")
    .action(status);
program.parse();
