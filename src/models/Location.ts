export interface Location {
  latitude: number;
  longitude: number;
  updatedAt: string;
  radius?: number; // Search radius in kilometers
}

export interface LocationInput {
  latitude: number;
  longitude: number;
  radius?: number;
}

export class LocationModel {
  // Constants for validation
  static readonly MIN_LATITUDE = -90;
  static readonly MAX_LATITUDE = 90;
  static readonly MIN_LONGITUDE = -180;
  static readonly MAX_LONGITUDE = 180;
  static readonly MIN_RADIUS = 0.1; // 100 meters minimum
  static readonly MAX_RADIUS = 100; // 100 kilometers maximum
  static readonly DEFAULT_RADIUS = 5; // 5 kilometers default

  static validateLatitude(latitude: number): void {
    if (typeof latitude !== 'number' || isNaN(latitude)) {
      throw new Error('Latitude must be a valid number');
    }

    if (latitude < this.MIN_LATITUDE || latitude > this.MAX_LATITUDE) {
      throw new Error(
        `Latitude must be between ${this.MIN_LATITUDE} and ${this.MAX_LATITUDE}`,
      );
    }
  }

  static validateLongitude(longitude: number): void {
    if (typeof longitude !== 'number' || isNaN(longitude)) {
      throw new Error('Longitude must be a valid number');
    }

    if (longitude < this.MIN_LONGITUDE || longitude > this.MAX_LONGITUDE) {
      throw new Error(
        `Longitude must be between ${this.MIN_LONGITUDE} and ${this.MAX_LONGITUDE}`,
      );
    }
  }

  static validateRadius(radius: number): void {
    if (typeof radius !== 'number' || isNaN(radius)) {
      throw new Error('Radius must be a valid number');
    }

    if (radius < this.MIN_RADIUS || radius > this.MAX_RADIUS) {
      throw new Error(
        `Radius must be between ${this.MIN_RADIUS} and ${this.MAX_RADIUS} kilometers`,
      );
    }
  }

  static create(input: LocationInput): Location {
    this.validateLatitude(input.latitude);
    this.validateLongitude(input.longitude);

    if (input.radius !== undefined) {
      this.validateRadius(input.radius);
    }

    return {
      latitude: input.latitude,
      longitude: input.longitude,
      updatedAt: new Date().toISOString(),
      radius: input.radius || this.DEFAULT_RADIUS,
    };
  }

  static update(existing: Location, updates: LocationInput): Location {
    const updated = {...existing};

    if (updates.latitude !== undefined) {
      this.validateLatitude(updates.latitude);
      updated.latitude = updates.latitude;
    }

    if (updates.longitude !== undefined) {
      this.validateLongitude(updates.longitude);
      updated.longitude = updates.longitude;
    }

    if (updates.radius !== undefined) {
      this.validateRadius(updates.radius);
      updated.radius = updates.radius;
    }

    updated.updatedAt = new Date().toISOString();

    return updated;
  }

  static validate(location: Location): void {
    this.validateLatitude(location.latitude);
    this.validateLongitude(location.longitude);

    if (location.radius !== undefined) {
      this.validateRadius(location.radius);
    }

    if (!location.updatedAt) {
      throw new Error('Location must have a valid updatedAt timestamp');
    }

    // Validate updatedAt is valid ISO string
    try {
      new Date(location.updatedAt);
    } catch (error) {
      throw new Error('Location updatedAt must be a valid ISO date string');
    }
  }

  /**
   * Calculate the distance between two locations using Haversine formula
   * Returns distance in kilometers
   */
  static calculateDistance(location1: Location, location2: Location): number {
    const R = 6371; // Earth's radius in kilometers

    const lat1Rad = this.degreesToRadians(location1.latitude);
    const lat2Rad = this.degreesToRadians(location2.latitude);
    const deltaLatRad = this.degreesToRadians(
      location2.latitude - location1.latitude,
    );
    const deltaLngRad = this.degreesToRadians(
      location2.longitude - location1.longitude,
    );

    const a =
      Math.sin(deltaLatRad / 2) * Math.sin(deltaLatRad / 2) +
      Math.cos(lat1Rad) *
        Math.cos(lat2Rad) *
        Math.sin(deltaLngRad / 2) *
        Math.sin(deltaLngRad / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return Math.round(distance * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Check if one location is within the radius of another
   */
  static isWithinRadius(
    center: Location,
    target: Location,
    radiusKm?: number,
  ): boolean {
    const distance = this.calculateDistance(center, target);
    const radius = radiusKm || center.radius || this.DEFAULT_RADIUS;
    return distance <= radius;
  }

  /**
   * Find all locations within radius of a center point
   */
  static findWithinRadius(
    center: Location,
    locations: Location[],
    radiusKm?: number,
  ): Location[] {
    const radius = radiusKm || center.radius || this.DEFAULT_RADIUS;
    return locations.filter(location =>
      this.isWithinRadius(center, location, radius),
    );
  }

  /**
   * Sort locations by distance from a center point (closest first)
   */
  static sortByDistance(
    center: Location,
    locations: Location[],
  ): Array<Location & {distance: number}> {
    return locations
      .map(location => ({
        ...location,
        distance: this.calculateDistance(center, location),
      }))
      .sort((a, b) => a.distance - b.distance);
  }

  /**
   * Get the bounding box (min/max lat/lng) for a location with radius
   */
  static getBoundingBox(
    center: Location,
    radiusKm?: number,
  ): {
    minLatitude: number;
    maxLatitude: number;
    minLongitude: number;
    maxLongitude: number;
  } {
    const radius = radiusKm || center.radius || this.DEFAULT_RADIUS;
    const R = 6371; // Earth's radius in kilometers

    // Calculate latitude bounds
    const latChange = this.radiansToDegrees(radius / R);
    const minLatitude = Math.max(
      center.latitude - latChange,
      this.MIN_LATITUDE,
    );
    const maxLatitude = Math.min(
      center.latitude + latChange,
      this.MAX_LATITUDE,
    );

    // Calculate longitude bounds (accounting for latitude)
    const lngChange = this.radiansToDegrees(
      radius / (R * Math.cos(this.degreesToRadians(center.latitude))),
    );
    const minLongitude = Math.max(
      center.longitude - lngChange,
      this.MIN_LONGITUDE,
    );
    const maxLongitude = Math.min(
      center.longitude + lngChange,
      this.MAX_LONGITUDE,
    );

    return {
      minLatitude: Math.round(minLatitude * 1000000) / 1000000, // 6 decimal places
      maxLatitude: Math.round(maxLatitude * 1000000) / 1000000,
      minLongitude: Math.round(minLongitude * 1000000) / 1000000,
      maxLongitude: Math.round(maxLongitude * 1000000) / 1000000,
    };
  }

  /**
   * Check if location coordinates are valid
   */
  static isValid(location: LocationInput): boolean {
    try {
      this.validateLatitude(location.latitude);
      this.validateLongitude(location.longitude);
      if (location.radius !== undefined) {
        this.validateRadius(location.radius);
      }
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get a human-readable description of the location
   */
  static getDescription(location: Location): string {
    const lat = location.latitude.toFixed(6);
    const lng = location.longitude.toFixed(6);
    const radius = location.radius || this.DEFAULT_RADIUS;

    return `Location: ${lat}, ${lng} (${radius}km radius)`;
  }

  /**
   * Create a location from a user's current position
   */
  static fromCurrentPosition(
    latitude: number,
    longitude: number,
    radius?: number,
  ): Location {
    return this.create({
      latitude,
      longitude,
      radius: radius || this.DEFAULT_RADIUS,
    });
  }

  /**
   * Parse location from string format "lat,lng" or "lat,lng,radius"
   */
  static fromString(locationString: string): Location {
    const parts = locationString
      .split(',')
      .map(part => parseFloat(part.trim()));

    if (parts.length < 2 || parts.length > 3) {
      throw new Error(
        'Location string must be in format "latitude,longitude" or "latitude,longitude,radius"',
      );
    }

    const [latitude, longitude, radius] = parts;

    if (isNaN(latitude) || isNaN(longitude)) {
      throw new Error('Invalid latitude or longitude in location string');
    }

    if (parts.length === 3 && isNaN(radius)) {
      throw new Error('Invalid radius in location string');
    }

    return this.create({
      latitude,
      longitude,
      radius: parts.length === 3 ? radius : undefined,
    });
  }

  /**
   * Convert location to string format
   */
  static toString(location: Location): string {
    if (location.radius && location.radius !== this.DEFAULT_RADIUS) {
      return `${location.latitude},${location.longitude},${location.radius}`;
    }
    return `${location.latitude},${location.longitude}`;
  }

  private static degreesToRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  private static radiansToDegrees(radians: number): number {
    return radians * (180 / Math.PI);
  }

  static toJSON(location: Location): string {
    return JSON.stringify(location);
  }

  static fromJSON(json: string): Location {
    try {
      const location = JSON.parse(json) as Location;
      this.validate(location);
      return location;
    } catch (error) {
      throw new Error(
        `Failed to parse Location from JSON: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }
}
