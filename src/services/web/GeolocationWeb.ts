// Web polyfill for react-native-geolocation-service
// Uses browser Geolocation API

export interface GeolocationPosition {
  coords: {
    latitude: number;
    longitude: number;
    accuracy: number;
    altitude: number | null;
    altitudeAccuracy: number | null;
    heading: number | null;
    speed: number | null;
  };
  timestamp: number;
}

export interface GeolocationError {
  code: number;
  message: string;
}

class GeolocationWeb {
  getCurrentPosition(
    successCallback: (position: GeolocationPosition) => void,
    errorCallback?: (error: GeolocationError) => void,
    options?: {
      enableHighAccuracy?: boolean;
      timeout?: number;
      maximumAge?: number;
    },
  ) {
    if (!navigator.geolocation) {
      if (errorCallback) {
        errorCallback({
          code: 2,
          message: 'Geolocation not supported',
        });
      }
      return;
    }

    navigator.geolocation.getCurrentPosition(
      position => {
        successCallback({
          coords: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude,
            altitudeAccuracy: position.coords.altitudeAccuracy,
            heading: position.coords.heading,
            speed: position.coords.speed,
          },
          timestamp: position.timestamp,
        });
      },
      error => {
        if (errorCallback) {
          errorCallback({
            code: error.code,
            message: error.message,
          });
        }
      },
      options,
    );
  }

  watchPosition(
    successCallback: (position: GeolocationPosition) => void,
    errorCallback?: (error: GeolocationError) => void,
    options?: {
      enableHighAccuracy?: boolean;
      timeout?: number;
      maximumAge?: number;
      distanceFilter?: number;
    },
  ): number {
    if (!navigator.geolocation) {
      return -1;
    }

    return navigator.geolocation.watchPosition(
      position => {
        successCallback({
          coords: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude,
            altitudeAccuracy: position.coords.altitudeAccuracy,
            heading: position.coords.heading,
            speed: position.coords.speed,
          },
          timestamp: position.timestamp,
        });
      },
      error => {
        if (errorCallback) {
          errorCallback({
            code: error.code,
            message: error.message,
          });
        }
      },
      options,
    );
  }

  clearWatch(watchId: number) {
    if (navigator.geolocation) {
      navigator.geolocation.clearWatch(watchId);
    }
  }

  requestAuthorization() {
    // Web doesn't need explicit authorization request
    return Promise.resolve('granted');
  }
}

export default new GeolocationWeb();
