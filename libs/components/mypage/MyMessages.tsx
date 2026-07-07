import React, { ChangeEvent, FormEvent, KeyboardEvent, useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Button } from '@mui/material';
import AttachFileRoundedIcon from '@mui/icons-material/AttachFileRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { GET_MESSAGES, GET_MY_MESSAGE_THREADS } from '../../../apollo/user/query';
import { MARK_MESSAGE_THREAD_READ, SEND_MESSAGE } from '../../../apollo/user/mutation';
import { socketVar, userVar } from '../../../apollo/store';
import { Direction } from '../../enums/common.enum';
import { MessageThread, PharmacyMessage } from '../../types/message/message';
import { MessagesInquiry, MessageThreadsInquiry } from '../../types/message/message.input';
import { getJwtToken } from '../../auth';
import { REACT_APP_API_URL } from '../../config';
import { sweetErrorHandling, sweetMixinErrorAlert } from '../../sweetAlert';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import MyPageMobileMenu from './MyPageMobileMenu';
import { useTranslation } from 'next-i18next';

const threadInquiry: MessageThreadsInquiry = {
	page: 1,
	limit: 30,
	sort: 'lastMessageAt',
	direction: Direction.DESC,
};

const messageImageUrl = (image: string) => `${REACT_APP_API_URL}/${image}`;
const memberImageUrl = (image?: string) => (image ? `${REACT_APP_API_URL}/${image}` : '/img/profile/defaultUser.svg');
const messageDate = (date?: Date | string) =>
	date ? new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(date)) : '';
const NEAR_BOTTOM_THRESHOLD = 96;
type ThreadRealtimeUpdate = Pick<MessageThread, 'lastMessageText' | 'lastMessageAt' | 'myUnreadCount'>;

const MyMessages = () => {
	const router = useRouter();
	const { t } = useTranslation('common');
	const device = useDeviceDetect();
	const isMobile = device === 'mobile';
	const user = useReactiveVar(userVar);
	const socket = useReactiveVar(socketVar);
	const fileRef = useRef<HTMLInputElement>(null);
	const historyRef = useRef<HTMLDivElement>(null);
	const bottomRef = useRef<HTMLDivElement>(null);
	const wasNearBottomRef = useRef(true);
	const lastMessageIdRef = useRef<string | null>(null);
	const pendingBottomScrollRef = useRef<'auto' | 'smooth' | null>(null);
	const preserveScrollRef = useRef<{ scrollHeight: number; scrollTop: number } | null>(null);
	const requestedThreadId = Array.isArray(router.query.threadId) ? router.query.threadId[0] : router.query.threadId;
	const [activeThreadId, setActiveThreadId] = useState<string | null>(requestedThreadId ?? null);
	const [messageText, setMessageText] = useState('');
	const [messageImages, setMessageImages] = useState<string[]>([]);
	const [isUploading, setIsUploading] = useState(false);
	const [isSending, setIsSending] = useState(false);
	const [threadSearch, setThreadSearch] = useState('');
	const [showNewMessageButton, setShowNewMessageButton] = useState(false);
	const [deviceReady, setDeviceReady] = useState(false);
	const [realtimeMessages, setRealtimeMessages] = useState<PharmacyMessage[]>([]);
	const [realtimeThreadUpdates, setRealtimeThreadUpdates] = useState<Record<string, ThreadRealtimeUpdate>>({});

	const {
		data: threadsData,
		loading: threadsLoading,
		error: threadsError,
		refetch: refetchThreads,
	} = useQuery(GET_MY_MESSAGE_THREADS, {
		variables: { input: threadInquiry },
		fetchPolicy: 'network-only',
		skip: !user?._id,
	});

	const serverThreads: MessageThread[] = threadsData?.getMyMessageThreads?.list ?? [];
	const threads: MessageThread[] = useMemo(() => {
		return serverThreads
			.map((thread) => {
				const update = realtimeThreadUpdates[thread._id];
				return update ? { ...thread, ...update } : thread;
			})
			.sort((first, second) => {
				const firstTime = new Date(first.lastMessageAt ?? first.updatedAt ?? first.createdAt).getTime();
				const secondTime = new Date(second.lastMessageAt ?? second.updatedAt ?? second.createdAt).getTime();
				return secondTime - firstTime;
			});
	}, [realtimeThreadUpdates, serverThreads]);
	const selectedThread = useMemo(
		() => threads.find((thread) => thread._id === activeThreadId) ?? null,
		[activeThreadId, threads],
	);
	const messageInquiry: MessagesInquiry | null = useMemo(
		() => (activeThreadId ? { page: 1, limit: 80, sort: 'createdAt', direction: Direction.ASC, threadId: activeThreadId } : null),
		[activeThreadId],
	);

	const {
		data: messagesData,
		loading: messagesLoading,
		error: messagesError,
		refetch: refetchMessages,
	} = useQuery(GET_MESSAGES, {
		variables: { input: messageInquiry },
		fetchPolicy: 'network-only',
		skip: !messageInquiry,
	});

	const [sendMessage] = useMutation(SEND_MESSAGE);
	const [markThreadRead] = useMutation(MARK_MESSAGE_THREAD_READ);
	const messages: PharmacyMessage[] = messagesData?.getMessages?.list ?? [];
	const displayedMessages = useMemo(() => {
		const messageMap = new Map<string, PharmacyMessage>();
		const activeRealtimeMessages = realtimeMessages.filter((message) => message.threadId === activeThreadId);

		[...messages, ...activeRealtimeMessages].forEach((message) => {
			if (message?._id) messageMap.set(message._id, message);
		});

		return Array.from(messageMap.values()).sort(
			(first, second) => new Date(first.createdAt).getTime() - new Date(second.createdAt).getTime(),
		);
	}, [activeThreadId, messages, realtimeMessages]);
	const filteredThreads = useMemo(() => {
		const query = threadSearch.trim().toLowerCase();
		if (!query) return threads;
		return threads.filter((thread) => {
			const member = user?._id === thread.ownerId ? thread.customerData : thread.ownerData;
			return [
				thread.pharmacyData?.pharmacyName,
				thread.pharmacyData?.pharmacyAddress,
				member?.memberFullName,
				member?.memberNick,
				thread.lastMessageText,
			]
				.filter(Boolean)
				.some((value) => String(value).toLowerCase().includes(query));
		});
	}, [threadSearch, threads, user?._id]);

	const prefersReducedMotion = () =>
		typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	const isNearHistoryBottom = () => {
		const history = historyRef.current;
		if (!history) return true;
		return history.scrollHeight - history.scrollTop - history.clientHeight <= NEAR_BOTTOM_THRESHOLD;
	};

	const scrollHistoryToBottom = (behavior: ScrollBehavior = 'smooth') => {
		const resolvedBehavior = prefersReducedMotion() ? 'auto' : behavior;
		bottomRef.current?.scrollIntoView({ block: 'end', behavior: resolvedBehavior });
		wasNearBottomRef.current = true;
		setShowNewMessageButton(false);
	};

	const refreshMessagesWithIntent = async (forceBottom = false) => {
		const shouldScrollToBottom = forceBottom || isNearHistoryBottom();
		if (shouldScrollToBottom) pendingBottomScrollRef.current = forceBottom ? 'smooth' : 'auto';
		else setShowNewMessageButton(true);
		if (messageInquiry) await refetchMessages({ input: messageInquiry });
	};

	const mergeRealtimeMessage = (message: PharmacyMessage) => {
		setRealtimeMessages((current) => {
			if (current.some((item) => item._id === message._id)) return current;
			return [...current, message];
		});
	};

	const applyRealtimeThreadUpdate = (message: PharmacyMessage) => {
		if (!message.threadId) return;
		const isIncoming = message.receiverId === user?._id;
		const isOpenThread = message.threadId === activeThreadId;
		setRealtimeThreadUpdates((current) => {
			const currentUnread = current[message.threadId]?.myUnreadCount ?? threads.find((thread) => thread._id === message.threadId)?.myUnreadCount ?? 0;
			return {
				...current,
				[message.threadId]: {
				lastMessageText: message.messageText || (message.messageImages?.length ? t('mypage.messages.image') : ''),
					lastMessageAt: message.createdAt,
					myUnreadCount: isIncoming && !isOpenThread ? currentUnread + 1 : isOpenThread ? 0 : currentUnread,
				},
			};
		});
	};

	const handleHistoryScroll = () => {
		const nearBottom = isNearHistoryBottom();
		wasNearBottomRef.current = nearBottom;
		if (nearBottom) setShowNewMessageButton(false);
	};

	useEffect(() => {
		setDeviceReady(true);
	}, []);

	useEffect(() => {
		if (requestedThreadId) setActiveThreadId(requestedThreadId);
		else if (isMobile) setActiveThreadId(null);
	}, [isMobile, requestedThreadId]);

	useEffect(() => {
		if (!deviceReady || isMobile || activeThreadId || !filteredThreads.length) return;
		if (typeof window !== 'undefined' && window.innerWidth <= 767) return;
		setActiveThreadId(filteredThreads[0]._id);
	}, [activeThreadId, deviceReady, filteredThreads, isMobile]);

	useEffect(() => {
		if (!activeThreadId) return;
		setRealtimeMessages((current) => current.filter((message) => message.threadId === activeThreadId));
		lastMessageIdRef.current = null;
		wasNearBottomRef.current = true;
		pendingBottomScrollRef.current = 'auto';
		preserveScrollRef.current = null;
		setShowNewMessageButton(false);
	}, [activeThreadId]);

	useEffect(() => {
		if (!activeThreadId) return;
		markThreadRead({ variables: { threadId: activeThreadId } })
			.then(() => refetchThreads({ input: threadInquiry }))
			.catch(() => undefined);
	}, [activeThreadId, markThreadRead, refetchThreads]);

	useEffect(() => {
		if (!realtimeMessages.length) return;
		const serverMessageIds = new Set(messages.map((message) => message._id));
		setRealtimeMessages((current) => {
			const nextMessages = current.filter((message) => message.threadId === activeThreadId && !serverMessageIds.has(message._id));
			return nextMessages.length === current.length ? current : nextMessages;
		});
	}, [activeThreadId, messages, realtimeMessages.length]);

	useEffect(() => {
		if (!Object.keys(realtimeThreadUpdates).length) return;
		setRealtimeThreadUpdates((current) => {
			const nextUpdates = { ...current };
			serverThreads.forEach((thread) => {
				const update = nextUpdates[thread._id];
				if (!update) return;
				if (
					String(thread.lastMessageAt ?? '') === String(update.lastMessageAt ?? '') &&
					thread.lastMessageText === update.lastMessageText &&
					thread.myUnreadCount === update.myUnreadCount
				) {
					delete nextUpdates[thread._id];
				}
			});
			return Object.keys(nextUpdates).length === Object.keys(current).length ? current : nextUpdates;
		});
	}, [realtimeThreadUpdates, serverThreads]);

	useEffect(() => {
		const history = historyRef.current;
		if (!history) return;
		const lastMessageId = displayedMessages[displayedMessages.length - 1]?._id ?? null;
		const hasNewLastMessage = lastMessageId !== lastMessageIdRef.current;
		const pendingPreserve = preserveScrollRef.current;
		const pendingBottom = pendingBottomScrollRef.current;

		if (pendingPreserve) {
			const nextScrollTop = history.scrollHeight - pendingPreserve.scrollHeight + pendingPreserve.scrollTop;
			history.scrollTop = Math.max(0, nextScrollTop);
			preserveScrollRef.current = null;
		} else if (pendingBottom || (hasNewLastMessage && wasNearBottomRef.current)) {
			requestAnimationFrame(() => scrollHistoryToBottom(pendingBottom ?? 'auto'));
		} else if (hasNewLastMessage) {
			setShowNewMessageButton(true);
		}

		lastMessageIdRef.current = lastMessageId;
		pendingBottomScrollRef.current = null;
	}, [displayedMessages]);

	useEffect(() => {
		if (!socket) return;
		const handleSocketMessage = (event: MessageEvent) => {
			try {
				const data = JSON.parse(event.data);
				if (!String(data.event || '').startsWith('message:')) return;
				refetchThreads({ input: threadInquiry }).catch(() => undefined);
				const socketMessage = data.message as PharmacyMessage | undefined;
				if (data.event === 'message:new' && socketMessage?._id) {
					mergeRealtimeMessage(socketMessage);
					applyRealtimeThreadUpdate(socketMessage);
					if (socketMessage.threadId === activeThreadId) {
						const shouldScrollToBottom = isNearHistoryBottom();
						if (shouldScrollToBottom) pendingBottomScrollRef.current = 'auto';
						else setShowNewMessageButton(true);
						if (messageInquiry) refetchMessages({ input: messageInquiry }).catch(() => undefined);
						if (socketMessage.receiverId === user?._id) markThreadRead({ variables: { threadId: activeThreadId } }).catch(() => undefined);
					}
					return;
				}
				if (data.thread?._id === activeThreadId || data.message?.threadId === activeThreadId) {
					refreshMessagesWithIntent().catch(() => undefined);
					if (activeThreadId) markThreadRead({ variables: { threadId: activeThreadId } }).catch(() => undefined);
				}
			} catch {
				// Ignore unrelated socket payloads.
			}
		};

		socket.addEventListener('message', handleSocketMessage);
		return () => socket.removeEventListener('message', handleSocketMessage);
	}, [activeThreadId, markThreadRead, messageInquiry, refetchMessages, refetchThreads, socket, threads, user?._id]);

	const selectThread = (threadId: string) => {
		setActiveThreadId(threadId);
		router.push({ pathname: '/mypage', query: { category: 'messages', threadId } }, undefined, { scroll: false });
	};

	const closeMobileThread = () => {
		setActiveThreadId(null);
		router.push({ pathname: '/mypage', query: { category: 'messages' } }, undefined, { scroll: false });
	};

	const uploadMessageImages = async (event: ChangeEvent<HTMLInputElement>) => {
		try {
			const files = Array.from(event.target.files ?? []);
			if (!files.length) return;
			if (files.length + messageImages.length > 4) throw new Error(t('mypage.messages.errors.maxAttachments'));
			setIsUploading(true);

			const body = new FormData();
			body.append(
				'operations',
				JSON.stringify({
					query: 'mutation ImagesUploader($files: [Upload!]!, $target: String!) { imagesUploader(files: $files, target: $target) }',
					variables: { files: files.map(() => null), target: 'messages' },
				}),
			);
			body.append('map', JSON.stringify(Object.fromEntries(files.map((_, index) => [index, [`variables.files.${index}`]]))));
			files.forEach((file, index) => body.append(String(index), file));

			const response = await axios.post(`${process.env.REACT_APP_API_GRAPHQL_URL}`, body, {
				headers: { Authorization: `Bearer ${getJwtToken()}`, 'apollo-require-preflight': true },
			});
			setMessageImages((current) => [...current, ...(response.data?.data?.imagesUploader ?? [])]);
			if (fileRef.current) fileRef.current.value = '';
		} catch (error: any) {
			await sweetMixinErrorAlert(error.message ?? t('mypage.messages.errors.uploadFailed'));
		} finally {
			setIsUploading(false);
		}
	};

	const sendCurrentMessage = async () => {
		try {
			const currentThreadId = activeThreadId;
			if (!currentThreadId) return;
			if (!messageText.trim() && !messageImages.length) throw new Error(t('mypage.messages.errors.messageRequired'));
			if (isSending) return;
			setIsSending(true);
			const response = await sendMessage({
				variables: {
					input: {
						threadId: currentThreadId,
						messageText: messageText.trim(),
						messageImages,
					},
				},
			});
			const sentMessage = response.data?.sendMessage as PharmacyMessage | undefined;
			if (sentMessage?._id && sentMessage.threadId === currentThreadId) {
				mergeRealtimeMessage(sentMessage);
				applyRealtimeThreadUpdate(sentMessage);
			}
			setMessageText('');
			setMessageImages([]);
			await refreshMessagesWithIntent(true);
			await refetchThreads({ input: threadInquiry });
		} catch (error) {
			await sweetErrorHandling(error);
		} finally {
			setIsSending(false);
		}
	};

	const submitMessage = async (event: FormEvent) => {
		event.preventDefault();
		await sendCurrentMessage();
	};

	const handleComposerKeyDown = async (event: KeyboardEvent<HTMLTextAreaElement>) => {
		if (isMobile || event.key !== 'Enter' || event.shiftKey || event.nativeEvent.isComposing) return;
		if (isSending || isUploading || (!messageText.trim() && !messageImages.length)) return;
		event.preventDefault();
		await sendCurrentMessage();
	};

	const otherParticipant = (thread: MessageThread) => {
		const member = user?._id === thread.ownerId ? thread.customerData : thread.ownerData;
		return member?.memberFullName ?? member?.memberNick ?? t('mypage.menu.defaultMember');
	};
	const otherMember = selectedThread ? (user?._id === selectedThread.ownerId ? selectedThread.customerData : selectedThread.ownerData) : null;
	const selectedUnreadTotal = threads.reduce((total, thread) => total + (thread.myUnreadCount ?? 0), 0);
	const stateMobileMenu = (
		<div className="my-messages__state-menu" aria-label={t('mypage.messages.sectionMenu')}>
			<MyPageMobileMenu triggerClassName="my-messages__mobile-menu-trigger" />
		</div>
	);

	if (threadsLoading) {
		return (
			<section className="my-messages my-messages--loading">
				{stateMobileMenu}
				<div className="my-messages__skeleton" />
				<div className="my-messages__skeleton my-messages__skeleton--large" />
			</section>
		);
	}

	if (threadsError) {
		return (
			<section className="my-messages my-messages__state">
				{stateMobileMenu}
				<h2>{t('mypage.messages.loadErrorTitle')}</h2>
				<p>{t('mypage.messages.loadErrorText')}</p>
				<Button onClick={() => refetchThreads({ input: threadInquiry })}>{t('mypage.common.tryAgain')}</Button>
			</section>
		);
	}

	if (!threads.length) {
		return (
			<section className="my-messages my-messages__state">
				{stateMobileMenu}
				<h2>{t('mypage.messages.emptyTitle')}</h2>
				<p>{t('mypage.messages.emptyText')}</p>
				<Link href="/pharmacies">{t('mypage.messages.findPharmacies')} <ArrowForwardRoundedIcon /></Link>
			</section>
		);
	}

	return (
		<section className={`my-messages ${activeThreadId ? 'my-messages--chat-open' : ''}`}>
			<aside className="my-messages__threads" aria-label={t('mypage.messages.conversationsAria')} data-testid="messages-conversation-list">
				<div className="my-messages__thread-header">
					<div>
						<span>{t('mypage.categories.messages.title')}</span>
						<strong>{t('mypage.messages.conversationCount', { count: filteredThreads.length })}</strong>
					</div>
					{selectedUnreadTotal > 0 && <em>{t('mypage.messages.newCount', { count: selectedUnreadTotal })}</em>}
					<MyPageMobileMenu triggerClassName="my-messages__mobile-menu-trigger" />
				</div>
				<label className="my-messages__search" htmlFor="message-thread-search">
					<SearchRoundedIcon />
					<input
						id="message-thread-search"
						type="search"
						value={threadSearch}
						placeholder={t('mypage.messages.searchPlaceholder')}
						onChange={(event) => setThreadSearch(event.target.value)}
					/>
				</label>
				<div className="my-messages__thread-list">
				{filteredThreads.map((thread) => (
					<button
						type="button"
						key={thread._id}
						className={thread._id === activeThreadId ? 'active' : ''}
						onClick={() => selectThread(thread._id)}
						data-testid={`messages-conversation-row-${thread._id}`}
					>
						<img src={memberImageUrl(user?._id === thread.ownerId ? thread.customerData?.memberImage : thread.ownerData?.memberImage)} alt="" />
						<span>
							<strong>{otherParticipant(thread)}</strong>
							<em>{thread.pharmacyData?.pharmacyName ?? t('mypage.messages.pharmacyConversation')}</em>
							<small>{thread.lastMessageText || t('mypage.messages.imageMessage')}</small>
						</span>
						<div className="my-messages__thread-meta">
							{thread.lastMessageAt && <time>{messageDate(thread.lastMessageAt)}</time>}
							{thread.myUnreadCount > 0 && <b>{thread.myUnreadCount}</b>}
						</div>
					</button>
				))}
				{!filteredThreads.length && <p className="my-messages__no-thread">{t('mypage.messages.noSearchResults')}</p>}
				</div>
			</aside>

			<div className="my-messages__conversation" data-testid={isMobile ? 'mobile-chat-overlay' : undefined} aria-hidden={isMobile && !activeThreadId}>
				<header>
					<div>
						<button
							type="button"
							className="my-messages__back"
							onClick={closeMobileThread}
							aria-label={t('mypage.messages.backToConversations')}
							data-testid="mobile-chat-back-button"
						>
							<ArrowBackRoundedIcon />
						</button>
						{selectedThread?.pharmacyId ? (
							<Link
								href={`/pharmacies/detail?id=${selectedThread.pharmacyId}`}
								className="my-messages__conversation-identity"
								aria-label={t('mypage.messages.viewPharmacyAria', { name: selectedThread.pharmacyData?.pharmacyName ?? t('mypage.messages.pharmacy') })}
								data-testid="view-pharmacy-action"
							>
								<div className="my-messages__member-avatar">
									<img src={memberImageUrl(otherMember?.memberImage)} alt="" />
								</div>
								<div>
									<span>{otherMember?.memberFullName ?? otherMember?.memberNick ?? t('mypage.menu.defaultMember')}</span>
									<h2>{selectedThread.pharmacyData?.pharmacyName ?? t('mypage.messages.pharmacyConversation')}</h2>
									<p>{t('mypage.messages.openPharmacyDetails')}</p>
								</div>
							</Link>
						) : (
							<div className="my-messages__conversation-identity">
								<div className="my-messages__member-avatar">
									<img src={memberImageUrl(otherMember?.memberImage)} alt="" />
								</div>
								<div>
									<span>{otherMember?.memberFullName ?? otherMember?.memberNick ?? t('mypage.menu.defaultMember')}</span>
									<h2>{selectedThread?.pharmacyData?.pharmacyName ?? t('mypage.messages.conversation')}</h2>
									<p>{t('mypage.messages.pharmacyConversation')}</p>
								</div>
							</div>
						)}
					</div>
					<div className="my-messages__conversation-actions">
						{otherMember?.memberPhone && (
							<a href={`tel:${otherMember.memberPhone}`} aria-label={t('mypage.messages.callParticipant', { name: otherMember.memberNick ?? t('mypage.messages.participant') })}>
								<PhoneOutlinedIcon />
							</a>
						)}
					</div>
				</header>

				<div
					className="my-messages__history"
					aria-live="polite"
					data-testid="message-history"
					ref={historyRef}
					onScroll={handleHistoryScroll}
				>
					{!!displayedMessages.length && <div className="my-messages__day-divider">{t('mypage.messages.history')}</div>}
					{messagesLoading && <p className="my-messages__hint">{t('mypage.messages.loadingConversation')}</p>}
					{messagesError && <p className="my-messages__hint">{t('mypage.messages.conversationLoadError')}</p>}
					{!messagesLoading && !displayedMessages.length && <p className="my-messages__hint">{t('mypage.messages.noConversationMessages')}</p>}
					{displayedMessages.map((message) => {
						const mine = message.senderId === user?._id;
						return (
							<article key={message._id} className={mine ? 'mine' : ''}>
								{!mine && <img src={memberImageUrl(message.senderData?.memberImage)} alt="" />}
								<div>
									{message.messageText && <p>{message.messageText}</p>}
									{!!message.messageImages?.length && (
										<div className="my-messages__images">
											{message.messageImages.map((image) => (
												<a href={messageImageUrl(image)} target="_blank" rel="noreferrer" key={image}>
													<img src={messageImageUrl(image)} alt={t('mypage.messages.attachmentAlt')} />
												</a>
											))}
										</div>
									)}
									<time>{messageDate(message.createdAt)}</time>
								</div>
							</article>
						);
					})}
					{showNewMessageButton && (
						<button
							type="button"
							className="my-messages__scroll-bottom"
							data-testid="scroll-to-latest-messages"
							onClick={() => scrollHistoryToBottom('smooth')}
						>
							{t('mypage.messages.newMessages')}
						</button>
					)}
					<div ref={bottomRef} className="my-messages__bottom-sentinel" aria-hidden="true" />
				</div>

				<form className="my-messages__composer" onSubmit={submitMessage} data-testid="message-composer">
					<label htmlFor="message-composer">{t('mypage.messages.messageLabel')}</label>
					<div className="my-messages__composer-row">
						<textarea
							id="message-composer"
							value={messageText}
							placeholder={t('mypage.messages.composerPlaceholder')}
							onChange={(event) => setMessageText(event.target.value)}
							onKeyDown={handleComposerKeyDown}
							disabled={isSending}
							maxLength={1200}
						/>
						<div className="my-messages__composer-actions">
							<input ref={fileRef} type="file" accept="image/jpeg,image/jpg,image/png" multiple onChange={uploadMessageImages} />
							<Button type="button" onClick={() => fileRef.current?.click()} disabled={isUploading || isSending}>
								<AttachFileRoundedIcon /> {isUploading ? t('mypage.messages.uploading') : t('mypage.messages.attach')}
							</Button>
							<Button type="submit" disabled={isSending || (!messageText.trim() && !messageImages.length)} data-testid="message-send-button">
								{isSending ? t('mypage.messages.sending') : t('mypage.messages.send')} <SendRoundedIcon />
							</Button>
						</div>
					</div>
					{!!messageImages.length && (
						<div className="my-messages__preview">
							{messageImages.map((image) => (
								<button type="button" key={image} onClick={() => setMessageImages((current) => current.filter((item) => item !== image))}>
									<img src={messageImageUrl(image)} alt={t('mypage.messages.removeAttachment')} />
									<span>{t('mypage.messages.remove')}</span>
								</button>
							))}
						</div>
					)}
				</form>
			</div>
		</section>
	);
};

export default MyMessages;
