import { Member } from '../member/member';
import { Property, TotalCounter } from '../property/property';

export interface MessageThread {
	_id: string;
	customerId: string;
	ownerId: string;
	pharmacyId: string;
	lastMessageText?: string;
	lastMessageAt?: Date;
	customerUnreadCount: number;
	ownerUnreadCount: number;
	myUnreadCount: number;
	createdAt: Date;
	updatedAt: Date;
	customerData?: Member;
	ownerData?: Member;
	pharmacyData?: Property;
}

export interface MessageThreads {
	list: MessageThread[];
	metaCounter: TotalCounter[];
}

export interface PharmacyMessage {
	_id: string;
	messageStatus: string;
	threadId: string;
	senderId: string;
	receiverId: string;
	pharmacyId: string;
	messageText?: string;
	messageImages?: string[];
	readAt?: Date;
	createdAt: Date;
	updatedAt: Date;
	senderData?: Member;
}

export interface PharmacyMessages {
	list: PharmacyMessage[];
	metaCounter: TotalCounter[];
}
