import fs from "fs";
import path from "path";
import os from "os";
const CONFIG_DIR = path.join(os.homedir(), ".craftcode");
const CONFIG_FILE = path.join(CONFIG_DIR, "config.json");
export function ensureConfigDir() {
    if (!fs.existsSync(CONFIG_DIR)) {
        fs.mkdirSync(CONFIG_DIR, { recursive: true });
    }
}
export function loadConfig() {
    ensureConfigDir();
    if (!fs.existsSync(CONFIG_FILE)) {
        return {
            apiUrl: "http://localhost:5173",
        };
    }
    try {
        const content = fs.readFileSync(CONFIG_FILE, "utf-8");
        return JSON.parse(content);
    }
    catch {
        return {
            apiUrl: "http://localhost:5173",
        };
    }
}
export function saveConfig(config) {
    ensureConfigDir();
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}
export function clearConfig() {
    saveConfig({
        apiUrl: "http://localhost:5173",
    });
}
export function isAuthenticated() {
    const config = loadConfig();
    return !!config.token;
}
export function getToken() {
    return loadConfig().token;
}
export function getApiUrl() {
    return loadConfig().apiUrl || "http://localhost:5173";
}
