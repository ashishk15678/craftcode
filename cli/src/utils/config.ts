import fs from "fs";
import path from "path";
import os from "os";

const CONFIG_DIR = path.join(os.homedir(), ".craftcode");
const CONFIG_FILE = path.join(CONFIG_DIR, "config.json");

export interface Config {
  token?: string;
  apiUrl?: string;
  user?: {
    id: string;
    email: string;
    name?: string;
  };
}

export function ensureConfigDir(): void {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }
}

export function loadConfig(): Config {
  ensureConfigDir();

  if (!fs.existsSync(CONFIG_FILE)) {
    return {
      apiUrl: "http://localhost:5173",
    };
  }

  try {
    const content = fs.readFileSync(CONFIG_FILE, "utf-8");
    return JSON.parse(content);
  } catch {
    return {
      apiUrl: "http://localhost:5173",
    };
  }
}

export function saveConfig(config: Config): void {
  ensureConfigDir();
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

export function clearConfig(): void {
  saveConfig({
    apiUrl: "http://localhost:5173",
  });
}

export function isAuthenticated(): boolean {
  const config = loadConfig();
  return !!config.token;
}

export function getToken(): string | undefined {
  return loadConfig().token;
}

export function getApiUrl(): string {
  return loadConfig().apiUrl || "http://localhost:5173";
}
