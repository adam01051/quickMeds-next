export interface LatLng {
	lat: number;
	lng: number;
}

export const isFiniteNumber = (value: unknown): value is number =>
	typeof value === 'number' && Number.isFinite(value);

export const isValidLatLng = (latitude?: number, longitude?: number): boolean => {
	if (!isFiniteNumber(latitude) || !isFiniteNumber(longitude)) return false;
	return latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180 && !(latitude === 0 && longitude === 0);
};

export const toPharmacyCoordinateFields = ({ lat, lng }: LatLng) => ({
	pharmacyLatitude: lat,
	pharmacyLongitude: lng,
});

export const toGeoJsonPoint = ({ lat, lng }: LatLng) => ({
	type: 'Point' as const,
	coordinates: [lng, lat],
});
