import { PharmacyLocation } from '../enums/property.enum';

export const pharmacyLocationLabels: Record<PharmacyLocation, string> = {
	[PharmacyLocation.TASHKENT_CITY]: 'Tashkent City',
	[PharmacyLocation.TASHKENT_REGION]: 'Tashkent Region',
	[PharmacyLocation.ANDIJAN]: 'Andijan',
	[PharmacyLocation.BUKHARA]: 'Bukhara',
	[PharmacyLocation.FERGANA]: 'Fergana',
	[PharmacyLocation.JIZZAKH]: 'Jizzakh',
	[PharmacyLocation.KARAKALPAKSTAN]: 'Karakalpakstan',
	[PharmacyLocation.KASHKADARYA]: 'Kashkadarya',
	[PharmacyLocation.KHOREZM]: 'Khorezm',
	[PharmacyLocation.NAMANGAN]: 'Namangan',
	[PharmacyLocation.NAVOI]: 'Navoi',
	[PharmacyLocation.SAMARKAND]: 'Samarkand',
	[PharmacyLocation.SIRDARYA]: 'Sirdarya',
	[PharmacyLocation.SURKHANDARYA]: 'Surkhandarya',
};

export const getPharmacyLocationLabel = (location?: PharmacyLocation): string =>
	location ? pharmacyLocationLabels[location] : 'All regions';
