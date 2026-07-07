import React from 'react';
import Link from 'next/link';
import {
	Avatar,
	Button,
	Fade,
	Menu,
	MenuItem,
	Skeleton,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { CaretDown } from 'phosphor-react';
import { Property } from '../../../types/property/property';
import { REACT_APP_API_URL } from '../../../config';
import { PharmacyStatus } from '../../../enums/property.enum';
import { formatDeliveryFeeUZS } from '../../../utils';
import { useTranslation } from 'next-i18next';

interface PropertyPanelListType {
	properties: Property[];
	loading: boolean;
	error?: Error;
	anchorEl: HTMLElement[];
	menuIconClickHandler: (event: React.MouseEvent<HTMLElement>, index: number) => void;
	menuIconCloseHandler: () => void;
	updatePharmacyHandler: (updateData: { _id: string; pharmacyStatus: PharmacyStatus }) => void;
	removePropertyHandler: (id: string) => void;
	retryHandler: () => void;
}

const getStatusClass = (status: PharmacyStatus) => {
	if (status === PharmacyStatus.ACTIVE) return 'is-active';
	if (status === PharmacyStatus.CLOSED || status === PharmacyStatus.HOLD) return 'is-blocked';
	return 'is-deleted';
};

const getPharmacyImage = (pharmacy: Property) => {
	const firstImage = pharmacy.pharmacyImages?.[0];
	return firstImage ? `${REACT_APP_API_URL}/${firstImage}` : '/img/homepage/pharmacy-hero.webp';
};

const getHoursLabel = (pharmacy: Property, t: any) => {
	if (pharmacy.open24Hours) return t('pharmacyStatus.open247');
	if (pharmacy.hoursConfigured) return t('admin.pharmacies.hoursConfigured');
	return t('admin.pharmacies.hoursMissing');
};

const AdminPharmacySkeletonRows = () => (
	<>
		{Array.from({ length: 6 }).map((_, index) => (
			<TableRow key={`admin-pharmacy-skeleton-${index}`}>
				<TableCell><Skeleton variant="text" width={180} /></TableCell>
				<TableCell>
					<div className="admin-pharmacy-cell">
						<Skeleton variant="circular" width={42} height={42} />
						<div>
							<Skeleton variant="text" width={170} />
							<Skeleton variant="text" width={220} />
						</div>
					</div>
				</TableCell>
				<TableCell><Skeleton variant="text" width={110} /></TableCell>
				<TableCell><Skeleton variant="text" width={110} /></TableCell>
				<TableCell><Skeleton variant="text" width={120} /></TableCell>
				<TableCell><Skeleton variant="text" width={80} /></TableCell>
				<TableCell><Skeleton variant="rounded" width={108} height={28} /></TableCell>
				<TableCell><Skeleton variant="rounded" width={132} height={40} /></TableCell>
			</TableRow>
		))}
	</>
);

export const PropertyPanelList = (props: PropertyPanelListType) => {
	const { t } = useTranslation('common');
	const {
		properties,
		loading,
		error,
		anchorEl,
		menuIconClickHandler,
		menuIconCloseHandler,
		updatePharmacyHandler,
		removePropertyHandler,
		retryHandler,
	} = props;
	const statusLabels: Record<PharmacyStatus, string> = {
		[PharmacyStatus.HOLD]: t('admin.pharmacies.statusHold'),
		[PharmacyStatus.ACTIVE]: t('admin.pharmacies.statusActive'),
		[PharmacyStatus.CLOSED]: t('admin.pharmacies.statusClosed'),
		[PharmacyStatus.DELETE]: t('admin.pharmacies.statusDeleted'),
	};

	if (error) {
		return (
			<div className="admin-table-state admin-table-state--error" role="alert">
				<Typography component="strong">{t('admin.pharmacies.loadErrorTitle')}</Typography>
				<Typography component="p">{t('admin.pharmacies.loadErrorText')}</Typography>
				<Button onClick={retryHandler}>{t('admin.pharmacies.retry')}</Button>
			</div>
		);
	}

	return (
		<TableContainer className="admin-users-table admin-pharmacies-table">
			<Table aria-label={t('admin.pharmacies.tableAria')}>
				<TableHead>
					<TableRow>
						<TableCell>{t('admin.pharmacies.referenceId')}</TableCell>
						<TableCell>{t('admin.pharmacies.pharmacy')}</TableCell>
						<TableCell>{t('admin.pharmacies.deliveryHours')}</TableCell>
						<TableCell>{t('admin.pharmacies.owner')}</TableCell>
						<TableCell>{t('admin.pharmacies.region')}</TableCell>
						<TableCell>{t('admin.pharmacies.type')}</TableCell>
						<TableCell>{t('admin.pharmacies.status')}</TableCell>
						<TableCell align="right">{t('admin.pharmacies.actions')}</TableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{loading && <AdminPharmacySkeletonRows />}
					{!loading && properties.length === 0 && (
						<TableRow>
							<TableCell align="center" colSpan={8}>
								<div className="admin-table-state">
									<Typography component="strong">{t('admin.pharmacies.noFoundTitle')}</Typography>
									<Typography component="p">{t('admin.pharmacies.noFoundText')}</Typography>
								</div>
							</TableCell>
						</TableRow>
					)}
					{!loading &&
						properties.map((property, index) => (
							<TableRow hover key={property._id}>
								<TableCell>
									<span className="admin-reference-id">{property._id}</span>
								</TableCell>
								<TableCell>
									<div className="admin-pharmacy-cell">
										<Link href={`/pharmacies/detail?id=${property._id}`} aria-label={t('admin.pharmacies.openAria', { name: property.pharmacyName })}>
											<Avatar alt={t('admin.pharmacies.imageAlt', { name: property.pharmacyName })} src={getPharmacyImage(property)} />
										</Link>
										<div>
											<Link href={`/pharmacies/detail?id=${property._id}`}>{property.pharmacyName}</Link>
											<span>{property.pharmacyAddress || t('admin.pharmacies.addressNotProvided')}</span>
										</div>
									</div>
								</TableCell>
								<TableCell>
									<div className="admin-stacked-cell">
										<strong>{property.hasDelivery ? formatDeliveryFeeUZS(property.pharmacyDeliveryFee) : t('sharedPharmacyCard.pickupOnly')}</strong>
										<span>{getHoursLabel(property, t)}</span>
									</div>
								</TableCell>
								<TableCell>{property.memberData?.memberNick || '-'}</TableCell>
								<TableCell>{t(`pharmacyLocation.${property.pharmacyLocation}`)}</TableCell>
								<TableCell>{t(`pharmacyType.${property.pharmacyType}`)}</TableCell>
								<TableCell>
									<span className={`admin-status-chip ${getStatusClass(property.pharmacyStatus)}`}>
										{statusLabels[property.pharmacyStatus]}
									</span>
								</TableCell>
								<TableCell align="right">
									{property.pharmacyStatus === PharmacyStatus.DELETE ? (
										<Button
											className="admin-action-button admin-action-button--danger"
											onClick={() => removePropertyHandler(property._id)}
											startIcon={<DeleteIcon fontSize="small" />}
										>
											{t('admin.pharmacies.remove')}
										</Button>
									) : (
										<>
											<Button
												className="admin-action-button"
												onClick={(event) => menuIconClickHandler(event, index)}
												aria-label={t('admin.pharmacies.changeStatusAria', { name: property.pharmacyName })}
												endIcon={<CaretDown size={14} />}
											>
												{t('admin.pharmacies.changeStatus')}
											</Button>
											<Menu
												className="admin-action-menu"
												anchorEl={anchorEl[index]}
												open={Boolean(anchorEl[index])}
												onClose={menuIconCloseHandler}
												TransitionComponent={Fade}
											>
												{Object.values(PharmacyStatus)
													.filter((status) => status !== property.pharmacyStatus)
													.map((status) => (
														<MenuItem
															onClick={() => updatePharmacyHandler({ _id: property._id, pharmacyStatus: status })}
															key={status}
														>
															{statusLabels[status]}
														</MenuItem>
													))}
											</Menu>
										</>
									)}
								</TableCell>
							</TableRow>
						))}
				</TableBody>
			</Table>
		</TableContainer>
	);
};
