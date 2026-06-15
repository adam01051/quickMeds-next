import React from 'react';
import Link from 'next/link';
import { IconButton } from '@mui/material';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import HealthAndSafetyOutlinedIcon from '@mui/icons-material/HealthAndSafetyOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';
import { REACT_APP_API_URL } from '../../config';
import { Property } from '../../types/property/property';
import { formatDeliveryFeeUZS } from '../../utils';

interface MyPagePharmacyCardProps {
	pharmacy: Property;
	onRemoveFavorite?: (pharmacyId: string) => Promise<void>;
	removingFavorite?: boolean;
}

const formatPharmacyType = (value: string) =>
	value
		.toLowerCase()
		.replace(/_/g, ' ')
		.replace(/\b\w/g, (letter) => letter.toUpperCase());

const MyPagePharmacyCard = ({ pharmacy, onRemoveFavorite, removingFavorite = false }: MyPagePharmacyCardProps) => {
	const image = pharmacy.pharmacyImages?.[0]
		? `${REACT_APP_API_URL}/${pharmacy.pharmacyImages[0]}`
		: '/img/homepage/pharmacy-hero.webp';
	const status = pharmacy.open24Hours
		? 'Open 24/7'
		: pharmacy.hoursConfigured
			? pharmacy.isOpenNow
				? 'Open now'
				: 'Closed'
			: 'Hours not provided';
	const statusClass = pharmacy.open24Hours || pharmacy.isOpenNow ? 'is-open' : pharmacy.hoursConfigured ? 'is-closed' : 'is-unknown';

	const useFallbackImage = (event: React.SyntheticEvent<HTMLImageElement>) => {
		event.currentTarget.onerror = null;
		event.currentTarget.src = '/img/homepage/pharmacy-hero.webp';
	};

	return (
		<article className="my-page-pharmacy-card">
			<div className="my-page-pharmacy-card__media">
				<img src={image} alt={`${pharmacy.pharmacyName} pharmacy`} onError={useFallbackImage} />
				<span className={`my-page-pharmacy-card__status ${statusClass}`}>
					<AccessTimeRoundedIcon />
					{status}
				</span>
				{onRemoveFavorite && (
					<IconButton
						className="my-page-pharmacy-card__favorite"
						aria-label={`Remove ${pharmacy.pharmacyName} from favorites`}
						disabled={removingFavorite}
						onClick={() => onRemoveFavorite(pharmacy._id)}
					>
						<FavoriteRoundedIcon />
					</IconButton>
				)}
			</div>

			<div className="my-page-pharmacy-card__body">
				<div className="my-page-pharmacy-card__heading">
					<Link href={`/pharmacies/detail?id=${pharmacy._id}`}>{pharmacy.pharmacyName}</Link>
					{pharmacy.verifiedAt && (
						<span title="Verified pharmacy" aria-label="Verified pharmacy">
							<VerifiedRoundedIcon />
						</span>
					)}
				</div>

				<p className="my-page-pharmacy-card__address">
					<LocationOnOutlinedIcon />
					{pharmacy.pharmacyAddress}
				</p>

				<div className="my-page-pharmacy-card__services">
					<span>
						<StorefrontOutlinedIcon />
						{formatPharmacyType(pharmacy.pharmacyType)}
					</span>
					<span>
						<LocalShippingOutlinedIcon />
						{pharmacy.hasDelivery ? `Delivery: ${formatDeliveryFeeUZS(pharmacy.pharmacyDeliveryFee)}` : 'Pickup only'}
					</span>
					<span>
						<HealthAndSafetyOutlinedIcon />
						{pharmacy.acceptsInsurance ? 'Insurance accepted' : 'Insurance not accepted'}
					</span>
				</div>

				<Link className="my-page-pharmacy-card__action" href={`/pharmacies/detail?id=${pharmacy._id}`}>
					View pharmacy
					<ArrowForwardRoundedIcon />
				</Link>
			</div>
		</article>
	);
};

export default MyPagePharmacyCard;
