import { getToken, getApiUrl } from './config.js';
export async function apiRequest(endpoint, options = {}) {
    const token = getToken();
    const apiUrl = getApiUrl();
    const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {})
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    try {
        const response = await fetch(`${apiUrl}${endpoint}`, {
            ...options,
            headers
        });
        const data = await response.json().catch(() => null);
        if (!response.ok) {
            return {
                ok: false,
                status: response.status,
                error: data?.error || `Request failed with status ${response.status}`
            };
        }
        return {
            ok: true,
            status: response.status,
            data: data
        };
    }
    catch (err) {
        return {
            ok: false,
            status: 0,
            error: err instanceof Error ? err.message : 'Network error'
        };
    }
}
