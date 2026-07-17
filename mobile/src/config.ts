/**
 * Backend base URL for the (optional) Companion AI endpoint. Every other feature in this app is
 * fully offline and never touches this — see docs/architecture.md.
 *
 * For BETA: hosted on Render (free tier, no credit card needed).
 * After deploying the backend to Render, put your Render URL here, e.g.:
 *   https://pokemon-trainer-companion.onrender.com/api
 *
 * For local dev: use your PC's WiFi IP, e.g. http://192.168.x.x:3000/api
 * and run: adb reverse tcp:3000 tcp:3000 (for USB) or just be on the same WiFi.
 */
export const BACKEND_BASE_URL = 'https://pokemon-trainer-companion.onrender.com/api';
