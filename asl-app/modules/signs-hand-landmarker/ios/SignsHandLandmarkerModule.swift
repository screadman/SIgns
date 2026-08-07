import ExpoModulesCore
import MediaPipeTasksVision
import UIKit

public class SignsHandLandmarkerModule: Module {
  private var landmarker: HandLandmarker?

  public func definition() -> ModuleDefinition {
    Name("SignsHandLandmarker")

    OnCreate {
      self.prepareLandmarker()
    }

    Function("isAvailable") { () -> Bool in
      return self.landmarker != nil
    }

    AsyncFunction("detectFromUri") { (uri: String) -> [[String: Double]]? in
      guard let landmarker = self.landmarker else {
        return nil
      }

      let path = uri.hasPrefix("file://")
        ? String(uri.dropFirst("file://".count))
        : uri

      guard let image = UIImage(contentsOfFile: path) else {
        return nil
      }
      guard let mpImage = try? MPImage(uiImage: image) else {
        return nil
      }

      let result = try landmarker.detect(image: mpImage)
      guard let hand = result.landmarks.first, hand.count >= 21 else {
        return nil
      }

      return hand.prefix(21).map { landmark in
        [
          "x": Double(landmark.x),
          "y": Double(landmark.y),
          "z": Double(landmark.z),
        ]
      }
    }
  }

  private func prepareLandmarker() {
    do {
      let options = HandLandmarkerOptions()
      options.runningMode = .image
      options.numHands = 1
      options.minHandDetectionConfidence = 0.5
      options.minHandPresenceConfidence = 0.5
      options.minTrackingConfidence = 0.5

      if let modelPath = Bundle.main.path(
        forResource: "hand_landmarker",
        ofType: "task"
      ) {
        options.baseOptions.modelAssetPath = modelPath
      } else if let bundle = Bundle(identifier: "org.cocoapods.SignsHandLandmarker"),
                let modelURL = bundle.url(
                  forResource: "hand_landmarker",
                  withExtension: "task"
                ) {
        options.baseOptions.modelAssetPath = modelURL.path
      } else {
        // Fallback: search resource bundles created by CocoaPods.
        for bundle in Bundle.allBundles {
          if let modelURL = bundle.url(
            forResource: "hand_landmarker",
            withExtension: "task"
          ) {
            options.baseOptions.modelAssetPath = modelURL.path
            break
          }
        }
      }

      guard options.baseOptions.modelAssetPath != nil else {
        NSLog("[SignsHandLandmarker] Model file not found")
        return
      }

      self.landmarker = try HandLandmarker(options: options)
    } catch {
      NSLog("[SignsHandLandmarker] Init failed: \(error)")
      self.landmarker = nil
    }
  }
}
