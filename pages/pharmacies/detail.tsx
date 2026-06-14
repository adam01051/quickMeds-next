import React, { useEffect, useMemo, useState } from 'react';
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
import { useLazyQuery, useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { useRouter } from 'next/router';
import { Property } from '../../libs/types/property/property';
import moment from 'moment';
import { formatDeliveryFeeUZS } from '../../libs/utils';
import { getPharmacyLocationLabel } from '../../libs/utils/pharmacy-location';
import { REACT_APP_API_URL } from '../../libs/config';
import { userVar } from '../../apollo/store';
import { CommentInput, CommentsInquiry } from '../../libs/types/comment/comment.input';
import { Comment } from '../../libs/types/comment/comment';
import { CommentGroup } from '../../libs/enums/comment.enum';
import Link from 'next/link';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GET_COMMENTS, GET_PHARMACIES, GET_PHARMACY } from '../../apollo/user/query';
import { T } from '../../libs/types/common';
import { Direction, Message } from '../../libs/enums/common.enum';
import { CREATE_COMMENT, LIKE_TARGET_PHARMACY } from '../../apollo/user/mutation';
import { sweetErrorHandling, sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';

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
	const [insertCommentData, setInsertCommentData] = useState<CommentInput>({
		commentGroup: CommentGroup.PHARMACY,
		commentContent: '',
		commentRefId: '',
	});

	const [likeTargetPharmacy] = useMutation(LIKE_TARGET_PHARMACY);
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
		return latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180 && !(latitude === 0 && longitude === 0);
	}, [pharmacy]);

	const relatedPharmacies = nearbyPharmacies.filter((item) => item._id !== pharmacyId).slice(0, 4);
	const isFavorite = pharmacy?.meLiked?.[0]?.myFavorite === true;
	const services = [
		pharmacy?.hasDelivery ? 'Delivery available' : null,
		pharmacy?.acceptsInsurance ? 'Insurance accepted' : null,
	].filter(Boolean) as string[];

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
			await sweetTopSmallSuccessAlert('Comment submitted', 1000);
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

	if (pharmacyLoading && !pharmacy) {
		return (
			<main className="pharmacy-detail-state" aria-label="Loading pharmacy details">
				<div className="pharmacy-detail-state__skeleton pharmacy-detail-state__skeleton--heading" />
				<div className="pharmacy-detail-state__skeleton pharmacy-detail-state__skeleton--gallery" />
				<div className="pharmacy-detail-state__skeleton pharmacy-detail-state__skeleton--content" />
			</main>
		);
	}

	if (pharmacyError || (!pharmacyLoading && pharmacyId && !pharmacy)) {
		return (
			<main className="pharmacy-detail-state pharmacy-detail-state--message">
				<span>Pharmacy unavailable</span>
				<h1>We could not find this pharmacy.</h1>
				<p>It may have moved, closed, or no longer be publicly available.</p>
				<Link href="/pharmacies">Browse pharmacies <ArrowForwardRoundedIcon /></Link>
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
							<span>{getPharmacyLocationLabel(pharmacy.pharmacyLocation)}</span>
							{pharmacy.verifiedAt && <span className="is-verified"><VerifiedRoundedIcon /> Verified pharmacy</span>}
						</div>
						<h1>{pharmacy.pharmacyName}</h1>
						<p><LocationOnOutlinedIcon /> {pharmacy.pharmacyAddress}</p>
						<div className="pharmacy-detail__services">
							<span><StorefrontOutlinedIcon /> {pharmacy.pharmacyType.toLowerCase()} pharmacy</span>
							{pharmacy.hasDelivery && <span><LocalShippingOutlinedIcon /> Delivery available</span>}
							{pharmacy.acceptsInsurance && <span><HealthAndSafetyOutlinedIcon /> Insurance accepted</span>}
							<span><CalendarMonthOutlinedIcon /> {pharmacy.open24Hours ? 'Open 24/7' : pharmacy.hoursConfigured ? (pharmacy.isOpenNow ? 'Open now' : 'Closed') : 'Hours not provided'}</span>
						</div>
					</div>
					<div className="pharmacy-detail__header-actions">
						<div><VisibilityOutlinedIcon /><span>{pharmacy.pharmacyViews} views</span></div>
						<button type="button" onClick={handleFavorite} aria-label={isFavorite ? `Remove ${pharmacy.pharmacyName} from favorites` : `Save ${pharmacy.pharmacyName}`}>
							{isFavorite ? <FavoriteRoundedIcon /> : <FavoriteBorderRoundedIcon />}
							<span>{isFavorite ? 'Saved' : 'Save pharmacy'}</span>
						</button>
					</div>
				</header>

				<section className="pharmacy-detail__gallery" aria-label={`${pharmacy.pharmacyName} gallery`}>
					<div className="pharmacy-detail__main-image">
						<img src={pharmacyImage(selectedImage)} alt={`${pharmacy.pharmacyName} pharmacy`} />
					</div>
					{pharmacy.pharmacyImages.length > 1 && (
						<div className="pharmacy-detail__thumbnails">
							{pharmacy.pharmacyImages.map((image, index) => (
								<button type="button" key={image} className={image === selectedImage ? 'is-active' : ''} onClick={() => setSelectedImage(image)} aria-label={`View ${pharmacy.pharmacyName} image ${index + 1}`}>
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
								<span>About</span>
								<h2>About this pharmacy</h2>
							</div>
							<p className={pharmacy.pharmacyDesc ? '' : 'pharmacy-detail__empty-copy'}>
								{pharmacy.pharmacyDesc ?? 'This pharmacy has not added a description yet.'}
							</p>
							<dl className="pharmacy-detail__facts">
								<div><dt>Region</dt><dd>{getPharmacyLocationLabel(pharmacy.pharmacyLocation)}</dd></div>
								<div><dt>Pharmacy type</dt><dd>{pharmacy.pharmacyType.toLowerCase()}</dd></div>
								<div><dt>Established</dt><dd>{pharmacy.openedAt ? moment(pharmacy.openedAt).format('YYYY') : 'Not provided'}</dd></div>
								{pharmacy.hasDelivery && <div><dt>Delivery fee</dt><dd>{formatDeliveryFeeUZS(pharmacy.pharmacyDeliveryFee)}</dd></div>}
							</dl>
						</section>

						<section className="pharmacy-detail__section">
							<div className="pharmacy-detail__section-heading">
								<span>Services</span>
								<h2>Available support</h2>
							</div>
							{services.length ? (
								<div className="pharmacy-detail__service-list">
									{pharmacy.hasDelivery && <div><LocalShippingOutlinedIcon /><span><strong>Delivery available</strong><small>Delivery fee: {formatDeliveryFeeUZS(pharmacy.pharmacyDeliveryFee)}</small></span></div>}
									{pharmacy.acceptsInsurance && <div><HealthAndSafetyOutlinedIcon /><span><strong>Insurance accepted</strong><small>Confirm your provider directly with the pharmacy.</small></span></div>}
								</div>
							) : <p className="pharmacy-detail__empty-copy">No additional services are listed for this pharmacy.</p>}
						</section>

						<section className="pharmacy-detail__section">
							<div className="pharmacy-detail__section-heading">
								<span>Hours</span>
								<h2>Working hours</h2>
							</div>
							{pharmacy.open24Hours ? <p>Open 24 hours every day.</p> : pharmacy.operatingHours?.length ? (
								<dl className="pharmacy-detail__facts">
									{pharmacy.operatingHours.map((day) => <div key={day.dayOfWeek}><dt>{['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][day.dayOfWeek - 1]}</dt><dd>{day.isClosed ? 'Closed' : `${day.opensAt}–${day.closesAt}`}</dd></div>)}
								</dl>
							) : <p className="pharmacy-detail__empty-copy">Hours not provided.</p>}
							{pharmacy.hoursConfigured && !pharmacy.open24Hours && (
								<p className="pharmacy-detail__address">
									{pharmacy.isOpenNow && pharmacy.nextClosingAt ? `Open now · closes ${moment(pharmacy.nextClosingAt).format('ddd HH:mm')}` : pharmacy.nextOpeningAt ? `Next opens ${moment(pharmacy.nextOpeningAt).format('ddd HH:mm')}` : 'No upcoming opening time is listed.'}
								</p>
							)}
						</section>

						<section className="pharmacy-detail__section">
							<div className="pharmacy-detail__section-heading">
								<span>Location</span>
								<h2>Find the pharmacy</h2>
							</div>
							<p className="pharmacy-detail__address"><LocationOnOutlinedIcon /> {pharmacy.pharmacyAddress}, {getPharmacyLocationLabel(pharmacy.pharmacyLocation)}</p>
							{validCoordinates ? (
								<div className="pharmacy-detail__map">
									<iframe
										title={`${pharmacy.pharmacyName} location`}
										src={`https://www.google.com/maps?q=${pharmacy.pharmacyLatitude},${pharmacy.pharmacyLongitude}&z=15&output=embed`}
										loading="lazy"
										referrerPolicy="no-referrer-when-downgrade"
									/>
								</div>
							) : <p className="pharmacy-detail__empty-copy">A map location has not been provided yet.</p>}
						</section>

						<section className="pharmacy-detail__section pharmacy-detail__feedback">
							<h2>Community Feedback</h2>
							{commentsLoading && !comments.length ? (
								<div className="pharmacy-detail__comments-loading" aria-label="Loading pharmacy comments">
									<div />
									<div />
								</div>
							) : commentsError && !comments.length ? (
								<div className="pharmacy-detail__comments-state" role="alert">
									<p>We could not load pharmacy comments.</p>
									<button type="button" onClick={handleRetryComments}>Try again</button>
								</div>
							) : comments.length ? (
								<div className="pharmacy-detail__comments">
									{comments.map((comment) => <Review comment={comment} key={comment._id} />)}
									{comments.length < commentTotal && (
										<button className="pharmacy-detail__load-comments" type="button" onClick={handleLoadMoreComments} disabled={isLoadingMoreComments}>
											{isLoadingMoreComments ? 'Loading comments…' : 'Load More Comments'}
										</button>
									)}
								</div>
							) : <p className="pharmacy-detail__empty-copy">No comments yet. Be the first to share useful information.</p>}
							<button
								className="pharmacy-detail__comment-toggle"
								type="button"
								aria-expanded={isCommentFormOpen}
								aria-controls="pharmacy-comment-form"
								onClick={() => setIsCommentFormOpen((current) => !current)}
							>
								{isCommentFormOpen ? 'Close comment form' : 'Write a comment'}
							</button>
							{isCommentFormOpen && (
								<div className="pharmacy-detail__comment-form" id="pharmacy-comment-form">
									<label htmlFor="pharmacy-comment">Share helpful information about this pharmacy</label>
									{!user?._id && <p className="pharmacy-detail__comment-auth">Log in to write a comment.</p>}
									<textarea id="pharmacy-comment" value={insertCommentData.commentContent} onChange={(event) => setInsertCommentData({ ...insertCommentData, commentContent: event.target.value })} placeholder="Write your comment" disabled={!user?._id || isCreatingComment} />
									<Button disabled={!insertCommentData.commentContent.trim() || !user?._id || isCreatingComment} onClick={handleCreateComment}>
										{isCreatingComment ? 'Submitting…' : 'Submit comment'}
									</Button>
								</div>
							)}
						</section>
					</div>

					<aside className="pharmacy-detail__sidebar">
						<div className="pharmacy-detail__owner-card">
							<span className="pharmacy-detail__card-label">Pharmacy Owner</span>
							<div className="pharmacy-detail__owner">
								<img src={pharmacy.memberData?.memberImage ? `${REACT_APP_API_URL}/${pharmacy.memberData.memberImage}` : '/img/profile/defaultUser.svg'} alt={`${pharmacy.memberData?.memberNick ?? 'Pharmacy Owner'} profile`} />
								<div>
									<strong>{pharmacy.memberData?.memberFullName ?? pharmacy.memberData?.memberNick ?? 'Pharmacy Owner'}</strong>
									{pharmacy.memberData?.memberPhone && <a href={`tel:${pharmacy.memberData.memberPhone}`}><PhoneOutlinedIcon /> {pharmacy.memberData.memberPhone}</a>}
								</div>
							</div>
							{pharmacy.memberData?._id && <Link href={`/member?memberId=${pharmacy.memberData._id}`}>View Pharmacy Owner profile <ArrowForwardRoundedIcon /></Link>}
						</div>
						<div className="pharmacy-detail__message-card">
							<div className="pharmacy-detail__message-heading">
								<div><span>Contact</span><h2>Message the pharmacy</h2></div>
								<em>Coming soon</em>
							</div>
							<label>Name<input type="text" placeholder="Your name" disabled /></label>
							<label>Phone<input type="tel" placeholder="Your phone number" disabled /></label>
							<label>Message<textarea placeholder={`Hello, I have a question about ${pharmacy.pharmacyName}.`} disabled /></label>
							<Button disabled>Send message</Button>
						</div>
					</aside>
				</div>

				<section className="pharmacy-detail__nearby">
					<div className="pharmacy-detail__section-heading">
						<span>Nearby</span>
						<h2>More pharmacies in {getPharmacyLocationLabel(pharmacy.pharmacyLocation)}</h2>
					</div>
					{relatedPharmacies.length ? (
						<div className="pharmacy-detail__nearby-grid">
							{relatedPharmacies.map((item) => (
								<article className="pharmacy-detail__nearby-card" key={item._id}>
									<Link href={`/pharmacies/detail?id=${item._id}`}><img src={pharmacyImage(item.pharmacyImages?.[0])} alt={`${item.pharmacyName} pharmacy`} /></Link>
									<div><span>{item.pharmacyType.toLowerCase()}</span><h3>{item.pharmacyName}</h3><p>{item.pharmacyAddress}</p><Link href={`/pharmacies/detail?id=${item._id}`}>View pharmacy <ArrowForwardRoundedIcon /></Link></div>
								</article>
							))}
						</div>
					) : <p className="pharmacy-detail__empty-copy">No other pharmacies are currently listed in this region.</p>}
				</section>
			</div>
		</main>
	);
};

export default withLayoutFull(PharmacyDetail);
