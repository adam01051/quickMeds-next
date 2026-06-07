import React, { useEffect, useState } from 'react';
import type { NextPage } from 'next';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import { Box, List, ListItem, Stack } from '@mui/material';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { TabContext } from '@mui/lab';
import TablePagination from '@mui/material/TablePagination';
import { PropertyPanelList } from '../../../libs/components/admin/properties/PropertyList';
import { AllPharmaciesInquiry } from '../../../libs/types/property/property.input';
import { Property } from '../../../libs/types/property/property';
import { PharmacyLocation, PharmacyStatus } from '../../../libs/enums/property.enum';
import { sweetConfirmAlert, sweetErrorHandling } from '../../../libs/sweetAlert';
import { PharmacyUpdate } from '../../../libs/types/property/property.update';
import { useMutation, useQuery } from '@apollo/client';
import { REMOVE_PHARMACY_BY_ADMIN, UPDATE_PHARMACY_BY_ADMIN } from '../../../apollo/admin/mutation';
import { GET_ALL_PHARMACIES_BY_ADMIN } from '../../../apollo/admin/query';
import { T } from '../../../libs/types/common';

const AdminProperties: NextPage = ({ initialInquiry, ...props }: any) => {
	const [anchorEl, setAnchorEl] = useState<[] | HTMLElement[]>([]);
	const [propertiesInquiry, setPharmaciesInquiry] = useState<AllPharmaciesInquiry>(initialInquiry);
	const [properties, setProperties] = useState<Property[]>([]);
	const [propertiesTotal, setPropertiesTotal] = useState<number>(0);
	const [value, setValue] = useState(
		propertiesInquiry?.search?.pharmacyStatus ? propertiesInquiry?.search?.pharmacyStatus : 'ALL',
	);
	const [searchType, setSearchType] = useState('ALL');

	/** APOLLO REQUESTS **/
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

		setPharmaciesInquiry({ ...propertiesInquiry, page: 1, sort: 'createdAt' });

		switch (newValue) {
			case 'HOLD':
				setPharmaciesInquiry({ ...propertiesInquiry, search: { pharmacyStatus: PharmacyStatus.HOLD } });
				break;
			case 'ACTIVE':
				setPharmaciesInquiry({ ...propertiesInquiry, search: { pharmacyStatus: PharmacyStatus.ACTIVE } });
				break;
			case 'CLOSED':
				setPharmaciesInquiry({ ...propertiesInquiry, search: { pharmacyStatus: PharmacyStatus.CLOSED } });
				break;
			case 'DELETE':
				setPharmaciesInquiry({ ...propertiesInquiry, search: { pharmacyStatus: PharmacyStatus.DELETE } });
				break;
			default:
				delete propertiesInquiry?.search?.pharmacyStatus;
				setPharmaciesInquiry({ ...propertiesInquiry });
				break;
		}
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
		try {
			setSearchType(newValue);

			if (newValue !== 'ALL') {
				setPharmaciesInquiry({
					...propertiesInquiry,
					page: 1,
					sort: 'createdAt',
					search: {
						...propertiesInquiry.search,
						pharmacyLocationList: [newValue as PharmacyLocation],
					},
				});
			} else {
				delete propertiesInquiry?.search?.pharmacyLocationList;
				setPharmaciesInquiry({ ...propertiesInquiry });
			}
		} catch (err: any) {
			console.log('searchTypeHandler: ', err.message);
		}
	};

	const updatePharmacyHandler = async (updateData: PharmacyUpdate) => {
		try {
			console.log('+updateData: ', updateData);
				await updatePharmacyByAdmin({
				variables:{
					input:updateData,
				}
			})
			menuIconCloseHandler();

		} catch (err: any) {
			menuIconCloseHandler();
			sweetErrorHandling(err).then();
		}
	};

	return (
		<Box component={'div'} className={'content'}>
			<Typography variant={'h2'} className={'tit'} sx={{ mb: '24px' }}>
				Pharmacy List
			</Typography>
			<Box component={'div'} className={'table-wrap'}>
				<Box component={'div'} sx={{ width: '100%', typography: 'body1' }}>
					<TabContext value={value}>
						<Box component={'div'}>
							<List className={'tab-menu'}>
								<ListItem
									onClick={(e:any) => tabChangeHandler(e, 'HOLD')}
									value="HOLD"
									className={value === 'HOLD' ? 'li on' : 'li'}
								>
									Hold
								</ListItem>
								<ListItem
									onClick={(e:any) => tabChangeHandler(e, 'ALL')}
									value="ALL"
									className={value === 'ALL' ? 'li on' : 'li'}
								>
									All
								</ListItem>
								<ListItem
									onClick={(e:any) => tabChangeHandler(e, 'ACTIVE')}
									value="ACTIVE"
									className={value === 'ACTIVE' ? 'li on' : 'li'}
								>
									Active
								</ListItem>
								<ListItem
									onClick={(e:any) => tabChangeHandler(e, 'CLOSED')}
									value="CLOSED"
									className={value === 'CLOSED' ? 'li on' : 'li'}
								>
									Closed
								</ListItem>
								<ListItem
									onClick={(e:any) => tabChangeHandler(e, 'DELETE')}
									value="DELETE"
									className={value === 'DELETE' ? 'li on' : 'li'}
								>
									Delete
								</ListItem>
							</List>
							<Divider />
							<Stack className={'search-area'} sx={{ m: '24px' }}>
								<Select sx={{ width: '160px', mr: '20px' }} value={searchType}>
									<MenuItem value={'ALL'} onClick={() => searchTypeHandler('ALL')}>
										ALL
									</MenuItem>
									{Object.values(PharmacyLocation).map((location: string) => (
										<MenuItem value={location} onClick={() => searchTypeHandler(location)} key={location}>
											{location}
										</MenuItem>
									))}
								</Select>
							</Stack>
							<Divider />
						</Box>
						<PropertyPanelList
							properties={properties}
							anchorEl={anchorEl}
							menuIconClickHandler={menuIconClickHandler}
							menuIconCloseHandler={menuIconCloseHandler}
							updatePharmacyHandler={updatePharmacyHandler}
							removePropertyHandler={removePropertyHandler}
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
					</TabContext>
				</Box>
			</Box>
		</Box>
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
