import React from 'react';
import Link from 'next/link';
import { BoardArticle } from '../../types/board-article/board-article';
import { REACT_APP_API_URL } from '../../config';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';

const CATEGORY_LABELS = {
	FREE: 'Discussions',
	RECOMMEND: 'Recommendations',
	NEWS: 'News',
	HUMOR: 'Community Corner',
};

interface CommunityArticleRowProps {
	article: BoardArticle;
	likeLoading: boolean;
	onLike: (articleId: string) => Promise<void>;
}

const getExcerpt = (content: string) => {
	if (!content) return 'Open this article to read the full community contribution.';

	const plainText =
		typeof document === 'undefined'
			? content.replace(/<[^>]*>/g, ' ')
			: (() => {
					const container = document.createElement('div');
					container.innerHTML = content;
					return container.textContent ?? '';
				})();

	const normalized = plainText.replace(/\s+/g, ' ').trim();
	return normalized.length > 210 ? `${normalized.slice(0, 207).trimEnd()}...` : normalized;
};

const CommunityArticleRow = ({ article, likeLoading, onLike }: CommunityArticleRowProps) => {
	const articleHref = `/community/detail?articleCategory=${article.articleCategory}&id=${article._id}`;
	const articleImage = article.articleImage ? `${REACT_APP_API_URL}/${article.articleImage}` : null;
	const title = article.articleTitle?.trim() || 'Untitled community article';
	const categoryClass = String(article.articleCategory || 'community').toLowerCase();
	const categoryLabel = CATEGORY_LABELS[article.articleCategory] ?? 'Community';
	const createdAt = article.createdAt ? new Date(article.createdAt) : null;
	const hasValidDate = createdAt !== null && !Number.isNaN(createdAt.getTime());
	const memberImage = article.memberData?.memberImage
		? `${REACT_APP_API_URL}/${article.memberData.memberImage}`
		: '/img/profile/defaultUser.svg';
	const memberId = article.memberData?._id;
	const memberName = article.memberData?.memberNick ?? 'QuickMeds member';
	const isLiked = Boolean(article.meLiked?.[0]?.myFavorite);

	return (
		<article className={`community-article-row ${articleImage ? 'community-article-row--with-image' : ''}`}>
			<div className="community-article-row__content">
				<div className="community-article-row__eyebrow">
					<span className={`community-category community-category--${categoryClass}`}>
						{categoryLabel}
					</span>
					{hasValidDate && (
						<time dateTime={createdAt.toISOString()}>
							{new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(createdAt)}
						</time>
					)}
				</div>

				<Link href={articleHref} className="community-article-row__title">
					{title}
				</Link>
				<p className="community-article-row__excerpt">{getExcerpt(article.articleContent)}</p>

				<div className="community-article-row__footer">
					{memberId ? (
						<Link href={`/member?memberId=${memberId}`} className="community-article-row__author">
							<img src={memberImage} alt="" />
							<span>{memberName}</span>
						</Link>
					) : (
						<div className="community-article-row__author" aria-label="Article author">
							<img src={memberImage} alt="" />
							<span>{memberName}</span>
						</div>
					)}

					<div className="community-article-row__metrics" aria-label="Article engagement">
						<span title="Views">
							<VisibilityOutlinedIcon aria-hidden="true" />
							{article.articleViews ?? 0}
						</span>
						<button
							type="button"
							onClick={() => onLike(article._id)}
							disabled={likeLoading}
							aria-label={isLiked ? 'Unlike article' : 'Like article'}
							aria-pressed={isLiked}
						>
							{isLiked ? <FavoriteRoundedIcon aria-hidden="true" /> : <FavoriteBorderRoundedIcon aria-hidden="true" />}
							{article.articleLikes ?? 0}
						</button>
						<span title="Comments">
							<ChatBubbleOutlineRoundedIcon aria-hidden="true" />
							{article.articleComments ?? 0}
						</span>
					</div>

					<Link href={articleHref} className="community-article-row__read">
						Read article <ArrowForwardRoundedIcon aria-hidden="true" />
					</Link>
				</div>
			</div>

			{articleImage && (
				<Link href={articleHref} className="community-article-row__image" aria-label={`Read ${title}`}>
					<img src={articleImage} alt={`Article image for ${title}`} loading="lazy" />
				</Link>
			)}
		</article>
	);
};

export default CommunityArticleRow;
