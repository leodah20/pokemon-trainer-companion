import { NativeModules, Platform } from 'react-native';

interface OverlayNativeModule {
  hasOverlayPermission(): Promise<boolean>;
  requestOverlayPermission(): void;
  showOverlay(): Promise<boolean>;
  hideOverlay(): Promise<boolean>;
  requestScreenCapturePermission(): Promise<boolean>;
  startLiveCapture(): Promise<boolean>;
  captureLiveFrame(): Promise<string>;
  stopLiveCapture(): Promise<boolean>;
}

const { OverlayModule } = NativeModules as { OverlayModule?: OverlayNativeModule };

/**
 * Thin wrapper over the native OverlayModule (Android only -- see
 * android/.../overlay/OverlayModule.kt and ScreenCaptureService.kt). Every function is a safe
 * no-op on iOS or if the native module isn't linked, so callers never need their own platform
 * checks.
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
 * allowed it. Call `startLiveCapture()` afterwards to actually open the capture session.
 */
export async function requestScreenCapturePermission(): Promise<boolean> {
  if (!isOverlaySupported()) {
    return false;
  }
  return OverlayModule!.requestScreenCapturePermission();
}

/**
 * Starts the foreground service that opens the real MediaProjection session using the consent
 * granted by `requestScreenCapturePermission()`. Must be called once before `captureLiveFrame()`.
 */
export async function startLiveCapture(): Promise<boolean> {
  if (!isOverlaySupported()) {
    return false;
  }
  return OverlayModule!.startLiveCapture();
}

/**
 * Grabs the current screen as a single frame and returns a `file://` URI for it -- the same shape
 * `analyzeScreenshot(uri)` already expects from the gallery-picker flow. Returns `null` if no
 * frame is available yet (e.g. called immediately after `startLiveCapture()`).
 */
export async function captureLiveFrame(): Promise<string | null> {
  if (!isOverlaySupported()) {
    return null;
  }
  try {
    return await OverlayModule!.captureLiveFrame();
  } catch {
    return null;
  }
}

export async function stopLiveCapture(): Promise<boolean> {
  if (!isOverlaySupported()) {
    return false;
  }
  return OverlayModule!.stopLiveCapture();
}
