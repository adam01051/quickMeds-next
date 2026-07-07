import { Button, Menu, MenuItem, Stack, Typography } from '@mui/material';
import React, { useState } from 'react';
import { useTranslation } from 'next-i18next';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import IconButton from '@mui/material/IconButton';
import ModeIcon from '@mui/icons-material/Mode';
import DeleteIcon from '@mui/icons-material/Delete';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import HealthAndSafetyOutlinedIcon from '@mui/icons-material/HealthAndSafetyOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { Property } from '../../types/property/property';
import { formatDeliveryFeeUZS } from '../../utils';
import Moment from 'react-moment';
import { useRouter } from 'next/router';
import { PharmacyStatus } from '../../enums/property.enum';
import { REACT_APP_API_URL } from '../../config';

interface MyPharmacyCardProps {
	property: Property;
	deletePropertyHandler?: any;
	memberPage?: boolean;
	updatePharmacyHandler?: any;
}

const getHoursLabelKey = (property: Property) => {
	if (property.open24Hours) return 'mypage.myPharmacies.card.open247';
	if (!property.hoursConfigured) return 'mypage.myPharmacies.card.hoursNotProvided';
	return property.isOpenNow ? 'mypage.myPharmacies.card.openNow' : 'mypage.myPharmacies.card.closed';
};

export const MyPharmacyCard = (props: MyPharmacyCardProps) => {
	const { property, deletePropertyHandler, memberPage, updatePharmacyHandler } = props;
	const { t } = useTranslation('common');
	const device = useDeviceDetect();
	const router = useRouter();
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const open = Boolean(anchorEl);

	/** HANDLERS **/
	const pushEditProperty = async (id: string) => {
		await router.push({
			pathname: '/mypage',
			query: { category: 'addPharmacy', pharmacyId: id },
		});
	};

	const pushPropertyDetail = async (id: string) => {
		if (memberPage)
			await router.push({
				pathname: '/pharmacies/detail',
				query: { id: id },
			});
		else return;
	};

	const handleClick = (event: any) => {
		setAnchorEl(event.currentTarget);
	};

	const handleClose = () => {
		setAnchorEl(null);
	};

	const pushPharmacyDetail = async (id: string) => {
		await router.push({
			pathname: '/pharmacies/detail',
			query: { id },
		});
	};

	const image = property.pharmacyImages?.[0]
		? `${REACT_APP_API_URL}/${property.pharmacyImages[0]}`
		: '/img/homepage/pharmacy-hero.webp';
	const hoursLabel = t(getHoursLabelKey(property));
	const hoursClass = property.open24Hours || property.isOpenNow ? 'is-open' : property.hoursConfigured ? 'is-closed' : 'is-unknown';

	const useFallbackImage = (event: React.SyntheticEvent<HTMLImageElement>) => {
		event.currentTarget.onerror = null;
		event.currentTarget.src = '/img/homepage/pharmacy-hero.webp';
	};

	if (device === 'mobile') {
		return (
			<article className="my-pharmacy-card">
				<div className="my-pharmacy-card__media" onClick={() => pushPharmacyDetail(property._id)}>
					<img src={image} alt={t('sharedPharmacyCard.imageAlt', { name: property.pharmacyName })} onError={useFallbackImage} />
					<span className={`my-pharmacy-card__hours ${hoursClass}`}>
						<AccessTimeRoundedIcon />
						{hoursLabel}
					</span>
					<span className={`my-pharmacy-card__status is-${property.pharmacyStatus.toLowerCase()}`}>
						{property.pharmacyStatus}
					</span>
				</div>

				<div className="my-pharmacy-card__body">
					<div className="my-pharmacy-card__heading">
						<button type="button" onClick={() => pushPharmacyDetail(property._id)}>
							{property.pharmacyName}
						</button>
						<span>
							<VisibilityOutlinedIcon />
							{property.pharmacyViews?.toLocaleString() ?? 0}
						</span>
					</div>

					<p className="my-pharmacy-card__address">{property.pharmacyAddress}</p>

					<div className="my-pharmacy-card__chips">
						<span>{t(`pharmacyType.${property.pharmacyType}`)}</span>
						<span>
							<LocalShippingOutlinedIcon />
							{property.hasDelivery ? formatDeliveryFeeUZS(property.pharmacyDeliveryFee) : t('mypage.myPharmacies.card.pickupOnly')}
						</span>
						<span>
							<HealthAndSafetyOutlinedIcon />
							{property.acceptsInsurance ? t('mypage.myPharmacies.card.insurance') : t('mypage.myPharmacies.card.noInsurance')}
						</span>
					</div>

					<div className="my-pharmacy-card__meta">
						<span>{t('mypage.myPharmacies.card.published')}</span>
						<strong>
							<Moment format="DD MMM, YYYY">{property.createdAt}</Moment>
						</strong>
					</div>

					<div className="my-pharmacy-card__actions">
						<Button className="my-pharmacy-card__view" onClick={() => pushPharmacyDetail(property._id)}>
							{t('mypage.myPharmacies.card.view')}
							<ArrowForwardRoundedIcon />
						</Button>
						<Button className="my-pharmacy-card__edit" onClick={() => pushEditProperty(property._id)}>
							{t('mypage.myPharmacies.card.edit')}
						</Button>
						<IconButton className="my-pharmacy-card__more" aria-label={t('mypage.myPharmacies.card.moreActions', { name: property.pharmacyName })} onClick={handleClick}>
							<MoreHorizRoundedIcon />
						</IconButton>
					</div>

					<Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
						{property.pharmacyStatus === PharmacyStatus.ACTIVE && (
							<MenuItem
								onClick={() => {
									handleClose();
									updatePharmacyHandler(PharmacyStatus.CLOSED, property._id);
								}}
							>
								{t('mypage.myPharmacies.card.closePharmacy')}
							</MenuItem>
						)}
						<MenuItem
							onClick={() => {
								handleClose();
								deletePropertyHandler(property._id);
							}}
							>
							{t('mypage.myPharmacies.card.deletePharmacy')}
						</MenuItem>
					</Menu>
				</div>
			</article>
		);
	} else
		return (
			<Stack className="property-card-box">
				<Stack className="image-box" onClick={() => pushPropertyDetail(property?._id)}>
					<img src={`${process.env.REACT_APP_API_URL}/${property.pharmacyImages[0]}`} alt="" />
				</Stack>
				<Stack className="information-box" onClick={() => pushPropertyDetail(property?._id)}>
					<Typography className="name">{property.pharmacyName}</Typography>
					<Typography className="address">{property.pharmacyAddress}</Typography>
					<Typography className="price">
						<strong>
							{property.hasDelivery
								? t('mypage.myPharmacies.card.deliveryWithFee', { fee: formatDeliveryFeeUZS(property.pharmacyDeliveryFee) })
								: t('mypage.myPharmacies.card.pickupOnly')}
						</strong>
					</Typography>
				</Stack>
				<Stack className="date-box">
					<Typography className="date">
						<Moment format="DD MMMM, YYYY">{property.createdAt}</Moment>
					</Typography>
				</Stack>
				<Stack className="status-box">
					<Stack className="coloured-box" sx={{ background: '#E5F0FD' }} onClick={handleClick}>
						<Typography className="status" sx={{ color: '#3554d1' }}>
							{property.pharmacyStatus}
						</Typography>
					</Stack>
				</Stack>
				{!memberPage && property.pharmacyStatus !== 'CLOSED' && (
					<Menu
						anchorEl={anchorEl}
						open={open}
						onClose={handleClose}
						PaperProps={{
							elevation: 0,
							sx: {
								width: '70px',
								mt: 1,
								ml: '10px',
								overflow: 'visible',
								filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
							},
							style: {
								padding: 0,
								display: 'flex',
								justifyContent: 'center',
							},
						}}
					>
						{property.pharmacyStatus === 'ACTIVE' && (
							<>
								<MenuItem
									disableRipple
									onClick={() => {
										handleClose();
										updatePharmacyHandler(PharmacyStatus.CLOSED, property?._id);
									}}
								>
									{t('mypage.myPharmacies.card.close')}
								</MenuItem>
							</>
						)} 
					</Menu>
				)}

				<Stack className="views-box">
					<Typography className="views">{property.pharmacyViews.toLocaleString()}</Typography>
				</Stack>
				{!memberPage && property.pharmacyStatus === PharmacyStatus.ACTIVE &&(
					<Stack className="action-box">
						<IconButton className="icon-button" onClick={() => pushEditProperty(property._id)}>
							<ModeIcon className="buttons" />
						</IconButton>
						<IconButton className="icon-button" onClick={() => deletePropertyHandler(property._id)}>
							<DeleteIcon className="buttons" />
						</IconButton>
					</Stack>
				)}
			</Stack>
		);
};
