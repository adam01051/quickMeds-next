import React, { ChangeEvent, MouseEvent, useEffect, useState } from 'react';
import { NextPage } from 'next';
import { Box, Button, Menu, MenuItem, Pagination, Stack, Typography } from '@mui/material';
import CatalogPharmacyCard from '../../libs/components/property/CatalogPharmacyCard';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import Filter from '../../libs/components/property/Filter';
import { useRouter } from 'next/router';
import { PharmaciesInquiry } from '../../libs/types/property/property.input';
import { Property } from '../../libs/types/property/property';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import { Direction, Message } from '../../libs/enums/common.enum';
import { GET_PHARMACIES } from '../../apollo/user/query';
import { useMutation, useQuery } from '@apollo/client';
import { T } from '../../libs/types/common';
import { LIKE_TARGET_PHARMACY } from '../../apollo/user/mutation';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const PharmacyList: NextPage = ({ initialInput, ...props }: any) => {
	const device = useDeviceDetect();
	const router = useRouter();
	const [searchFilter, setSearchFilter] = useState<PharmaciesInquiry>(
		router?.query?.input ? JSON.parse(router?.query?.input as string) : initialInput,
	);
	const [properties, setProperties] = useState<Property[]>([]);
	const [total, setTotal] = useState<number>(0);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const [sortingOpen, setSortingOpen] = useState(false);
	const [filterSortName, setFilterSortName] = useState('New');
	const [likeTargetPharmacy] = useMutation(LIKE_TARGET_PHARMACY);

	/** APOLLO REQUESTS **/
	const {
		loading: getPharmaciesLoading,
		data: getPharmaciesData,
		error: getPharmacyError,
		refetch: getPharmaciesRefetch,
	} = useQuery(GET_PHARMACIES, {
		fetchPolicy: 'network-only',
		variables: { input: searchFilter },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setProperties(data?.getPharmacies?.list);
			setTotal(data?.getPharmacies?.metaCounter[0]?.total);
		},
	});

	/** LIFECYCLES **/
	useEffect(() => {
		if (router.query.input) {
			const inputObj = JSON.parse(router?.query?.input as string);
			setSearchFilter(inputObj);
		}

		setCurrentPage(searchFilter.page === undefined ? 1 : searchFilter.page);
	}, [router]);

	useEffect(() => {
		//getPharmaciesRefetch({input:searchFilter})
	}, [searchFilter]);

	/** HANDLERS **/
	const handlePaginationChange = async (event: ChangeEvent<unknown>, value: number) => {
		searchFilter.page = value;
		await router.push(
			`/pharmacies?input=${JSON.stringify(searchFilter)}`,
			`/pharmacies?input=${JSON.stringify(searchFilter)}`,
			{
				scroll: false,
			},
		);
		setCurrentPage(value);
	};

	const likePropertyHandler = async (user: T, id: string) => {
		try {
			if (!id) return;
			if (!user._id) throw new Error(Message.SOMETHING_WENT_WRONG);
			await likeTargetPharmacy({
				variables: { input: id },
			});
			await getPharmaciesRefetch({ input: searchFilter });
			await sweetTopSmallSuccessAlert('success', 800);
		} catch (error: any) {
			console.log('error in likePropertHandler', error.message);
			sweetMixinErrorAlert(error.message).then();
		}
	};

	const sortingClickHandler = (e: MouseEvent<HTMLElement>) => {
		setAnchorEl(e.currentTarget);
		setSortingOpen(true);
	};

	const sortingCloseHandler = () => {
		setSortingOpen(false);
		setAnchorEl(null);
	};

	const sortingHandler = (e: React.MouseEvent<HTMLLIElement>) => {
		switch (e.currentTarget.id) {
			case 'new':
				setSearchFilter({ ...searchFilter, sort: 'createdAt', direction: Direction.ASC });
				setFilterSortName('New');
				break;
			case 'lowest':
				setSearchFilter({ ...searchFilter, sort: 'pharmacyDeliveryFee', direction: Direction.ASC, search: { ...searchFilter.search, hasDelivery: true } });
				setFilterSortName('Lowest delivery fee');
				break;
			case 'highest':
				setSearchFilter({ ...searchFilter, sort: 'pharmacyDeliveryFee', direction: Direction.DESC, search: { ...searchFilter.search, hasDelivery: true } });
				setFilterSortName('Highest delivery fee');
		}
		setSortingOpen(false);
		setAnchorEl(null);
	};

	const clearFilters = async () => {
		setSearchFilter(initialInput);
		await router.push(`/pharmacies?input=${JSON.stringify(initialInput)}`, undefined, { scroll: false });
	};

	if (device === 'mobile') {
		return <h1>PHARMACIES MOBILE</h1>;
	} else {
		return (
			<div id="property-list-page" style={{ position: 'relative' }}>
				<header className="catalog-directory-header">
					<div className="container">
						<div className="catalog-directory-header__copy">
							<span>Pharmacy directory</span>
							<h1>Find pharmacies across Uzbekistan</h1>
							<p>Filter pharmacies by region, available services, and working hours before you visit.</p>
						</div>
						<div className="catalog-directory-header__utilities">
							<p aria-live="polite">
								{getPharmaciesLoading && properties.length === 0 ? (
									<span>Loading pharmacies…</span>
								) : (
									<>
										<strong>{total}</strong>
										<span>{total === 1 ? ' pharmacy available' : ' pharmacies available'}</span>
									</>
								)}
							</p>
							<Box component="div" className="catalog-directory-header__sort">
								<span>Sort by</span>
								<Button onClick={sortingClickHandler} endIcon={<KeyboardArrowDownRoundedIcon />} aria-haspopup="menu" aria-expanded={sortingOpen}>
									{filterSortName}
								</Button>
								<Menu anchorEl={anchorEl} open={sortingOpen} onClose={sortingCloseHandler} sx={{ paddingTop: '5px' }}>
									<MenuItem onClick={sortingHandler} id="new" disableRipple>New</MenuItem>
									<MenuItem onClick={sortingHandler} id="lowest" disableRipple>Lowest delivery fee</MenuItem>
									<MenuItem onClick={sortingHandler} id="highest" disableRipple>Highest delivery fee</MenuItem>
								</Menu>
							</Box>
						</div>
					</div>
				</header>
				<div className="container">
					<Stack className={'property-page'}>
						<Stack className={'filter-config'}>
							{/* @ts-ignore */}
							<Filter searchFilter={searchFilter} setSearchFilter={setSearchFilter} initialInput={initialInput} />
						</Stack>
						<Stack className="main-config" mb={'76px'}>
							<Stack className={'list-config'}>
								{getPharmaciesLoading && properties.length === 0 ? (
									Array.from({ length: 6 }).map((_, index) => (
										<div className="catalog-pharmacy-skeleton" aria-hidden="true" key={index}>
											<div />
											<span />
											<span />
											<span />
											<span />
										</div>
									))
								) : getPharmacyError ? (
									<div className="catalog-pharmacy-state" role="alert">
										<strong>Pharmacies could not be loaded</strong>
										<p>Check your connection and try again.</p>
										<Button variant="outlined" onClick={() => getPharmaciesRefetch({ input: searchFilter })}>Try again</Button>
									</div>
								) : properties?.length === 0 ? (
									<div className="catalog-pharmacy-state">
										<strong>No pharmacies match these filters</strong>
										<p>Try changing your region, services, or search text.</p>
										<Button variant="outlined" onClick={clearFilters}>Clear filters</Button>
									</div>
								) : (
									properties.map((property: Property) => {
										return <CatalogPharmacyCard pharmacy={property} onFavorite={likePropertyHandler} key={property?._id} />;
									})
								)}
							</Stack>
							<Stack className="pagination-config">
								{properties.length !== 0 && (
									<Stack className="pagination-box">
										<Pagination
											page={currentPage}
											count={Math.ceil(total / searchFilter.limit)}
											onChange={handlePaginationChange}
											shape="circular"
											color="primary"
										/>
									</Stack>
								)}

								{properties.length !== 0 && (
									<Stack className="total-result">
										<Typography>
											Total {total} pharmacies available
										</Typography>
									</Stack>
								)}
							</Stack>
						</Stack>
					</Stack>
				</div>
			</div>
		);
	}
};

PharmacyList.defaultProps = {
	initialInput: {
		page: 1,
		limit: 9,
		sort: 'createdAt',
		direction: 'DESC',
		search: {},
	},
};

export default withLayoutBasic(PharmacyList);
