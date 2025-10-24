// Web polyfill for react-native-geolocation-service
export default {
  getCurrentPosition: (success: any, error: any) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(success, error);
    } else {
      error({code: 1, message: 'Geolocation not supported'});
    }
  },
  watchPosition: () => null,
  clearWatch: () => {},
  stopObserving: () => {},
};
