import React, { useState } from 'react';
import { NextPage } from 'next';
import { Pagination, Stack, Typography } from '@mui/material';
import { useTranslation } from 'next-i18next';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { MyPharmacyCard } from './MyPharmacyCard';
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
import Link from 'next/link';

const statusTabs = [
	{ value: PharmacyStatus.HOLD, labelKey: 'mypage.myPharmacies.status.hold' },
	{ value: PharmacyStatus.ACTIVE, labelKey: 'mypage.myPharmacies.status.active' },
	{ value: PharmacyStatus.CLOSED, labelKey: 'mypage.myPharmacies.status.closed' },
];

const MyPharmacies: NextPage = ({ initialInput, ...props }: any) => {
	const { t } = useTranslation('common');
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
			if (await sweetConfirmAlert(t('mypage.myPharmacies.confirmDelete'))) {
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
			if (await sweetConfirmAlert(t('mypage.myPharmacies.confirmStatus', { status }))) {
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
		return (
			<div id="my-property-page" className="my-pharmacies-page">
				<div className="my-pharmacies-page__bar">
					<div>
						<strong>{total}</strong>
						<span>{t('mypage.myPharmacies.countInStatus', { count: total, status: String(searchFilter.search?.pharmacyStatus ?? '').toLowerCase() })}</span>
					</div>
					<Link href="/mypage?category=addPharmacy">{t('mypage.categories.addPharmacy.title')}</Link>
				</div>

				<div className="my-pharmacies-page__tabs" role="tablist" aria-label={t('mypage.myPharmacies.filterByStatus')}>
					{statusTabs.map((tab) => (
						<button
							key={tab.value}
							type="button"
							className={searchFilter.search?.pharmacyStatus === tab.value ? 'is-active' : ''}
							onClick={() => changeStatusHandler(tab.value)}
						>
							{t(tab.labelKey)}
						</button>
					))}
				</div>

				{getAgentPharmaciesLoading && !agentProperties.length ? (
					<div className="my-pharmacies-page__list" aria-label={t('mypage.myPharmacies.loading')}>
						{Array.from({ length: 3 }).map((_, index) => <div className="my-pharmacy-card-skeleton" key={index} />)}
					</div>
				) : getAgentPharmaciesError ? (
					<div className="my-pharmacies-page__state" role="alert">
						<h2>{t('mypage.myPharmacies.loadErrorTitle')}</h2>
						<p>{t('mypage.myPharmacies.loadErrorText')}</p>
						<button type="button" onClick={() => getAgentPharmaciesRefetch({ input: searchFilter })}>{t('mypage.common.tryAgain')}</button>
					</div>
				) : agentProperties?.length === 0 ? (
					<div className="my-pharmacies-page__state">
						<h2>{t('mypage.myPharmacies.emptyTitle')}</h2>
						<p>{t('mypage.myPharmacies.emptyText')}</p>
						<Link href="/mypage?category=addPharmacy">{t('mypage.categories.addPharmacy.title')}</Link>
					</div>
				) : (
					<div className="my-pharmacies-page__list">
						{agentProperties.map((property: Property) => (
							<MyPharmacyCard
								key={property._id}
								property={property}
								deletePropertyHandler={deletePropertyHandler}
								updatePharmacyHandler={updatePharmacyHandler}
							/>
						))}
					</div>
				)}

				{agentProperties.length !== 0 && (
					<div className="my-pharmacies-page__pagination">
						<Pagination
							count={Math.ceil(total / searchFilter.limit)}
							page={searchFilter.page}
							shape="rounded"
							color="primary"
							onChange={paginationHandler}
						/>
						<p>{t('mypage.myPharmacies.totalAvailable', { count: total })}</p>
					</div>
				)}
			</div>
		);
	}

	return (
		<div id="my-property-page">
			<Stack className="property-list-box">
				<Stack className="tab-name-box">
					<Typography
						onClick={() => changeStatusHandler(PharmacyStatus.HOLD)}
						className={searchFilter?.search?.pharmacyStatus === 'HOLD' ? 'active-tab-name' : 'tab-name'}
					>
						{t('mypage.myPharmacies.status.hold')}
					</Typography>
					<Typography
						onClick={() => changeStatusHandler(PharmacyStatus.ACTIVE)}
						className={searchFilter?.search?.pharmacyStatus === 'ACTIVE' ? 'active-tab-name' : 'tab-name'}
					>
						{t('mypage.myPharmacies.status.active')}
					</Typography>
					<Typography
						onClick={() => changeStatusHandler(PharmacyStatus.CLOSED)}
						className={searchFilter?.search?.pharmacyStatus === 'CLOSED' ? 'active-tab-name' : 'tab-name'}
					>
						{t('mypage.myPharmacies.status.closed')}
					</Typography>
				</Stack>
				<Stack className="list-box">
					<Stack className="listing-title-box">
						<Typography className="title-text">{t('mypage.myPharmacies.table.name')}</Typography>
						<Typography className="title-text">{t('mypage.myPharmacies.table.datePublished')}</Typography>
						<Typography className="title-text">{t('mypage.myPharmacies.table.status')}</Typography>
						<Typography className="title-text">{t('mypage.myPharmacies.table.views')}</Typography>
						{searchFilter?.search?.pharmacyStatus === 'ACTIVE' && <Typography className="title-text">{t('mypage.myPharmacies.table.action')}</Typography>}
					</Stack>

					{agentProperties?.length === 0 ? (
						<div className={'no-data'}>
							<img src="/img/icons/icoAlert.svg" alt="" />
							<p>{t('mypage.myPharmacies.emptyTitle')}</p>
						</div>
					) : (
						agentProperties.map((property: Property) => {
							return (
								<MyPharmacyCard
									key={property._id}
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
								<Typography>{t('mypage.myPharmacies.totalAvailable', { count: total })}</Typography>
							</Stack>
						</Stack>
					)}
				</Stack>
			</Stack>
		</div>
	);
};

MyPharmacies.defaultProps = {
	initialInput: {
		page: 1,
		limit: 5,
		sort: 'createdAt',
		search: {
			pharmacyStatus: 'ACTIVE',
		},
	},
};

export default MyPharmacies;
