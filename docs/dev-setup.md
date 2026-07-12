# Local Development Setup

Step-by-step guide to get the whole stack running from a fresh clone: backend API, PostgreSQL,
and the mobile app on an Android emulator.

## Prerequisites

- Node.js 22+ and npm
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (for PostgreSQL)
- Android SDK + JDK, with `ANDROID_HOME` and `JAVA_HOME` set, and an Android emulator (AVD)
  created — see the Android section below if this isn't set up yet.

## 1. Install dependencies

```
npm install                    # repo root — installs concurrently
npm --prefix backend install
npm --prefix mobile install
```

## 2. Configure environment variables

```
cp .env.example .env                     # repo root — Postgres credentials for Docker
cp backend/.env.example backend/.env     # backend — DATABASE_URL for Prisma
```

The `POSTGRES_*` values in the root `.env` and the `DATABASE_URL` in `backend/.env` must describe
the same user/password/database/port — the defaults in both `.env.example` files already match,
so you only need to edit them if you intentionally change one.

## 3. Start PostgreSQL

```
docker compose up -d
```

This starts Postgres on port 5432 (or whatever `POSTGRES_PORT` is set to) with a persistent
volume, so data survives container restarts.

## 4. Run Prisma migrations

```
cd backend
npx prisma migrate dev --name init
```

This creates the tables described in `backend/prisma/schema.prisma` (see
`../docs/entity-relationship-diagram.md` for the model). Re-run `npx prisma migrate dev` any time
`schema.prisma` changes.

**Note:** the backend doesn't have a `PrismaService` wired into the NestJS DI container yet — that
lands with the first feature that actually needs the database. Migrations and Prisma Studio work
independently of that.

## 5. Run backend + Metro bundler together

From the repo root:

```
npm run dev
```

This runs the backend (`start:dev`, watch mode) and the Metro bundler side by side via
`concurrently`, each with its own colored prefix in the terminal so you can tell their logs apart.

## 6. Run the mobile app on an Android emulator

In a separate terminal, with an emulator already running:

```
npm --prefix mobile run android
```

This builds the debug APK and installs it on whichever emulator/device is connected, then connects
to the Metro bundler already running from step 5 for the JS bundle.

### Setting up the Android emulator (first time only)

If you don't have an AVD yet: open Android Studio's Device Manager and create one (any recent
Pixel profile + a `google_apis` system image works), or use the command-line tools:

```
sdkmanager --install "system-images;android-36;google_apis;x86_64"
avdmanager create avd --name pokemon_trainer_companion --package "system-images;android-36;google_apis;x86_64" --device pixel_6
emulator -avd pokemon_trainer_companion
```

## 7. Prisma Studio (inspect/edit the database in the browser)

```
cd backend
npx prisma studio
```

Opens a local web UI (default `http://localhost:5555`) to browse and edit rows directly — useful
for checking what a migration actually created, or seeding data by hand while a feature is mid-way.

## Inspecting the mobile app: adb logcat

With the emulator running and the app installed:

```
# All logs from just this app's process
adb logcat --pid=$(adb shell pidof -s com.pokemontrainercompanionmobile)

# Only JS console.log/warn/error output from the React Native bundle
adb logcat -s ReactNativeJS

# Only errors, across the whole device
adb logcat *:E

# Clear the buffer before reproducing an issue, so logs start clean
adb logcat -c
```

## Inspecting HTTP requests from the mobile app: Flipper

[Flipper](https://fbflipper.com/) is the standard desktop tool for inspecting a running React
Native app: network requests, layout inspector, and more, all in one place. Install it separately
and connect it to the running debug build to see every request the app makes to the backend.
Flipper support varies by React Native version — if it doesn't auto-detect the app, check the
[React Native Flipper docs](https://reactnative.dev/docs/debugging) for the version-specific setup
step, since this has changed across recent RN releases.

## Summary: first-time setup, in order

```
npm install
npm --prefix backend install
npm --prefix mobile install
cp .env.example .env
cp backend/.env.example backend/.env
docker compose up -d
cd backend && npx prisma migrate dev --name init && cd ..
npm run dev                        # keep running in this terminal
# --- in a second terminal, with an emulator already running ---
npm --prefix mobile run android
```
