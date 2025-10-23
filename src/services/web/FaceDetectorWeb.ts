// Web polyfill for react-native-face-detector
// Uses Web APIs or placeholder for facial recognition

export interface FaceDetectorOptions {
  detectLandmarks?: boolean;
  runClassifications?: boolean;
}

export interface Face {
  bounds: {
    origin: {x: number; y: number};
    size: {width: number; height: number};
  };
  rollAngle?: number;
  yawAngle?: number;
  smilingProbability?: number;
  leftEyeOpenProbability?: number;
  rightEyeOpenProbability?: number;
}

class FaceDetectorWeb {
  async detectFaces(
    imageUri: string,
    options?: FaceDetectorOptions,
  ): Promise<Face[]> {
    // Placeholder for web face detection
    // In production, could use:
    // - face-api.js
    // - TensorFlow.js with face detection models
    // - Browser's Shape Detection API (experimental)

    console.warn(
      'Face detection on web requires additional setup. Using placeholder.',
    );

    // Return mock data for now
    return new Promise(resolve => {
      setTimeout(() => {
        resolve([
          {
            bounds: {
              origin: {x: 100, y: 100},
              size: {width: 200, height: 200},
            },
            rollAngle: 0,
            yawAngle: 0,
            smilingProbability: 0.8,
            leftEyeOpenProbability: 0.9,
            rightEyeOpenProbability: 0.9,
          },
        ]);
      }, 500);
    });
  }
}

export default new FaceDetectorWeb();
