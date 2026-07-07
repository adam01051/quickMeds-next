import React from 'react';
import { Stack, Box, Divider, Typography } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { Property } from '../../types/property/property';
import { REACT_APP_API_URL } from '../../config';
import { formatDeliveryFeeUZS } from '../../utils';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { useRouter } from 'next/router';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import {topPropertyRank} from "../../config"
import { useTranslation } from 'next-i18next';
interface PropertyBigCardProps {
	property: Property;
	likePropertyHandler?:any;
}

const PropertyBigCard = (props: PropertyBigCardProps) => {
	const { property , likePropertyHandler} = props;
	const device = useDeviceDetect();
	const { t } = useTranslation('common');
	const user = useReactiveVar(userVar);
	const router = useRouter();

	/** HANDLERS **/
	const goPropertyDetatilPage = (pharmacyId: string) => {
		router.push(`/pharmacies/detail?id=${pharmacyId}`);
	};

	if (device === 'mobile') {
		return <div>PHARMACY CARD</div>;
	} else {
		return (
			<Stack className="property-big-card-box" onClick={() => goPropertyDetatilPage(property?._id)}>
				<Box
					component={'div'}
					className={'card-img'}
					style={{ backgroundImage: `url(${REACT_APP_API_URL}/${property?.pharmacyImages?.[0]})` }}
				>
					{property?.pharmacyRank && property?.pharmacyRank >= topPropertyRank && (
						<div className={'status'}>
							<img src="/img/icons/electricity.svg" alt="" />
							<span>{t('sharedPharmacyCard.top')}</span>
						</div>
					)}

					<div className={'price'}>{property.hasDelivery ? t('sharedPharmacyCard.deliveryWithFee', { fee: formatDeliveryFeeUZS(property.pharmacyDeliveryFee) }) : t('sharedPharmacyCard.pickupOnly')}</div>
				</Box>
				<Box component={'div'} className={'info'}>
					<strong className={'title'}>{property?.pharmacyName}</strong>
					<p className={'desc'}>{property?.pharmacyAddress}</p>
					<div className={'options'}>
						<div>
							<img src="/img/icons/discovery.svg" alt="" />
							<span>{property?.pharmacyLocation ? t(`pharmacyLocation.${property.pharmacyLocation}`) : ''}</span>
						</div>
						<div>
							<img src="/img/icons/securePayment.svg" alt="" />
							<span>{property?.pharmacyType ? t('sharedPharmacyCard.typeLabel', { type: t(`pharmacyType.${property.pharmacyType}`) }) : ''}</span>
						</div>
						<div>
							<img src="/img/icons/home.svg" alt="" />
							<span>{t('sharedPharmacyCard.medications', { count: property?.pharmacyMedicationCount ?? 0 })}</span>
						</div>
					</div>
					<Divider sx={{ mt: '15px', mb: '17px' }} />
					<div className={'bott'}>
						<div>
							{property?.hasDelivery ? <p>{t('sharedPharmacyCard.delivery')}</p> : <span>{t('sharedPharmacyCard.delivery')}</span>}
							{property?.acceptsInsurance ? <p>{t('sharedPharmacyCard.insurance')}</p> : <span>{t('sharedPharmacyCard.insurance')}</span>}
						</div>
						<div className="buttons-box">
							<IconButton color={'default'}>
								<RemoveRedEyeIcon />
							</IconButton>
							<Typography className="view-cnt">{property?.pharmacyViews}</Typography>
							<IconButton
								color={'default'}
								onClick={(e:any) => {
									e.stopPropagation();
									likePropertyHandler(user,property?._id)
								}}
							>
								{property?.meLiked && property?.meLiked[0]?.myFavorite ? (
									<FavoriteIcon style={{ color: '#08634f' }} />
								) : (
									<FavoriteIcon />
								)}
							</IconButton>
							<Typography className="view-cnt">{property?.pharmacyLikes}</Typography>
						</div>
					</div>
				</Box>
			</Stack>
		);
	}
};

export default PropertyBigCard;
