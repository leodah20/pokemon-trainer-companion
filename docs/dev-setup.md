# Local Development Setup

Step-by-step guide to get the whole stack running from a fresh clone: backend API, PostgreSQL,
and the mobile app on an Android emulator or physical device.

## Prerequisites

- Node.js 22+ and npm
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (for PostgreSQL)
- Android SDK + JDK, with `ANDROID_HOME` and `JAVA_HOME` set
- For physical device: USB debugging enabled on your phone

## 1. Install dependencies

```bash
npm install                    # repo root — installs concurrently
npm --prefix backend install
npm --prefix mobile install
```

## 2. Configure environment variables

```bash
cp .env.example .env                     # repo root — Postgres credentials for Docker
cp backend/.env.example backend/.env     # backend — DATABASE_URL for Prisma
```

The `POSTGRES_*` values in the root `.env` and the `DATABASE_URL` in `backend/.env` must describe
the same user/password/database/port — the defaults in both `.env.example` files already match.

### Optional: Companion AI (`GEMINI_API_KEY`)

Everything else in this app works with zero configuration. The one exception is
`POST /api/companion/suggest` (AI-generated tips, not the free rule-based ones) — it needs a
Gemini API key:

1. Get a free key at [aistudio.google.com/apikey](https://aistudio.google.com/apikey) (no credit
   card — the free tier is 1,500 requests/day on the Flash/Flash-Lite models this endpoint uses).
2. Add it to `backend/.env`: `GEMINI_API_KEY=your-key-here`.

Without it, the endpoint returns a clean `503` instead of crashing — nothing else in the app is
affected.

**Testing from the mobile app:** it needs to reach the backend over the network, which is new —
every other mobile feature is offline. Check `mobile/src/config.ts`:
- Android emulator: default `http://10.0.2.2:3000/api` already works (10.0.2.2 is the emulator's
  alias for your dev machine's `localhost`).
- Physical device: change it to your dev machine's LAN IP (e.g. `http://192.168.1.42:3000/api`)
  — phone and computer must be on the same Wi-Fi, and `npm run dev` must be running.

## 3. Start PostgreSQL

```bash
docker compose up -d
```

This starts Postgres on port 5432 (default) with a persistent volume.

## 4. Run Prisma migrations

```bash
cd backend
npx prisma migrate dev --name init
```

This creates the tables from `backend/prisma/schema.prisma`. Re-run any time the schema changes.

## 5. Run backend + Metro bundler together

From the repo root:

```bash
npm run dev
```

This runs the backend (`start:dev`, watch mode) and the Metro bundler side by side via
`concurrently`, each with its own colored prefix.

## 6. Run the mobile app

### Option A: Android emulator

An AVD named `pokemon_trainer_companion` already exists on this machine — this is the
recommended default for day-to-day work, since it doesn't depend on a physical phone staying
connected over USB.

```bash
# Start the emulator (headless-friendly; drop -no-window to see it)
"$ANDROID_HOME/emulator/emulator" -avd pokemon_trainer_companion &

# Wait for it to finish booting before installing
adb wait-for-device shell 'while [[ -z $(getprop sys.boot_completed) ]]; do sleep 1; done'

cd mobile/android
./gradlew installDebug   # or: npx react-native run-android, from mobile/

# adb reverse is technically not required for emulators (they resolve localhost:8081 via
# 10.0.2.2 automatically), but running it is harmless and keeps the same command working for
# both emulator and physical device:
adb -s emulator-5554 reverse tcp:8081 tcp:8081
```

If the AVD doesn't exist yet (fresh machine):

```bash
sdkmanager --install "system-images;android-36;google_apis;x86_64"
avdmanager create avd --name pokemon_trainer_companion \
  --package "system-images;android-36;google_apis;x86_64" --device pixel_6
emulator -avd pokemon_trainer_companion
```

### Option B: Physical Android device (USB debugging)

1. **Enable Developer Options** on your phone:
   - Settings → About Phone → Tap "Build Number" 7 times

2. **Enable USB Debugging**:
   - Settings → Developer Options → USB Debugging → ON

3. **Connect the phone** via USB cable.

4. **Verify connection**:
   ```bash
   adb devices
   ```
   You should see a device serial (e.g. `7D7L5POBUGXWR8XO`) with status `device`.

5. **If the device shows as `offline`**:
   ```bash
   adb kill-server
   adb start-server
   adb devices
   ```
   Reconnect the USB cable if it's still offline.

6. **Set up the reverse port forwarding** (required so the phone can reach Metro):
   ```bash
   adb -s YOUR_SERIAL reverse tcp:8081 tcp:8081
   ```
   Replace `YOUR_SERIAL` with the serial from step 4 (e.g. `7D7L5POBUGXWR8XO`).

7. **Build and install**:
   ```bash
   cd mobile
   npx react-native run-android --device YOUR_SERIAL
   ```

   > **Note:** If you see a warning about `@react-native-community/cli`, it's benign — the
   > package is already installed. The `--deviceId` flag is deprecated but still works. For
   > newer RN versions, use `--device "device_name"` instead.

8. **Hot-reload**: Once running, edit any file in `mobile/src/` and save — the app updates
   automatically in 1–2 seconds without reinstalling.

### Troubleshooting ADB issues

| Symptom | Fix |
|---------|-----|
| `device offline` | `adb kill-server && adb start-server && adb devices` |
| `unauthorized` | Check phone screen — accept the RSA key prompt |
| `no devices/emulators found` | Check USB cable, try another port, enable USB debugging |
| `grep: command not found` | The `--list-devices` flag uses `grep` internally on Git Bash. Use `--deviceId` instead. |
| `INSTALL_FAILED_USER_RESTRICTED: Install canceled by user` (Xiaomi/HyperOS) | Regular "USB debugging" + "Install via USB" toggles are **not enough** on Xiaomi/HyperOS/MIUI. Enable Developer Options → **"USB debugging (Security settings)"** ("Depuração USB (Config. de segurança)") as well — this requires a Mi Account signed in on the device and an active internet connection to verify. Confirmed fix on a Redmi/POCO "rodin" device, Android 16/HyperOS, 2026-07-14. |
| Red "Unable to load script" screen on a debug build (physical device) | The device can't reach Metro. Run `adb reverse tcp:8081 tcp:8081` (must be re-run after every USB reconnect/reboot), and make sure Metro (`npx react-native start` or `npm run dev`) is actually running. Then reload — see next row. |
| App stuck on a blank/gray screen after install or after fixing the above | `adb shell am start -n <pkg>/.MainActivity` only brings the existing activity to the foreground — it does **not** re-fetch the JS bundle if the RN instance already failed to load it once. Force a real cold start instead: `adb shell am force-stop <package>` then `adb shell am start -n <pkg>/.MainActivity`. Watch the Metro terminal for a `BUNDLE ./index.js` progress line to confirm the device actually requested it. |
| `Error: listen EADDRINUSE: address already in use :::8081` when starting Metro | Another Metro instance (yours or a background one someone else started, e.g. `nohup npx react-native start &`) is already holding port 8081. Find and stop it — on Windows: `Get-Process node \| Stop-Process -Force` (kills *all* Node processes, safe in a dev-only setup) — then start Metro again. Only one Metro instance should run at a time; running two doesn't share state and the app will randomly connect to whichever one wins. |

## 7. Prisma Studio (inspect database in browser)

```bash
cd backend
npx prisma studio
```

Opens a local web UI (default `http://localhost:5555`) to browse and edit rows.

## Inspecting the mobile app: adb logcat

With the app installed and running:

```bash
# Only JS console.log/warn/error from the React Native bundle
adb logcat -s ReactNativeJS

# All logs from this app's process
adb logcat --pid=$(adb shell pidof -s com.pokemontrainercompanionmobile)

# Only errors across the whole device
adb logcat *:E

# Clear buffer before reproducing an issue
adb logcat -c
```

## Summary: first-time setup

```bash
# 1. Install everything
npm install
npm --prefix backend install
npm --prefix mobile install

# 2. Configure environment
cp .env.example .env
cp backend/.env.example backend/.env

# 3. Start database
docker compose up -d

# 4. Run migrations
cd backend && npx prisma migrate dev --name init && cd ..

# 5. Start backend + Metro (keep running in this terminal)
npm run dev

# 6. In another terminal, build + install on device
cd mobile
npx react-native run-android            # emulator
npx react-native run-android --deviceId SERIAL  # physical device
```
