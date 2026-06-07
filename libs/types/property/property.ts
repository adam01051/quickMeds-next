import { PharmacyLocation, PharmacyStatus, PharmacyType } from '../../enums/property.enum';
import { Member } from '../member/member';

export interface MeLiked {
	memberId: string;
	likeRefId: string;
	myFavorite: boolean;
}

export interface TotalCounter {
	total: number;
}

export interface Property {
	_id: string;
	pharmacyType: PharmacyType;
	pharmacyStatus: PharmacyStatus;
	pharmacyLocation: PharmacyLocation;
	pharmacyAddress: string;
	pharmacyName: string;
	pharmacyDeliveryFee: number;
	pharmacyLatitude: number;
	pharmacyLongitude: number;
	pharmacyMedicationCount: number;
	pharmacyViews: number;
	pharmacyLikes: number;
	pharmacyComments: number;
	pharmacyRank: number;
	pharmacyImages: string[];
	pharmacyDesc?: string;
	acceptsInsurance: boolean;
	hasDelivery: boolean;
	memberId: string;
	verifiedAt?: Date;
	deletedAt?: Date;
	openedAt?: Date;
	createdAt: Date;
	updatedAt: Date;
	/** from aggregation **/
	meLiked?: MeLiked[];
	memberData?: Member;
}

export interface Properties {
	list: Property[];
	metaCounter: TotalCounter[];
}
