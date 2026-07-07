import React, { useState } from 'react';
import { NextPage } from 'next';
import { Pagination } from '@mui/material';
import { useQuery } from '@apollo/client';
import { GET_VISITED } from '../../../apollo/user/query';
import { T } from '../../types/common';
import { Property } from '../../types/property/property';
import MyPagePharmacyCard from './MyPagePharmacyCard';
import { useTranslation } from 'next-i18next';

const RecentlyVisited: NextPage = () => {
	const { t } = useTranslation('common');
	const [recentlyVisited, setRecentlyVisited] = useState<Property[]>([]);
	const [total, setTotal] = useState(0);
	const [searchVisited, setSearchVisited] = useState<T>({ page: 1, limit: 6 });

	const { loading, error, refetch } = useQuery(GET_VISITED, {
		fetchPolicy: 'network-only',
		variables: { input: searchVisited },
		notifyOnNetworkStatusChange: true,
		onCompleted(data: T) {
			setRecentlyVisited(data.getVisited?.list ?? []);
			setTotal(data.getVisited?.metaCounter?.[0]?.total ?? 0);
		},
	});

	return (
		<section id="recently-visited-page" className="my-page-pharmacy-collection" aria-label={t('mypage.collections.visitedAria')}>
			{loading && !recentlyVisited.length ? (
				<div className="my-page-pharmacy-grid" aria-label={t('mypage.collections.visitedLoading')}>
					{Array.from({ length: 3 }).map((_, index) => <div className="my-page-pharmacy-card-skeleton" key={index} />)}
				</div>
			) : error ? (
				<div className="my-page-collection-state" role="alert">
					<h2>{t('mypage.collections.visitedLoadError')}</h2>
					<p>{t('mypage.collections.connectionError')}</p>
					<button type="button" onClick={() => refetch({ input: searchVisited })}>{t('pharmacies.states.tryAgain')}</button>
				</div>
			) : recentlyVisited.length ? (
				<div className="my-page-pharmacy-grid">
					{recentlyVisited.map((pharmacy) => <MyPagePharmacyCard key={pharmacy._id} pharmacy={pharmacy} />)}
				</div>
			) : (
				<div className="my-page-collection-state">
					<h2>{t('mypage.collections.visitedEmptyTitle')}</h2>
					<p>{t('mypage.collections.visitedEmptyText')}</p>
					<a href="/pharmacies">{t('mypage.collections.explorePharmacies')}</a>
				</div>
			)}

			{recentlyVisited.length > 0 && (
				<div className="my-page-collection-pagination">
					<Pagination
						count={Math.ceil(total / searchVisited.limit)}
						page={searchVisited.page}
						shape="rounded"
						onChange={(_, page) => setSearchVisited({ ...searchVisited, page })}
					/>
					<p>{t('mypage.collections.visitedCount', { count: total })}</p>
				</div>
			)}
		</section>
	);
};

export default RecentlyVisited;
