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
import { getPharmacyLocationLabel } from '../../../utils/pharmacy-location';
import { formatDeliveryFeeUZS } from '../../../utils';

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

const statusLabels: Record<PharmacyStatus, string> = {
	[PharmacyStatus.HOLD]: 'Pending review',
	[PharmacyStatus.ACTIVE]: 'Active',
	[PharmacyStatus.CLOSED]: 'Closed',
	[PharmacyStatus.DELETE]: 'Deleted',
};

const getStatusClass = (status: PharmacyStatus) => {
	if (status === PharmacyStatus.ACTIVE) return 'is-active';
	if (status === PharmacyStatus.CLOSED || status === PharmacyStatus.HOLD) return 'is-blocked';
	return 'is-deleted';
};

const getPharmacyImage = (pharmacy: Property) => {
	const firstImage = pharmacy.pharmacyImages?.[0];
	return firstImage ? `${REACT_APP_API_URL}/${firstImage}` : '/img/homepage/pharmacy-hero.webp';
};

const getHoursLabel = (pharmacy: Property) => {
	if (pharmacy.open24Hours) return 'Open 24/7';
	if (pharmacy.hoursConfigured) return 'Hours configured';
	return 'Hours missing';
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

	if (error) {
		return (
			<div className="admin-table-state admin-table-state--error" role="alert">
				<Typography component="strong">Unable to load pharmacies</Typography>
				<Typography component="p">The admin pharmacy query could not be completed. Please retry the current filters.</Typography>
				<Button onClick={retryHandler}>Retry</Button>
			</div>
		);
	}

	return (
		<TableContainer className="admin-users-table admin-pharmacies-table">
			<Table aria-label="QuickMeds pharmacies table">
				<TableHead>
					<TableRow>
						<TableCell>Reference ID</TableCell>
						<TableCell>Pharmacy</TableCell>
						<TableCell>Delivery & Hours</TableCell>
						<TableCell>Pharmacy Owner</TableCell>
						<TableCell>Region</TableCell>
						<TableCell>Type</TableCell>
						<TableCell>Status</TableCell>
						<TableCell align="right">Actions</TableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{loading && <AdminPharmacySkeletonRows />}
					{!loading && properties.length === 0 && (
						<TableRow>
							<TableCell align="center" colSpan={8}>
								<div className="admin-table-state">
									<Typography component="strong">No pharmacies found</Typography>
									<Typography component="p">Try changing the status or region filter.</Typography>
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
										<Link href={`/pharmacies/detail?id=${property._id}`} aria-label={`Open ${property.pharmacyName}`}>
											<Avatar alt={`${property.pharmacyName} image`} src={getPharmacyImage(property)} />
										</Link>
										<div>
											<Link href={`/pharmacies/detail?id=${property._id}`}>{property.pharmacyName}</Link>
											<span>{property.pharmacyAddress || 'Address not provided'}</span>
										</div>
									</div>
								</TableCell>
								<TableCell>
									<div className="admin-stacked-cell">
										<strong>{property.hasDelivery ? formatDeliveryFeeUZS(property.pharmacyDeliveryFee) : 'Pickup only'}</strong>
										<span>{getHoursLabel(property)}</span>
									</div>
								</TableCell>
								<TableCell>{property.memberData?.memberNick || '-'}</TableCell>
								<TableCell>{getPharmacyLocationLabel(property.pharmacyLocation)}</TableCell>
								<TableCell>{property.pharmacyType}</TableCell>
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
											Remove
										</Button>
									) : (
										<>
											<Button
												className="admin-action-button"
												onClick={(event) => menuIconClickHandler(event, index)}
												aria-label={`Change status for ${property.pharmacyName}`}
												endIcon={<CaretDown size={14} />}
											>
												Change status
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
