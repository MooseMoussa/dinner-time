// Web polyfill for react-native-face-detector
export default {
  detectFaces: async () => {
    console.warn('Face detection not supported on web');
    return {faces: []};
  },
};
