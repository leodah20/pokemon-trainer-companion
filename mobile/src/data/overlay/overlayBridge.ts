import { NativeEventEmitter, NativeModules, Platform } from 'react-native';

interface OverlayNativeModule {
  hasOverlayPermission(): Promise<boolean>;
  requestOverlayPermission(): void;
  showOverlay(): Promise<boolean>;
  hideOverlay(): Promise<boolean>;
  updateOverlayText(text: string): Promise<boolean>;
  requestScreenCapturePermission(): Promise<boolean>;
  startLiveCapture(): Promise<boolean>;
  captureLiveFrame(): Promise<string>;
  stopLiveCapture(): Promise<boolean>;
}

const OVERLAY_TAPPED_EVENT = 'PTCOverlayTapped';
const OVERLAY_FRAME_TEXT_EVENT = 'PTCOverlayFrameText';

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

/** Pushes fresh text into the already-shown floating window -- how the live-capture loop
 * displays a species/CP/tip reading without recreating the overlay each time. */
export async function updateOverlayText(text: string): Promise<boolean> {
  if (!isOverlaySupported()) {
    return false;
  }
  return OverlayModule!.updateOverlayText(text);
}

/** Subscribes to taps on the floating overlay window. Returns an unsubscribe function; a no-op
 * one on iOS or if the native module isn't linked. */
export function onOverlayTapped(listener: () => void): () => void {
  if (!isOverlaySupported()) {
    return () => {};
  }
  const emitter = new NativeEventEmitter(NativeModules.OverlayModule);
  const subscription = emitter.addListener(OVERLAY_TAPPED_EVENT, listener);
  return () => subscription.remove();
}

/**
 * Subscribes to text recognized by the native live-capture polling loop (see
 * ScreenCaptureService.kt's `startPolling`). This loop runs natively -- not as a JS timer -- so it
 * keeps firing while PTC is backgrounded and the trainer is looking at the actual game, which a
 * setInterval tied to a screen component cannot reliably do. Returns an unsubscribe function; a
 * no-op one on iOS or if the native module isn't linked.
 */
export function onOverlayFrameText(listener: (text: string) => void): () => void {
  if (!isOverlaySupported()) {
    return () => {};
  }
  const emitter = new NativeEventEmitter(NativeModules.OverlayModule);
  const subscription = emitter.addListener(OVERLAY_FRAME_TEXT_EVENT, listener);
  return () => subscription.remove();
}
