import { PharmacyLocation, PharmacyStatus, PharmacyType } from '../../enums/property.enum';
import { Direction } from '../../enums/common.enum';

export interface PharmacyInput {
	pharmacyType: PharmacyType;
	pharmacyLocation: PharmacyLocation;
	pharmacyAddress: string;
	pharmacyName: string;
	pharmacyDeliveryFee: number;
	pharmacyLatitude: number;
	pharmacyLongitude: number;
	pharmacyImages: string[];
	pharmacyDesc?: string;
	acceptsInsurance?: boolean;
	hasDelivery?: boolean;
	memberId?: string;
	openedAt?: Date;
}

interface PISearch {
	memberId?: string;
	locationList?: PharmacyLocation[];
	typeList?: PharmacyType[];
	acceptsInsurance?: boolean;
	hasDelivery?: boolean;
	deliveryFeeRange?: Range;
	periodsRange?: PeriodsRange;
	text?: string;
}

export interface PharmaciesInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: PISearch;
}

interface APISearch {
	pharmacyStatus?: PharmacyStatus;
}

export interface AgentPharmaciesInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: APISearch;
}

interface ALPISearch {
	pharmacyStatus?: PharmacyStatus;
	pharmacyLocationList?: PharmacyLocation[];
	pharmacyTypeList?: PharmacyType[];
}

export interface AllPharmaciesInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: ALPISearch;
}

interface Range {
	start: number;
	end: number;
}

interface PeriodsRange {
	start: Date | number;
	end: Date | number;
}
