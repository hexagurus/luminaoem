/**
 * Central API Helper
 *
 * Provides a single `apiRequest(endpoint, options)` function.
 * All fetch calls across all scripts should go through this helper.
 *
 * Usage:
 *   const data = await apiRequest('/api/events');
 *   const data = await apiRequest('/api/auth/login', { method: 'POST', body: JSON.stringify({...}) });
 *
 * Authentication: Pass 'x-auth-token' in options.headers if needed, or
 * use apiAuthRequest() which automatically includes the stored token.
 */

/**
 * Generic API request using the centralized BASE_URL.
 * @param {string} endpoint - The API path, e.g. '/api/events'
 * @param {RequestInit} options - Fetch options (method, headers, body, etc.)
 * @returns {Promise<Response>} - Raw fetch Response (caller decides .json()/.blob())
 */
async function apiRequest(endpoint, options = {}) {
    const url = `${window.BASE_URL}${endpoint}`;
    const defaultHeaders = { 'Content-Type': 'application/json' };

    return fetch(url, {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers
        }
    });
}

/**
 * Authenticated API request - automatically attaches the stored auth token.
 * @param {string} endpoint - The API path
 * @param {RequestInit} options - Fetch options
 * @returns {Promise<Response>}
 */
async function apiAuthRequest(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    return apiRequest(endpoint, {
        ...options,
        headers: {
            'x-auth-token': token,
            ...options.headers
        }
    });
}

// Expose globally
window.apiRequest = apiRequest;
window.apiAuthRequest = apiAuthRequest;
