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
import { useTranslation } from 'next-i18next';

export const getStaticProps = async ({ locale }: T) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const CATEGORIES: Array<{ value: BoardArticleCategory }> = [
	{ value: BoardArticleCategory.FREE },
	{ value: BoardArticleCategory.RECOMMEND },
	{ value: BoardArticleCategory.NEWS },
	{ value: BoardArticleCategory.HUMOR },
];

const SORTS = [
	{ value: 'createdAt', labelKey: 'newest' },
	{ value: 'articleViews', labelKey: 'mostViewed' },
	{ value: 'articleLikes', labelKey: 'mostLiked' },
];

const getRouteCategory = (articleCategory: string | string[] | undefined): BoardArticleCategory | null => {
	const value = Array.isArray(articleCategory) ? articleCategory[0] : articleCategory;
	return CATEGORIES.some((category) => category.value === value) ? (value as BoardArticleCategory) : null;
};

const getCommunityErrorMessage = (message: string | undefined, t: any) => {
	if (!message) return t('community.states.noResponse');
	if (/failed to fetch|network|econnrefused|socket|connect/i.test(message)) {
		return t('community.states.apiUnreachable');
	}
	return message;
};

const Community: NextPage = ({ initialInput }: T) => {
	const router = useRouter();
	const { t } = useTranslation('common');
	const user = useReactiveVar(userVar);
	const routeCategory = getRouteCategory(router.query.articleCategory);
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
	const activeCategoryLabel = activeCategory ? t(`boardCategory.${activeCategory}`) : t('community.labels.articles');
	const errorMessage = getCommunityErrorMessage(error?.message, t);

	useEffect(() => {
		if (!router.isReady) return;

		const nextCategory = routeCategory ?? BoardArticleCategory.FREE;
		setSearchCommunity((current) =>
			current.search.articleCategory === nextCategory
				? current
				: { ...current, page: 1, search: { articleCategory: nextCategory } },
		);

		if (!routeCategory) {
			void router.replace(
				{ pathname: '/community', query: { articleCategory: BoardArticleCategory.FREE } },
				undefined,
				{ shallow: true },
			);
		}
	}, [routeCategory, router]);

	const changeCategory = async (category: BoardArticleCategory) => {
		setSearchCommunity((current) => ({ ...current, page: 1, search: { articleCategory: category } }));
		await router.push({ pathname: '/community', query: { articleCategory: category } }, undefined, { shallow: true });
	};

	const likeArticle = async (articleId: string) => {
		try {
			if (!user?._id) throw new Error(t('communityDetail.alerts.signInLike'));
			if (likeLoadingId) return;
			setLikeLoadingId(articleId);
			await likeTargetBoardArticle({ variables: { input: articleId } });
			await refetch({ input: searchCommunity });
		} catch (likeError) {
			const message = likeError instanceof Error ? likeError.message : t('communityDetail.alerts.likeFailed');
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
						<p className="community-intro__eyebrow">{t('community.intro.eyebrow')}</p>
						<h1>{t('community.intro.title')}</h1>
						<p>{t('community.intro.description')}</p>
					</div>
					{user?._id && (
						<Link href="/mypage?category=writeArticle" className="community-write-action">
							<EditOutlinedIcon aria-hidden="true" /> {t('community.actions.writeArticle')}
						</Link>
					)}
				</header>

				<nav className="community-tabs" aria-label={t('community.labels.categoriesAria')}>
					{CATEGORIES.map(({ value }) => (
						<button
							type="button"
							key={value}
							onClick={() => changeCategory(value)}
							className={activeCategory === value ? 'active' : ''}
							aria-current={activeCategory === value ? 'page' : undefined}
						>
							{t(`boardCategory.${value}`)}
						</button>
					))}
				</nav>

				<section className="community-feed" aria-labelledby="community-feed-heading">
					<div className="community-feed__toolbar">
						<h2 id="community-feed-heading">
							{activeCategoryLabel} <span>({t('community.labels.results', { count: totalCount })})</span>
						</h2>
						<label>
							<span className="sr-only">{t('sort.sortArticles')}</span>
							<select
								value={searchCommunity.sort}
								onChange={(event) =>
									setSearchCommunity((current) => ({ ...current, page: 1, sort: event.target.value }))
								}
							>
								{SORTS.map(({ value, labelKey }) => (
									<option value={value} key={value}>
										{t(`sort.${labelKey}`)}
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
								<h3>{t('community.states.loadErrorTitle')}</h3>
								<p>{errorMessage}</p>
								<button type="button" onClick={() => refetch({ input: searchCommunity })}>
									{t('community.actions.tryAgain')}
								</button>
							</div>
						)}

						{!loading && !error && boardArticles.length === 0 && (
							<div className="community-state">
								<h3>{t('community.states.emptyTitle', { category: activeCategoryLabel.toLowerCase() })}</h3>
								<p>{t('community.states.emptyText')}</p>
								{user?._id && <Link href="/mypage?category=writeArticle">{t('community.actions.writeFirstArticle')}</Link>}
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
					<div className="community-pagination" aria-label={t('community.labels.articlePagesAria')}>
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
