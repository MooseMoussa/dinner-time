import Geolocation from 'react-native-geolocation-service';
import {PermissionsAndroid, Platform} from 'react-native';
import {Location} from '@models/Location';

export interface LocationPermissionStatus {
  granted: boolean;
  status: 'granted' | 'denied' | 'never_ask_again' | 'restricted' | 'limited';
  canRequestAgain: boolean;
}

export interface LocationServiceOptions {
  enableHighAccuracy: boolean;
  timeout: number;
  maximumAge: number;
  distanceFilter: number;
}

export interface NearbySearchOptions {
  radius: number;
  limit: number;
  type?: 'restaurant' | 'grocery' | 'market';
  minRating?: number;
}

export interface RestaurantInfo {
  id: string;
  name: string;
  location: Location;
  cuisine?: string[];
  rating?: number;
  priceLevel?: number;
  distance: number;
  isOpen?: boolean;
  phone?: string;
  website?: string;
}

export interface GroceryStore {
  id: string;
  name: string;
  location: Location;
  distance: number;
  isOpen?: boolean;
  hasOrganicSection?: boolean;
  hasInternationalSection?: boolean;
}

export class LocationService {
  private static instance: LocationService;
  private readonly defaultOptions: LocationServiceOptions = {
    enableHighAccuracy: true,
    timeout: 15000,
    maximumAge: 300000, // 5 minutes
    distanceFilter: 10, // meters
  };

  private watchId: number | null = null;
  private lastKnownLocation: Location | null = null;
  private locationUpdateCallbacks: ((location: Location) => void)[] = [];

  constructor() {}

  static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  async requestLocationPermission(): Promise<LocationPermissionStatus> {
    try {
      if (Platform.OS === 'ios') {
        return await this.requestIOSLocationPermission();
      } else {
        return await this.requestAndroidLocationPermission();
      }
    } catch (error) {
      console.error('Failed to request location permission:', error);
      return {
        granted: false,
        status: 'denied',
        canRequestAgain: false,
      };
    }
  }

  private async requestIOSLocationPermission(): Promise<LocationPermissionStatus> {
    return new Promise(resolve => {
      Geolocation.requestAuthorization('whenInUse').then(status => {
        const granted = status === 'granted';
        const canRequestAgain = status !== 'denied';

        resolve({
          granted,
          status: status as any,
          canRequestAgain,
        });
      });
    });
  }

  private async requestAndroidLocationPermission(): Promise<LocationPermissionStatus> {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message:
            'This app needs access to your location to provide restaurant suggestions near you.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );

      const isGranted = granted === PermissionsAndroid.RESULTS.GRANTED;
      const canRequestAgain =
        granted !== PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN;

      return {
        granted: isGranted,
        status: isGranted ? 'granted' : 'denied',
        canRequestAgain,
      };
    } catch (error) {
      console.error('Android permission request failed:', error);
      return {
        granted: false,
        status: 'denied',
        canRequestAgain: false,
      };
    }
  }

  async getCurrentLocation(
    options?: Partial<LocationServiceOptions>,
  ): Promise<Location> {
    const mergedOptions = {...this.defaultOptions, ...options};

    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        position => {
          const location: Location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            updatedAt: new Date().toISOString(),
          };

          this.lastKnownLocation = location;
          resolve(location);
        },
        error => {
          console.error('Failed to get current location:', error);

          if (this.lastKnownLocation) {
            console.log('Using last known location as fallback');
            resolve(this.lastKnownLocation);
          } else {
            reject(
              new Error(
                `Location unavailable: ${
                  error instanceof Error ? error.message : String(error)
                }`,
              ),
            );
          }
        },
        {
          enableHighAccuracy: mergedOptions.enableHighAccuracy,
          timeout: mergedOptions.timeout,
          maximumAge: mergedOptions.maximumAge,
        },
      );
    });
  }

  startLocationTracking(
    callback: (location: Location) => void,
    options?: Partial<LocationServiceOptions>,
  ): boolean {
    try {
      if (this.watchId !== null) {
        this.stopLocationTracking();
      }

      const mergedOptions = {...this.defaultOptions, ...options};
      this.locationUpdateCallbacks.push(callback);

      this.watchId = Geolocation.watchPosition(
        position => {
          const location: Location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            updatedAt: new Date().toISOString(),
          };

          this.lastKnownLocation = location;

          for (const cb of this.locationUpdateCallbacks) {
            try {
              cb(location);
            } catch (error) {
              console.error('Location callback error:', error);
            }
          }
        },
        error => {
          console.error('Location tracking error:', error);
        },
        {
          enableHighAccuracy: mergedOptions.enableHighAccuracy,
          distanceFilter: mergedOptions.distanceFilter,
          interval: mergedOptions.timeout, // Use timeout as interval
          fastestInterval: mergedOptions.timeout / 2,
        },
      );

      return this.watchId !== null;
    } catch (error) {
      console.error('Failed to start location tracking:', error);
      return false;
    }
  }

  stopLocationTracking(): void {
    if (this.watchId !== null) {
      Geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
    this.locationUpdateCallbacks = [];
  }

  getLastKnownLocation(): Location | null {
    return this.lastKnownLocation;
  }

  async findNearbyRestaurants(
    location: Location,
    options: NearbySearchOptions,
  ): Promise<RestaurantInfo[]> {
    try {
      const restaurants = await this.searchNearbyPlaces(location, {
        ...options,
        type: 'restaurant',
      });

      return restaurants.map(place => ({
        id: place.id,
        name: place.name,
        location: place.location,
        cuisine: place.cuisine,
        rating: place.rating,
        priceLevel: place.priceLevel,
        distance: place.distance,
        isOpen: place.isOpen,
        phone: place.phone,
        website: place.website,
      }));
    } catch (error) {
      console.error('Failed to find nearby restaurants:', error);
      throw new Error(
        `Restaurant search failed: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  async findNearbyGroceryStores(
    location: Location,
    options: NearbySearchOptions,
  ): Promise<GroceryStore[]> {
    try {
      const stores = await this.searchNearbyPlaces(location, {
        ...options,
        type: 'grocery',
      });

      return stores.map(place => ({
        id: place.id,
        name: place.name,
        location: place.location,
        distance: place.distance,
        isOpen: place.isOpen,
        hasOrganicSection: place.hasOrganicSection,
        hasInternationalSection: place.hasInternationalSection,
      }));
    } catch (error) {
      console.error('Failed to find nearby grocery stores:', error);
      throw new Error(
        `Grocery store search failed: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  private async searchNearbyPlaces(
    location: Location,
    options: NearbySearchOptions & {type: string},
  ): Promise<any[]> {
    const mockPlaces = this.generateMockPlaces(location, options);

    return mockPlaces
      .filter(place => place.distance <= options.radius)
      .filter(place => !options.minRating || place.rating >= options.minRating)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, options.limit);
  }

  private generateMockPlaces(location: Location, options: any): any[] {
    const places = [];
    const placeCount = Math.min(options.limit * 3, 50);

    for (let i = 0; i < placeCount; i++) {
      const distance = Math.random() * options.radius * 1.5;
      const bearing = Math.random() * 360;

      const nearbyLocation = this.calculateNearbyLocation(
        location,
        distance,
        bearing,
      );

      if (options.type === 'restaurant') {
        places.push(this.generateMockRestaurant(i, nearbyLocation, distance));
      } else if (options.type === 'grocery') {
        places.push(this.generateMockGroceryStore(i, nearbyLocation, distance));
      }
    }

    return places;
  }

  private generateMockRestaurant(
    index: number,
    location: Location,
    distance: number,
  ): any {
    const cuisines = [
      ['italian'],
      ['mexican'],
      ['chinese'],
      ['japanese'],
      ['thai'],
      ['indian'],
      ['american'],
      ['mediterranean'],
      ['korean'],
      ['vietnamese'],
      ['french'],
    ];

    const restaurantNames = [
      'Bella Vista',
      'Casa Grande',
      'Golden Dragon',
      'Sakura',
      'Thai Garden',
      'Spice Palace',
      'The Grill',
      'Olive Branch',
      'Seoul Kitchen',
      'Pho Saigon',
      'Le Bistro',
      'Pizza Corner',
      'Taco Bell',
      'Sushi Express',
      'Curry House',
    ];

    return {
      id: `restaurant_${index}`,
      name: restaurantNames[index % restaurantNames.length],
      location,
      cuisine: cuisines[index % cuisines.length],
      rating: Math.round((3 + Math.random() * 2) * 10) / 10,
      priceLevel: Math.floor(Math.random() * 4) + 1,
      distance: Math.round(distance),
      isOpen: Math.random() > 0.2,
      phone: `+1-555-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      website: `https://restaurant${index}.example.com`,
    };
  }

  private generateMockGroceryStore(
    index: number,
    location: Location,
    distance: number,
  ): any {
    const storeNames = [
      'Fresh Market',
      'Super Grocery',
      'Corner Store',
      'Organic Foods',
      'City Market',
      'Family Grocers',
      'Quick Shop',
      'Green Grocer',
    ];

    return {
      id: `grocery_${index}`,
      name: storeNames[index % storeNames.length],
      location,
      distance: Math.round(distance),
      isOpen: Math.random() > 0.1,
      hasOrganicSection: Math.random() > 0.4,
      hasInternationalSection: Math.random() > 0.6,
    };
  }

  private calculateNearbyLocation(
    center: Location,
    distance: number,
    bearing: number,
  ): Location {
    const R = 6371000;
    const lat1 = (center.latitude * Math.PI) / 180;
    const lon1 = (center.longitude * Math.PI) / 180;
    const bearingRad = (bearing * Math.PI) / 180;

    const lat2 = Math.asin(
      Math.sin(lat1) * Math.cos(distance / R) +
        Math.cos(lat1) * Math.sin(distance / R) * Math.cos(bearingRad),
    );

    const lon2 =
      lon1 +
      Math.atan2(
        Math.sin(bearingRad) * Math.sin(distance / R) * Math.cos(lat1),
        Math.cos(distance / R) - Math.sin(lat1) * Math.sin(lat2),
      );

    return {
      latitude: (lat2 * 180) / Math.PI,
      longitude: (lon2 * 180) / Math.PI,
      updatedAt: new Date().toISOString(),
    };
  }

  calculateDistance(location1: Location, location2: Location): number {
    const R = 6371000;
    const lat1Rad = (location1.latitude * Math.PI) / 180;
    const lat2Rad = (location2.latitude * Math.PI) / 180;
    const deltaLatRad =
      ((location2.latitude - location1.latitude) * Math.PI) / 180;
    const deltaLonRad =
      ((location2.longitude - location1.longitude) * Math.PI) / 180;

    const a =
      Math.sin(deltaLatRad / 2) * Math.sin(deltaLatRad / 2) +
      Math.cos(lat1Rad) *
        Math.cos(lat2Rad) *
        Math.sin(deltaLonRad / 2) *
        Math.sin(deltaLonRad / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  isLocationWithinRadius(
    center: Location,
    target: Location,
    radiusMeters: number,
  ): boolean {
    const distance = this.calculateDistance(center, target);
    return distance <= radiusMeters;
  }

  getBoundingBox(
    center: Location,
    radiusMeters: number,
  ): {
    northEast: Location;
    southWest: Location;
  } {
    const R = 6371000;
    const lat = (center.latitude * Math.PI) / 180;
    const lon = (center.longitude * Math.PI) / 180;

    const deltaLat = radiusMeters / R;
    const deltaLon = radiusMeters / (R * Math.cos(lat));

    return {
      northEast: {
        latitude: ((lat + deltaLat) * 180) / Math.PI,
        longitude: ((lon + deltaLon) * 180) / Math.PI,
        updatedAt: new Date().toISOString(),
      },
      southWest: {
        latitude: ((lat - deltaLat) * 180) / Math.PI,
        longitude: ((lon - deltaLon) * 180) / Math.PI,
        updatedAt: new Date().toISOString(),
      },
    };
  }

  formatDistance(meters: number): string {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    } else if (meters < 10000) {
      return `${(meters / 1000).toFixed(1)}km`;
    } else {
      return `${Math.round(meters / 1000)}km`;
    }
  }

  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    details: string;
    permissionStatus?: LocationPermissionStatus;
  }> {
    try {
      const permissionStatus = await this.requestLocationPermission();

      if (!permissionStatus.granted) {
        return {
          status: 'degraded',
          details: 'Location permission not granted',
          permissionStatus,
        };
      }

      try {
        await this.getCurrentLocation({timeout: 5000});
        return {
          status: 'healthy',
          details: 'Location service operational',
          permissionStatus,
        };
      } catch (error) {
        return {
          status: 'degraded',
          details: `Location unavailable: ${
            error instanceof Error ? error.message : String(error)
          }`,
          permissionStatus,
        };
      }
    } catch (error) {
      return {
        status: 'unhealthy',
        details: `Location service error: ${
          error instanceof Error ? error.message : String(error)
        }`,
      };
    }
  }

  cleanup(): void {
    this.stopLocationTracking();
    this.lastKnownLocation = null;
    this.locationUpdateCallbacks = [];
  }
}
