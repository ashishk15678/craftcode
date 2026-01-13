export interface ApiResponse<T = unknown> {
    ok: boolean;
    status: number;
    data?: T;
    error?: string;
}
export declare function apiRequest<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>>;
