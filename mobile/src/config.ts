/**
 * Backend base URL for the (optional) Companion AI endpoint. Every other feature in this app is
 * fully offline and never touches this — see docs/architecture.md.
 *
 * Uses `localhost`, same as the Metro bundler (port 8081) — both the Android emulator and a
 * physical device over USB reach it via `adb reverse tcp:3000 tcp:3000`, which forwards the
 * device's localhost:3000 to your dev machine's localhost:3000. Re-run that command after every
 * USB reconnect/emulator restart, same as the Metro one (see docs/dev-setup.md).
 */
export const BACKEND_BASE_URL = 'http://localhost:3000/api';
