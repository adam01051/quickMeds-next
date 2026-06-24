export type AssistantRole = 'user' | 'assistant';

export interface AssistantAction {
	label: string;
	href: string;
}

export interface AssistantMessage {
	id: string;
	role: AssistantRole;
	content: string;
	createdAt: string;
	links?: AssistantAction[];
	actions?: AssistantAction[];
	status?: 'ok' | 'not_configured' | 'blocked' | 'unavailable' | 'rate_limited' | 'error';
}

export interface AssistantApiMessage {
	role: AssistantRole;
	content: string;
}

export interface AssistantApiResponse {
	message: AssistantApiMessage;
	links?: AssistantAction[];
	actions?: AssistantAction[];
	status: 'ok' | 'not_configured' | 'blocked' | 'unavailable' | 'rate_limited';
}

export interface AssistantApiError {
	message?: string;
	status?: string;
}
