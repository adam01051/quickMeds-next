import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Pagination, Skeleton } from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import CommunityArticleRow from '../../libs/components/community/CommunityArticleRow';
import { BoardArticle } from '../../libs/types/board-article/board-article';
import { BoardArticlesInquiry } from '../../libs/types/board-article/board-article.input';
import { BoardArticleCategory } from '../../libs/enums/board-article.enum';
import { Direction } from '../../libs/enums/common.enum';
import { T } from '../../libs/types/common';
import { userVar } from '../../apollo/store';
import { LIKE_TARGET_BOARD_ARTICLE } from '../../apollo/user/mutation';
import { GET_BOARD_ARTICLES } from '../../apollo/user/query';
import { sweetMixinErrorAlert } from '../../libs/sweetAlert';

export const getStaticProps = async ({ locale }: T) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const CATEGORIES: Array<{ value: BoardArticleCategory; label: string }> = [
	{ value: BoardArticleCategory.FREE, label: 'Discussions' },
	{ value: BoardArticleCategory.RECOMMEND, label: 'Recommendations' },
	{ value: BoardArticleCategory.NEWS, label: 'News' },
	{ value: BoardArticleCategory.HUMOR, label: 'Community Corner' },
];

const SORTS = [
	{ value: 'createdAt', label: 'Newest' },
	{ value: 'articleViews', label: 'Most viewed' },
	{ value: 'articleLikes', label: 'Most liked' },
];

const Community: NextPage = ({ initialInput }: T) => {
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const routeCategory = router.query.articleCategory as BoardArticleCategory | undefined;
	const [searchCommunity, setSearchCommunity] = useState<BoardArticlesInquiry>(initialInput);
	const [likeLoadingId, setLikeLoadingId] = useState<string | null>(null);
	const [likeTargetBoardArticle] = useMutation(LIKE_TARGET_BOARD_ARTICLE);

	const { loading, data, error, refetch } = useQuery(GET_BOARD_ARTICLES, {
		fetchPolicy: 'network-only',
		variables: { input: searchCommunity },
		notifyOnNetworkStatusChange: true,
	});

	const boardArticles: BoardArticle[] = data?.getBoardArticles?.list ?? [];
	const totalCount = data?.getBoardArticles?.metaCounter?.[0]?.total ?? 0;
	const activeCategory = searchCommunity.search.articleCategory;
	const activeCategoryLabel = CATEGORIES.find(({ value }) => value === activeCategory)?.label ?? 'Articles';

	useEffect(() => {
		const validCategory = CATEGORIES.some(({ value }) => value === routeCategory);
		const nextCategory: BoardArticleCategory = validCategory ? routeCategory! : BoardArticleCategory.FREE;

		if (nextCategory !== searchCommunity.search.articleCategory) {
			setSearchCommunity((current) => ({ ...current, page: 1, search: { articleCategory: nextCategory } }));
		}

		if (!validCategory && router.isReady) {
			void router.replace(
				{ pathname: '/community', query: { articleCategory: BoardArticleCategory.FREE } },
				undefined,
				{ shallow: true },
			);
		}
	}, [routeCategory, router.isReady]);

	const changeCategory = async (category: BoardArticleCategory) => {
		setSearchCommunity((current) => ({ ...current, page: 1, search: { articleCategory: category } }));
		await router.push({ pathname: '/community', query: { articleCategory: category } }, undefined, { shallow: true });
	};

	const likeArticle = async (articleId: string) => {
		try {
			if (!user?._id) throw new Error('Please sign in to like an article.');
			if (likeLoadingId) return;
			setLikeLoadingId(articleId);
			await likeTargetBoardArticle({ variables: { input: articleId } });
			await refetch({ input: searchCommunity });
		} catch (likeError) {
			const message = likeError instanceof Error ? likeError.message : 'Unable to update this article.';
			await sweetMixinErrorAlert(message);
		} finally {
			setLikeLoadingId(null);
		}
	};

	return (
		<main id="community-list-page">
			<div className="container community-shell">
				<header className="community-intro">
					<div>
						<p className="community-intro__eyebrow">QuickMeds Community</p>
						<h1>Practical knowledge, shared locally.</h1>
						<p>Discover useful pharmacy information and share experiences that help communities across Uzbekistan.</p>
					</div>
					{user?._id && (
						<Link href="/mypage?category=writeArticle" className="community-write-action">
							<EditOutlinedIcon aria-hidden="true" /> Write an article
						</Link>
					)}
				</header>

				<nav className="community-tabs" aria-label="Community categories">
					{CATEGORIES.map(({ value, label }) => (
						<button
							type="button"
							key={value}
							onClick={() => changeCategory(value)}
							className={activeCategory === value ? 'active' : ''}
							aria-current={activeCategory === value ? 'page' : undefined}
						>
							{label}
						</button>
					))}
				</nav>

				<section className="community-feed" aria-labelledby="community-feed-heading">
					<div className="community-feed__toolbar">
						<h2 id="community-feed-heading">
							{activeCategoryLabel} <span>({totalCount} results)</span>
						</h2>
						<label>
							<span className="sr-only">Sort articles</span>
							<select
								value={searchCommunity.sort}
								onChange={(event) =>
									setSearchCommunity((current) => ({ ...current, page: 1, sort: event.target.value }))
								}
							>
								{SORTS.map(({ value, label }) => (
									<option value={value} key={value}>
										{label}
									</option>
								))}
							</select>
						</label>
					</div>

					<div className="community-feed__list" aria-live="polite">
						{loading &&
							Array.from({ length: 4 }).map((_, index) => (
								<div className="community-article-skeleton" key={index}>
									<div>
										<Skeleton width={180} />
										<Skeleton height={35} width="70%" />
										<Skeleton height={22} width="92%" />
										<Skeleton height={22} width="75%" />
									</div>
									<Skeleton variant="rounded" width={210} height={132} />
								</div>
							))}

						{!loading && error && (
							<div className="community-state" role="alert">
								<h3>We could not load the community articles.</h3>
								<p>Please check your connection and try again.</p>
								<button type="button" onClick={() => refetch({ input: searchCommunity })}>
									Try again
								</button>
							</div>
						)}

						{!loading && !error && boardArticles.length === 0 && (
							<div className="community-state">
								<h3>No {activeCategoryLabel.toLowerCase()} yet.</h3>
								<p>Community contributions in this category will appear here.</p>
								{user?._id && <Link href="/mypage?category=writeArticle">Write the first article</Link>}
							</div>
						)}

						{!loading &&
							!error &&
							boardArticles.map((article) => (
								<CommunityArticleRow
									key={article._id}
									article={article}
									likeLoading={likeLoadingId === article._id}
									onLike={likeArticle}
								/>
							))}
					</div>
				</section>

				{totalCount > searchCommunity.limit && (
					<div className="community-pagination" aria-label="Community article pages">
						<Pagination
							count={Math.ceil(totalCount / searchCommunity.limit)}
							page={searchCommunity.page}
							onChange={(_, page) => setSearchCommunity((current) => ({ ...current, page }))}
						/>
					</div>
				)}
			</div>
		</main>
	);
};

Community.defaultProps = {
	initialInput: {
		page: 1,
		limit: 6,
		sort: 'createdAt',
		direction: Direction.DESC,
		search: { articleCategory: BoardArticleCategory.FREE },
	},
};

export default withLayoutBasic(Community);
