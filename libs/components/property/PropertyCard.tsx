import React from 'react';
import { Stack, Typography, Box } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { Property } from '../../types/property/property';
import Link from 'next/link';
import { formatDeliveryFeeUZS } from '../../utils';
import { REACT_APP_API_URL } from '../../config';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import IconButton from '@mui/material/IconButton';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import { useTranslation } from 'next-i18next';



import {topPropertyRank} from "../../config"

interface PropertyCardType {
	property: Property;
	likePropertyHandler?: any;
	myFavorites?: boolean;
	recentlyVisited?: boolean;
}

const PropertyCard = (props: PropertyCardType) => {
	const { property, likePropertyHandler, myFavorites, recentlyVisited } = props;
	const device = useDeviceDetect();
	const { t } = useTranslation('common');
	const user = useReactiveVar(userVar);
	const imagePath: string = property?.pharmacyImages[0]
		? `${REACT_APP_API_URL}/${property?.pharmacyImages[0]}`
		: '/img/banner/header1.svg';

	if (device === 'mobile') {
		return <div>PHARMACY CARD</div>;
	} else {
		return (
			<Stack className="card-config">
				<Stack className="top">
					<Link
						href={{
							pathname: '/pharmacies/detail',
							query: { id: property?._id },
						}}
					>
						<img src={imagePath} alt="" />
					</Link>
					{property && property?.pharmacyRank > topPropertyRank && (
						<Box component={'div'} className={'top-badge'}>
							<img src="/img/icons/electricity.svg" alt="" />
							<Typography>TOP</Typography>
						</Box>
					)}
					<Box component={'div'} className={'price-box'}>
						<Typography>{property.hasDelivery ? t('sharedPharmacyCard.deliveryWithFee', { fee: formatDeliveryFeeUZS(property.pharmacyDeliveryFee) }) : t('sharedPharmacyCard.pickupOnly')}</Typography>
					</Box>
				</Stack>
				<Stack className="bottom">
					<Stack className="name-address">
						<Stack className="name">
							<Link
								href={{
									pathname: '/pharmacies/detail',
									query: { id: property?._id },
								}}
							>
								<Typography>{property.pharmacyName}</Typography>
							</Link>
						</Stack>
						<Stack className="address">
							<Typography>
								{property.pharmacyAddress}, {t(`pharmacyLocation.${property.pharmacyLocation}`)}
							</Typography>
						</Stack>
					</Stack>
					<Stack className="options">
						<Stack className="option">
							<img src="/img/icons/discovery.svg" alt="" /> <Typography>{t('sharedPharmacyCard.medications', { count: property.pharmacyMedicationCount })}</Typography>
						</Stack>
						<Stack className="option">
							<img src="/img/icons/securePayment.svg" alt="" /> <Typography>{t('sharedPharmacyCard.typeLabel', { type: t(`pharmacyType.${property.pharmacyType}`) })}</Typography>
						</Stack>
						<Stack className="option">
							<img src="/img/icons/home.svg" alt="" /> <Typography>{t(`pharmacyLocation.${property.pharmacyLocation}`)}</Typography>
						</Stack>
					</Stack>
					<Stack className="divider"></Stack>
					<Stack className="type-buttons">
						<Stack className="type">
							<Typography sx={{ fontWeight: 500, fontSize: '13px' }}>
								{property.open24Hours ? t('pharmacyStatus.open247') : property.hoursConfigured ? (property.isOpenNow ? t('pharmacyStatus.openNow') : t('pharmacyStatus.closed')) : t('pharmacyStatus.hoursNotProvided')}
							</Typography>
							<Typography
								sx={{ fontWeight: 500, fontSize: '13px' }}
								className={property.hasDelivery ? '' : 'disabled-type'}
							>
								{t('sharedPharmacyCard.delivery')}
							</Typography>
							<Typography
								sx={{ fontWeight: 500, fontSize: '13px' }}
								className={property.acceptsInsurance ? '' : 'disabled-type'}
							>
								{t('sharedPharmacyCard.insurance')}
							</Typography>
						</Stack>
						{!recentlyVisited && (
							<Stack className="buttons">
								<IconButton color={'default'}>
									<RemoveRedEyeIcon />
								</IconButton>
								<Typography className="view-cnt">{property?.pharmacyViews}</Typography>
								<IconButton color={'default'} onClick={() => likePropertyHandler(user, property?._id)}>
									{myFavorites ? (
										<FavoriteIcon color="primary" />
									) : property?.meLiked && property?.meLiked[0]?.myFavorite ? (
										<FavoriteIcon color="primary" />
									) : (
										<FavoriteBorderIcon />
									)}
								</IconButton>
								<Typography className="view-cnt">{property?.pharmacyLikes}</Typography>
							</Stack>
						)}
					</Stack>
				</Stack>
			</Stack>
		);
	}
};

export default PropertyCard;
