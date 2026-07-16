package com.pokemontrainercompanionmobile.overlay

import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.graphics.PixelFormat
import android.net.Uri
import android.os.Build
import android.provider.Settings
import android.view.Gravity
import android.view.WindowManager
import android.widget.TextView
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

/**
 * Scaffolding for the flagship real-time overlay (see docs/architecture.md and the README's
 * "Flagship feature" section) -- proves the permission flow and a bare WindowManager floating
 * window work end to end. Screen capture (MediaProjection) is a separate, larger piece that
 * still needs its own foreground service and is NOT implemented here on purpose: this module
 * only shows a static placeholder view, it never reads anything from the screen.
 */
class OverlayModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

  private var overlayView: TextView? = null

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

  companion object {
    const val NAME = "OverlayModule"
  }
}
