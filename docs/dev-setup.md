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

In a separate terminal, with an emulator already running:

```bash
cd mobile
npx react-native run-android
```

The first time the emulator doesn't exist:

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
   npx react-native run-android --deviceId YOUR_SERIAL
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
