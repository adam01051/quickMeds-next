import React, { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Button, IconButton, Pagination } from '@mui/material';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
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
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { CREATE_COMMENT, LIKE_TARGET_BOARD_ARTICLE, LIKE_TARGET_MEMBER, LIKE_TARGET_PHARMACY, SUBSCRIBE, UNSUBSCRIBE } from '../../apollo/user/mutation';
import { GET_BOARD_ARTICLES, GET_COMMENTS, GET_MEMBER, GET_MEMBER_FOLLOWERS, GET_MEMBER_FOLLOWINGS, GET_PHARMACIES } from '../../apollo/user/query';
import { userVar } from '../../apollo/store';
import { BoardArticle } from '../../libs/types/board-article/board-article';
import { Comment } from '../../libs/types/comment/comment';
import { CommentInput, CommentsInquiry } from '../../libs/types/comment/comment.input';
import { CommentGroup } from '../../libs/enums/comment.enum';
import { FollowInquiry } from '../../libs/types/follow/follow.input';
import { Follower, Following } from '../../libs/types/follow/follow';
import { Member } from '../../libs/types/member/member';
import { MemberType } from '../../libs/enums/member.enum';
import { PharmaciesInquiry } from '../../libs/types/property/property.input';
import { Property } from '../../libs/types/property/property';
import { BoardArticlesInquiry } from '../../libs/types/board-article/board-article.input';
import { Direction } from '../../libs/enums/common.enum';
import { Messages, REACT_APP_API_URL } from '../../libs/config';
import { sweetErrorHandling, sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';
import { formatDeliveryFeeUZS } from '../../libs/utils';
import CommunityArticleRow from '../../libs/components/community/CommunityArticleRow';
import { T } from '../../libs/types/common';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

type ProfileCategory = 'pharmacies' | 'followers' | 'followings' | 'articles' | 'comments';

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

const getMemberName = (member?: Member | null) => member?.memberFullName || member?.memberNick || 'QuickMeds member';
const isOwnerProfile = (member?: Member | null) => member?.memberType === MemberType.AGENT;
const defaultCategoryFor = (member?: Member | null): ProfileCategory => (isOwnerProfile(member) ? 'pharmacies' : 'articles');
const isValidCategory = (category: string | undefined, member?: Member | null) => {
	const allowed: ProfileCategory[] = isOwnerProfile(member)
		? ['pharmacies', 'followers', 'followings', 'articles', 'comments']
		: ['followers', 'followings', 'articles', 'comments'];
	return allowed.includes(category as ProfileCategory);
};

const OwnerPharmacyCard = ({
	pharmacy,
	onFavorite,
}: {
	pharmacy: Property;
	onFavorite: (pharmacyId: string) => Promise<void>;
}) => {
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
					onClick={() => onFavorite(pharmacy._id)}
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

const CommentCard = ({ comment }: { comment: Comment }) => {
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

const FollowCard = ({
	member,
	alreadyFollowing,
	onFollow,
	onUnfollow,
	onLike,
	onOpen,
}: {
	member?: Member;
	alreadyFollowing: boolean;
	onFollow: (memberId: string) => Promise<void>;
	onUnfollow: (memberId: string) => Promise<void>;
	onLike: (memberId: string) => Promise<void>;
	onOpen: (memberId: string) => Promise<void>;
}) => {
	const user = useReactiveVar(userVar);
	if (!member?._id) return null;
	const name = getMemberName(member);
	const image = member.memberImage ? `${REACT_APP_API_URL}/${member.memberImage}` : '/img/profile/defaultUser.svg';
	const liked = member.meLiked?.[0]?.myFavorite === true;

	return (
		<article className="member-profile-follow-card">
			<button type="button" className="member-profile-follow-card__identity" onClick={() => onOpen(member._id)}>
				<img src={image} alt="" />
				<span>
					<strong>{name}</strong>
					<small>{member.memberType === MemberType.AGENT ? 'Pharmacy Owner' : 'QuickMeds member'}</small>
				</span>
			</button>
			<div className="member-profile-follow-card__stats">
				<span>{member.memberFollowers ?? 0} followers</span>
				<span>{member.memberFollowings ?? 0} following</span>
				<button type="button" onClick={() => onLike(member._id)} aria-label={liked ? `Unlike ${name}` : `Like ${name}`}>
					{liked ? <FavoriteRoundedIcon /> : <FavoriteBorderRoundedIcon />}
					{member.memberLikes ?? 0}
				</button>
			</div>
			{user?._id !== member._id && (
				<div className="member-profile-follow-card__actions">
					{alreadyFollowing ? (
						<>
							<span>Following</span>
							<Button onClick={() => onUnfollow(member._id)}>Unfollow</Button>
						</>
					) : (
						<Button onClick={() => onFollow(member._id)}>Follow</Button>
					)}
				</div>
			)}
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

const MemberPage: NextPage = ({ initialPharmacies, initialFollowers, initialFollowings, initialArticles, initialComments }: any) => {
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const [memberId, setMemberId] = useState('');
	const [member, setMember] = useState<Member | null>(null);
	const [activeCategory, setActiveCategory] = useState<ProfileCategory>('articles');
	const [pharmacyInquiry, setPharmacyInquiry] = useState<PharmaciesInquiry>(initialPharmacies);
	const [followersInquiry, setFollowersInquiry] = useState<FollowInquiry>(initialFollowers);
	const [followingsInquiry, setFollowingsInquiry] = useState<FollowInquiry>(initialFollowings);
	const [articlesInquiry, setArticlesInquiry] = useState<BoardArticlesInquiry>(initialArticles);
	const [commentsInquiry, setCommentsInquiry] = useState<CommentsInquiry>(initialComments);
	const [commentDraft, setCommentDraft] = useState<CommentInput>({
		commentGroup: CommentGroup.MEMBER,
		commentContent: '',
		commentRefId: '',
	});

	const [subscribe] = useMutation(SUBSCRIBE);
	const [unsubscribe] = useMutation(UNSUBSCRIBE);
	const [likeTargetMember] = useMutation(LIKE_TARGET_MEMBER);
	const [likeTargetPharmacy] = useMutation(LIKE_TARGET_PHARMACY);
	const [likeTargetBoardArticle] = useMutation(LIKE_TARGET_BOARD_ARTICLE);
	const [createComment, { loading: createCommentLoading }] = useMutation(CREATE_COMMENT);

	const {
		loading: memberLoading,
		error: memberError,
		refetch: refetchMember,
	} = useQuery(GET_MEMBER, {
		fetchPolicy: 'network-only',
		variables: { input: memberId },
		skip: !memberId,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			const loadedMember = data?.getMember ?? null;
			setMember(loadedMember);
		},
	});

	const {
		loading: pharmaciesLoading,
		error: pharmaciesError,
		data: pharmaciesData,
		refetch: refetchPharmacies,
	} = useQuery(GET_PHARMACIES, {
		fetchPolicy: 'network-only',
		variables: { input: pharmacyInquiry },
		skip: !memberId || !isOwnerProfile(member) || activeCategory !== 'pharmacies',
		notifyOnNetworkStatusChange: true,
	});

	const {
		loading: followersLoading,
		error: followersError,
		data: followersData,
		refetch: refetchFollowers,
	} = useQuery(GET_MEMBER_FOLLOWERS, {
		fetchPolicy: 'network-only',
		variables: { input: followersInquiry },
		skip: !memberId || activeCategory !== 'followers',
		notifyOnNetworkStatusChange: true,
	});

	const {
		loading: followingsLoading,
		error: followingsError,
		data: followingsData,
		refetch: refetchFollowings,
	} = useQuery(GET_MEMBER_FOLLOWINGS, {
		fetchPolicy: 'network-only',
		variables: { input: followingsInquiry },
		skip: !memberId || activeCategory !== 'followings',
		notifyOnNetworkStatusChange: true,
	});

	const {
		loading: articlesLoading,
		error: articlesError,
		data: articlesData,
		refetch: refetchArticles,
	} = useQuery(GET_BOARD_ARTICLES, {
		fetchPolicy: 'network-only',
		variables: { input: articlesInquiry },
		skip: !memberId || activeCategory !== 'articles',
		notifyOnNetworkStatusChange: true,
	});

	const {
		loading: commentsLoading,
		error: commentsError,
		data: commentsData,
		refetch: refetchComments,
	} = useQuery(GET_COMMENTS, {
		fetchPolicy: 'network-only',
		variables: { input: commentsInquiry },
		skip: !memberId || activeCategory !== 'comments',
		notifyOnNetworkStatusChange: true,
	});

	useEffect(() => {
		if (!router.isReady) return;
		const routedMemberId = Array.isArray(router.query.memberId) ? router.query.memberId[0] : router.query.memberId;
		setMemberId(routedMemberId ?? '');
	}, [router.isReady, router.query.memberId]);

	useEffect(() => {
		if (!member?._id || !router.isReady) return;
		const category = Array.isArray(router.query.category) ? router.query.category[0] : router.query.category;
		const nextCategory = isValidCategory(category, member) ? (category as ProfileCategory) : defaultCategoryFor(member);
		setActiveCategory(nextCategory);
		setPharmacyInquiry({ ...initialPharmacies, search: { memberId: member._id } });
		setFollowersInquiry({ ...initialFollowers, search: { followingId: member._id } });
		setFollowingsInquiry({ ...initialFollowings, search: { followerId: member._id } });
		setArticlesInquiry({ ...initialArticles, search: { memberId: member._id } });
		setCommentsInquiry({ ...initialComments, search: { commentRefId: member._id, commentGroup: CommentGroup.MEMBER } });
		setCommentDraft({ commentGroup: CommentGroup.MEMBER, commentContent: '', commentRefId: member._id });
		if (category !== nextCategory) {
			router.replace({ pathname: '/member', query: { memberId: member._id, category: nextCategory } }, undefined, { shallow: true });
		}
	}, [member?._id, member?.memberType, router.isReady, router.query.category]);

	const profileCategories = useMemo(() => {
		const categories = isOwnerProfile(member)
			? [
					{ key: 'pharmacies' as ProfileCategory, label: 'Pharmacies', count: member?.memberPharmacies ?? 0, icon: <StorefrontOutlinedIcon /> },
					{ key: 'followers' as ProfileCategory, label: 'Followers', count: member?.memberFollowers ?? 0, icon: <PersonAddAltOutlinedIcon /> },
					{ key: 'followings' as ProfileCategory, label: 'Following', count: member?.memberFollowings ?? 0, icon: <PersonAddAltOutlinedIcon /> },
					{ key: 'articles' as ProfileCategory, label: 'Articles', count: member?.memberArticles ?? 0, icon: <ArticleOutlinedIcon /> },
					{ key: 'comments' as ProfileCategory, label: 'Comments', count: member?.memberComments ?? 0, icon: <ChatBubbleOutlineRoundedIcon /> },
				]
			: [
					{ key: 'followers' as ProfileCategory, label: 'Followers', count: member?.memberFollowers ?? 0, icon: <PersonAddAltOutlinedIcon /> },
					{ key: 'followings' as ProfileCategory, label: 'Following', count: member?.memberFollowings ?? 0, icon: <PersonAddAltOutlinedIcon /> },
					{ key: 'articles' as ProfileCategory, label: 'Articles', count: member?.memberArticles ?? 0, icon: <ArticleOutlinedIcon /> },
					{ key: 'comments' as ProfileCategory, label: 'Comments', count: member?.memberComments ?? 0, icon: <ChatBubbleOutlineRoundedIcon /> },
				];
		return categories;
	}, [member]);

	const openCategory = async (category: ProfileCategory) => {
		if (!member?._id) return;
		setActiveCategory(category);
		await router.push({ pathname: '/member', query: { memberId: member._id, category } }, undefined, { shallow: true, scroll: false });
	};

	const requireUser = () => {
		if (!user?._id) throw new Error(Messages.error2);
	};

	const followMember = async (targetId: string, refetch?: () => Promise<any>) => {
		try {
			requireUser();
			await subscribe({ variables: { input: targetId } });
			await refetchMember({ input: memberId });
			if (refetch) await refetch();
			await sweetTopSmallSuccessAlert('Followed', 800);
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	};

	const unfollowMember = async (targetId: string, refetch?: () => Promise<any>) => {
		try {
			requireUser();
			await unsubscribe({ variables: { input: targetId } });
			await refetchMember({ input: memberId });
			if (refetch) await refetch();
			await sweetTopSmallSuccessAlert('Unfollowed', 800);
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	};

	const likeMember = async (targetId: string, refetch?: () => Promise<any>) => {
		try {
			requireUser();
			await likeTargetMember({ variables: { input: targetId } });
			await refetchMember({ input: memberId });
			if (refetch) await refetch();
			await sweetTopSmallSuccessAlert('Success', 800);
		} catch (err: any) {
			sweetMixinErrorAlert(err.message).then();
		}
	};

	const likePharmacy = async (pharmacyId: string) => {
		try {
			requireUser();
			await likeTargetPharmacy({ variables: { input: pharmacyId } });
			await refetchPharmacies({ input: pharmacyInquiry });
			await sweetTopSmallSuccessAlert('Success', 800);
		} catch (err: any) {
			sweetMixinErrorAlert(err.message).then();
		}
	};

	const likeArticle = async (articleId: string) => {
		try {
			requireUser();
			await likeTargetBoardArticle({ variables: { input: articleId } });
			await refetchArticles({ input: articlesInquiry });
			await sweetTopSmallSuccessAlert('Success', 800);
		} catch (err: any) {
			sweetMixinErrorAlert(err.message).then();
		}
	};

	const submitComment = async () => {
		try {
			requireUser();
			if (user._id === memberId) throw new Error('You cannot comment on your own profile.');
			if (!commentDraft.commentContent.trim()) return;
			await createComment({
				variables: {
					input: { ...commentDraft, commentContent: commentDraft.commentContent.trim() },
				},
			});
			setCommentDraft({ ...commentDraft, commentContent: '' });
			await refetchComments({ input: commentsInquiry });
			await refetchMember({ input: memberId });
			await sweetTopSmallSuccessAlert('Comment submitted', 800);
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	};

	const openMember = async (targetId: string) => {
		if (targetId === user?._id) await router.push('/mypage');
		else await router.push(`/member?memberId=${targetId}`);
	};

	const renderSection = () => {
		if (activeCategory === 'pharmacies') {
			const pharmacies = (pharmaciesData?.getPharmacies?.list ?? []) as Property[];
			const total = pharmaciesData?.getPharmacies?.metaCounter?.[0]?.total ?? 0;
			return (
				<section className="pharmacy-owner-detail__section">
					<div className="pharmacy-owner-detail__section-head">
						<div>
							<h2>Managed pharmacies</h2>
							<p>Browse pharmacies connected to this owner profile.</p>
						</div>
						<span>{total} {total === 1 ? 'pharmacy' : 'pharmacies'}</span>
					</div>
					{pharmaciesLoading && !pharmacies.length ? (
						<div className="pharmacy-owner-detail__grid" aria-label="Loading pharmacies">
							{Array.from({ length: 3 }).map((_, index) => <div className="pharmacy-owner-detail-card-skeleton" key={index} />)}
						</div>
					) : pharmaciesError ? (
						<div className="pharmacy-owner-detail__empty" role="alert">
							<h3>Pharmacies could not be loaded</h3>
							<p>Please try again.</p>
							<button type="button" onClick={() => refetchPharmacies({ input: pharmacyInquiry })}>Try again</button>
						</div>
					) : pharmacies.length ? (
						<div className="pharmacy-owner-detail__grid">
							{pharmacies.map((pharmacy) => <OwnerPharmacyCard key={pharmacy._id} pharmacy={pharmacy} onFavorite={likePharmacy} />)}
						</div>
					) : (
						<div className="pharmacy-owner-detail__empty">
							<h3>No pharmacies listed yet</h3>
							<p>This Pharmacy Owner has not published any pharmacies.</p>
						</div>
					)}
					{pharmacies.length > 0 && (
						<footer className="pharmacy-owner-detail__pagination">
							<Pagination
								page={pharmacyInquiry.page}
								count={Math.ceil(total / pharmacyInquiry.limit) || 1}
								onChange={(event: ChangeEvent<unknown>, value) => setPharmacyInquiry({ ...pharmacyInquiry, page: value })}
								shape="rounded"
								color="primary"
							/>
							<p>Total {total} pharmacies available</p>
						</footer>
					)}
				</section>
			);
		}

		if (activeCategory === 'followers') {
			const followers = (followersData?.getMemberFollowers?.list ?? []) as Follower[];
			const total = followersData?.getMemberFollowers?.metaCounter?.[0]?.total ?? 0;
			return (
				<section className="pharmacy-owner-detail__section">
					<div className="pharmacy-owner-detail__section-head">
						<div>
							<h2>Followers</h2>
							<p>Members following this profile.</p>
						</div>
						<span>{total} followers</span>
					</div>
					{followersLoading && !followers.length ? (
						<div className="member-profile-list-skeleton"><div /><div /><div /></div>
					) : followersError ? (
						<div className="pharmacy-owner-detail__empty" role="alert">
							<h3>Followers could not be loaded</h3>
							<button type="button" onClick={() => refetchFollowers({ input: followersInquiry })}>Try again</button>
						</div>
					) : followers.length ? (
						<div className="member-profile-list">
							{followers.map((follow) => (
								<FollowCard
									key={follow._id}
									member={follow.followerData ? { ...follow.followerData, meLiked: follow.meLiked } : undefined}
									alreadyFollowing={Boolean(follow.meFollowed?.some((item) => item.myFollowing))}
									onFollow={(id) => followMember(id, () => refetchFollowers({ input: followersInquiry }))}
									onUnfollow={(id) => unfollowMember(id, () => refetchFollowers({ input: followersInquiry }))}
									onLike={(id) => likeMember(id, () => refetchFollowers({ input: followersInquiry }))}
									onOpen={openMember}
								/>
							))}
						</div>
					) : (
						<div className="pharmacy-owner-detail__empty">
							<h3>No followers yet</h3>
							<p>This profile does not have followers yet.</p>
						</div>
					)}
					{followers.length > 0 && (
						<footer className="pharmacy-owner-detail__pagination">
							<Pagination
								page={followersInquiry.page}
								count={Math.ceil(total / followersInquiry.limit) || 1}
								onChange={(event: ChangeEvent<unknown>, value) => setFollowersInquiry({ ...followersInquiry, page: value })}
								shape="rounded"
								color="primary"
							/>
						</footer>
					)}
				</section>
			);
		}

		if (activeCategory === 'followings') {
			const followings = (followingsData?.getMemberFollowings?.list ?? []) as Following[];
			const total = followingsData?.getMemberFollowings?.metaCounter?.[0]?.total ?? 0;
			const isOwnFollowingsList = memberId === user?._id;
			return (
				<section className="pharmacy-owner-detail__section">
					<div className="pharmacy-owner-detail__section-head">
						<div>
							<h2>Following</h2>
							<p>Profiles this member follows.</p>
						</div>
						<span>{total} following</span>
					</div>
					{followingsLoading && !followings.length ? (
						<div className="member-profile-list-skeleton"><div /><div /><div /></div>
					) : followingsError ? (
						<div className="pharmacy-owner-detail__empty" role="alert">
							<h3>Following could not be loaded</h3>
							<button type="button" onClick={() => refetchFollowings({ input: followingsInquiry })}>Try again</button>
						</div>
					) : followings.length ? (
						<div className="member-profile-list">
							{followings.map((follow) => (
								<FollowCard
									key={follow._id}
									member={follow.followingData ? { ...follow.followingData, meLiked: follow.meLiked } : undefined}
									alreadyFollowing={isOwnFollowingsList || Boolean(follow.meFollowed?.some((item) => item.myFollowing))}
									onFollow={(id) => followMember(id, () => refetchFollowings({ input: followingsInquiry }))}
									onUnfollow={(id) => unfollowMember(id, () => refetchFollowings({ input: followingsInquiry }))}
									onLike={(id) => likeMember(id, () => refetchFollowings({ input: followingsInquiry }))}
									onOpen={openMember}
								/>
							))}
						</div>
					) : (
						<div className="pharmacy-owner-detail__empty">
							<h3>No following profiles yet</h3>
							<p>This member has not followed anyone yet.</p>
						</div>
					)}
					{followings.length > 0 && (
						<footer className="pharmacy-owner-detail__pagination">
							<Pagination
								page={followingsInquiry.page}
								count={Math.ceil(total / followingsInquiry.limit) || 1}
								onChange={(event: ChangeEvent<unknown>, value) => setFollowingsInquiry({ ...followingsInquiry, page: value })}
								shape="rounded"
								color="primary"
							/>
						</footer>
					)}
				</section>
			);
		}

		if (activeCategory === 'articles') {
			const articles = (articlesData?.getBoardArticles?.list ?? []) as BoardArticle[];
			const total = articlesData?.getBoardArticles?.metaCounter?.[0]?.total ?? 0;
			return (
				<section className="pharmacy-owner-detail__section member-profile-articles-section">
					<div className="pharmacy-owner-detail__section-head">
						<div>
							<h2>Community articles</h2>
							<p>Public Community posts by this member.</p>
						</div>
						<span>{total} articles</span>
					</div>
					{articlesLoading && !articles.length ? (
						<div className="member-profile-list-skeleton"><div /><div /></div>
					) : articlesError ? (
						<div className="pharmacy-owner-detail__empty" role="alert">
							<h3>Articles could not be loaded</h3>
							<button type="button" onClick={() => refetchArticles({ input: articlesInquiry })}>Try again</button>
						</div>
					) : articles.length ? (
						<div className="member-profile-articles">
							{articles.map((article) => <CommunityArticleRow key={article._id} article={article} likeLoading={false} onLike={likeArticle} />)}
						</div>
					) : (
						<div className="pharmacy-owner-detail__empty">
							<h3>No articles yet</h3>
							<p>This member has not published Community articles yet.</p>
						</div>
					)}
					{articles.length > 0 && (
						<footer className="pharmacy-owner-detail__pagination">
							<Pagination
								page={articlesInquiry.page}
								count={Math.ceil(total / articlesInquiry.limit) || 1}
								onChange={(event: ChangeEvent<unknown>, value) => setArticlesInquiry({ ...articlesInquiry, page: value })}
								shape="rounded"
								color="primary"
							/>
						</footer>
					)}
				</section>
			);
		}

		const comments = (commentsData?.getComments?.list ?? []) as Comment[];
		const total = commentsData?.getComments?.metaCounter?.[0]?.total ?? 0;
		const isSelf = user?._id === memberId;
		const disableComment = !user?._id || isSelf || !commentDraft.commentContent.trim() || createCommentLoading;
		return (
			<section className="pharmacy-owner-detail__section pharmacy-owner-detail__comments-section">
				<div className="pharmacy-owner-detail__section-head">
					<div>
						<h2>Community comments</h2>
						<p>Comments from QuickMeds members about this profile.</p>
					</div>
					<span>{total} {total === 1 ? 'comment' : 'comments'}</span>
				</div>
				{commentsLoading && !comments.length ? (
					<div className="pharmacy-owner-detail__comments-loading" aria-label="Loading comments">
						<div />
						<div />
					</div>
				) : commentsError ? (
					<div className="pharmacy-owner-detail__empty" role="alert">
						<h3>Comments could not be loaded</h3>
						<button type="button" onClick={() => refetchComments({ input: commentsInquiry })}>Try again</button>
					</div>
				) : comments.length ? (
					<div className="pharmacy-owner-detail__comments">
						{comments.map((comment) => <CommentCard comment={comment} key={comment._id} />)}
					</div>
				) : (
					<div className="pharmacy-owner-detail__empty">
						<h3>No comments yet</h3>
						<p>Be the first to leave useful feedback for this profile.</p>
					</div>
				)}
				{comments.length > 0 && (
					<footer className="pharmacy-owner-detail__pagination">
						<Pagination
							page={commentsInquiry.page}
							count={Math.ceil(total / commentsInquiry.limit) || 1}
							onChange={(event: ChangeEvent<unknown>, value) => setCommentsInquiry({ ...commentsInquiry, page: value })}
							shape="rounded"
							color="primary"
						/>
					</footer>
				)}
				<div className="pharmacy-owner-detail__comment-form">
					<h3>Leave a comment</h3>
					{!user?._id && <p className="pharmacy-owner-detail__notice">Log in to write a comment.</p>}
					{isSelf && <p className="pharmacy-owner-detail__notice">You cannot comment on your own profile.</p>}
					<textarea
						value={commentDraft.commentContent}
						placeholder="Share helpful information for other QuickMeds members"
						disabled={!user?._id || isSelf || createCommentLoading}
						onChange={(event) => setCommentDraft({ ...commentDraft, commentContent: event.target.value })}
					/>
					<Button className="pharmacy-owner-detail__submit" disabled={disableComment} onClick={submitComment}>
						{createCommentLoading ? 'Submitting...' : 'Submit comment'}
					</Button>
				</div>
			</section>
		);
	};

	if (!router.isReady || memberLoading) {
		return (
			<main className="pharmacy-owner-detail-state pharmacy-owner-detail-state--loading" aria-label="Loading member profile">
				<div />
				<div />
				<div />
			</main>
		);
	}

	if (!memberId) {
		return (
			<DetailState
				title="Profile not selected"
				copy="Open a member or Pharmacy Owner profile from QuickMeds to view public activity."
				action={<Link href="/pharmacies">Browse pharmacies</Link>}
			/>
		);
	}

	if (memberError) {
		return (
			<DetailState
				title="Profile could not be loaded"
				copy="Please check your connection and try again."
				action={<button type="button" onClick={() => refetchMember({ input: memberId })}>Try again</button>}
			/>
		);
	}

	if (!member) {
		return (
			<DetailState
				title="Profile not found"
				copy="This profile may have been removed or is no longer available."
				action={<Link href="/pharmacies">Browse pharmacies</Link>}
			/>
		);
	}

	const name = getMemberName(member);
	const image = member.memberImage ? `${REACT_APP_API_URL}/${member.memberImage}` : '/img/profile/defaultUser.svg';
	const isSelf = user?._id === member._id;
	const alreadyFollowing = Boolean(member.meFollowed?.some((follow) => follow.myFollowing));
	const isLiked = Boolean(member.meLiked?.[0]?.myFavorite);
	const profileLabel = isOwnerProfile(member) ? 'Pharmacy Owner' : 'QuickMeds member';

	return (
		<main className="pharmacy-owner-detail member-profile">
			<div className="container">
				<header className="pharmacy-owner-detail__hero member-profile__hero">
					<div className="pharmacy-owner-detail__profile">
						<img src={image} alt={`${name} profile`} />
						<div>
							<span>{profileLabel}</span>
							<h1>{name}</h1>
							<div className="pharmacy-owner-detail__meta">
								{member.memberPhone && (
									<span>
										<LocalPhoneOutlinedIcon />
										{member.memberPhone}
									</span>
								)}
								{member.memberAddress && (
									<span>
										<LocationOnOutlinedIcon />
										{member.memberAddress}
									</span>
								)}
							</div>
							<div className="member-profile__actions">
								<IconButton
									className="member-profile__like"
									aria-label={isLiked ? `Unlike ${name}` : `Like ${name}`}
									onClick={() => likeMember(member._id)}
								>
									{isLiked ? <FavoriteRoundedIcon /> : <FavoriteBorderRoundedIcon />}
								</IconButton>
								{!isSelf && (
									alreadyFollowing ? (
										<Button className="member-profile__follow member-profile__follow--secondary" onClick={() => unfollowMember(member._id)}>
											Unfollow
										</Button>
									) : (
										<Button className="member-profile__follow" onClick={() => followMember(member._id)}>
											Follow
										</Button>
									)
								)}
							</div>
						</div>
					</div>
					<div className="pharmacy-owner-detail__stats">
						{isOwnerProfile(member) && (
							<div>
								<StorefrontOutlinedIcon />
								<strong>{member.memberPharmacies ?? 0}</strong>
								<span>Pharmacies</span>
							</div>
						)}
						<div>
							<ArticleOutlinedIcon />
							<strong>{member.memberArticles ?? 0}</strong>
							<span>Articles</span>
						</div>
						<div>
							<PersonAddAltOutlinedIcon />
							<strong>{member.memberFollowers ?? 0}</strong>
							<span>Followers</span>
						</div>
						<div>
							<FavoriteBorderRoundedIcon />
							<strong>{member.memberLikes ?? 0}</strong>
							<span>Likes</span>
						</div>
						<div>
							<VisibilityOutlinedIcon />
							<strong>{member.memberViews ?? 0}</strong>
							<span>Views</span>
						</div>
					</div>
				</header>

				<nav className="member-profile__tabs" aria-label="Profile sections">
					{profileCategories.map((category) => (
						<button
							key={category.key}
							type="button"
							className={activeCategory === category.key ? 'is-active' : ''}
							onClick={() => openCategory(category.key)}
						>
							{category.icon}
							<span>{category.label}</span>
							<strong>{category.count}</strong>
						</button>
					))}
				</nav>

				{renderSection()}
			</div>
		</main>
	);
};

MemberPage.defaultProps = {
	initialPharmacies: {
		page: 1,
		limit: 9,
		search: {
			memberId: '',
		},
	},
	initialFollowers: {
		page: 1,
		limit: 6,
		search: {
			followingId: '',
		},
	},
	initialFollowings: {
		page: 1,
		limit: 6,
		search: {
			followerId: '',
		},
	},
	initialArticles: {
		page: 1,
		limit: 6,
		sort: 'createdAt',
		direction: Direction.DESC,
		search: {
			memberId: '',
		},
	},
	initialComments: {
		page: 1,
		limit: 5,
		sort: 'createdAt',
		direction: Direction.DESC,
		search: {
			commentRefId: '',
			commentGroup: CommentGroup.MEMBER,
		},
	},
};

export default withLayoutBasic(MemberPage);
