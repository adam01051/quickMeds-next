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

const ArticleViewer = dynamic(() => import('../../libs/components/community/TViewer'), { ssr: false });

export const getStaticProps = async ({ locale }: T) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const CATEGORY_LABELS = {
	FREE: 'Discussions',
	RECOMMEND: 'Recommendations',
	NEWS: 'News',
	HUMOR: 'Community Corner',
};

const formatDate = (date: Date | string) =>
	new Intl.DateTimeFormat('en', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(date));

const formatRelativeDate = (date: Date | string) => {
	const elapsed = Date.now() - new Date(date).getTime();
	const minutes = Math.max(1, Math.floor(elapsed / 60000));
	if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
	const hours = Math.floor(minutes / 60);
	if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
	const days = Math.floor(hours / 24);
	if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;
	return formatDate(date);
};

const CommunityDetail: NextPage = ({ initialInput }: T) => {
	const router = useRouter();
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
			if (!user?._id) throw new Error('Please sign in to like this article.');
			if (!articleId || likeLoading) return;
			setLikeLoading(true);
			await likeTargetBoardArticle({ variables: { input: articleId } });
			await refetchArticle({ input: articleId });
		} catch (error) {
			await sweetMixinErrorAlert(error instanceof Error ? error.message : 'Unable to update this article.');
		} finally {
			setLikeLoading(false);
		}
	};

	const submitComment = async () => {
		try {
			if (!user?._id) throw new Error('Please sign in to join the discussion.');
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
			await sweetMixinSuccessAlert('Comment added.');
		} catch (error) {
			await sweetMixinErrorAlert(error instanceof Error ? error.message : 'Unable to add your comment.');
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
			await sweetMixinSuccessAlert('Comment updated.');
		} catch (error) {
			await sweetMixinErrorAlert(error instanceof Error ? error.message : 'Unable to update your comment.');
		}
	};

	const deleteComment = async (commentId: string) => {
		if (!(await sweetConfirmAlert('Do you want to delete this comment?'))) return;
		try {
			await updateComment({ variables: { input: { _id: commentId, commentStatus: CommentStatus.DELETE } } });
			await Promise.all([refetchComments({ input: searchFilter }), refetchArticle({ input: articleId })]);
		} catch (error) {
			await sweetMixinErrorAlert(error instanceof Error ? error.message : 'Unable to delete your comment.');
		}
	};

	if (articleLoading || !router.isReady) {
		return (
			<main id="community-detail-page">
				<div className="community-detail-shell community-detail-loading" aria-label="Loading article">
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
					<h1>This community article is unavailable.</h1>
					<p>It may have been removed, or the link may be incorrect.</p>
					<Link href="/community?articleCategory=FREE">Back to Community</Link>
				</div>
			</main>
		);
	}

	const categoryLabel = CATEGORY_LABELS[boardArticle.articleCategory];
	const memberImage = boardArticle.memberData?.memberImage
		? `${REACT_APP_API_URL}/${boardArticle.memberData.memberImage}`
		: '/img/profile/defaultUser.svg';
	const articleImage = boardArticle.articleImage ? `${REACT_APP_API_URL}/${boardArticle.articleImage}` : null;
	const isLiked = Boolean(boardArticle.meLiked?.[0]?.myFavorite);

	return (
		<main id="community-detail-page">
			<div className="community-detail-frame">
				<Link
					href={`/community?articleCategory=${boardArticle.articleCategory}`}
					className="community-detail-back"
				>
					<ArrowBackRoundedIcon aria-hidden="true" /> Back to {categoryLabel}
				</Link>

				<article className="community-detail-shell">
					<header className="community-detail-header">
						<span className={`community-detail-category community-detail-category--${boardArticle.articleCategory.toLowerCase()}`}>
							{categoryLabel}
						</span>
						<h1>{boardArticle.articleTitle}</h1>
						<div className="community-detail-byline">
							<div className="community-detail-byline__author">
								<Link href={`/member?memberId=${boardArticle.memberData?._id}`} className="community-detail-author">
									<img src={memberImage} alt="" />
									<span>
										<strong>{boardArticle.memberData?.memberNick ?? 'QuickMeds member'}</strong>
										<small>Published {formatDate(boardArticle.createdAt)}</small>
									</span>
								</Link>
							</div>
							<div className="community-detail-byline__metrics" aria-label="Article engagement">
								<span><VisibilityOutlinedIcon aria-hidden="true" /> {boardArticle.articleViews}</span>
								<span><ChatBubbleOutlineRoundedIcon aria-hidden="true" /> {boardArticle.articleComments}</span>
								<span>
									{isLiked ? <FavoriteRoundedIcon aria-hidden="true" /> : <FavoriteBorderRoundedIcon aria-hidden="true" />}
									{boardArticle.articleLikes} Likes
								</span>
							</div>
						</div>
					</header>

					{articleImage && (
						<img
							className="community-detail-image"
							src={articleImage}
							alt={`Article image for ${boardArticle.articleTitle}`}
						/>
					)}

					<div className="community-detail-content">
						<ArticleViewer markdown={boardArticle.articleContent} />
					</div>

					<div className="community-detail-engagement">
						<button type="button" onClick={likeArticle} disabled={likeLoading} aria-pressed={isLiked}>
							{isLiked ? <FavoriteRoundedIcon aria-hidden="true" /> : <FavoriteBorderRoundedIcon aria-hidden="true" />}
							{isLiked ? 'Liked' : 'Like this article'} <span>{boardArticle.articleLikes}</span>
						</button>
					</div>
				</article>
			</div>

			<section className="community-comments" aria-labelledby="community-comments-heading">
				<div className="community-comments__heading">
					<div>
						<h2 id="community-comments-heading">Comments ({commentTotal})</h2>
					</div>
				</div>

				<div className="community-comment-form">
					{!user?._id && <p className="community-comment-form__notice">Sign in to join this discussion.</p>}
					<label htmlFor="community-comment">Add a comment</label>
					<textarea
						id="community-comment"
						value={commentText}
						maxLength={100}
						onChange={(event) => setCommentText(event.target.value)}
						placeholder="Share a useful, respectful contribution."
						disabled={!user?._id || commentSubmitting}
					/>
					<div>
						<span>{commentText.length}/100</span>
						<button type="button" onClick={submitComment} disabled={!commentText.trim() || commentSubmitting || !user?._id}>
							{commentSubmitting ? 'Posting...' : 'Post comment'}
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
						<p>Comments could not be loaded.</p>
						<button type="button" onClick={() => refetchComments({ input: searchFilter })}>Try again</button>
					</div>
				)}

				{!commentsLoading && !commentsError && comments.length === 0 && (
					<div className="community-comments-state">
						<h3>No comments yet.</h3>
						<p>Start a thoughtful discussion about this article.</p>
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
											<strong>{comment.memberData?.memberNick ?? 'QuickMeds member'}</strong>
											<time dateTime={new Date(comment.createdAt).toISOString()}>{formatRelativeDate(comment.createdAt)}</time>
										</span>
									</Link>
									<p>{comment.commentContent}</p>
									{comment.memberId === user?._id && (
										<div className="community-comment__actions">
											<IconButton
												aria-label="Edit comment"
												onClick={() => {
													setEditingComment(comment);
													setEditedCommentText(comment.commentContent);
												}}
											>
												<EditOutlinedIcon />
											</IconButton>
											<IconButton aria-label="Delete comment" onClick={() => deleteComment(comment._id)}>
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
					<h2>Edit comment</h2>
					<textarea
						autoFocus
						maxLength={100}
						value={editedCommentText}
						onChange={(event) => setEditedCommentText(event.target.value)}
					/>
					<div>
						<button type="button" className="secondary" onClick={() => setEditingComment(null)}>Cancel</button>
						<button type="button" onClick={saveEditedComment} disabled={!editedCommentText.trim()}>Save comment</button>
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
