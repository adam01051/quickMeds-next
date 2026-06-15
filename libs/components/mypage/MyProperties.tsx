import React, { useState } from 'react';
import { NextPage } from 'next';
import { Pagination, Stack, Typography } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { PropertyCard } from './PropertyCard';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { Property } from '../../types/property/property';
import { AgentPharmaciesInquiry } from '../../types/property/property.input';
import { T } from '../../types/common';
import { PharmacyStatus } from '../../enums/property.enum';
import { userVar } from '../../../apollo/store';
import { useRouter } from 'next/router';
import { GET_AGENT_PHARMACIES } from '../../../apollo/user/query';
import { sweetConfirmAlert, sweetErrorHandling } from '../../sweetAlert';
import { UPDATE_PHARMACY } from '../../../apollo/user/mutation';

const MyProperties: NextPage = ({ initialInput, ...props }: any) => {
	const device = useDeviceDetect();
	const [searchFilter, setSearchFilter] = useState<AgentPharmaciesInquiry>(initialInput);
	const [agentProperties, setAgentProperties] = useState<Property[]>([]);
	const [total, setTotal] = useState<number>(0);
	const user = useReactiveVar(userVar);
	const router = useRouter();

	/** APOLLO REQUESTS **/
	const [updatePharmacy]  =useMutation(UPDATE_PHARMACY);
	const {
		loading: getAgentPharmaciesLoading,
		data: getAgentPharmaciesData,
		error: getAgentPharmaciesError,
		refetch: getAgentPharmaciesRefetch,
	} = useQuery(GET_AGENT_PHARMACIES, {
		fetchPolicy: 'network-only',
		variables: { input: searchFilter },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setAgentProperties(data?.getAgentPharmacies?.list);
			setTotal(data?.getAgentPharmacies?.metaCounter[0]?.total);
		},
	});

	/** HANDLERS **/
	const paginationHandler = (e: T, value: number) => {
		setSearchFilter({ ...searchFilter, page: value });
	};

	const changeStatusHandler = (value: PharmacyStatus) => {
		setSearchFilter({ ...searchFilter, search: { pharmacyStatus: value } });
	};

	const deletePropertyHandler = async (id: string) => {
		try {
			if (await sweetConfirmAlert('are you sure to delete this pharmacy')) {
				await updatePharmacy({
					variables: {
						input: {
							_id: id,
							pharmacyStatus: 'DELETE',
						},
					},
				});
			}
			await getAgentPharmaciesRefetch({ input: searchFilter });
		} catch (error) {
			await sweetErrorHandling(error);
		}
	};

	const updatePharmacyHandler = async (status: string, id: string) => {
		try {
			if (await sweetConfirmAlert(`are you sure change to ${status} status`)) {
				await updatePharmacy({
					variables: {
						input: {
							_id: id,
							pharmacyStatus: status,
						},
					},
				});
			}
			await getAgentPharmaciesRefetch({ input: searchFilter });
		} catch (error) {
			await sweetErrorHandling(error);
		}
	};

	if (user?.memberType !== 'AGENT') {
		router.back();
	}

	if (device === 'mobile') {
		return <div>QUICKMEDS PHARMACIES MOBILE</div>;
	} else {
		return (
			<div id="my-property-page">
				<Stack className="property-list-box">
					<Stack className="tab-name-box">
						<Typography
							onClick={() => changeStatusHandler(PharmacyStatus.HOLD)}
							className={searchFilter?.search?.pharmacyStatus === 'HOLD' ? 'active-tab-name' : 'tab-name'}
						>
							Hold
						</Typography>
						<Typography
							onClick={() => changeStatusHandler(PharmacyStatus.ACTIVE)}
							className={searchFilter?.search?.pharmacyStatus === 'ACTIVE' ? 'active-tab-name' : 'tab-name'}
						>
							Active
						</Typography>
						<Typography
							onClick={() => changeStatusHandler(PharmacyStatus.CLOSED)}
							className={searchFilter?.search?.pharmacyStatus === 'CLOSED' ? 'active-tab-name' : 'tab-name'}
						>
							Closed
						</Typography>
					</Stack>
					<Stack className="list-box">
						<Stack className="listing-title-box">
							<Typography className="title-text">Pharmacy name</Typography>
							<Typography className="title-text">Date Published</Typography>
							<Typography className="title-text">Status</Typography>
							<Typography className="title-text">View</Typography>
							{searchFilter?.search?.pharmacyStatus === 'ACTIVE' && <Typography className="title-text">Action</Typography>}
						</Stack>

						{agentProperties?.length === 0 ? (
							<div className={'no-data'}>
								<img src="/img/icons/icoAlert.svg" alt="" />
								<p>No pharmacy found!</p>
							</div>
						) : (
							agentProperties.map((property: Property) => {
								return (
									<PropertyCard
										property={property}
										deletePropertyHandler={deletePropertyHandler}
										updatePharmacyHandler={updatePharmacyHandler}
									/>
								);
							})
						)}

						{agentProperties.length !== 0 && (
							<Stack className="pagination-config">
								<Stack className="pagination-box">
									<Pagination
										count={Math.ceil(total / searchFilter.limit)}
										page={searchFilter.page}
										shape="circular"
										color="primary"
										onChange={paginationHandler}
									/>
								</Stack>
								<Stack className="total-result">
									<Typography>{total} pharmacies available</Typography>
								</Stack>
							</Stack>
						)}
					</Stack>
				</Stack>
			</div>
		);
	}
};

MyProperties.defaultProps = {
	initialInput: {
		page: 1,
		limit: 5,
		sort: 'createdAt',
		search: {
			pharmacyStatus: 'ACTIVE',
		},
	},
};

export default MyProperties;
