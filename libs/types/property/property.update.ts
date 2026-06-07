import { PharmacyLocation, PharmacyStatus, PharmacyType } from '../../enums/property.enum';

export interface PharmacyUpdate {
	_id: string;
	pharmacyType?: PharmacyType;
	pharmacyStatus?: PharmacyStatus;
	pharmacyLocation?: PharmacyLocation;
	pharmacyAddress?: string;
	pharmacyName?: string;
	pharmacyDeliveryFee?: number;
	pharmacyLatitude?: number;
	pharmacyLongitude?: number;
	pharmacyMedicationCount?: number;
	pharmacyImages?: string[];
	pharmacyDesc?: string;
	acceptsInsurance?: boolean;
	hasDelivery?: boolean;
	verifiedAt?: Date;
	deletedAt?: Date;
	openedAt?: Date;
}
