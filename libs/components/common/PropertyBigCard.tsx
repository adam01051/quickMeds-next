import React from 'react';
import { getPharmacyLocationLabel } from '../../utils/pharmacy-location';
import { Stack, Box, Divider, Typography } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { Property } from '../../types/property/property';
import { REACT_APP_API_URL } from '../../config';
import { formatterStr } from '../../utils';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { useRouter } from 'next/router';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import {topPropertyRank} from "../../config"
interface PropertyBigCardProps {
	property: Property;
	likePropertyHandler?:any;
}

const PropertyBigCard = (props: PropertyBigCardProps) => {
	const { property , likePropertyHandler} = props;
	const device = useDeviceDetect();
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
							<span>top</span>
						</div>
					)}

					<div className={'price'}>Delivery: ${formatterStr(property?.pharmacyDeliveryFee)}</div>
				</Box>
				<Box component={'div'} className={'info'}>
					<strong className={'title'}>{property?.pharmacyName}</strong>
					<p className={'desc'}>{property?.pharmacyAddress}</p>
					<div className={'options'}>
						<div>
							<img src="/img/icons/discovery.svg" alt="" />
							<span>{getPharmacyLocationLabel(property?.pharmacyLocation)}</span>
						</div>
						<div>
							<img src="/img/icons/securePayment.svg" alt="" />
							<span>{property?.pharmacyType} type</span>
						</div>
						<div>
							<img src="/img/icons/home.svg" alt="" />
							<span>{property?.pharmacyMedicationCount} medications</span>
						</div>
					</div>
					<Divider sx={{ mt: '15px', mb: '17px' }} />
					<div className={'bott'}>
						<div>
							{property?.hasDelivery ? <p>Delivery</p> : <span>Delivery</span>}
							{property?.acceptsInsurance ? <p>Insurance</p> : <span>Insurance</span>}
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
									<FavoriteIcon style={{ color: 'red' }} />
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
