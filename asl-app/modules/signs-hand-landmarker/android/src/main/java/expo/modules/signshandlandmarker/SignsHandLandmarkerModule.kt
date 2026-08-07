package expo.modules.signshandlandmarker

import android.graphics.BitmapFactory
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import com.google.mediapipe.framework.image.BitmapImageBuilder
import com.google.mediapipe.tasks.core.BaseOptions
import com.google.mediapipe.tasks.vision.core.RunningMode
import com.google.mediapipe.tasks.vision.handlandmarker.HandLandmarker
import com.google.mediapipe.tasks.vision.handlandmarker.HandLandmarkerResult
import java.io.File

class SignsHandLandmarkerModule : Module() {
  private var landmarker: HandLandmarker? = null

  override fun definition() = ModuleDefinition {
    Name("SignsHandLandmarker")

    OnCreate {
      prepareLandmarker()
    }

    Function("isAvailable") {
      landmarker != null
    }

    AsyncFunction("detectFromUri") { uri: String ->
      val marker = landmarker ?: return@AsyncFunction null
      val path = if (uri.startsWith("file://")) uri.removePrefix("file://") else uri
      val file = File(path)
      if (!file.exists()) {
        return@AsyncFunction null
      }
      val bitmap = BitmapFactory.decodeFile(file.absolutePath) ?: return@AsyncFunction null
      val mpImage = BitmapImageBuilder(bitmap).build()
      val result: HandLandmarkerResult = marker.detect(mpImage)
      if (result.landmarks().isEmpty()) {
        return@AsyncFunction null
      }
      val hand = result.landmarks()[0]
      if (hand.size < 21) {
        return@AsyncFunction null
      }
      hand.take(21).map { landmark ->
        mapOf(
          "x" to landmark.x().toDouble(),
          "y" to landmark.y().toDouble(),
          "z" to landmark.z().toDouble(),
        )
      }
    }
  }

  private fun prepareLandmarker() {
    try {
      val context = appContext.reactContext ?: return
      val baseOptions = BaseOptions.builder()
        .setModelAssetPath("hand_landmarker.task")
        .build()

      val options = HandLandmarker.HandLandmarkerOptions.builder()
        .setBaseOptions(baseOptions)
        .setRunningMode(RunningMode.IMAGE)
        .setNumHands(1)
        .setMinHandDetectionConfidence(0.5f)
        .setMinHandPresenceConfidence(0.5f)
        .setMinTrackingConfidence(0.5f)
        .build()

      landmarker = HandLandmarker.createFromOptions(context, options)
    } catch (error: Exception) {
      landmarker = null
      android.util.Log.e("SignsHandLandmarker", "Init failed", error)
    }
  }
}
