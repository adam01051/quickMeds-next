import React from 'react';
import Link from 'next/link';
import { IconButton } from '@mui/material';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import HealthAndSafetyOutlinedIcon from '@mui/icons-material/HealthAndSafetyOutlined';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { Property } from '../../types/property/property';
import { REACT_APP_API_URL } from '../../config';

interface HomePharmacyCardProps {
	pharmacy: Property;
	onFavorite: (pharmacyId: string) => void;
}

const HomePharmacyCard = ({ pharmacy, onFavorite }: HomePharmacyCardProps) => {
	const image = pharmacy.pharmacyImages?.[0]
		? `${REACT_APP_API_URL}/${pharmacy.pharmacyImages[0]}`
		: '/img/banner/header1.svg';
	const isFavorite = pharmacy.meLiked?.[0]?.myFavorite === true;
	const useFallbackImage = (event: React.SyntheticEvent<HTMLImageElement>) => {
		event.currentTarget.onerror = null;
		event.currentTarget.src = '/img/banner/header1.svg';
	};

	return (
		<article className="home-pharmacy-card">
			<Link href={`/pharmacies/detail?id=${pharmacy._id}`} className="home-pharmacy-card__image-link">
				<img src={image} alt={`${pharmacy.pharmacyName} pharmacy`} className="home-pharmacy-card__image" onError={useFallbackImage} />
			</Link>
			<div className="home-pharmacy-card__body">
				<div className="home-pharmacy-card__heading">
					<div>
						<div className="home-pharmacy-card__name-row">
							<h3>{pharmacy.pharmacyName}</h3>
							{pharmacy.verifiedAt && (
								<span className="home-pharmacy-card__verified">
									<VerifiedRoundedIcon />
									Verified
								</span>
							)}
						</div>
						<p>{pharmacy.pharmacyAddress}</p>
					</div>
					<IconButton
						className="home-pharmacy-card__favorite"
						aria-label={isFavorite ? `Remove ${pharmacy.pharmacyName} from favorites` : `Save ${pharmacy.pharmacyName}`}
						onClick={() => onFavorite(pharmacy._id)}
					>
						{isFavorite ? <FavoriteRoundedIcon /> : <FavoriteBorderRoundedIcon />}
					</IconButton>
				</div>
				<div className="home-pharmacy-card__services">
					<span className={pharmacy.hasDelivery ? '' : 'is-muted'}>
						<LocalShippingOutlinedIcon />
						{pharmacy.hasDelivery ? 'Delivery available' : 'Pickup only'}
					</span>
					<span className={pharmacy.acceptsInsurance ? '' : 'is-muted'}>
						<HealthAndSafetyOutlinedIcon />
						{pharmacy.acceptsInsurance ? 'Insurance accepted' : 'Insurance not listed'}
					</span>
				</div>
				<div className="home-pharmacy-card__footer">
					<div>
						<span>Delivery fee</span>
						<strong>${pharmacy.pharmacyDeliveryFee}</strong>
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
