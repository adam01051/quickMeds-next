import React, { ChangeEvent, useEffect, useState } from 'react';
import { NextPage } from 'next';
import Link from 'next/link';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { Button, IconButton, Pagination } from '@mui/material';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import HealthAndSafetyOutlinedIcon from '@mui/icons-material/HealthAndSafetyOutlined';
import LocalPhoneOutlinedIcon from '@mui/icons-material/LocalPhoneOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { useRouter } from 'next/router';
import { Property } from '../../libs/types/property/property';
import { Member } from '../../libs/types/member/member';
import { sweetErrorHandling, sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';
import { userVar } from '../../apollo/store';
import { PharmaciesInquiry } from '../../libs/types/property/property.input';
import { CommentInput, CommentsInquiry } from '../../libs/types/comment/comment.input';
import { Comment } from '../../libs/types/comment/comment';
import { CommentGroup } from '../../libs/enums/comment.enum';
import { Messages, REACT_APP_API_URL } from '../../libs/config';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { CREATE_COMMENT, LIKE_TARGET_PHARMACY } from '../../apollo/user/mutation';
import { GET_COMMENTS, GET_MEMBER, GET_PHARMACIES } from '../../apollo/user/query';
import { T } from '../../libs/types/common';
import { formatDeliveryFeeUZS } from '../../libs/utils';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const formatPharmacyType = (value?: string) =>
	value
		? value
				.toLowerCase()
				.replace(/_/g, ' ')
				.replace(/\b\w/g, (letter) => letter.toUpperCase())
		: 'Pharmacy';

const formatDate = (value?: Date | string) => {
	if (!value) return 'Recently';
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return 'Recently';
	return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
};

const getOwnerName = (owner?: Member | null) => owner?.memberFullName || owner?.memberNick || 'Pharmacy Owner';

const OwnerPharmacyCard = ({
	pharmacy,
	onFavorite,
}: {
	pharmacy: Property;
	onFavorite: (user: T, pharmacyId: string) => void;
}) => {
	const user = useReactiveVar(userVar);
	const image = pharmacy.pharmacyImages?.[0]
		? `${REACT_APP_API_URL}/${pharmacy.pharmacyImages[0]}`
		: '/img/homepage/pharmacy-hero.webp';
	const isFavorite = pharmacy.meLiked?.[0]?.myFavorite === true;
	const status = pharmacy.open24Hours
		? 'Open 24/7'
		: pharmacy.hoursConfigured
			? pharmacy.isOpenNow
				? 'Open now'
				: 'Closed'
			: 'Hours not provided';
	const statusClass = pharmacy.open24Hours || pharmacy.isOpenNow ? 'is-open' : pharmacy.hoursConfigured ? 'is-closed' : 'is-unknown';

	const useFallbackImage = (event: React.SyntheticEvent<HTMLImageElement>) => {
		event.currentTarget.onerror = null;
		event.currentTarget.src = '/img/homepage/pharmacy-hero.webp';
	};

	return (
		<article className="pharmacy-owner-detail-card">
			<div className="pharmacy-owner-detail-card__media">
				<Link href={`/pharmacies/detail?id=${pharmacy._id}`} aria-label={`View ${pharmacy.pharmacyName}`}>
					<img src={image} alt={`${pharmacy.pharmacyName} pharmacy`} onError={useFallbackImage} />
				</Link>
				<span className={`pharmacy-owner-detail-card__status ${statusClass}`}>
					<AccessTimeRoundedIcon />
					{status}
				</span>
				<IconButton
					className="pharmacy-owner-detail-card__favorite"
					aria-label={isFavorite ? `Remove ${pharmacy.pharmacyName} from favorites` : `Save ${pharmacy.pharmacyName}`}
					onClick={() => onFavorite(user, pharmacy._id)}
				>
					{isFavorite ? <FavoriteRoundedIcon /> : <FavoriteBorderRoundedIcon />}
				</IconButton>
			</div>
			<div className="pharmacy-owner-detail-card__body">
				<h3>{pharmacy.pharmacyName}</h3>
				<p>
					<LocationOnOutlinedIcon />
					{pharmacy.pharmacyAddress}
				</p>
				<div className="pharmacy-owner-detail-card__services">
					<span>
						<StorefrontOutlinedIcon />
						{formatPharmacyType(pharmacy.pharmacyType)}
					</span>
					<span>
						<LocalShippingOutlinedIcon />
						{pharmacy.hasDelivery ? `Delivery: ${formatDeliveryFeeUZS(pharmacy.pharmacyDeliveryFee)}` : 'Pickup only'}
					</span>
					<span>
						<HealthAndSafetyOutlinedIcon />
						{pharmacy.acceptsInsurance ? 'Insurance accepted' : 'Insurance not accepted'}
					</span>
				</div>
				<Link className="pharmacy-owner-detail-card__action" href={`/pharmacies/detail?id=${pharmacy._id}`}>
					View pharmacy
					<ArrowForwardRoundedIcon />
				</Link>
			</div>
		</article>
	);
};

const OwnerCommentCard = ({ comment }: { comment: Comment }) => {
	const memberName = comment.memberData?.memberNick ?? 'QuickMeds member';
	const memberImage = comment.memberData?.memberImage
		? `${REACT_APP_API_URL}/${comment.memberData.memberImage}`
		: '/img/profile/defaultUser.svg';

	return (
		<article className="pharmacy-owner-detail-comment">
			<div className="pharmacy-owner-detail-comment__author">
				<img src={memberImage} alt="" />
				<div>
					<strong>{memberName}</strong>
					<span>{formatDate(comment.createdAt)}</span>
				</div>
			</div>
			<p>{comment.commentContent}</p>
		</article>
	);
};

const DetailState = ({
	title,
	copy,
	action,
}: {
	title: string;
	copy: string;
	action?: React.ReactNode;
}) => (
	<main className="pharmacy-owner-detail-state">
		<h1>{title}</h1>
		<p>{copy}</p>
		{action}
	</main>
);

const AgentDetail: NextPage = ({ initialInput, initialComment }: any) => {
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const [agentId, setAgentId] = useState('');
	const [agent, setAgent] = useState<Member | null>(null);
	const [searchFilter, setSearchFilter] = useState<PharmaciesInquiry>(initialInput);
	const [agentProperties, setAgentProperties] = useState<Property[]>([]);
	const [propertyTotal, setPropertyTotal] = useState<number>(0);
	const [commentInquiry, setCommentInquiry] = useState<CommentsInquiry>(initialComment);
	const [agentComments, setAgentComments] = useState<Comment[]>([]);
	const [commentTotal, setCommentTotal] = useState<number>(0);
	const [insertCommentData, setInsertCommentData] = useState<CommentInput>({
		commentGroup: CommentGroup.MEMBER,
		commentContent: '',
		commentRefId: '',
	});

	const [createComment] = useMutation(CREATE_COMMENT);
	const [likeTargetPharmacy] = useMutation(LIKE_TARGET_PHARMACY);

	const {
		loading: getMemberLoading,
		error: getMemberError,
		refetch: getMemberRefetch,
	} = useQuery(GET_MEMBER, {
		fetchPolicy: 'network-only',
		variables: { input: agentId },
		skip: !agentId,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			const owner = data?.getMember ?? null;
			setAgent(owner);
			if (!owner?._id) return;
			setSearchFilter({ ...initialInput, search: { memberId: owner._id } });
			setCommentInquiry({ ...initialComment, search: { commentRefId: owner._id } });
			setInsertCommentData({ commentGroup: CommentGroup.MEMBER, commentContent: '', commentRefId: owner._id });
		},
	});

	const {
		loading: getPharmaciesLoading,
		error: getPharmaciesError,
		refetch: getPharmaciesRefetch,
	} = useQuery(GET_PHARMACIES, {
		fetchPolicy: 'network-only',
		variables: { input: searchFilter },
		skip: !searchFilter.search.memberId,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setAgentProperties(data?.getPharmacies?.list ?? []);
			setPropertyTotal(data?.getPharmacies?.metaCounter?.[0]?.total ?? 0);
		},
	});

	const {
		loading: getCommentsLoading,
		error: getCommentsError,
		refetch: getCommentsRefetch,
	} = useQuery(GET_COMMENTS, {
		fetchPolicy: 'network-only',
		variables: { input: commentInquiry },
		skip: !commentInquiry.search.commentRefId,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setAgentComments(data?.getComments?.list ?? []);
			setCommentTotal(data?.getComments?.metaCounter?.[0]?.total ?? 0);
		},
	});

	useEffect(() => {
		if (!router.isReady) return;
		const routedAgentId = Array.isArray(router.query.agentId) ? router.query.agentId[0] : router.query.agentId;
		setAgentId(routedAgentId ?? '');
	}, [router.isReady, router.query.agentId]);

	const propertyPaginationChangeHandler = async (event: ChangeEvent<unknown>, value: number) => {
		setSearchFilter({ ...searchFilter, page: value });
	};

	const commentPaginationChangeHandler = async (event: ChangeEvent<unknown>, value: number) => {
		setCommentInquiry({ ...commentInquiry, page: value });
	};

	const createCommentHandler = async () => {
		try {
			if (!user._id) throw new Error(Messages.error2);
			if (user._id === agentId) throw new Error('Cannot write a comment for yourself.');
			if (!insertCommentData.commentContent.trim()) return;
			await createComment({
				variables: {
					input: { ...insertCommentData, commentContent: insertCommentData.commentContent.trim() },
				},
			});
			setInsertCommentData({ ...insertCommentData, commentContent: '' });
			await getCommentsRefetch({ input: commentInquiry });
			await sweetTopSmallSuccessAlert('Comment submitted', 800);
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	};

	const likePropertyHandler = async (currentUser: T, id: string) => {
		try {
			if (!id) return;
			if (!currentUser._id) throw new Error(Messages.error2);
			await likeTargetPharmacy({ variables: { input: id } });
			await getPharmaciesRefetch({ input: searchFilter });
			await sweetTopSmallSuccessAlert('Success', 800);
		} catch (err: any) {
			console.log('ERROR, likePropertyHandler:', err.message);
			sweetMixinErrorAlert(err.message).then();
		}
	};

	if (!router.isReady || getMemberLoading) {
		return (
			<main className="pharmacy-owner-detail-state pharmacy-owner-detail-state--loading" aria-label="Loading Pharmacy Owner">
				<div />
				<div />
				<div />
			</main>
		);
	}

	if (!agentId) {
		return (
			<DetailState
				title="Pharmacy Owner not selected"
				copy="Open a Pharmacy Owner profile from the directory to view their pharmacies and community comments."
				action={<Link href="/agent">Back to Pharmacy Owners</Link>}
			/>
		);
	}

	if (getMemberError) {
		return (
			<DetailState
				title="Pharmacy Owner could not be loaded"
				copy="Please check your connection and try again."
				action={<button type="button" onClick={() => getMemberRefetch({ input: agentId })}>Try again</button>}
			/>
		);
	}

	if (!agent) {
		return (
			<DetailState
				title="Pharmacy Owner not found"
				copy="This profile may have been removed or is no longer available."
				action={<Link href="/agent">Back to Pharmacy Owners</Link>}
			/>
		);
	}

	const ownerName = getOwnerName(agent);
	const ownerImage = agent.memberImage ? `${REACT_APP_API_URL}/${agent.memberImage}` : '/img/profile/defaultUser.svg';
	const isSelf = user?._id === agent._id;
	const disableComment = !user?._id || isSelf || !insertCommentData.commentContent.trim();

	return (
		<main className="pharmacy-owner-detail">
			<div className="container">
				<Link className="pharmacy-owner-detail__back" href="/agent">
					<ArrowBackRoundedIcon />
					Back to Pharmacy Owners
				</Link>

				<header className="pharmacy-owner-detail__hero">
					<div className="pharmacy-owner-detail__profile">
						<img src={ownerImage} alt={`${ownerName} profile`} />
						<div>
							<span>Pharmacy Owner</span>
							<h1>{ownerName}</h1>
							<div className="pharmacy-owner-detail__meta">
								{agent.memberPhone && (
									<span>
										<LocalPhoneOutlinedIcon />
										{agent.memberPhone}
									</span>
								)}
								{agent.memberAddress && (
									<span>
										<LocationOnOutlinedIcon />
										{agent.memberAddress}
									</span>
								)}
							</div>
						</div>
					</div>
					<div className="pharmacy-owner-detail__stats">
						<div>
							<StorefrontOutlinedIcon />
							<strong>{agent.memberPharmacies ?? 0}</strong>
							<span>Pharmacies</span>
						</div>
						<div>
							<ArticleOutlinedIcon />
							<strong>{agent.memberArticles ?? 0}</strong>
							<span>Articles</span>
						</div>
						<div>
							<PersonAddAltOutlinedIcon />
							<strong>{agent.memberFollowers ?? 0}</strong>
							<span>Followers</span>
						</div>
						<div>
							<FavoriteBorderRoundedIcon />
							<strong>{agent.memberLikes ?? 0}</strong>
							<span>Likes</span>
						</div>
						<div>
							<VisibilityOutlinedIcon />
							<strong>{agent.memberViews ?? 0}</strong>
							<span>Views</span>
						</div>
					</div>
				</header>

				<section className="pharmacy-owner-detail__section">
					<div className="pharmacy-owner-detail__section-head">
						<div>
							<h2>Managed pharmacies</h2>
							<p>Browse pharmacies connected to this owner profile.</p>
						</div>
						<span>{propertyTotal} {propertyTotal === 1 ? 'pharmacy' : 'pharmacies'}</span>
					</div>

					{getPharmaciesLoading && !agentProperties.length ? (
						<div className="pharmacy-owner-detail__grid" aria-label="Loading owner pharmacies">
							{Array.from({ length: 3 }).map((_, index) => <div className="pharmacy-owner-detail-card-skeleton" key={index} />)}
						</div>
					) : getPharmaciesError ? (
						<div className="pharmacy-owner-detail__empty" role="alert">
							<h3>Pharmacies could not be loaded</h3>
							<p>Please try again.</p>
							<button type="button" onClick={() => getPharmaciesRefetch({ input: searchFilter })}>Try again</button>
						</div>
					) : agentProperties.length ? (
						<div className="pharmacy-owner-detail__grid">
							{agentProperties.map((property) => (
								<OwnerPharmacyCard key={property._id} pharmacy={property} onFavorite={likePropertyHandler} />
							))}
						</div>
					) : (
						<div className="pharmacy-owner-detail__empty">
							<h3>No pharmacies listed yet</h3>
							<p>This Pharmacy Owner has not published any pharmacies.</p>
						</div>
					)}

					{agentProperties.length > 0 && (
						<footer className="pharmacy-owner-detail__pagination">
							<Pagination
								page={searchFilter.page}
								count={Math.ceil(propertyTotal / searchFilter.limit) || 1}
								onChange={propertyPaginationChangeHandler}
								shape="rounded"
								color="primary"
							/>
							<p>Total {propertyTotal} pharmacies available</p>
						</footer>
					)}
				</section>

				<section className="pharmacy-owner-detail__section pharmacy-owner-detail__comments-section">
					<div className="pharmacy-owner-detail__section-head">
						<div>
							<h2>Community comments</h2>
							<p>Comments from QuickMeds members about this owner profile.</p>
						</div>
						<span>{commentTotal} {commentTotal === 1 ? 'comment' : 'comments'}</span>
					</div>

					{getCommentsLoading && !agentComments.length ? (
						<div className="pharmacy-owner-detail__comments-loading" aria-label="Loading comments">
							<div />
							<div />
						</div>
					) : getCommentsError ? (
						<div className="pharmacy-owner-detail__empty" role="alert">
							<h3>Comments could not be loaded</h3>
							<p>Please try again.</p>
							<button type="button" onClick={() => getCommentsRefetch({ input: commentInquiry })}>Try again</button>
						</div>
					) : agentComments.length ? (
						<div className="pharmacy-owner-detail__comments">
							{agentComments.map((comment) => <OwnerCommentCard comment={comment} key={comment._id} />)}
						</div>
					) : (
						<div className="pharmacy-owner-detail__empty">
							<h3>No comments yet</h3>
							<p>Be the first to leave useful feedback for this Pharmacy Owner.</p>
						</div>
					)}

					{agentComments.length > 0 && (
						<footer className="pharmacy-owner-detail__pagination">
							<Pagination
								page={commentInquiry.page}
								count={Math.ceil(commentTotal / commentInquiry.limit) || 1}
								onChange={commentPaginationChangeHandler}
								shape="rounded"
								color="primary"
							/>
						</footer>
					)}

					<div className="pharmacy-owner-detail__comment-form">
						<h3>Leave a comment</h3>
						{!user?._id && <p className="pharmacy-owner-detail__notice">Log in to write a comment.</p>}
						{isSelf && <p className="pharmacy-owner-detail__notice">You cannot comment on your own owner profile.</p>}
						<textarea
							value={insertCommentData.commentContent}
							placeholder="Share helpful information for other QuickMeds members"
							disabled={!user?._id || isSelf}
							onChange={(event) => setInsertCommentData({ ...insertCommentData, commentContent: event.target.value })}
						/>
						<Button className="pharmacy-owner-detail__submit" disabled={disableComment} onClick={createCommentHandler}>
							Submit comment
						</Button>
					</div>
				</section>
			</div>
		</main>
	);
};

AgentDetail.defaultProps = {
	initialInput: {
		page: 1,
		limit: 9,
		search: {
			memberId: '',
		},
	},
	initialComment: {
		page: 1,
		limit: 5,
		sort: 'createdAt',
		direction: 'ASC',
		search: {
			commentRefId: '',
		},
	},
};

export default withLayoutBasic(AgentDetail);
