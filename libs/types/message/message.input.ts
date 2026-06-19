import { Direction } from '../../enums/common.enum';

export interface MessageThreadsInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
}

export interface MessagesInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	threadId: string;
}
