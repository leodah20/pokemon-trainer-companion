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
import com.pokemontrainercompanionmobile.R

/**
 * Foreground service that actually opens the MediaProjection session the consent dialog in
 * OverlayModule.kt already grants access to (Android 10+ requires a running foreground service of
 * type "mediaProjection" before a capture session can be used). Captures single frames on demand
 * (via [captureLatestFrame], called from OverlayModule) rather than streaming continuous video --
 * the OCR pipeline only ever needs one still frame at a time, so this avoids the extra complexity
 * and battery cost of a real-time video pipe across the RN bridge.
 */
class ScreenCaptureService : Service() {

  private var mediaProjection: MediaProjection? = null
  private var virtualDisplay: android.hardware.display.VirtualDisplay? = null
  private var imageReader: ImageReader? = null

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
  }
}
