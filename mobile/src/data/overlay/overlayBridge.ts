import { NativeModules, Platform } from 'react-native';

interface OverlayNativeModule {
  hasOverlayPermission(): Promise<boolean>;
  requestOverlayPermission(): void;
  showOverlay(): Promise<boolean>;
  hideOverlay(): Promise<boolean>;
  requestScreenCapturePermission(): Promise<boolean>;
}

const { OverlayModule } = NativeModules as { OverlayModule?: OverlayNativeModule };

/**
 * Thin wrapper over the native OverlayModule (Android only -- see
 * android/.../overlay/OverlayModule.kt). This is scaffolding for the flagship real-time overlay:
 * it proves the permission flow and a bare floating window work, but does not read anything from
 * the screen yet (no MediaProjection capture). Every function is a safe no-op on iOS or if the
 * native module isn't linked, so callers never need their own platform checks.
 */
export function isOverlaySupported(): boolean {
  return Platform.OS === 'android' && OverlayModule != null;
}

export async function hasOverlayPermission(): Promise<boolean> {
  if (!isOverlaySupported()) {
    return false;
  }
  return OverlayModule!.hasOverlayPermission();
}

export function requestOverlayPermission(): void {
  if (isOverlaySupported()) {
    OverlayModule!.requestOverlayPermission();
  }
}

export async function showTestOverlay(): Promise<boolean> {
  if (!isOverlaySupported()) {
    return false;
  }
  return OverlayModule!.showOverlay();
}

export async function hideTestOverlay(): Promise<boolean> {
  if (!isOverlaySupported()) {
    return false;
  }
  return OverlayModule!.hideOverlay();
}

/**
 * Shows Android's system screen-capture consent dialog and resolves with whether the trainer
 * allowed it. Scaffolding only — no capture session is actually started (see
 * OverlayModule.kt's requestScreenCapturePermission for why).
 */
export async function requestScreenCapturePermission(): Promise<boolean> {
  if (!isOverlaySupported()) {
    return false;
  }
  return OverlayModule!.requestScreenCapturePermission();
}
