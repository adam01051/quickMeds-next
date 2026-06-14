import React from 'react';
import { Stack, Box, Divider, Typography } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { Property } from '../../types/property/property';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import { REACT_APP_API_URL } from '../../config';
import { useRouter } from 'next/router';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { topPropertyRank } from '../../config';
import { getPharmacyLocationLabel } from '../../utils/pharmacy-location';
import { formatDeliveryFeeUZS } from '../../utils';

interface TopPropertyCardProps {
	property: Property;
	 likePropertyHandler:any;
}

const TopPropertyCard = (props: TopPropertyCardProps) => {
	const { property,likePropertyHandler } = props;
	const device = useDeviceDetect();
	const router = useRouter();
	const user = useReactiveVar(userVar);

	/** HANDLERS **/
	const pushDetailhandler = async (propertyID: string) => {
		console.log('ID', propertyID);
		await router.push({pathname:'/pharmacies/detail',query:{id:propertyID}})
	};

	if (device === 'mobile') {
		return (
			<Stack className="top-card-box">
				<Box
					component={'div'}
					className={'card-img'}
					style={{ backgroundImage: `url(${REACT_APP_API_URL}/${property?.pharmacyImages[0]})` }}
					onClick={() => {
						pushDetailhandler(property._id);
					}}
				>
					{property?.pharmacyRank >= topPropertyRank && (
						<div className="status">
							<img src="/img/icons/electricity.svg" alt="" />
							<span>top</span>
						</div>
					)}
					<div className="price">{property.hasDelivery ? formatDeliveryFeeUZS(property.pharmacyDeliveryFee) : 'Pickup only'}</div>
				</Box>
				<Box component={'div'} className={'info'}>
					<strong className={'title'} 	onClick={() => {
						pushDetailhandler(property._id);
					}}>{property?.pharmacyName}</strong>
					<p className={'desc'}>{property?.pharmacyAddress}</p>
					<div className={'options'}>
						<div>
							<img src="/img/icons/discovery.svg" alt="" />
							<span>{property?.pharmacyMedicationCount} medications</span>
						</div>
						<div>
							<img src="/img/icons/securePayment.svg" alt="" />
							<span>{property?.pharmacyType} type</span>
						</div>
						<div>
							<img src="/img/icons/home.svg" alt="" />
							<span>{getPharmacyLocationLabel(property?.pharmacyLocation)}</span>
						</div>
					</div>
					<Divider sx={{ mt: '15px', mb: '17px' }} />
					<div className={'bott'}>
						<p>
							{' '}
							{property.hasDelivery ? 'Delivery' : ''} {property.hasDelivery && property.acceptsInsurance && '/'}{' '}
							{property.acceptsInsurance ? 'Insurance' : ''}
						</p>
						<div className="view-like-box">
							<IconButton color={'default'}>
								<RemoveRedEyeIcon />
							</IconButton>
							<Typography className="view-cnt">{property?.pharmacyViews}</Typography>
							<IconButton color={'default'} onClick={(event) => { event.stopPropagation(); likePropertyHandler(user, property?._id); }}>
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
	} else {
		return (
			<Stack className="top-card-box">
				<Box
					component={'div'}
					className={'card-img'}
					style={{ backgroundImage: `url(${REACT_APP_API_URL}/${property?.pharmacyImages[0]})` }}
					onClick={() => {
						pushDetailhandler(property._id);
					}}
				>
					{property?.pharmacyRank >= topPropertyRank && (
						<div className="status">
							<img src="/img/icons/electricity.svg" alt="" />
							<span>top</span>
						</div>
					)}
					<div className="price">{property.hasDelivery ? formatDeliveryFeeUZS(property.pharmacyDeliveryFee) : 'Pickup only'}</div>
				</Box>
				<Box component={'div'} className={'info'}>
					<strong className={'title'} 	onClick={() => {
						pushDetailhandler(property._id);
					}}>{property?.pharmacyName}</strong>
					<p className={'desc'}>{property?.pharmacyAddress}</p>
					<div className={'options'}>
						<div>
							<img src="/img/icons/discovery.svg" alt="" />
							<span>{property?.pharmacyMedicationCount} medications</span>
						</div>
						<div>
							<img src="/img/icons/securePayment.svg" alt="" />
							<span>{property?.pharmacyType} type</span>
						</div>
						<div>
							<img src="/img/icons/home.svg" alt="" />
							<span>{getPharmacyLocationLabel(property?.pharmacyLocation)}</span>
						</div>
					</div>
					<Divider sx={{ mt: '15px', mb: '17px' }} />
					<div className={'bott'}>
						<p>
							{' '}
							{property.hasDelivery ? 'Delivery' : ''} {property.hasDelivery && property.acceptsInsurance && '/'}{' '}
							{property.acceptsInsurance ? 'Insurance' : ''}
						</p>
						<div className="view-like-box">
							<IconButton color={'default'} >
								<RemoveRedEyeIcon />
							</IconButton>
							<Typography className="view-cnt">{property?.pharmacyViews}</Typography>
							<IconButton color={'default'} onClick={(event) => { event.stopPropagation(); likePropertyHandler(user, property?._id); }}>
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

export default TopPropertyCard;
