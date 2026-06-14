import React from 'react';
import Link from 'next/link';
import IconButton from '@mui/material/IconButton';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import HealthAndSafetyOutlinedIcon from '@mui/icons-material/HealthAndSafetyOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { REACT_APP_API_URL } from '../../config';
import { Property } from '../../types/property/property';
import { T } from '../../types/common';
import { formatDeliveryFeeUZS } from '../../utils';

interface CatalogPharmacyCardProps {
	pharmacy: Property;
	onFavorite: (user: T, pharmacyId: string) => void;
}

const formatPharmacyType = (type: string) =>
	type
		.toLowerCase()
		.replace(/_/g, ' ')
		.replace(/\b\w/g, (letter) => letter.toUpperCase());

const CatalogPharmacyCard = ({ pharmacy, onFavorite }: CatalogPharmacyCardProps) => {
	const user = useReactiveVar(userVar);
	const isFavorite = pharmacy.meLiked?.[0]?.myFavorite === true;
	const status = pharmacy.open24Hours
		? 'Open 24/7'
		: pharmacy.hoursConfigured
			? pharmacy.isOpenNow
				? 'Open now'
				: 'Closed'
			: 'Hours not provided';
	const statusClass = pharmacy.open24Hours || pharmacy.isOpenNow ? 'is-open' : pharmacy.hoursConfigured ? 'is-closed' : 'is-unknown';
	const delivery = pharmacy.hasDelivery ? formatDeliveryFeeUZS(pharmacy.pharmacyDeliveryFee) : 'Pickup only';
	const image = pharmacy.pharmacyImages?.[0]
		? `${REACT_APP_API_URL}/${pharmacy.pharmacyImages[0]}`
		: '/img/homepage/pharmacy-hero.webp';

	const useFallbackImage = (event: React.SyntheticEvent<HTMLImageElement>) => {
		event.currentTarget.onerror = null;
		event.currentTarget.src = '/img/homepage/pharmacy-hero.webp';
	};

	return (
		<article className="catalog-pharmacy-card">
			<div className="catalog-pharmacy-card__media">
				<Link href={`/pharmacies/detail?id=${pharmacy._id}`} aria-label={`View ${pharmacy.pharmacyName}`}>
					<img src={image} alt={`${pharmacy.pharmacyName} pharmacy`} onError={useFallbackImage} />
				</Link>
				<span className={`catalog-pharmacy-card__status ${statusClass}`}>
					<AccessTimeRoundedIcon />
					{status}
				</span>
				<IconButton
					className="catalog-pharmacy-card__favorite"
					aria-label={isFavorite ? `Remove ${pharmacy.pharmacyName} from favorites` : `Save ${pharmacy.pharmacyName}`}
					onClick={() => onFavorite(user, pharmacy._id)}
				>
					{isFavorite ? <FavoriteRoundedIcon /> : <FavoriteBorderRoundedIcon />}
				</IconButton>
			</div>

			<div className="catalog-pharmacy-card__body">
				<div className="catalog-pharmacy-card__heading">
					<h2>{pharmacy.pharmacyName}</h2>
					{pharmacy.verifiedAt && (
						<span title="Verified pharmacy" aria-label="Verified pharmacy">
							<VerifiedRoundedIcon />
						</span>
					)}
				</div>

				<p className="catalog-pharmacy-card__address">
					<LocationOnOutlinedIcon />
					{pharmacy.pharmacyAddress}
				</p>

				<dl className="catalog-pharmacy-card__facts">
					<div>
						<dt>Type</dt>
						<dd>{formatPharmacyType(pharmacy.pharmacyType)}</dd>
					</div>
					<div>
						<dt>Delivery</dt>
						<dd>{delivery}</dd>
					</div>
					<div>
						<dt>Insurance</dt>
						<dd>
							<HealthAndSafetyOutlinedIcon />
							{pharmacy.acceptsInsurance ? 'Accepted' : 'Not accepted'}
						</dd>
					</div>
				</dl>

				<Link className="catalog-pharmacy-card__action" href={`/pharmacies/detail?id=${pharmacy._id}`}>
					View pharmacy
					<ArrowForwardRoundedIcon />
				</Link>
			</div>
		</article>
	);
};

export default CatalogPharmacyCard;
