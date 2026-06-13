import React, { useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { GET_PHARMACIES } from '../../../apollo/user/query';
import { LIKE_TARGET_PHARMACY } from '../../../apollo/user/mutation';
import { userVar } from '../../../apollo/store';
import { PharmaciesInquiry } from '../../types/property/property.input';
import { Property } from '../../types/property/property';
import { T } from '../../types/common';
import { Message } from '../../enums/common.enum';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../sweetAlert';
import HomePharmacyCard from './HomePharmacyCard';

interface HomePharmacySectionProps {
	title: string;
	description: string;
	initialInput: PharmaciesInquiry;
	tone?: 'default' | 'soft';
}

const HomePharmacySection = ({ title, description, initialInput, tone = 'default' }: HomePharmacySectionProps) => {
	const user = useReactiveVar(userVar);
	const [pharmacies, setPharmacies] = useState<Property[]>([]);
	const [likeTargetPharmacy] = useMutation(LIKE_TARGET_PHARMACY);
	const { loading, error, refetch } = useQuery(GET_PHARMACIES, {
		fetchPolicy: 'cache-and-network',
		variables: { input: initialInput },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => setPharmacies(data?.getPharmacies?.list ?? []),
	});

	const favoritePharmacy = async (pharmacyId: string) => {
		try {
			if (!user._id) throw new Error(Message.SOMETHING_WENT_WRONG);
			await likeTargetPharmacy({ variables: { input: pharmacyId } });
			await refetch({ input: initialInput });
			await sweetTopSmallSuccessAlert('success', 800);
		} catch (caughtError) {
			const message = caughtError instanceof Error ? caughtError.message : Message.SOMETHING_WENT_WRONG;
			await sweetMixinErrorAlert(message);
		}
	};

	return (
		<section className={`home-discovery-section home-discovery-section--${tone}`}>
			<div className="home-shell">
				<header className="home-section-heading">
					<div>
						<h2>{title}</h2>
						<p>{description}</p>
					</div>
					<Link href="/pharmacies">
						Browse all pharmacies
						<ArrowForwardRoundedIcon />
					</Link>
				</header>
				{loading && pharmacies.length === 0 ? (
					<div className="home-pharmacy-grid" aria-label={`Loading ${title}`}>
						{[0, 1, 2].map((item) => <div className="home-pharmacy-skeleton" key={item} />)}
					</div>
				) : error ? (
					<div className="home-section-state">
						<strong>Pharmacies could not be loaded.</strong>
						<button type="button" onClick={() => refetch({ input: initialInput })}>Try again</button>
					</div>
				) : pharmacies.length === 0 ? (
					<div className="home-section-state">
						<strong>No pharmacies are available yet.</strong>
						<span>Try browsing all pharmacies or searching another area.</span>
					</div>
				) : (
					<div className="home-pharmacy-grid">
						{pharmacies.slice(0, 3).map((pharmacy) => (
							<HomePharmacyCard pharmacy={pharmacy} onFavorite={favoritePharmacy} key={pharmacy._id} />
						))}
					</div>
				)}
			</div>
		</section>
	);
};

export default HomePharmacySection;
