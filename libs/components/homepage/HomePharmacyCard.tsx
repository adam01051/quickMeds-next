import React from 'react';
import Link from 'next/link';
import { IconButton } from '@mui/material';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import HealthAndSafetyOutlinedIcon from '@mui/icons-material/HealthAndSafetyOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { Property } from '../../types/property/property';
import { REACT_APP_API_URL } from '../../config';
import { formatterStr } from '../../utils';

interface HomePharmacyCardProps {
	pharmacy: Property;
	onFavorite: (pharmacyId: string) => void;
}

const HomePharmacyCard = ({ pharmacy, onFavorite }: HomePharmacyCardProps) => {
	const image = pharmacy.pharmacyImages?.[0]
		? `${REACT_APP_API_URL}/${pharmacy.pharmacyImages[0]}`
		: '/img/banner/header1.svg';
	const isFavorite = pharmacy.meLiked?.[0]?.myFavorite === true;
	const deliveryFee = pharmacy.pharmacyDeliveryFee > 0 ? `${formatterStr(pharmacy.pharmacyDeliveryFee)} UZS` : 'Free';
	const useFallbackImage = (event: React.SyntheticEvent<HTMLImageElement>) => {
		event.currentTarget.onerror = null;
		event.currentTarget.src = '/img/banner/header1.svg';
	};

	return (
		<article className="home-pharmacy-card">
			<div className="home-pharmacy-card__media">
				<Link href={`/pharmacies/detail?id=${pharmacy._id}`} className="home-pharmacy-card__image-link">
					<img src={image} alt={`${pharmacy.pharmacyName} pharmacy`} className="home-pharmacy-card__image" onError={useFallbackImage} />
				</Link>
				<IconButton
					className="home-pharmacy-card__favorite"
					aria-label={isFavorite ? `Remove ${pharmacy.pharmacyName} from favorites` : `Save ${pharmacy.pharmacyName}`}
					onClick={() => onFavorite(pharmacy._id)}
				>
					{isFavorite ? <FavoriteRoundedIcon /> : <FavoriteBorderRoundedIcon />}
				</IconButton>
			</div>
			<div className="home-pharmacy-card__body">
				<div className="home-pharmacy-card__heading">
					<div>
						<div className="home-pharmacy-card__name-row">
							<h3>{pharmacy.pharmacyName}</h3>
							{pharmacy.verifiedAt && (
								<span className="home-pharmacy-card__verified" title="Verified pharmacy" aria-label="Verified pharmacy">
									<VerifiedRoundedIcon />
								</span>
							)}
						</div>
						<p><LocationOnOutlinedIcon /> {pharmacy.pharmacyAddress}</p>
					</div>
				</div>
				<div className="home-pharmacy-card__services">
					<span className={pharmacy.hoursConfigured && !pharmacy.isOpenNow ? 'is-muted' : ''}>
						<AccessTimeRoundedIcon />
						{pharmacy.open24Hours ? 'Open 24/7' : pharmacy.hoursConfigured ? (pharmacy.isOpenNow ? 'Open now' : 'Closed') : 'Hours not provided'}
					</span>
					<span>
						<StorefrontOutlinedIcon />
						{pharmacy.pharmacyType.toLowerCase()}
					</span>
					{pharmacy.hasDelivery && <span>
						<LocalShippingOutlinedIcon />
						Delivery
					</span>}
					{pharmacy.acceptsInsurance && <span>
						<HealthAndSafetyOutlinedIcon />
						Insurance
					</span>}
				</div>
				<div className="home-pharmacy-card__footer">
					<div>
						<span>{pharmacy.hasDelivery ? 'Delivery fee' : 'Service'}</span>
						<strong>{pharmacy.hasDelivery ? deliveryFee : 'Pickup only'}</strong>
					</div>
					<Link href={`/pharmacies/detail?id=${pharmacy._id}`}>
						View pharmacy
						<ArrowForwardRoundedIcon />
					</Link>
				</div>
			</div>
		</article>
	);
};

export default HomePharmacyCard;
