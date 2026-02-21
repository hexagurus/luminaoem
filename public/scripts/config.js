/**
 * Centralized API Configuration
 *
 * This file is the SINGLE SOURCE OF TRUTH for the API base URL.
 * To change the backend URL for production, update this file ONLY.
 *
 * - Development: http://localhost:8000
 * - Production: https://your-production-domain.com
 *
 * The window.__ENV__ mechanism allows injecting BASE_URL via HTML at deploy time,
 * falling back to auto-detection based on the current hostname.
 */

const BASE_URL = window.__ENV__?.BASE_URL
    || (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? `${window.location.protocol}//${window.location.hostname}:8000`
        : window.location.origin);

// Expose globally so all scripts can import it
window.BASE_URL = BASE_URL;
