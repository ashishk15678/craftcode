export interface Config {
    token?: string;
    apiUrl?: string;
    user?: {
        id: string;
        email: string;
        name?: string;
    };
}
export declare function ensureConfigDir(): void;
export declare function loadConfig(): Config;
export declare function saveConfig(config: Config): void;
export declare function clearConfig(): void;
export declare function isAuthenticated(): boolean;
export declare function getToken(): string | undefined;
export declare function getApiUrl(): string;
