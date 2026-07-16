package com.pokemontrainercompanionmobile.overlay

import android.app.Activity
import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.graphics.PixelFormat
import android.media.projection.MediaProjectionManager
import android.net.Uri
import android.os.Build
import android.provider.Settings
import android.view.Gravity
import android.view.WindowManager
import android.widget.TextView
import com.facebook.react.bridge.ActivityEventListener
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

/**
 * Scaffolding for the flagship real-time overlay (see docs/architecture.md and the README's
 * "Flagship feature" section) -- proves the permission flows and a bare WindowManager floating
 * window work end to end. Actual screen capture (reading frames via MediaProjection into a
 * VirtualDisplay/ImageReader, feeding the OCR pipeline) is NOT implemented here on purpose: this
 * module only shows a static placeholder view and round-trips the capture *consent* dialog, it
 * never reads a single pixel from the screen. Real capture also needs its own foreground service
 * (required by Android 10+ once a MediaProjection session actually starts), which is separate,
 * larger work than what's scaffolded so far.
 */
class OverlayModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext), ActivityEventListener {

  private var overlayView: TextView? = null
  private var screenCapturePermissionPromise: Promise? = null

  init {
    reactContext.addActivityEventListener(this)
  }

  override fun getName(): String = NAME

  @ReactMethod
  fun hasOverlayPermission(promise: Promise) {
    promise.resolve(Settings.canDrawOverlays(reactApplicationContext))
  }

  /** Opens the system "draw over other apps" settings screen for this app -- Android requires a
   * user-driven grant for this permission, it cannot be requested via a normal runtime prompt. */
  @ReactMethod
  fun requestOverlayPermission() {
    val intent =
        Intent(
                Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                Uri.parse("package:" + reactApplicationContext.packageName))
            .apply { addFlags(Intent.FLAG_ACTIVITY_NEW_TASK) }
    reactApplicationContext.startActivity(intent)
  }

  @ReactMethod
  fun showOverlay(promise: Promise) {
    if (!Settings.canDrawOverlays(reactApplicationContext)) {
      promise.reject("NO_PERMISSION", "Overlay permission not granted")
      return
    }
    if (overlayView != null) {
      promise.resolve(true)
      return
    }

    val windowManager =
        reactApplicationContext.getSystemService(Context.WINDOW_SERVICE) as WindowManager
    val overlayType =
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
          WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
        } else {
          @Suppress("DEPRECATION") WindowManager.LayoutParams.TYPE_PHONE
        }
    val params =
        WindowManager.LayoutParams(
                WindowManager.LayoutParams.WRAP_CONTENT,
                WindowManager.LayoutParams.WRAP_CONTENT,
                overlayType,
                WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or
                    WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL,
                PixelFormat.TRANSLUCENT)
            .apply {
              gravity = Gravity.TOP or Gravity.START
              x = 40
              y = 200
            }

    val view =
        TextView(reactApplicationContext).apply {
          text = "PTC overlay (test)"
          setTextColor(Color.WHITE)
          setBackgroundColor(Color.parseColor("#CC1A1A2E"))
          setPadding(32, 20, 32, 20)
        }

    windowManager.addView(view, params)
    overlayView = view
    promise.resolve(true)
  }

  @ReactMethod
  fun hideOverlay(promise: Promise) {
    val view = overlayView
    if (view != null) {
      val windowManager =
          reactApplicationContext.getSystemService(Context.WINDOW_SERVICE) as WindowManager
      windowManager.removeView(view)
      overlayView = null
    }
    promise.resolve(true)
  }

  /**
   * Triggers Android's system screen-capture consent dialog ("Start recording or casting your
   * screen?") and resolves with whether the trainer allowed it. Does NOT start capturing
   * anything -- the `data: Intent` Android hands back on approval (needed to actually open a
   * MediaProjection session) is discarded in [onActivityResult] below. That's the next real
   * milestone, not this one.
   */
  @ReactMethod
  fun requestScreenCapturePermission(promise: Promise) {
    val activity = reactApplicationContext.currentActivity
    if (activity == null) {
      promise.reject("NO_ACTIVITY", "No foreground activity to request screen capture from")
      return
    }
    if (screenCapturePermissionPromise != null) {
      promise.reject("REQUEST_IN_PROGRESS", "A screen capture permission request is already pending")
      return
    }
    val projectionManager =
        activity.getSystemService(Context.MEDIA_PROJECTION_SERVICE) as MediaProjectionManager
    screenCapturePermissionPromise = promise
    activity.startActivityForResult(
        projectionManager.createScreenCaptureIntent(), SCREEN_CAPTURE_REQUEST_CODE)
  }

  override fun onActivityResult(activity: Activity, requestCode: Int, resultCode: Int, data: Intent?) {
    if (requestCode != SCREEN_CAPTURE_REQUEST_CODE) {
      return
    }
    val granted = resultCode == Activity.RESULT_OK && data != null
    screenCapturePermissionPromise?.resolve(granted)
    screenCapturePermissionPromise = null
  }

  override fun onNewIntent(intent: Intent) {
    // No-op: this module doesn't register for deep links / new intents, only activity results.
  }

  companion object {
    const val NAME = "OverlayModule"
    private const val SCREEN_CAPTURE_REQUEST_CODE = 4201
  }
}
