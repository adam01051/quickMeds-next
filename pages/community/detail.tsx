import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { Dialog, IconButton, Pagination, Skeleton } from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { BoardArticle } from '../../libs/types/board-article/board-article';
import { CommentInput, CommentsInquiry } from '../../libs/types/comment/comment.input';
import { Comment } from '../../libs/types/comment/comment';
import { CommentGroup, CommentStatus } from '../../libs/enums/comment.enum';
import { T } from '../../libs/types/common';
import { REACT_APP_API_URL } from '../../libs/config';
import { userVar } from '../../apollo/store';
import { CREATE_COMMENT, LIKE_TARGET_BOARD_ARTICLE, UPDATE_COMMENT } from '../../apollo/user/mutation';
import { GET_BOARD_ARTICLE, GET_COMMENTS } from '../../apollo/user/query';
import { sweetConfirmAlert, sweetMixinErrorAlert, sweetMixinSuccessAlert } from '../../libs/sweetAlert';
import { useTranslation } from 'next-i18next';

const ArticleViewer = dynamic(() => import('../../libs/components/community/TViewer'), { ssr: false });

export const getStaticProps = async ({ locale }: T) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const getValidDate = (date?: Date | string) => {
	if (!date) return null;
	const nextDate = new Date(date);
	return Number.isNaN(nextDate.getTime()) ? null : nextDate;
};

const formatDate = (date: Date | string, locale: string, fallback: string) => {
	const nextDate = getValidDate(date);
	if (!nextDate) return fallback;
	return new Intl.DateTimeFormat(locale, { month: 'long', day: 'numeric', year: 'numeric' }).format(nextDate);
};

const formatRelativeDate = (date: Date | string, t: any, locale: string) => {
	const nextDate = getValidDate(date);
	if (!nextDate) return t('communityDetail.states.dateUnavailable');
	const elapsed = Date.now() - nextDate.getTime();
	const minutes = Math.max(1, Math.floor(elapsed / 60000));
	if (minutes < 60) return t('communityDetail.relative.minute', { count: minutes });
	const hours = Math.floor(minutes / 60);
	if (hours < 24) return t('communityDetail.relative.hour', { count: hours });
	const days = Math.floor(hours / 24);
	if (days < 7) return t('communityDetail.relative.day', { count: days });
	return formatDate(date, locale, t('communityDetail.states.dateUnavailable'));
};

const CommunityDetail: NextPage = ({ initialInput }: T) => {
	const router = useRouter();
	const { t, i18n } = useTranslation('common');
	const user = useReactiveVar(userVar);
	const articleId = typeof router.query.id === 'string' ? router.query.id : '';
	const [boardArticle, setBoardArticle] = useState<BoardArticle | null>(null);
	const [comments, setComments] = useState<Comment[]>([]);
	const [commentTotal, setCommentTotal] = useState(0);
	const [commentText, setCommentText] = useState('');
	const [commentSubmitting, setCommentSubmitting] = useState(false);
	const [likeLoading, setLikeLoading] = useState(false);
	const [editingComment, setEditingComment] = useState<Comment | null>(null);
	const [editedCommentText, setEditedCommentText] = useState('');
	const [searchFilter, setSearchFilter] = useState<CommentsInquiry>(initialInput);

	const [likeTargetBoardArticle] = useMutation(LIKE_TARGET_BOARD_ARTICLE);
	const [createComment] = useMutation(CREATE_COMMENT);
	const [updateComment] = useMutation(UPDATE_COMMENT);

	const {
		loading: articleLoading,
		error: articleError,
		refetch: refetchArticle,
	} = useQuery(GET_BOARD_ARTICLE, {
		fetchPolicy: 'network-only',
		skip: !articleId,
		variables: { input: articleId },
		onCompleted: (data: { getBoardArticle?: BoardArticle }) => setBoardArticle(data.getBoardArticle ?? null),
	});

	const {
		loading: commentsLoading,
		error: commentsError,
		refetch: refetchComments,
	} = useQuery(GET_COMMENTS, {
		fetchPolicy: 'cache-and-network',
		skip: !articleId,
		variables: { input: searchFilter },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: { getComments?: { list: Comment[]; metaCounter?: Array<{ total: number }> } }) => {
			setComments(data.getComments?.list ?? []);
			setCommentTotal(data.getComments?.metaCounter?.[0]?.total ?? 0);
		},
	});

	useEffect(() => {
		if (articleId) {
			setSearchFilter((current) => ({ ...current, page: 1, search: { commentRefId: articleId } }));
		}
	}, [articleId]);

	const likeArticle = async () => {
		try {
			if (!user?._id) throw new Error(t('communityDetail.alerts.signInLike'));
			if (!articleId || likeLoading) return;
			setLikeLoading(true);
			await likeTargetBoardArticle({ variables: { input: articleId } });
			await refetchArticle({ input: articleId });
		} catch (error) {
			await sweetMixinErrorAlert(error instanceof Error ? error.message : t('communityDetail.alerts.likeFailed'));
		} finally {
			setLikeLoading(false);
		}
	};

	const submitComment = async () => {
		try {
			if (!user?._id) throw new Error(t('communityDetail.alerts.signInComment'));
			if (!commentText.trim() || commentSubmitting) return;
			setCommentSubmitting(true);
			const input: CommentInput = {
				commentGroup: CommentGroup.ARTICLE,
				commentRefId: articleId,
				commentContent: commentText.trim(),
			};
			await createComment({ variables: { input } });
			setCommentText('');
			await Promise.all([refetchComments({ input: searchFilter }), refetchArticle({ input: articleId })]);
			await sweetMixinSuccessAlert(t('communityDetail.alerts.commentAdded'));
		} catch (error) {
			await sweetMixinErrorAlert(error instanceof Error ? error.message : t('communityDetail.alerts.commentAddFailed'));
		} finally {
			setCommentSubmitting(false);
		}
	};

	const saveEditedComment = async () => {
		try {
			if (!editingComment || !editedCommentText.trim()) return;
			await updateComment({ variables: { input: { _id: editingComment._id, commentContent: editedCommentText.trim() } } });
			setEditingComment(null);
			await refetchComments({ input: searchFilter });
			await sweetMixinSuccessAlert(t('communityDetail.alerts.commentUpdated'));
		} catch (error) {
			await sweetMixinErrorAlert(error instanceof Error ? error.message : t('communityDetail.alerts.commentUpdateFailed'));
		}
	};

	const deleteComment = async (commentId: string) => {
		if (!(await sweetConfirmAlert(t('communityDetail.alerts.deleteConfirm')))) return;
		try {
			await updateComment({ variables: { input: { _id: commentId, commentStatus: CommentStatus.DELETE } } });
			await Promise.all([refetchComments({ input: searchFilter }), refetchArticle({ input: articleId })]);
		} catch (error) {
			await sweetMixinErrorAlert(error instanceof Error ? error.message : t('communityDetail.alerts.deleteFailed'));
		}
	};

	if (articleLoading || !router.isReady) {
		return (
			<main id="community-detail-page">
				<div className="community-detail-shell community-detail-loading" aria-label={t('communityDetail.states.loadingAria')}>
					<Skeleton width={160} />
					<Skeleton height={72} width="78%" />
					<Skeleton width={310} />
					<Skeleton variant="rounded" height={320} />
					<Skeleton height={25} />
					<Skeleton height={25} />
					<Skeleton height={25} width="85%" />
				</div>
			</main>
		);
	}

	if (articleError || !boardArticle) {
		return (
			<main id="community-detail-page">
				<div className="community-detail-state" role="alert">
					<h1>{t('communityDetail.states.unavailableTitle')}</h1>
					<p>{t('communityDetail.states.unavailableText')}</p>
					<Link href="/community?articleCategory=FREE">{t('communityDetail.states.backToCommunity')}</Link>
				</div>
			</main>
		);
	}

	const categoryLabel = boardArticle.articleCategory ? t(`boardCategory.${boardArticle.articleCategory}`) : t('community.article.fallbackCategory');
	const categoryClass = String(boardArticle.articleCategory || 'community').toLowerCase();
	const articleTitle = boardArticle.articleTitle?.trim() || t('community.article.fallbackTitle');
	const memberImage = boardArticle.memberData?.memberImage
		? `${REACT_APP_API_URL}/${boardArticle.memberData.memberImage}`
		: '/img/profile/defaultUser.svg';
	const memberId = boardArticle.memberData?._id;
	const memberName = boardArticle.memberData?.memberNick ?? t('community.article.fallbackMember');
	const articleImage = boardArticle.articleImage ? `${REACT_APP_API_URL}/${boardArticle.articleImage}` : null;
	const isLiked = Boolean(boardArticle.meLiked?.[0]?.myFavorite);

	return (
		<main id="community-detail-page">
			<div className="community-detail-frame">
				<Link
					href={`/community?articleCategory=${boardArticle.articleCategory}`}
					className="community-detail-back"
				>
					<ArrowBackRoundedIcon aria-hidden="true" /> {t('communityDetail.labels.backToCategory', { category: categoryLabel })}
				</Link>

				<article className="community-detail-shell">
					<header className="community-detail-header">
						<span className={`community-detail-category community-detail-category--${categoryClass}`}>
							{categoryLabel}
						</span>
						<h1>{articleTitle}</h1>
						<div className="community-detail-byline">
							<div className="community-detail-byline__author">
								{memberId ? (
									<Link href={`/member?memberId=${memberId}`} className="community-detail-author">
										<img src={memberImage} alt="" />
										<span>
											<strong>{memberName}</strong>
											<small>{t('communityDetail.labels.published', { date: formatDate(boardArticle.createdAt, i18n.language, t('communityDetail.states.dateUnavailable')) })}</small>
										</span>
									</Link>
								) : (
									<div className="community-detail-author" aria-label={t('community.labels.author')}>
										<img src={memberImage} alt="" />
										<span>
											<strong>{memberName}</strong>
											<small>{t('communityDetail.labels.published', { date: formatDate(boardArticle.createdAt, i18n.language, t('communityDetail.states.dateUnavailable')) })}</small>
										</span>
									</div>
								)}
							</div>
							<div className="community-detail-byline__metrics" aria-label={t('community.labels.engagement')}>
								<span><VisibilityOutlinedIcon aria-hidden="true" /> {boardArticle.articleViews ?? 0}</span>
								<span><ChatBubbleOutlineRoundedIcon aria-hidden="true" /> {boardArticle.articleComments ?? 0}</span>
								<span>
									{isLiked ? <FavoriteRoundedIcon aria-hidden="true" /> : <FavoriteBorderRoundedIcon aria-hidden="true" />}
									{t('communityDetail.labels.likes', { count: boardArticle.articleLikes ?? 0 })}
								</span>
							</div>
						</div>
					</header>

					{articleImage && (
						<img
							className="community-detail-image"
							src={articleImage}
							alt={t('community.article.imageAlt', { title: articleTitle })}
						/>
					)}

					<div className="community-detail-content">
						<ArticleViewer markdown={boardArticle.articleContent ?? ''} />
					</div>

					<div className="community-detail-engagement">
						<button type="button" onClick={likeArticle} disabled={likeLoading} aria-pressed={isLiked}>
							{isLiked ? <FavoriteRoundedIcon aria-hidden="true" /> : <FavoriteBorderRoundedIcon aria-hidden="true" />}
							{isLiked ? t('communityDetail.actions.liked') : t('communityDetail.actions.likeThisArticle')} <span>{boardArticle.articleLikes ?? 0}</span>
						</button>
					</div>
				</article>
			</div>

			<section className="community-comments" aria-labelledby="community-comments-heading">
				<div className="community-comments__heading">
					<div>
						<h2 id="community-comments-heading">{t('communityDetail.labels.commentsTitle', { count: commentTotal })}</h2>
					</div>
				</div>

				<div className="community-comment-form">
					{!user?._id && <p className="community-comment-form__notice">{t('communityDetail.copy.signInToDiscussion')}</p>}
					<label htmlFor="community-comment">{t('communityDetail.labels.addComment')}</label>
					<textarea
						id="community-comment"
						value={commentText}
						maxLength={100}
						onChange={(event) => setCommentText(event.target.value)}
						placeholder={t('communityDetail.copy.commentPlaceholder')}
						disabled={!user?._id || commentSubmitting}
					/>
					<div>
						<span>{t('communityDetail.labels.characterCount', { count: commentText.length })}</span>
						<button type="button" onClick={submitComment} disabled={!commentText.trim() || commentSubmitting || !user?._id}>
							{commentSubmitting ? t('communityDetail.actions.posting') : t('communityDetail.actions.postComment')}
						</button>
					</div>
				</div>

				{commentsLoading && (
					<div className="community-comment-list">
						{Array.from({ length: 3 }).map((_, index) => <Skeleton key={index} height={110} />)}
					</div>
				)}

				{!commentsLoading && commentsError && (
					<div className="community-comments-state" role="alert">
						<p>{t('communityDetail.copy.commentsLoadError')}</p>
						<button type="button" onClick={() => refetchComments({ input: searchFilter })}>{t('community.actions.tryAgain')}</button>
					</div>
				)}

				{!commentsLoading && !commentsError && comments.length === 0 && (
					<div className="community-comments-state">
						<h3>{t('communityDetail.copy.noCommentsTitle')}</h3>
						<p>{t('communityDetail.copy.noCommentsText')}</p>
					</div>
				)}

				{!commentsLoading && !commentsError && comments.length > 0 && (
					<div className="community-comment-list">
						{comments.map((comment) => {
							const commentMemberImage = comment.memberData?.memberImage
								? `${REACT_APP_API_URL}/${comment.memberData.memberImage}`
								: '/img/profile/defaultUser.svg';
							return (
								<article className="community-comment" key={comment._id}>
									<Link href={`/member?memberId=${comment.memberData?._id}`} className="community-comment__author">
										<img src={commentMemberImage} alt="" />
										<span>
											<strong>{comment.memberData?.memberNick ?? t('community.article.fallbackMember')}</strong>
											<time dateTime={new Date(comment.createdAt).toISOString()}>{formatRelativeDate(comment.createdAt, t, i18n.language)}</time>
										</span>
									</Link>
									<p>{comment.commentContent}</p>
									{comment.memberId === user?._id && (
										<div className="community-comment__actions">
											<IconButton
												aria-label={t('communityDetail.labels.editComment')}
												onClick={() => {
													setEditingComment(comment);
													setEditedCommentText(comment.commentContent);
												}}
											>
												<EditOutlinedIcon />
											</IconButton>
											<IconButton aria-label={t('communityDetail.alerts.deleteConfirm')} onClick={() => deleteComment(comment._id)}>
												<DeleteOutlineRoundedIcon />
											</IconButton>
										</div>
									)}
								</article>
							);
						})}
					</div>
				)}

				{commentTotal > searchFilter.limit && (
					<div className="community-comments-pagination">
						<Pagination
							count={Math.ceil(commentTotal / searchFilter.limit)}
							page={searchFilter.page}
							onChange={(_, page) => setSearchFilter((current) => ({ ...current, page }))}
						/>
					</div>
				)}
			</section>

			<Dialog open={Boolean(editingComment)} onClose={() => setEditingComment(null)} fullWidth maxWidth="sm">
				<div className="community-edit-dialog">
					<h2>{t('communityDetail.labels.editComment')}</h2>
					<textarea
						autoFocus
						maxLength={100}
						value={editedCommentText}
						onChange={(event) => setEditedCommentText(event.target.value)}
					/>
					<div>
						<button type="button" className="secondary" onClick={() => setEditingComment(null)}>{t('communityDetail.actions.cancel')}</button>
						<button type="button" onClick={saveEditedComment} disabled={!editedCommentText.trim()}>{t('communityDetail.actions.saveComment')}</button>
					</div>
				</div>
			</Dialog>
		</main>
	);
};

CommunityDetail.defaultProps = {
	initialInput: {
		page: 1,
		limit: 5,
		sort: 'createdAt',
		direction: 'DESC',
		search: { commentRefId: '' },
	},
};

export default withLayoutBasic(CommunityDetail);
