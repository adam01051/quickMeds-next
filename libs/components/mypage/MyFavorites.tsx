import React, { useState } from 'react';
import { NextPage } from 'next';
import { Pagination } from '@mui/material';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { GET_FAVORITES } from '../../../apollo/user/query';
import { LIKE_TARGET_PHARMACY } from '../../../apollo/user/mutation';
import { userVar } from '../../../apollo/store';
import { Messages } from '../../config';
import { T } from '../../types/common';
import { Property } from '../../types/property/property';
import { sweetMixinErrorAlert } from '../../sweetAlert';
import MyPagePharmacyCard from './MyPagePharmacyCard';

const MyFavorites: NextPage = () => {
	const user = useReactiveVar(userVar);
	const [myFavorites, setMyFavorites] = useState<Property[]>([]);
	const [total, setTotal] = useState(0);
	const [removingId, setRemovingId] = useState<string | null>(null);
	const [searchFavorites, setSearchFavorites] = useState<T>({ page: 1, limit: 6 });
	const [likeTargetPharmacy] = useMutation(LIKE_TARGET_PHARMACY);

	const { loading, error, refetch } = useQuery(GET_FAVORITES, {
		fetchPolicy: 'network-only',
		variables: { input: searchFavorites },
		notifyOnNetworkStatusChange: true,
		onCompleted(data: T) {
			setMyFavorites(data.getFavorites?.list ?? []);
			setTotal(data.getFavorites?.metaCounter?.[0]?.total ?? 0);
		},
	});

	const removeFavorite = async (id: string) => {
		try {
			if (!user._id) throw new Error(Messages.error2);
			setRemovingId(id);
			await likeTargetPharmacy({ variables: { input: id } });
			await refetch({ input: searchFavorites });
		} catch (err: any) {
			await sweetMixinErrorAlert(err.message);
		} finally {
			setRemovingId(null);
		}
	};

	return (
		<section id="my-favorites-page" className="my-page-pharmacy-collection" aria-label="Favorite pharmacies">
			{loading && !myFavorites.length ? (
				<div className="my-page-pharmacy-grid" aria-label="Loading favorite pharmacies">
					{Array.from({ length: 3 }).map((_, index) => <div className="my-page-pharmacy-card-skeleton" key={index} />)}
				</div>
			) : error ? (
				<div className="my-page-collection-state" role="alert">
					<h2>Favorites could not be loaded</h2>
					<p>Please check your connection and try again.</p>
					<button type="button" onClick={() => refetch({ input: searchFavorites })}>Try again</button>
				</div>
			) : myFavorites.length ? (
				<div className="my-page-pharmacy-grid">
					{myFavorites.map((pharmacy) => (
						<MyPagePharmacyCard
							key={pharmacy._id}
							pharmacy={pharmacy}
							onRemoveFavorite={removeFavorite}
							removingFavorite={removingId === pharmacy._id}
						/>
					))}
				</div>
			) : (
				<div className="my-page-collection-state">
					<h2>No favorite pharmacies yet</h2>
					<p>Save pharmacies while browsing to find them here later.</p>
					<a href="/pharmacies">Find pharmacies</a>
				</div>
			)}

			{myFavorites.length > 0 && (
				<div className="my-page-collection-pagination">
					<Pagination
						count={Math.ceil(total / searchFavorites.limit)}
						page={searchFavorites.page}
						shape="rounded"
						onChange={(_, page) => setSearchFavorites({ ...searchFavorites, page })}
					/>
					<p>{total} favorite {total === 1 ? 'pharmacy' : 'pharmacies'}</p>
				</div>
			)}
		</section>
	);
};

export default MyFavorites;
