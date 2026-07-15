/**
 * Backend base URL for the (optional) Companion AI endpoint. Every other feature in this app is
 * fully offline and never touches this — see docs/architecture.md. Defaults to the Android
 * emulator's host-loopback alias (10.0.2.2), which reaches a backend running on your dev machine.
 *
 * Testing on a physical device instead of the emulator? Change this to your dev machine's LAN IP
 * (e.g. 'http://192.168.1.42:3000/api') — the phone and your computer must be on the same
 * Wi-Fi network, and the backend must actually be running (`npm run dev` from the repo root).
 */
export const BACKEND_BASE_URL = 'http://10.0.2.2:3000/api';
