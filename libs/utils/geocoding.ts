import { PharmacyLocation } from '../enums/property.enum';

export interface GeocodingResult {
	id: string;
	label: string;
	latitude: number;
	longitude: number;
	address?: string;
	location?: PharmacyLocation;
}

interface NominatimResult {
	place_id: number;
	display_name: string;
	lat: string;
	lon: string;
	address?: Record<string, string | undefined>;
}

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';

const locationTokens: Array<[PharmacyLocation, string[]]> = [
	[PharmacyLocation.TASHKENT_CITY, ['tashkent city', 'toshkent shahri', 'tashkent']],
	[PharmacyLocation.TASHKENT_REGION, ['tashkent region', 'toshkent viloyati']],
	[PharmacyLocation.ANDIJAN, ['andijan', 'andijon']],
	[PharmacyLocation.BUKHARA, ['bukhara', 'buxoro']],
	[PharmacyLocation.FERGANA, ['fergana', 'fargona', "farg'ona"]],
	[PharmacyLocation.JIZZAKH, ['jizzakh', 'jizzax']],
	[PharmacyLocation.KARAKALPAKSTAN, ['karakalpakstan', 'qoraqalpogiston', "qoraqalpog'iston"]],
	[PharmacyLocation.KASHKADARYA, ['kashkadarya', 'qashqadaryo']],
	[PharmacyLocation.KHOREZM, ['khorezm', 'xorazm']],
	[PharmacyLocation.NAMANGAN, ['namangan']],
	[PharmacyLocation.NAVOI, ['navoi', 'navoiy']],
	[PharmacyLocation.SAMARKAND, ['samarkand', 'samarqand']],
	[PharmacyLocation.SIRDARYA, ['sirdarya', 'sirdaryo']],
	[PharmacyLocation.SURKHANDARYA, ['surkhandarya', 'surxondaryo']],
];

export const inferPharmacyLocation = (text?: string): PharmacyLocation | undefined => {
	const normalized = text?.toLowerCase();
	if (!normalized) return undefined;
	const match = locationTokens.find(([, tokens]) => tokens.some((token) => normalized.includes(token)));
	return match?.[0];
};

const resultToGeocodingResult = (result: NominatimResult): GeocodingResult => {
	const addressText = result.display_name;
	return {
		id: String(result.place_id),
		label: addressText,
		address: addressText,
		latitude: Number(result.lat),
		longitude: Number(result.lon),
		location: inferPharmacyLocation(`${addressText} ${Object.values(result.address ?? {}).join(' ')}`),
	};
};

export const searchAddress = async (query: string): Promise<GeocodingResult[]> => {
	const trimmed = query.trim();
	if (trimmed.length < 3) return [];

	const params = new URLSearchParams({
		format: 'jsonv2',
		addressdetails: '1',
		limit: '5',
		countrycodes: 'uz',
		q: trimmed,
	});
	const response = await fetch(`${NOMINATIM_BASE_URL}/search?${params.toString()}`, {
		headers: { Accept: 'application/json' },
	});
	if (!response.ok) throw new Error('Address search is temporarily unavailable.');
	const data = (await response.json()) as NominatimResult[];
	return data.map(resultToGeocodingResult).filter((item) => Number.isFinite(item.latitude) && Number.isFinite(item.longitude));
};

export const reverseGeocode = async (latitude: number, longitude: number): Promise<GeocodingResult | null> => {
	const params = new URLSearchParams({
		format: 'jsonv2',
		addressdetails: '1',
		lat: String(latitude),
		lon: String(longitude),
	});
	const response = await fetch(`${NOMINATIM_BASE_URL}/reverse?${params.toString()}`, {
		headers: { Accept: 'application/json' },
	});
	if (!response.ok) throw new Error('Address could not be updated automatically.');
	const data = (await response.json()) as NominatimResult;
	if (!data?.display_name) return null;
	return resultToGeocodingResult(data);
};
