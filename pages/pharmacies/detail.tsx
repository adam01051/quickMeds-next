import React, { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { Button, Stack } from '@mui/material';
import withLayoutFull from '../../libs/components/layout/LayoutFull';
import { NextPage } from 'next';
import Review from '../../libs/components/property/Review';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import HealthAndSafetyOutlinedIcon from '@mui/icons-material/HealthAndSafetyOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import AttachFileRoundedIcon from '@mui/icons-material/AttachFileRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import { useLazyQuery, useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { useRouter } from 'next/router';
import { Property } from '../../libs/types/property/property';
import moment from 'moment';
import { formatDeliveryFeeUZS } from '../../libs/utils';
import { REACT_APP_API_URL } from '../../libs/config';
import { userVar } from '../../apollo/store';
import { getJwtToken } from '../../libs/auth';
import { CommentInput, CommentsInquiry } from '../../libs/types/comment/comment.input';
import { Comment } from '../../libs/types/comment/comment';
import { CommentGroup } from '../../libs/enums/comment.enum';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GET_COMMENTS, GET_PHARMACIES, GET_PHARMACY } from '../../apollo/user/query';
import { T } from '../../libs/types/common';
import { Direction, Message } from '../../libs/enums/common.enum';
import { CREATE_COMMENT, LIKE_TARGET_PHARMACY, START_PHARMACY_CONVERSATION } from '../../apollo/user/mutation';
import { sweetErrorHandling, sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';
import { isValidLatLng } from '../../libs/utils/coordinates';

const PharmacyMap = dynamic(() => import('../../libs/components/common/PharmacyMap'), { ssr: false });

export const getStaticProps = async ({ locale }: { locale: string }) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const initialCommentInquiry: CommentsInquiry = {
	page: 1,
	limit: 5,
	sort: 'createdAt',
	direction: Direction.DESC,
	search: { commentRefId: '', commentGroup: CommentGroup.PHARMACY },
};

const pharmacyImage = (image?: string) => (image ? `${REACT_APP_API_URL}/${image}` : '/img/banner/header1.svg');

const PharmacyDetail: NextPage = () => {
	const router = useRouter();
	const { t } = useTranslation('common');
	const user = useReactiveVar(userVar);
	const [pharmacyId, setPharmacyId] = useState<string | null>(null);
	const [pharmacy, setPharmacy] = useState<Property | null>(null);
	const [selectedImage, setSelectedImage] = useState<string>('');
	const [nearbyPharmacies, setNearbyPharmacies] = useState<Property[]>([]);
	const [commentInquiry, setCommentInquiry] = useState<CommentsInquiry>(initialCommentInquiry);
	const [comments, setComments] = useState<Comment[]>([]);
	const [commentTotal, setCommentTotal] = useState(0);
	const [loadedCommentPage, setLoadedCommentPage] = useState(1);
	const [isLoadingMoreComments, setIsLoadingMoreComments] = useState(false);
	const [isCommentFormOpen, setIsCommentFormOpen] = useState(false);
	const messageFileRef = useRef<HTMLInputElement>(null);
	const [messageText, setMessageText] = useState('');
	const [messageImages, setMessageImages] = useState<string[]>([]);
	const [isUploadingMessageImage, setIsUploadingMessageImage] = useState(false);
	const [isStartingConversation, setIsStartingConversation] = useState(false);
	const [insertCommentData, setInsertCommentData] = useState<CommentInput>({
		commentGroup: CommentGroup.PHARMACY,
		commentContent: '',
		commentRefId: '',
	});

	const [likeTargetPharmacy] = useMutation(LIKE_TARGET_PHARMACY);
	const [startPharmacyConversation] = useMutation(START_PHARMACY_CONVERSATION);
	const [createComment, { loading: isCreatingComment }] = useMutation(CREATE_COMMENT);
	const [getComments, { loading: commentsLoading, error: commentsError }] = useLazyQuery(GET_COMMENTS, {
		fetchPolicy: 'network-only',
	});
	const {
		loading: pharmacyLoading,
		error: pharmacyError,
		refetch: refetchPharmacy,
	} = useQuery(GET_PHARMACY, {
		fetchPolicy: 'network-only',
		variables: { input: pharmacyId },
		skip: !pharmacyId,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			if (!data?.getPharmacy) return;
			setPharmacy(data.getPharmacy);
			setSelectedImage(data.getPharmacy.pharmacyImages?.[0] ?? '');
		},
	});

	const { refetch: refetchNearby } = useQuery(GET_PHARMACIES, {
		fetchPolicy: 'cache-and-network',
		variables: {
			input: {
				page: 1,
				limit: 5,
				sort: 'createdAt',
				direction: Direction.DESC,
				search: { locationList: pharmacy?.pharmacyLocation ? [pharmacy.pharmacyLocation] : [] },
			},
		},
		skip: !pharmacyId || !pharmacy,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => setNearbyPharmacies(data?.getPharmacies?.list ?? []),
	});

	useEffect(() => {
		if (!router.query.id) return;
		const id = router.query.id as string;
		setPharmacyId(id);
		const nextInquiry = { ...initialCommentInquiry, search: { commentRefId: id, commentGroup: CommentGroup.PHARMACY } };
		setCommentInquiry(nextInquiry);
		setComments([]);
		setCommentTotal(0);
		setLoadedCommentPage(1);
		setIsCommentFormOpen(false);
		setInsertCommentData({
			commentGroup: CommentGroup.PHARMACY,
			commentContent: '',
			commentRefId: id,
		});
		getComments({ variables: { input: nextInquiry } }).then((response) => {
			setComments(response.data?.getComments?.list ?? []);
			setCommentTotal(response.data?.getComments?.metaCounter?.[0]?.total ?? 0);
		}).catch(() => undefined);
	}, [getComments, router.query.id]);

	const validCoordinates = useMemo(() => {
		if (!pharmacy) return false;
		const { pharmacyLatitude: latitude, pharmacyLongitude: longitude } = pharmacy;
		return isValidLatLng(latitude, longitude);
	}, [pharmacy]);
	const pharmacyMarker = useMemo(
		() => validCoordinates && pharmacy ? { lat: pharmacy.pharmacyLatitude, lng: pharmacy.pharmacyLongitude } : null,
		[pharmacy, validCoordinates],
	);

	const relatedPharmacies = nearbyPharmacies.filter((item) => item._id !== pharmacyId).slice(0, 4);
	const isFavorite = pharmacy?.meLiked?.[0]?.myFavorite === true;
	const isOwnPharmacy = !!pharmacy?.memberId && pharmacy.memberId === user?._id;
	const services = [
		pharmacy?.hasDelivery ? t('pharmacyFilters.deliveryAvailable') : null,
		pharmacy?.acceptsInsurance ? t('sharedPharmacyCard.insuranceAccepted') : null,
	].filter(Boolean) as string[];
	const pharmacyRegion = pharmacy?.pharmacyLocation ? t(`pharmacyLocation.${pharmacy.pharmacyLocation}`) : '';
	const pharmacyTypeLabel = pharmacy?.pharmacyType ? t(`pharmacyType.${pharmacy.pharmacyType}`) : '';
	const pharmacyStatus = pharmacy?.open24Hours
		? t('pharmacyStatus.open247')
		: pharmacy?.hoursConfigured
			? pharmacy.isOpenNow
				? t('pharmacyStatus.openNow')
				: t('pharmacyStatus.closed')
			: t('pharmacyStatus.hoursNotProvided');

	const handleFavorite = async () => {
		try {
			if (!pharmacyId) return;
			if (!user._id) throw new Error(Message.NOT_AUTHENTICATED);
			await likeTargetPharmacy({ variables: { input: pharmacyId } });
			await refetchPharmacy({ input: pharmacyId });
			await refetchNearby();
			await sweetTopSmallSuccessAlert('success', 800);
		} catch (error: unknown) {
			const message = error instanceof Error ? error.message : Message.SOMETHING_WENT_WRONG;
			sweetMixinErrorAlert(message).then();
		}
	};

	const handleLoadMoreComments = async () => {
		try {
			setIsLoadingMoreComments(true);
			const nextPage = loadedCommentPage + 1;
			const response = await getComments({ variables: { input: { ...commentInquiry, page: nextPage } } });
			const nextComments = response.data?.getComments?.list ?? [];
			setComments((current) => {
				const commentsById = new Map(current.map((comment) => [comment._id, comment]));
				nextComments.forEach((comment: Comment) => commentsById.set(comment._id, comment));
				return Array.from(commentsById.values());
			});
			setCommentTotal(response.data?.getComments?.metaCounter?.[0]?.total ?? commentTotal);
			setLoadedCommentPage(nextPage);
		} catch (error: unknown) {
			sweetErrorHandling(error);
		} finally {
			setIsLoadingMoreComments(false);
		}
	};

	const handleCreateComment = async () => {
		const draft = insertCommentData.commentContent;
		let createdComment: Comment;
		try {
			if (!user._id) throw new Error(Message.NOT_AUTHENTICATED);
			const createdResponse = await createComment({ variables: { input: insertCommentData } });
			if (!createdResponse.data?.createComment) throw new Error(Message.SOMETHING_WENT_WRONG);
			createdComment = {
				...createdResponse.data?.createComment,
				memberData: user,
			} as Comment;
			setComments((current) => [createdComment, ...current.filter((comment) => comment._id !== createdComment._id)]);
			setCommentTotal((current) => current + 1);
			setInsertCommentData((current) => ({ ...current, commentContent: '' }));
			await sweetTopSmallSuccessAlert(t('pharmacyDetailPage.alerts.commentSubmitted'), 1000);
		} catch (error: unknown) {
			setInsertCommentData((current) => ({ ...current, commentContent: draft }));
			setIsCommentFormOpen(true);
			sweetErrorHandling(error);
			return;
		}

		try {
			const response = await getComments({ variables: { input: { ...commentInquiry, page: 1 } } });
			const refreshedComments = response.data?.getComments?.list ?? [];
			setComments((current) => {
				const refreshedIds = new Set(refreshedComments.map((comment: Comment) => comment._id));
				return [...refreshedComments, ...current.filter((comment) => !refreshedIds.has(comment._id))];
			});
			setCommentTotal(response.data?.getComments?.metaCounter?.[0]?.total ?? 0);
			setLoadedCommentPage(1);
		} catch (error: unknown) {
			// The comment is already persisted and remains visible from the mutation response.
		}
	};

	const handleRetryComments = async () => {
		try {
			const response = await getComments({ variables: { input: { ...commentInquiry, page: 1 } } });
			setComments(response.data?.getComments?.list ?? []);
			setCommentTotal(response.data?.getComments?.metaCounter?.[0]?.total ?? 0);
			setLoadedCommentPage(1);
		} catch (error: unknown) {
			sweetErrorHandling(error);
		}
	};

	const uploadMessageImages = async (event: ChangeEvent<HTMLInputElement>) => {
		try {
			const files = Array.from(event.target.files ?? []);
			if (!files.length) return;
			if (messageImages.length + files.length > 4) throw new Error(t('pharmacyDetailPage.alerts.maxAttachments'));
			setIsUploadingMessageImage(true);

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
			if (messageFileRef.current) messageFileRef.current.value = '';
		} catch (error: unknown) {
			sweetErrorHandling(error);
		} finally {
			setIsUploadingMessageImage(false);
		}
	};

	const handleStartConversation = async () => {
		try {
			if (!pharmacy?._id) return;
			if (!user?._id) throw new Error(Message.NOT_AUTHENTICATED);
			if (isOwnPharmacy) throw new Error(t('pharmacyDetailPage.alerts.ownerCannotMessage'));
			if (!messageText.trim() && !messageImages.length) throw new Error(t('pharmacyDetailPage.alerts.messageRequired'));
			setIsStartingConversation(true);

			const response = await startPharmacyConversation({
				variables: {
					input: {
						pharmacyId: pharmacy._id,
						messageText: messageText.trim(),
						messageImages,
					},
				},
			});
			const threadId = response.data?.startPharmacyConversation?._id;
			if (!threadId) throw new Error(Message.SOMETHING_WENT_WRONG);
			setMessageText('');
			setMessageImages([]);
			await router.push({ pathname: '/mypage', query: { category: 'messages', threadId } });
		} catch (error: unknown) {
			sweetErrorHandling(error);
		} finally {
			setIsStartingConversation(false);
		}
	};

	if (pharmacyLoading && !pharmacy) {
		return (
			<main className="pharmacy-detail-state" aria-label={t('pharmacyDetailPage.aria.loading')}>
				<div className="pharmacy-detail-state__skeleton pharmacy-detail-state__skeleton--heading" />
				<div className="pharmacy-detail-state__skeleton pharmacy-detail-state__skeleton--gallery" />
				<div className="pharmacy-detail-state__skeleton pharmacy-detail-state__skeleton--content" />
			</main>
		);
	}

	if (pharmacyError || (!pharmacyLoading && pharmacyId && !pharmacy)) {
		return (
			<main className="pharmacy-detail-state pharmacy-detail-state--message">
				<span>{t('pharmacyDetailPage.unavailable.eyebrow')}</span>
				<h1>{t('pharmacyDetailPage.unavailable.title')}</h1>
				<p>{t('pharmacyDetailPage.unavailable.description')}</p>
				<Link href="/pharmacies">{t('pharmacyDetailPage.unavailable.action')} <ArrowForwardRoundedIcon /></Link>
			</main>
		);
	}

	if (!pharmacy) return null;

	return (
		<main id="pharmacy-detail-page">
			<div className="container pharmacy-detail">
				<header className="pharmacy-detail__header">
					<div className="pharmacy-detail__identity">
						<div className="pharmacy-detail__eyebrow">
							<span>{pharmacyRegion}</span>
							{pharmacy.verifiedAt && <span className="is-verified"><VerifiedRoundedIcon /> {t('sharedPharmacyCard.verifiedPharmacy')}</span>}
						</div>
						<h1>{pharmacy.pharmacyName}</h1>
						<p><LocationOnOutlinedIcon /> {pharmacy.pharmacyAddress}</p>
						<div className="pharmacy-detail__services">
							<span><StorefrontOutlinedIcon /> {t('sharedPharmacyCard.typeLabel', { type: pharmacyTypeLabel })}</span>
							{pharmacy.hasDelivery && <span><LocalShippingOutlinedIcon /> {t('pharmacyFilters.deliveryAvailable')}</span>}
							{pharmacy.acceptsInsurance && <span><HealthAndSafetyOutlinedIcon /> {t('sharedPharmacyCard.insuranceAccepted')}</span>}
							<span><CalendarMonthOutlinedIcon /> {pharmacyStatus}</span>
						</div>
					</div>
					<div className="pharmacy-detail__header-actions">
						<div><VisibilityOutlinedIcon /><span>{t('pharmacyDetailPage.views', { count: pharmacy.pharmacyViews })}</span></div>
						<button type="button" onClick={handleFavorite} aria-label={isFavorite ? t('pharmacyDetailPage.aria.favoriteRemove', { name: pharmacy.pharmacyName }) : t('pharmacyDetailPage.aria.favoriteSave', { name: pharmacy.pharmacyName })}>
							{isFavorite ? <FavoriteRoundedIcon /> : <FavoriteBorderRoundedIcon />}
							<span>{isFavorite ? t('pharmacyDetailPage.actions.saved') : t('pharmacyDetailPage.actions.savePharmacy')}</span>
						</button>
					</div>
				</header>

				<section className="pharmacy-detail__gallery" aria-label={t('pharmacyDetailPage.aria.gallery', { name: pharmacy.pharmacyName })}>
					<div className="pharmacy-detail__main-image">
						<img src={pharmacyImage(selectedImage)} alt={t('sharedPharmacyCard.imageAlt', { name: pharmacy.pharmacyName })} />
					</div>
					{pharmacy.pharmacyImages.length > 1 && (
						<div className="pharmacy-detail__thumbnails">
							{pharmacy.pharmacyImages.map((image, index) => (
								<button type="button" key={image} className={image === selectedImage ? 'is-active' : ''} onClick={() => setSelectedImage(image)} aria-label={t('pharmacyDetailPage.aria.viewImage', { name: pharmacy.pharmacyName, count: index + 1 })}>
									<img src={pharmacyImage(image)} alt="" />
								</button>
							))}
						</div>
					)}
				</section>

				<div className="pharmacy-detail__layout">
					<div className="pharmacy-detail__content">
						<section className="pharmacy-detail__section">
							<div className="pharmacy-detail__section-heading">
								<span>{t('pharmacyDetailPage.labels.about')}</span>
								<h2>{t('pharmacyDetailPage.labels.aboutTitle')}</h2>
							</div>
							<p className={pharmacy.pharmacyDesc ? '' : 'pharmacy-detail__empty-copy'}>
								{pharmacy.pharmacyDesc ?? t('pharmacyDetailPage.copy.noDescription')}
							</p>
							<dl className="pharmacy-detail__facts">
								<div><dt>{t('locationPicker.region')}</dt><dd>{pharmacyRegion}</dd></div>
								<div><dt>{t('pharmacyDetailPage.labels.pharmacyType')}</dt><dd>{pharmacyTypeLabel}</dd></div>
								<div><dt>{t('pharmacyDetailPage.labels.established')}</dt><dd>{pharmacy.openedAt ? moment(pharmacy.openedAt).format('YYYY') : t('pharmacyDetailPage.labels.notProvided')}</dd></div>
								{pharmacy.hasDelivery && <div><dt>{t('pharmacyFilters.deliveryFee')}</dt><dd>{formatDeliveryFeeUZS(pharmacy.pharmacyDeliveryFee)}</dd></div>}
							</dl>
						</section>

						<section className="pharmacy-detail__section">
							<div className="pharmacy-detail__section-heading">
								<span>{t('pharmacyDetailPage.labels.services')}</span>
								<h2>{t('pharmacyDetailPage.labels.availableSupport')}</h2>
							</div>
							{services.length ? (
								<div className="pharmacy-detail__service-list">
									{pharmacy.hasDelivery && <div><LocalShippingOutlinedIcon /><span><strong>{t('pharmacyFilters.deliveryAvailable')}</strong><small>{t('pharmacyDetailPage.copy.deliveryFee', { fee: formatDeliveryFeeUZS(pharmacy.pharmacyDeliveryFee) })}</small></span></div>}
									{pharmacy.acceptsInsurance && <div><HealthAndSafetyOutlinedIcon /><span><strong>{t('sharedPharmacyCard.insuranceAccepted')}</strong><small>{t('pharmacyDetailPage.copy.insuranceHint')}</small></span></div>}
								</div>
							) : <p className="pharmacy-detail__empty-copy">{t('pharmacyDetailPage.copy.noServices')}</p>}
						</section>

						<section className="pharmacy-detail__section">
							<div className="pharmacy-detail__section-heading">
								<span>{t('pharmacyDetailPage.labels.hours')}</span>
								<h2>{t('pharmacyDetailPage.labels.workingHours')}</h2>
							</div>
							{pharmacy.open24Hours ? <p>{t('pharmacyStatus.open24EveryDay')}</p> : pharmacy.operatingHours?.length ? (
								<dl className="pharmacy-detail__facts">
									{pharmacy.operatingHours.map((day) => <div key={day.dayOfWeek}><dt>{new Intl.DateTimeFormat(router.locale ?? 'en', { weekday: 'long' }).format(new Date(Date.UTC(2024, 0, day.dayOfWeek)))}</dt><dd>{day.isClosed ? t('pharmacyStatus.closed') : `${day.opensAt}–${day.closesAt}`}</dd></div>)}
								</dl>
							) : <p className="pharmacy-detail__empty-copy">{t('pharmacyStatus.hoursNotProvided')}.</p>}
							{pharmacy.hoursConfigured && !pharmacy.open24Hours && (
								<p className="pharmacy-detail__address">
									{pharmacy.isOpenNow && pharmacy.nextClosingAt ? t('pharmacyStatus.openNowCloses', { time: moment(pharmacy.nextClosingAt).format('ddd HH:mm') }) : pharmacy.nextOpeningAt ? t('pharmacyStatus.nextOpens', { time: moment(pharmacy.nextOpeningAt).format('ddd HH:mm') }) : t('pharmacyStatus.noUpcomingOpening')}
								</p>
							)}
						</section>

						<section className="pharmacy-detail__section">
							<div className="pharmacy-detail__section-heading">
								<span>{t('pharmacyDetail.location.eyebrow')}</span>
								<h2>{t('pharmacyDetail.location.title')}</h2>
							</div>
							<p className="pharmacy-detail__address"><LocationOnOutlinedIcon /> {pharmacy.pharmacyAddress}, {pharmacyRegion}</p>
							{validCoordinates ? (
								<div className="pharmacy-detail__map">
									<PharmacyMap marker={pharmacyMarker} readOnly />
								</div>
							) : <p className="pharmacy-detail__empty-copy">{t('pharmacyDetail.location.noMap')}</p>}
						</section>

						<section className="pharmacy-detail__section pharmacy-detail__feedback">
							<h2>{t('pharmacyDetailPage.labels.communityFeedback')}</h2>
							{commentsLoading && !comments.length ? (
								<div className="pharmacy-detail__comments-loading" aria-label={t('pharmacyDetailPage.aria.commentsLoading')}>
									<div />
									<div />
								</div>
							) : commentsError && !comments.length ? (
								<div className="pharmacy-detail__comments-state" role="alert">
									<p>{t('pharmacyDetailPage.copy.commentsLoadError')}</p>
									<button type="button" onClick={handleRetryComments}>{t('pharmacies.states.tryAgain')}</button>
								</div>
							) : comments.length ? (
								<div className="pharmacy-detail__comments">
									{comments.map((comment) => <Review comment={comment} key={comment._id} />)}
									{comments.length < commentTotal && (
										<button className="pharmacy-detail__load-comments" type="button" onClick={handleLoadMoreComments} disabled={isLoadingMoreComments}>
											{isLoadingMoreComments ? t('pharmacyDetailPage.actions.loadingComments') : t('pharmacyDetailPage.actions.loadMoreComments')}
										</button>
									)}
								</div>
							) : <p className="pharmacy-detail__empty-copy">{t('pharmacyDetailPage.copy.noComments')}</p>}
							<button
								className="pharmacy-detail__comment-toggle"
								type="button"
								aria-expanded={isCommentFormOpen}
								aria-controls="pharmacy-comment-form"
								onClick={() => setIsCommentFormOpen((current) => !current)}
							>
								{isCommentFormOpen ? t('pharmacyDetailPage.actions.closeCommentForm') : t('pharmacyDetailPage.actions.writeComment')}
							</button>
							{isCommentFormOpen && (
								<div className="pharmacy-detail__comment-form" id="pharmacy-comment-form">
									<label htmlFor="pharmacy-comment">{t('pharmacyDetailPage.copy.commentLabel')}</label>
									{!user?._id && <p className="pharmacy-detail__comment-auth">{t('pharmacyDetailPage.copy.loginToComment')}</p>}
									<textarea id="pharmacy-comment" value={insertCommentData.commentContent} onChange={(event) => setInsertCommentData({ ...insertCommentData, commentContent: event.target.value })} placeholder={t('pharmacyDetailPage.copy.commentPlaceholder')} disabled={!user?._id || isCreatingComment} />
									<Button disabled={!insertCommentData.commentContent.trim() || !user?._id || isCreatingComment} onClick={handleCreateComment}>
										{isCreatingComment ? t('pharmacyDetailPage.actions.submitting') : t('pharmacyDetailPage.actions.submitComment')}
									</Button>
								</div>
							)}
						</section>
					</div>

					<aside className="pharmacy-detail__sidebar">
						<div className="pharmacy-detail__owner-card">
							<span className="pharmacy-detail__card-label">{t('pharmacyDetailPage.labels.pharmacyOwner')}</span>
							<div className="pharmacy-detail__owner">
								<img src={pharmacy.memberData?.memberImage ? `${REACT_APP_API_URL}/${pharmacy.memberData.memberImage}` : '/img/profile/defaultUser.svg'} alt={`${pharmacy.memberData?.memberNick ?? t('pharmacyDetailPage.labels.pharmacyOwner')} profile`} />
								<div>
									<strong>{pharmacy.memberData?.memberFullName ?? pharmacy.memberData?.memberNick ?? 'Pharmacy Owner'}</strong>
									{pharmacy.memberData?.memberPhone && <a href={`tel:${pharmacy.memberData.memberPhone}`}><PhoneOutlinedIcon /> {pharmacy.memberData.memberPhone}</a>}
								</div>
							</div>
							{pharmacy.memberData?._id && <Link href={`/member?memberId=${pharmacy.memberData._id}`}>{t('pharmacyDetailPage.actions.viewOwnerProfile')} <ArrowForwardRoundedIcon /></Link>}
						</div>
						<div className="pharmacy-detail__message-card">
							<div className="pharmacy-detail__message-heading">
								<div><span>{t('pharmacyDetailPage.labels.contact')}</span><h2>{t('pharmacyDetailPage.labels.messagePharmacy')}</h2></div>
								<em>{t('pharmacyDetailPage.labels.secureInbox')}</em>
							</div>
							{!user?._id ? (
								<div className="pharmacy-detail__message-state">
									<p>{t('pharmacyDetailPage.copy.loginToMessage')}</p>
									<Link href="/account/join">{t('pharmacyDetailPage.actions.loginToMessage')} <ArrowForwardRoundedIcon /></Link>
								</div>
							) : isOwnPharmacy ? (
								<div className="pharmacy-detail__message-state">
									<p>{t('pharmacyDetailPage.copy.ownPharmacyMessage')}</p>
								</div>
							) : (
								<div className="pharmacy-detail__message-form">
									<label htmlFor="pharmacy-owner-message">{t('nav.messages')}</label>
									<textarea
										id="pharmacy-owner-message"
										placeholder={t('pharmacyDetailPage.copy.messagePlaceholder', { name: pharmacy.pharmacyName })}
										value={messageText}
										onChange={(event) => setMessageText(event.target.value)}
										maxLength={1200}
										disabled={isStartingConversation}
									/>
									{!!messageImages.length && (
										<div className="pharmacy-detail__message-preview">
											{messageImages.map((image) => (
												<button type="button" key={image} onClick={() => setMessageImages((current) => current.filter((item) => item !== image))}>
													<img src={`${REACT_APP_API_URL}/${image}`} alt={t('pharmacyDetailPage.aria.attachmentRemove')} />
													<span>{t('pharmacyDetailPage.actions.remove')}</span>
												</button>
											))}
										</div>
									)}
									<div className="pharmacy-detail__message-actions">
										<input ref={messageFileRef} type="file" accept="image/jpeg,image/jpg,image/png" multiple onChange={uploadMessageImages} />
										<Button type="button" onClick={() => messageFileRef.current?.click()} disabled={isUploadingMessageImage || isStartingConversation}>
											<AttachFileRoundedIcon /> {isUploadingMessageImage ? t('pharmacyDetailPage.actions.uploading') : t('pharmacyDetailPage.actions.attachImages')}
										</Button>
										<Button
											type="button"
											onClick={handleStartConversation}
											disabled={isStartingConversation || (!messageText.trim() && !messageImages.length)}
										>
											{isStartingConversation ? t('pharmacyDetailPage.actions.sending') : t('pharmacyDetailPage.actions.sendMessage')} <SendRoundedIcon />
										</Button>
									</div>
								</div>
							)}
						</div>
					</aside>
				</div>

				<section className="pharmacy-detail__nearby">
					<div className="pharmacy-detail__section-heading">
						<span>{t('pharmacyDetailPage.labels.nearby')}</span>
						<h2>{t('pharmacyDetail.nearby.title', { region: pharmacyRegion })}</h2>
					</div>
					{relatedPharmacies.length ? (
						<div className="pharmacy-detail__nearby-grid">
							{relatedPharmacies.map((item) => (
								<article className="pharmacy-detail__nearby-card" key={item._id}>
									<Link href={`/pharmacies/detail?id=${item._id}`}><img src={pharmacyImage(item.pharmacyImages?.[0])} alt={t('sharedPharmacyCard.imageAlt', { name: item.pharmacyName })} /></Link>
									<div><span>{t(`pharmacyType.${item.pharmacyType}`)}</span><h3>{item.pharmacyName}</h3><p>{item.pharmacyAddress}</p><Link href={`/pharmacies/detail?id=${item._id}`}>{t('sharedPharmacyCard.viewPharmacy')} <ArrowForwardRoundedIcon /></Link></div>
								</article>
							))}
						</div>
					) : <p className="pharmacy-detail__empty-copy">{t('pharmacyDetailPage.copy.noNearby')}</p>}
				</section>
			</div>
		</main>
	);
};

export default withLayoutFull(PharmacyDetail);
