import React, { useState } from 'react';
import { NextPage } from 'next';
import { Pagination } from '@mui/material';
import { useQuery } from '@apollo/client';
import { GET_VISITED } from '../../../apollo/user/query';
import { T } from '../../types/common';
import { Property } from '../../types/property/property';
import MyPagePharmacyCard from './MyPagePharmacyCard';

const RecentlyVisited: NextPage = () => {
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
		<section id="recently-visited-page" className="my-page-pharmacy-collection" aria-label="Recently visited pharmacies">
			{loading && !recentlyVisited.length ? (
				<div className="my-page-pharmacy-grid" aria-label="Loading recently visited pharmacies">
					{Array.from({ length: 3 }).map((_, index) => <div className="my-page-pharmacy-card-skeleton" key={index} />)}
				</div>
			) : error ? (
				<div className="my-page-collection-state" role="alert">
					<h2>Recently visited pharmacies could not be loaded</h2>
					<p>Please check your connection and try again.</p>
					<button type="button" onClick={() => refetch({ input: searchVisited })}>Try again</button>
				</div>
			) : recentlyVisited.length ? (
				<div className="my-page-pharmacy-grid">
					{recentlyVisited.map((pharmacy) => <MyPagePharmacyCard key={pharmacy._id} pharmacy={pharmacy} />)}
				</div>
			) : (
				<div className="my-page-collection-state">
					<h2>No recently visited pharmacies</h2>
					<p>Pharmacies you view will appear here for quick access.</p>
					<a href="/pharmacies">Explore pharmacies</a>
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
					<p>{total} recently visited {total === 1 ? 'pharmacy' : 'pharmacies'}</p>
				</div>
			)}
		</section>
	);
};

export default RecentlyVisited;
