import React, { useEffect, useState } from 'react';
import type { NextPage } from 'next';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import { MenuItem, Select, TablePagination, Typography } from '@mui/material';
import { PropertyPanelList } from '../../../libs/components/admin/properties/PropertyList';
import { AllPharmaciesInquiry } from '../../../libs/types/property/property.input';
import { Property } from '../../../libs/types/property/property';
import { PharmacyLocation, PharmacyStatus } from '../../../libs/enums/property.enum';
import { sweetConfirmAlert, sweetErrorHandling, sweetTopSmallSuccessAlert } from '../../../libs/sweetAlert';
import { PharmacyUpdate } from '../../../libs/types/property/property.update';
import { useMutation, useQuery } from '@apollo/client';
import { REMOVE_PHARMACY_BY_ADMIN, UPDATE_PHARMACY_BY_ADMIN } from '../../../apollo/admin/mutation';
import { GET_ALL_PHARMACIES_BY_ADMIN } from '../../../apollo/admin/query';
import { T } from '../../../libs/types/common';
import { getPharmacyLocationLabel } from '../../../libs/utils/pharmacy-location';

const statusTabs = [
	{ label: 'Pending review', value: PharmacyStatus.HOLD },
	{ label: 'All', value: 'ALL' },
	{ label: 'Active', value: PharmacyStatus.ACTIVE },
	{ label: 'Closed', value: PharmacyStatus.CLOSED },
	{ label: 'Deleted', value: PharmacyStatus.DELETE },
];

const AdminProperties: NextPage = ({ initialInquiry, ...props }: any) => {
	const [anchorEl, setAnchorEl] = useState<HTMLElement[]>([]);
	const [propertiesInquiry, setPharmaciesInquiry] = useState<AllPharmaciesInquiry>(initialInquiry);
	const [properties, setProperties] = useState<Property[]>([]);
	const [propertiesTotal, setPropertiesTotal] = useState<number>(0);
	const [value, setValue] = useState<string>(
		propertiesInquiry?.search?.pharmacyStatus ? propertiesInquiry?.search?.pharmacyStatus : 'ALL',
	);
	const [searchType, setSearchType] = useState('ALL');

	/** APOLLO REQUESTS **/
const [updatePharmacyByAdmin] = useMutation(UPDATE_PHARMACY_BY_ADMIN);
const [removePharmacyByAdmin] = useMutation(REMOVE_PHARMACY_BY_ADMIN);

const {
  loading: getAllPharmaciesByAdminLoading,
  data: getAllPharmaciesByAdminData,
  error: getAllPharmaciesByAdminError,
  refetch: getAllPharmaciesByAdminRefetch,
} = useQuery(GET_ALL_PHARMACIES_BY_ADMIN, {
  fetchPolicy: 'network-only',
  variables: { input: propertiesInquiry },
  notifyOnNetworkStatusChange: true,
  onCompleted: (data: T) => {
    setProperties(data?.getAllPharmaciesByAdmin?.list);
    setPropertiesTotal(data?.getAllPharmaciesByAdmin?.metaCounter[0]?.total ?? 0);
  },
});
	/** LIFECYCLES **/
	useEffect(() => {
		getAllPharmaciesByAdminRefetch({input:propertiesInquiry});
	}, [propertiesInquiry]);

	/** HANDLERS **/
	const changePageHandler = async (event: unknown, newPage: number) => {
		propertiesInquiry.page = newPage + 1;
		await getAllPharmaciesByAdminRefetch({input:propertiesInquiry});
		setPharmaciesInquiry({ ...propertiesInquiry });
	};

	const changeRowsPerPageHandler = async (event: React.ChangeEvent<HTMLInputElement>) => {
		propertiesInquiry.limit = parseInt(event.target.value, 10);
		propertiesInquiry.page = 1;
		await getAllPharmaciesByAdminRefetch({input:propertiesInquiry});
		setPharmaciesInquiry({ ...propertiesInquiry });
	};

	const menuIconClickHandler = (e: any, index: number) => {
		const tempAnchor = anchorEl.slice();
		tempAnchor[index] = e.currentTarget;
		setAnchorEl(tempAnchor);
	};

	const menuIconCloseHandler = () => {
		setAnchorEl([]);
	};

	const tabChangeHandler = async (event: any, newValue: string) => {
		setValue(newValue);

		setPharmaciesInquiry((current) => {
			const nextSearch = { ...current.search };
			if (newValue === 'ALL') delete nextSearch.pharmacyStatus;
			else nextSearch.pharmacyStatus = newValue as PharmacyStatus;
			return { ...current, page: 1, sort: 'createdAt', search: nextSearch };
		});
	};

	const removePropertyHandler = async (id: string) => {
		try {
			if (await sweetConfirmAlert('Are you sure to remove?')) {
				await removePharmacyByAdmin({
				variables:{
					input:id,
				}
			})
			}
			
			menuIconCloseHandler();
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	};

	const searchTypeHandler = async (newValue: string) => {
		setSearchType(newValue);

		if (newValue !== 'ALL') {
			setPharmaciesInquiry((current) => ({
				...current,
				page: 1,
				sort: 'createdAt',
				search: {
					...current.search,
					pharmacyLocationList: [newValue as PharmacyLocation],
				},
			}));
		} else {
			setPharmaciesInquiry((current) => {
				const nextSearch = { ...current.search };
				delete nextSearch.pharmacyLocationList;
				return { ...current, page: 1, search: nextSearch };
			});
		}
	};

	const updatePharmacyHandler = async (updateData: PharmacyUpdate) => {
		try {
			await updatePharmacyByAdmin({
				variables: {
					input: updateData,
				},
			});
			menuIconCloseHandler();
			await getAllPharmaciesByAdminRefetch({ input: propertiesInquiry });
			await sweetTopSmallSuccessAlert('Pharmacy status updated');
		} catch (err: any) {
			menuIconCloseHandler();
			sweetErrorHandling(err).then();
		}
	};

	return (
		<div className="content admin-users-page">
			<div className="admin-page-header admin-page-header--with-count">
				<div>
					<Typography component="span">PHARMACY MANAGEMENT</Typography>
					<Typography component="h1">Pharmacies</Typography>
					<Typography component="p">Review pharmacy records, service availability, and publication status.</Typography>
				</div>
				<div className="admin-result-count" aria-live="polite">
					<strong>{propertiesTotal.toLocaleString()}</strong>
					<span>{propertiesTotal === 1 ? 'pharmacy' : 'pharmacies'}</span>
				</div>
			</div>

			<div className="table-wrap admin-management-panel">
				<div className="admin-filter-tabs" role="tablist" aria-label="Filter pharmacies by status">
					{statusTabs.map((tab) => (
						<button
							type="button"
							role="tab"
							aria-selected={value === tab.value}
							aria-current={value === tab.value ? 'page' : undefined}
							className={value === tab.value ? 'is-active' : ''}
							onClick={(event) => tabChangeHandler(event, tab.value)}
							key={tab.value}
						>
							{tab.label}
						</button>
					))}
				</div>

				<div className="admin-toolbar">
					<div className="admin-toolbar__context">
						<strong>Region filter</strong>
						<span>Use existing Uzbekistan region values.</span>
					</div>
					<Select
						className="admin-select-control"
						value={searchType}
						onChange={(event) => searchTypeHandler(event.target.value)}
						inputProps={{ 'aria-label': 'Filter pharmacies by region' }}
					>
						<MenuItem value="ALL">All regions</MenuItem>
						{Object.values(PharmacyLocation).map((location) => (
							<MenuItem value={location} key={location}>
								{getPharmacyLocationLabel(location)}
							</MenuItem>
						))}
					</Select>
				</div>

				<PropertyPanelList
					properties={properties}
					loading={getAllPharmaciesByAdminLoading}
					error={getAllPharmaciesByAdminError}
					anchorEl={anchorEl}
					menuIconClickHandler={menuIconClickHandler}
					menuIconCloseHandler={menuIconCloseHandler}
					updatePharmacyHandler={updatePharmacyHandler}
					removePropertyHandler={removePropertyHandler}
					retryHandler={() => getAllPharmaciesByAdminRefetch({ input: propertiesInquiry })}
				/>

				<TablePagination
					rowsPerPageOptions={[10, 20, 40, 60]}
					component="div"
					count={propertiesTotal}
					rowsPerPage={propertiesInquiry?.limit}
					page={propertiesInquiry?.page - 1}
					onPageChange={changePageHandler}
					onRowsPerPageChange={changeRowsPerPageHandler}
				/>
			</div>
		</div>
	);
};

AdminProperties.defaultProps = {
	initialInquiry: {
		page: 1,
		limit: 10,
		sort: 'createdAt',
		direction: 'DESC',
		search: {},
	},
};

export default withAdminLayout(AdminProperties);
