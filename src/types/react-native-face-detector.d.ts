declare module 'react-native-face-detector' {
  export class FaceDetector {
    static detectFaces(imageData: any): Promise<any[]>;
  }
}
