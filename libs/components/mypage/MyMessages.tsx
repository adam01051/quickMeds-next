import React, { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Button } from '@mui/material';
import AttachFileRoundedIcon from '@mui/icons-material/AttachFileRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import LocalPharmacyOutlinedIcon from '@mui/icons-material/LocalPharmacyOutlined';
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

const MyMessages = () => {
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const socket = useReactiveVar(socketVar);
	const fileRef = useRef<HTMLInputElement>(null);
	const requestedThreadId = Array.isArray(router.query.threadId) ? router.query.threadId[0] : router.query.threadId;
	const [activeThreadId, setActiveThreadId] = useState<string | null>(requestedThreadId ?? null);
	const [messageText, setMessageText] = useState('');
	const [messageImages, setMessageImages] = useState<string[]>([]);
	const [isUploading, setIsUploading] = useState(false);
	const [isSending, setIsSending] = useState(false);
	const [threadSearch, setThreadSearch] = useState('');

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

	const threads: MessageThread[] = threadsData?.getMyMessageThreads?.list ?? [];
	const selectedThread = useMemo(
		() => threads.find((thread) => thread._id === activeThreadId) ?? null,
		[activeThreadId, threads],
	);
	const messageInquiry: MessagesInquiry | null = activeThreadId
		? { page: 1, limit: 80, sort: 'createdAt', direction: Direction.ASC, threadId: activeThreadId }
		: null;

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

	useEffect(() => {
		if (requestedThreadId) setActiveThreadId(requestedThreadId);
	}, [requestedThreadId]);

	useEffect(() => {
		if (!activeThreadId && filteredThreads.length) setActiveThreadId(filteredThreads[0]._id);
	}, [activeThreadId, filteredThreads]);

	useEffect(() => {
		if (!activeThreadId) return;
		markThreadRead({ variables: { threadId: activeThreadId } })
			.then(() => refetchThreads({ input: threadInquiry }))
			.catch(() => undefined);
	}, [activeThreadId, markThreadRead, refetchThreads]);

	useEffect(() => {
		if (!socket) return;
		const handleSocketMessage = (event: MessageEvent) => {
			try {
				const data = JSON.parse(event.data);
				if (!String(data.event || '').startsWith('message:')) return;
				refetchThreads({ input: threadInquiry }).catch(() => undefined);
				if (data.thread?._id === activeThreadId || data.message?.threadId === activeThreadId) {
					refetchMessages({ input: messageInquiry }).catch(() => undefined);
					if (activeThreadId) markThreadRead({ variables: { threadId: activeThreadId } }).catch(() => undefined);
				}
			} catch {
				// Ignore unrelated socket payloads.
			}
		};

		socket.addEventListener('message', handleSocketMessage);
		return () => socket.removeEventListener('message', handleSocketMessage);
	}, [activeThreadId, markThreadRead, messageInquiry, refetchMessages, refetchThreads, socket]);

	const selectThread = (threadId: string) => {
		setActiveThreadId(threadId);
		router.push({ pathname: '/mypage', query: { category: 'messages', threadId } }, undefined, { scroll: false });
	};

	const uploadMessageImages = async (event: ChangeEvent<HTMLInputElement>) => {
		try {
			const files = Array.from(event.target.files ?? []);
			if (!files.length) return;
			if (files.length + messageImages.length > 4) throw new Error('You can attach up to 4 images.');
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
			await sweetMixinErrorAlert(error.message ?? 'Image upload failed.');
		} finally {
			setIsUploading(false);
		}
	};

	const submitMessage = async (event: FormEvent) => {
		event.preventDefault();
		try {
			if (!activeThreadId) return;
			if (!messageText.trim() && !messageImages.length) throw new Error('Write a message or attach an image first.');
			setIsSending(true);
			await sendMessage({
				variables: {
					input: {
						threadId: activeThreadId,
						messageText: messageText.trim(),
						messageImages,
					},
				},
			});
			setMessageText('');
			setMessageImages([]);
			await refetchMessages({ input: messageInquiry });
			await refetchThreads({ input: threadInquiry });
		} catch (error) {
			await sweetErrorHandling(error);
		} finally {
			setIsSending(false);
		}
	};

	const otherParticipant = (thread: MessageThread) => {
		const member = user?._id === thread.ownerId ? thread.customerData : thread.ownerData;
		return member?.memberFullName ?? member?.memberNick ?? 'QuickMeds member';
	};
	const otherMember = selectedThread ? (user?._id === selectedThread.ownerId ? selectedThread.customerData : selectedThread.ownerData) : null;
	const selectedUnreadTotal = threads.reduce((total, thread) => total + (thread.myUnreadCount ?? 0), 0);

	if (threadsLoading) {
		return (
			<section className="my-messages">
				<div className="my-messages__skeleton" />
				<div className="my-messages__skeleton my-messages__skeleton--large" />
			</section>
		);
	}

	if (threadsError) {
		return (
			<section className="my-messages my-messages__state">
				<h2>Messages could not load</h2>
				<p>We could not reach your inbox. Please try again.</p>
				<Button onClick={() => refetchThreads({ input: threadInquiry })}>Retry</Button>
			</section>
		);
	}

	if (!threads.length) {
		return (
			<section className="my-messages my-messages__state">
				<h2>No messages yet</h2>
				<p>Start from a pharmacy detail page when you have a question for a Pharmacy Owner.</p>
				<Link href="/pharmacies">Find pharmacies <ArrowForwardRoundedIcon /></Link>
			</section>
		);
	}

	return (
		<section className="my-messages">
			<aside className="my-messages__threads" aria-label="Message conversations">
				<div className="my-messages__thread-header">
					<div>
						<span>Messages</span>
						<strong>{filteredThreads.length} conversations</strong>
					</div>
					{selectedUnreadTotal > 0 && <em>{selectedUnreadTotal} New</em>}
				</div>
				<label className="my-messages__search" htmlFor="message-thread-search">
					<SearchRoundedIcon />
					<input
						id="message-thread-search"
						type="search"
						value={threadSearch}
						placeholder="Search conversations..."
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
					>
						<img src={memberImageUrl(user?._id === thread.ownerId ? thread.customerData?.memberImage : thread.ownerData?.memberImage)} alt="" />
						<span>
							<strong>{otherParticipant(thread)}</strong>
							<em>{thread.pharmacyData?.pharmacyName ?? 'Pharmacy conversation'}</em>
							<small>{thread.lastMessageText || 'Image message'}</small>
						</span>
						{thread.myUnreadCount > 0 && <b>{thread.myUnreadCount}</b>}
					</button>
				))}
				{!filteredThreads.length && <p className="my-messages__no-thread">No conversations match this search.</p>}
				</div>
			</aside>

			<div className="my-messages__conversation">
				<header>
					<div>
						<div className="my-messages__member-avatar">
							<img src={memberImageUrl(otherMember?.memberImage)} alt="" />
						</div>
						<div>
							<span>{selectedThread?.pharmacyData?.pharmacyName ?? 'Pharmacy conversation'}</span>
							<h2>{otherMember?.memberFullName ?? otherMember?.memberNick ?? 'Conversation'}</h2>
							<p>Active conversation about {selectedThread?.pharmacyData?.pharmacyName ?? 'this pharmacy'}</p>
						</div>
					</div>
					<div className="my-messages__conversation-actions">
						{otherMember?.memberPhone && (
							<a href={`tel:${otherMember.memberPhone}`} aria-label={`Call ${otherMember.memberNick ?? 'participant'}`}>
								<PhoneOutlinedIcon />
							</a>
						)}
						{selectedThread?.pharmacyId && (
							<Link href={`/pharmacies/detail?id=${selectedThread.pharmacyId}`}>
								<LocalPharmacyOutlinedIcon /> View pharmacy
							</Link>
						)}
					</div>
				</header>

				<div className="my-messages__history" aria-live="polite">
					{!!messages.length && <div className="my-messages__day-divider">Conversation history</div>}
					{messagesLoading && <p className="my-messages__hint">Loading conversation…</p>}
					{messagesError && <p className="my-messages__hint">Messages could not load. Please try again.</p>}
					{!messagesLoading && !messages.length && <p className="my-messages__hint">No messages in this conversation yet.</p>}
					{messages.map((message) => {
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
													<img src={messageImageUrl(image)} alt="Message attachment" />
												</a>
											))}
										</div>
									)}
									<time>{messageDate(message.createdAt)}</time>
								</div>
							</article>
						);
					})}
				</div>

				<form className="my-messages__composer" onSubmit={submitMessage}>
					<label htmlFor="message-composer">Message</label>
					<textarea
						id="message-composer"
						value={messageText}
						placeholder="Ask about availability, delivery, or pharmacy services."
						onChange={(event) => setMessageText(event.target.value)}
						disabled={isSending}
						maxLength={1200}
					/>
					{!!messageImages.length && (
						<div className="my-messages__preview">
							{messageImages.map((image) => (
								<button type="button" key={image} onClick={() => setMessageImages((current) => current.filter((item) => item !== image))}>
									<img src={messageImageUrl(image)} alt="Remove attachment" />
									<span>Remove</span>
								</button>
							))}
						</div>
					)}
					<div className="my-messages__composer-actions">
						<input ref={fileRef} type="file" accept="image/jpeg,image/jpg,image/png" multiple onChange={uploadMessageImages} />
						<Button type="button" onClick={() => fileRef.current?.click()} disabled={isUploading || isSending}>
							<AttachFileRoundedIcon /> {isUploading ? 'Uploading…' : 'Images'}
						</Button>
						<Button type="submit" disabled={isSending || (!messageText.trim() && !messageImages.length)}>
							{isSending ? 'Sending…' : 'Send'} <SendRoundedIcon />
						</Button>
					</div>
				</form>
			</div>
		</section>
	);
};

export default MyMessages;
