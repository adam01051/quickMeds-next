import React, { FormEvent, KeyboardEvent, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import {
	AssistantRuntimeProvider,
	ThreadPrimitive,
	useExternalStoreRuntime,
	type AppendMessage,
	type ThreadMessageLike,
} from '@assistant-ui/react';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import MarkChatUnreadIcon from '@mui/icons-material/MarkChatUnread';
import { REACT_APP_API_URL } from '../../config';
import type { AssistantAction, AssistantApiError, AssistantApiResponse, AssistantMessage } from './types';

const suggestedPrompts = [
	'How do I find a pharmacy near me?',
	'How do I contact a pharmacy?',
	'How do I become a Pharmacy Owner?',
	'Where do my messages appear?',
];

const createId = () => `qm-assistant-${Date.now()}-${Math.random().toString(16).slice(2)}`;

const createMessage = (
	role: AssistantMessage['role'],
	content: string,
	options?: Pick<AssistantMessage, 'actions' | 'links' | 'status'>,
): AssistantMessage => ({
	id: createId(),
	role,
	content,
	createdAt: new Date().toISOString(),
	...options,
});

const toThreadMessage = (message: AssistantMessage): ThreadMessageLike => ({
	id: message.id,
	role: message.role,
	content: [{ type: 'text', text: message.content }],
	createdAt: new Date(message.createdAt),
	metadata: {
		custom: {
			status: message.status,
			links: message.links,
			actions: message.actions,
		},
	},
});

const readAppendMessageText = (message: AppendMessage): string => {
	const textParts: string[] = [];
	for (const part of message.content) {
		if (part.type === 'text') textParts.push(part.text);
	}
	return textParts.join('\n').trim();
};

const getApiUrl = () => `${REACT_APP_API_URL}/api/v1/chatbot/message`;

const actionForStatus = (status?: AssistantMessage['status']): AssistantAction[] => {
	if (status === 'not_configured') return [{ label: 'Open FAQ', href: '/cs?tab=faq' }];
	if (status === 'blocked') return [];
	if (status === 'unavailable' || status === 'rate_limited') {
		return [{ label: 'Open FAQ', href: '/cs?tab=faq' }];
	}
	return [];
};

const QuickMedsAssistantRuntime = ({
	children,
	messages,
	isRunning,
}: {
	children: React.ReactNode;
	messages: AssistantMessage[];
	isRunning: boolean;
}) => {
	const onNew = async (message: AppendMessage) => {
		readAppendMessageText(message);
	};

	const runtime = useExternalStoreRuntime<AssistantMessage>({
		isRunning,
		messages,
		convertMessage: toThreadMessage,
		onNew,
	});

	return <AssistantRuntimeProvider runtime={runtime}>{children}</AssistantRuntimeProvider>;
};

const QuickMedsAssistantPanel = ({
	open,
	messages,
	isSending,
	input,
	onInput,
	onSubmit,
	onPrompt,
	onClose,
	onAction,
	onLink,
}: {
	open: boolean;
	messages: AssistantMessage[];
	isSending: boolean;
	input: string;
	onInput: (value: string) => void;
	onSubmit: () => void;
	onPrompt: (value: string) => void;
	onClose: () => void;
	onAction: (href: string) => void;
	onLink: (href: string) => void;
}) => {
	const viewportRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!open || !viewportRef.current) return;
		viewportRef.current.scrollTo({ top: viewportRef.current.scrollHeight, behavior: 'smooth' });
	}, [open, messages.length, isSending]);

	const submitForm = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		onSubmit();
	};

	const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			onSubmit();
		}
	};

	return (
		<ThreadPrimitive.Root asChild>
			<section className={`quickmeds-assistant__panel ${open ? 'is-open' : ''}`} aria-label="QuickMeds Assistant">
				<header className="quickmeds-assistant__header">
					<button className="quickmeds-assistant__back" type="button" onClick={onClose} aria-label="Close assistant">
						<ArrowBackRoundedIcon />
					</button>
					<div className="quickmeds-assistant__identity">
						<span className="quickmeds-assistant__avatar">
							<SmartToyOutlinedIcon />
						</span>
						<div>
							<p>QuickMeds Assistant</p>
							<span>Platform help, pharmacy search, and account guidance</span>
						</div>
					</div>
					<button className="quickmeds-assistant__close" type="button" onClick={onClose} aria-label="Close assistant">
						<CloseRoundedIcon />
					</button>
				</header>

				<ThreadPrimitive.Viewport asChild autoScroll>
					<div className="quickmeds-assistant__history" ref={viewportRef}>
						<div className="quickmeds-assistant__intro">
							<strong>How can I help?</strong>
							<p>
								I can help you use QuickMeds, find pharmacies, contact a pharmacy, and understand account or
								Pharmacy Owner tools.
							</p>
						</div>
						<div className="quickmeds-assistant__prompts" aria-label="Suggested questions">
							{suggestedPrompts.map((prompt) => (
								<button key={prompt} type="button" onClick={() => onPrompt(prompt)}>
									{prompt}
								</button>
							))}
						</div>
						{messages.map((message) => (
							<article
								key={message.id}
								className={`quickmeds-assistant__message quickmeds-assistant__message--${message.role}`}
							>
								<div className="quickmeds-assistant__bubble">
									<p>{message.content}</p>
									{message.links?.length ? (
										<div className="quickmeds-assistant__links">
											{message.links.map((link) => (
												<button key={`${message.id}-${link.href}`} type="button" onClick={() => onLink(link.href)}>
													{link.label}
												</button>
											))}
										</div>
									) : null}
									{message.actions?.length ? (
										<div className="quickmeds-assistant__actions">
											{message.actions.map((action) => (
												<button key={`${message.id}-${action.href}`} type="button" onClick={() => onAction(action.href)}>
													{action.label}
												</button>
											))}
										</div>
									) : null}
								</div>
							</article>
						))}
						{isSending ? (
							<div className="quickmeds-assistant__message quickmeds-assistant__message--assistant">
								<div className="quickmeds-assistant__bubble quickmeds-assistant__bubble--typing">
									<span />
									<span />
									<span />
								</div>
							</div>
						) : null}
					</div>
				</ThreadPrimitive.Viewport>

				<form className="quickmeds-assistant__composer" onSubmit={submitForm}>
					<label className="quickmeds-assistant__composer-label" htmlFor="quickmeds-assistant-input">
						Message
					</label>
					<textarea
						id="quickmeds-assistant-input"
						value={input}
						onChange={(event) => onInput(event.target.value)}
						onKeyDown={onKeyDown}
						placeholder="How can I help you?"
						rows={1}
					/>
					<button type="submit" disabled={!input.trim() || isSending} aria-label="Send assistant message">
						<SendRoundedIcon />
					</button>
				</form>
			</section>
		</ThreadPrimitive.Root>
	);
};

const QuickMedsAssistant = () => {
	const router = useRouter();
	const [open, setOpen] = useState(false);
	const [input, setInput] = useState('');
	const [messages, setMessages] = useState<AssistantMessage[]>([]);
	const [isSending, setIsSending] = useState(false);
	const submitToRuntime = async (message: string) => {
		setIsSending(true);
		const userMessage = createMessage('user', message);

		setMessages((current) => [...current, userMessage]);

		try {
			const history = messages.slice(-8).map((historyMessage) => ({
				role: historyMessage.role,
				content: historyMessage.content,
			}));

			const response = await fetch(getApiUrl(), {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify({ message, history, locale: 'en' }),
			});
			const payload = (await response.json().catch(() => null)) as AssistantApiResponse | AssistantApiError | null;

			if (!response.ok) {
				const content =
					(payload && typeof payload.message === 'string' ? payload.message : undefined) ||
					'QuickMeds Assistant is not available right now. Please try again later or check the FAQ.';
				const status = (payload?.status as AssistantMessage['status']) || 'error';
				setMessages((current) => [
					...current,
					createMessage('assistant', content, { status, actions: actionForStatus(status) }),
				]);
				return;
			}

			const success = payload as AssistantApiResponse;
			setMessages((current) => [
				...current,
				createMessage('assistant', success.message.content, {
					status: success.status,
					links: success.links,
					actions: success.actions,
				}),
			]);
		} catch (error) {
			setMessages((current) => [
				...current,
				createMessage('assistant', 'QuickMeds Assistant could not connect. Please try again.', {
					status: 'error',
					actions: [{ label: 'Open FAQ', href: '/cs?tab=faq' }],
				}),
			]);
		} finally {
			setIsSending(false);
		}
	};

	const submit = () => {
		const next = input.trim();
		if (!next || isSending) return;
		setInput('');
		submitToRuntime(next);
	};

	const prompt = (value: string) => {
		if (isSending) return;
		setInput('');
		submitToRuntime(value);
	};

	const navigateToAction = (href: string) => {
		setOpen(false);
		router.push(href);
	};

	return (
		<QuickMedsAssistantRuntime messages={messages} isRunning={isSending}>
			<div className={`quickmeds-assistant ${open ? 'is-open' : ''}`}>
				{!open ? (
					<button
						type="button"
						className="quickmeds-assistant__launcher"
						onClick={() => setOpen(true)}
						aria-label="Open QuickMeds Assistant"
					>
						<MarkChatUnreadIcon />
					</button>
				) : null}
				<QuickMedsAssistantPanel
					open={open}
					messages={messages}
					isSending={isSending}
					input={input}
					onInput={setInput}
					onSubmit={submit}
					onPrompt={prompt}
					onClose={() => setOpen(false)}
					onAction={navigateToAction}
					onLink={navigateToAction}
				/>
			</div>
		</QuickMedsAssistantRuntime>
	);
};

export default QuickMedsAssistant;
