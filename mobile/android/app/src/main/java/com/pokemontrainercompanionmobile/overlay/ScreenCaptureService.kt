package com.pokemontrainercompanionmobile.overlay

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.graphics.PixelFormat
import android.hardware.display.DisplayManager
import android.media.ImageReader
import android.media.projection.MediaProjection
import android.media.projection.MediaProjectionManager
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.google.mlkit.vision.common.InputImage
import com.google.mlkit.vision.text.TextRecognition
import com.google.mlkit.vision.text.latin.TextRecognizerOptions
import com.pokemontrainercompanionmobile.R

/**
 * Foreground service that actually opens the MediaProjection session the consent dialog in
 * OverlayModule.kt already grants access to (Android 10+ requires a running foreground service of
 * type "mediaProjection" before a capture session can be used). Captures single frames, not
 * continuous video -- OCR only ever needs one still frame at a time. While the session is active,
 * this service also runs its own capture+OCR polling loop (see [startPolling]) entirely natively,
 * so it keeps reading the screen and emitting recognized text to JS even while PTC itself is
 * backgrounded and the trainer is looking at the actual game -- a JS-side setInterval doing the
 * same thing reliably stalls once its owning Activity loses foreground.
 */
class ScreenCaptureService : Service() {

  private var mediaProjection: MediaProjection? = null
  private var virtualDisplay: android.hardware.display.VirtualDisplay? = null
  private var imageReader: ImageReader? = null
  private val textRecognizer = TextRecognition.getClient(TextRecognizerOptions.DEFAULT_OPTIONS)
  private val pollHandler = Handler(Looper.getMainLooper())
  private var pollRunnable: Runnable? = null

  override fun onBind(intent: Intent?): IBinder? = null

  override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
    startForeground(NOTIFICATION_ID, buildNotification())

    val resultCode = intent?.getIntExtra(EXTRA_RESULT_CODE, android.app.Activity.RESULT_CANCELED)
        ?: android.app.Activity.RESULT_CANCELED
    val projectionData = intent?.getParcelableExtra<Intent>(EXTRA_DATA)

    if (resultCode == android.app.Activity.RESULT_OK && projectionData != null) {
      startProjection(resultCode, projectionData)
    }

    return START_NOT_STICKY
  }

  private fun startProjection(resultCode: Int, data: Intent) {
    val projectionManager =
        getSystemService(Context.MEDIA_PROJECTION_SERVICE) as MediaProjectionManager
    val projection = projectionManager.getMediaProjection(resultCode, data) ?: return
    mediaProjection = projection

    // Android requires a registered callback before createVirtualDisplay() -- it's how the OS
    // tells us the trainer stopped sharing (e.g. via the system "Stop sharing" notification) so
    // we can release the VirtualDisplay/ImageReader instead of leaking them.
    projection.registerCallback(
        object : MediaProjection.Callback() {
          override fun onStop() {
            stopProjection()
          }
        },
        Handler(Looper.getMainLooper()))

    val metrics = resources.displayMetrics
    val width = metrics.widthPixels
    val height = metrics.heightPixels
    val density = metrics.densityDpi

    val reader = ImageReader.newInstance(width, height, PixelFormat.RGBA_8888, 2)
    imageReader = reader

    virtualDisplay =
        projection.createVirtualDisplay(
            "PTCScreenCapture",
            width,
            height,
            density,
            DisplayManager.VIRTUAL_DISPLAY_FLAG_AUTO_MIRROR,
            reader.surface,
            null,
            null)

    instance = this
    startPolling()
  }

  /**
   * Runs the whole "grab a frame, OCR it, hand the text to JS" loop natively on a Handler tied to
   * this Service, instead of a JS setInterval in OverlayDemoScreen. A JS timer only reliably fires
   * while its owning Activity is in the foreground -- once the trainer switches to the actual game
   * (the entire point of this overlay), Android throttles it and the overlay would freeze on its
   * last reading. This loop lives in the foreground service itself, so it keeps running exactly
   * when it matters most: while PTC is backgrounded and the game is on screen.
   */
  private fun startPolling() {
    stopPolling()
    val runnable =
        object : Runnable {
          override fun run() {
            recognizeCurrentFrame()
            pollHandler.postDelayed(this, POLL_INTERVAL_MS)
          }
        }
    pollRunnable = runnable
    pollHandler.postDelayed(runnable, POLL_INTERVAL_MS)
  }

  private fun stopPolling() {
    pollRunnable?.let { pollHandler.removeCallbacks(it) }
    pollRunnable = null
  }

  private fun recognizeCurrentFrame() {
    val bitmap = captureLatestFrame() ?: return
    textRecognizer
        .process(InputImage.fromBitmap(bitmap, 0))
        .addOnSuccessListener { visionText -> emitFrameText(visionText.text) }
        .addOnCompleteListener { bitmap.recycle() }
  }

  private fun emitFrameText(text: String) {
    OverlayModule.reactApplicationContextHolder
        ?.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
        ?.emit(OverlayModule.OVERLAY_FRAME_TEXT_EVENT, text)
  }

  /** Grabs whatever frame is currently sitting in the ImageReader, if any. */
  fun captureLatestFrame(): Bitmap? {
    val reader = imageReader ?: return null
    val image = reader.acquireLatestImage() ?: return null
    return try {
      val plane = image.planes[0]
      val pixelStride = plane.pixelStride
      val rowStride = plane.rowStride
      val rowPadding = rowStride - pixelStride * image.width

      val paddedBitmap =
          Bitmap.createBitmap(
              image.width + rowPadding / pixelStride, image.height, Bitmap.Config.ARGB_8888)
      paddedBitmap.copyPixelsFromBuffer(plane.buffer)

      if (rowPadding == 0) {
        paddedBitmap
      } else {
        Bitmap.createBitmap(paddedBitmap, 0, 0, image.width, image.height)
      }
    } finally {
      image.close()
    }
  }

  private fun stopProjection() {
    stopPolling()
    virtualDisplay?.release()
    virtualDisplay = null
    imageReader?.close()
    imageReader = null
    mediaProjection?.stop()
    mediaProjection = null
    instance = null
  }

  override fun onDestroy() {
    stopProjection()
    super.onDestroy()
  }

  private fun buildNotification(): Notification {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      val manager = getSystemService(NotificationManager::class.java)
      manager.createNotificationChannel(
          NotificationChannel(CHANNEL_ID, "Screen capture", NotificationManager.IMPORTANCE_LOW))
      return Notification.Builder(this, CHANNEL_ID)
          .setContentTitle(getString(R.string.app_name))
          .setContentText("Reading your screen for live tips")
          .setSmallIcon(R.mipmap.ic_launcher)
          .setOngoing(true)
          .build()
    }
    @Suppress("DEPRECATION")
    return Notification.Builder(this)
        .setContentTitle(getString(R.string.app_name))
        .setContentText("Reading your screen for live tips")
        .setSmallIcon(R.mipmap.ic_launcher)
        .setOngoing(true)
        .build()
  }

  companion object {
    var instance: ScreenCaptureService? = null
      private set

    const val EXTRA_RESULT_CODE = "resultCode"
    const val EXTRA_DATA = "data"
    private const val NOTIFICATION_ID = 4202
    private const val CHANNEL_ID = "ptc_screen_capture"
    private const val POLL_INTERVAL_MS = 4000L
  }
}
