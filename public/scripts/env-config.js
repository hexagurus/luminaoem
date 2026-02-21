/**
 * Frontend Environment Configuration
 *
 * ⚠️  IMPORTANT — UPDATE THIS FILE BEFORE DEPLOYING TO VERCEL:
 *
 * Set BASE_URL to wherever your backend (Node/Express server) is hosted.
 *
 * Examples:
 *   Render:   https://your-app.onrender.com
 *   Railway:  https://your-app.up.railway.app
 *   EC2/VPS:  https://api.yourdomain.com
 *
 * Locally, this file is OVERRIDDEN by the dynamic Express route in server.js
 * (which reads from .env), so local changes here have no effect during dev.
 */
window.__ENV__ = {
    BASE_URL: 'https://luminaoems.onrender.com'
};
