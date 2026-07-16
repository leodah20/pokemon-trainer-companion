package com.pokemontrainercompanionmobile.overlay

import android.app.Activity
import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.graphics.Color
import android.graphics.PixelFormat
import android.media.projection.MediaProjectionManager
import android.net.Uri
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.provider.Settings
import android.view.Gravity
import android.view.WindowManager
import android.widget.TextView
import com.facebook.react.bridge.ActivityEventListener
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import java.io.File
import java.io.FileOutputStream

/**
 * The flagship real-time overlay's native half (see docs/architecture.md and the README's
 * "Flagship feature" section): a bare WindowManager floating window, the MediaProjection consent
 * flow, and (via [ScreenCaptureService]) live single-frame screen capture. Capture is on-demand
 * single frames, not continuous video -- the OCR pipeline only ever analyzes one still frame at a
 * time, so streaming would add cost and bridge traffic for no benefit.
 */
class OverlayModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext), ActivityEventListener {

  private var overlayView: TextView? = null
  private var screenCapturePermissionPromise: Promise? = null
  private var pendingProjectionResultCode: Int? = null
  private var pendingProjectionData: Intent? = null

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
   * screen?") and resolves with whether the trainer allowed it. The `data: Intent` Android hands
   * back on approval is kept (see [onActivityResult]) so [startLiveCapture] can open the actual
   * MediaProjection session from it afterwards.
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
    if (granted) {
      pendingProjectionResultCode = resultCode
      pendingProjectionData = data
    }
    screenCapturePermissionPromise?.resolve(granted)
    screenCapturePermissionPromise = null
  }

  override fun onNewIntent(intent: Intent) {
    // No-op: this module doesn't register for deep links / new intents, only activity results.
  }

  /**
   * Starts [ScreenCaptureService], which opens the actual MediaProjection session using the
   * consent token captured in [onActivityResult]. Must be called after
   * [requestScreenCapturePermission] resolves `true`.
   */
  @ReactMethod
  fun startLiveCapture(promise: Promise) {
    val resultCode = pendingProjectionResultCode
    val data = pendingProjectionData
    if (resultCode == null || data == null) {
      promise.reject("NO_CONSENT", "Call requestScreenCapturePermission first")
      return
    }

    val intent =
        Intent(reactApplicationContext, ScreenCaptureService::class.java).apply {
          putExtra(ScreenCaptureService.EXTRA_RESULT_CODE, resultCode)
          putExtra(ScreenCaptureService.EXTRA_DATA, data)
        }
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      reactApplicationContext.startForegroundService(intent)
    } else {
      reactApplicationContext.startService(intent)
    }
    promise.resolve(true)
  }

  /**
   * Grabs whatever frame the live capture session currently has, saves it as a PNG in the app's
   * cache dir, and resolves with its `file://` URI -- the same shape `analyzeScreenshot(uri)`
   * already expects from the gallery-picker flow, so the OCR pipeline needs no changes.
   */
  @ReactMethod
  fun captureLiveFrame(promise: Promise) {
    val service = ScreenCaptureService.instance
    if (service == null) {
      promise.reject("NOT_CAPTURING", "Live capture isn't running -- call startLiveCapture first")
      return
    }

    // The VirtualDisplay may not have produced a frame yet on the very first call right after
    // startLiveCapture -- give it a beat before reading from the ImageReader.
    Handler(Looper.getMainLooper())
        .postDelayed(
            {
              val bitmap = service.captureLatestFrame()
              if (bitmap == null) {
                promise.reject("NO_FRAME", "No frame available yet -- try again")
                return@postDelayed
              }
              try {
                val file =
                    File(reactApplicationContext.cacheDir, "ptc-live-capture-${System.currentTimeMillis()}.png")
                FileOutputStream(file).use { out -> bitmap.compress(Bitmap.CompressFormat.PNG, 100, out) }
                promise.resolve(Uri.fromFile(file).toString())
              } catch (error: Exception) {
                promise.reject("SAVE_FAILED", error)
              } finally {
                bitmap.recycle()
              }
            },
            150)
  }

  @ReactMethod
  fun stopLiveCapture(promise: Promise) {
    reactApplicationContext.stopService(Intent(reactApplicationContext, ScreenCaptureService::class.java))
    pendingProjectionResultCode = null
    pendingProjectionData = null
    promise.resolve(true)
  }

  companion object {
    const val NAME = "OverlayModule"
    private const val SCREEN_CAPTURE_REQUEST_CODE = 4201
  }
}
