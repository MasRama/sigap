export const EARTH_RADIUS_METERS = 6_371_000;

export interface GeoPoint {
  latitude: number;
  longitude: number;
}

export const toRadians = (degrees: number): number =>
  degrees * (Math.PI / 180);

export const haversineDistance = (a: GeoPoint, b: GeoPoint): number => {
  const dLat = toRadians(b.latitude - a.latitude);
  const dLon = toRadians(b.longitude - a.longitude);

  const latA = toRadians(a.latitude);
  const latB = toRadians(b.latitude);

  const x = Math.sin(dLat / 2) ** 2 +
            Math.cos(latA) * Math.cos(latB) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));

  return EARTH_RADIUS_METERS * c;
};

export const isInsideRadius = (point: GeoPoint, center: GeoPoint, radiusMeters: number): boolean =>
  haversineDistance(point, center) <= radiusMeters;

export const validateCoordinates = (latitude: number, longitude: number): boolean =>
  !Number.isNaN(latitude) &&
  !Number.isNaN(longitude) &&
  latitude >= -90 && latitude <= 90 &&
  longitude >= -180 && longitude <= 180;
