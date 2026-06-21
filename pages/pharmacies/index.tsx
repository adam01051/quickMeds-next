import React, { ChangeEvent, KeyboardEvent, MouseEvent, useEffect, useMemo, useState } from 'react';
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
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import CheckBoxRoundedIcon from '@mui/icons-material/CheckBoxRounded';
import CheckBoxOutlineBlankRoundedIcon from '@mui/icons-material/CheckBoxOutlineBlankRounded';
import { Direction, Message } from '../../libs/enums/common.enum';
import { PharmacyLocation, PharmacyType } from '../../libs/enums/property.enum';
import { GET_PHARMACIES } from '../../apollo/user/query';
import { useMutation, useQuery } from '@apollo/client';
import { T } from '../../libs/types/common';
import { LIKE_TARGET_PHARMACY } from '../../apollo/user/mutation';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';
import { getPharmacyLocationLabel } from '../../libs/utils/pharmacy-location';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const mobileMotionEase = [0.22, 1, 0.36, 1] as const;

const formatTypeLabel = (type: PharmacyType | string) =>
	String(type)
		.toLowerCase()
		.replace(/_/g, ' ')
		.replace(/\b\w/g, (letter) => letter.toUpperCase());

const getActiveFilterChips = (input: PharmaciesInquiry) => {
	const chips: Array<{ key: string; label: string; remove: Partial<PharmaciesInquiry['search']> }> = [];
	input.search.locationList?.forEach((location) => {
		chips.push({
			key: `location-${location}`,
			label: getPharmacyLocationLabel(location),
			remove: { locationList: input.search.locationList?.filter((item) => item !== location) },
		});
	});
	input.search.typeList?.forEach((type) => {
		chips.push({
			key: `type-${type}`,
			label: formatTypeLabel(type),
			remove: { typeList: input.search.typeList?.filter((item) => item !== type) },
		});
	});
	if (input.search.openNow) chips.push({ key: 'openNow', label: 'Open now', remove: { openNow: undefined } });
	if (input.search.open24Hours) chips.push({ key: 'open24Hours', label: '24/7', remove: { open24Hours: undefined } });
	if (input.search.hasDelivery) chips.push({ key: 'hasDelivery', label: 'Delivery', remove: { hasDelivery: undefined } });
	if (input.search.acceptsInsurance) chips.push({ key: 'acceptsInsurance', label: 'Insurance', remove: { acceptsInsurance: undefined } });
	return chips;
};

const PharmacyList: NextPage = ({ initialInput, ...props }: any) => {
	const device = useDeviceDetect();
	const router = useRouter();
	const reduceMotion = useReducedMotion();
	const [searchFilter, setSearchFilter] = useState<PharmaciesInquiry>(
		router?.query?.input ? JSON.parse(router?.query?.input as string) : initialInput,
	);
	const [mobileDraftFilter, setMobileDraftFilter] = useState<PharmaciesInquiry>(
		router?.query?.input ? JSON.parse(router?.query?.input as string) : initialInput,
	);
	const [mobileSearchText, setMobileSearchText] = useState(searchFilter.search.text ?? '');
	const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
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
			setMobileDraftFilter(inputObj);
			setMobileSearchText(inputObj.search?.text ?? '');
		}

		setCurrentPage(searchFilter.page === undefined ? 1 : searchFilter.page);
	}, [router]);

	useEffect(() => {
		//getPharmaciesRefetch({input:searchFilter})
	}, [searchFilter]);

	useEffect(() => {
		if (!mobileFiltersOpen) return;
		const originalOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		return () => {
			document.body.style.overflow = originalOverflow;
		};
	}, [mobileFiltersOpen]);

	useEffect(() => {
		const handleKeyDown = (event: globalThis.KeyboardEvent) => {
			if (event.key === 'Escape') setMobileFiltersOpen(false);
		};
		if (mobileFiltersOpen) window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [mobileFiltersOpen]);

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

	const sanitizeSearch = (search: PharmaciesInquiry['search']) => ({
		...search,
		locationList: search.locationList?.length ? search.locationList : undefined,
		typeList: search.typeList?.length ? search.typeList : undefined,
		text: search.text?.trim() ? search.text.trim() : undefined,
		deliveryFeeRange:
			search.deliveryFeeRange && (search.deliveryFeeRange.start || search.deliveryFeeRange.end)
				? search.deliveryFeeRange
				: undefined,
	});

	const applyInquiry = async (next: PharmaciesInquiry, closeSheet = true) => {
		const cleanNext = { ...next, search: sanitizeSearch(next.search) };
		setSearchFilter(cleanNext);
		setMobileDraftFilter(cleanNext);
		setMobileSearchText(cleanNext.search.text ?? '');
		setCurrentPage(cleanNext.page ?? 1);
		await router.push(`/pharmacies?input=${JSON.stringify(cleanNext)}`, undefined, { scroll: false });
		if (closeSheet) setMobileFiltersOpen(false);
	};

	const openMobileFilters = () => {
		setMobileDraftFilter(searchFilter);
		setMobileFiltersOpen(true);
	};

	const applyMobileSearch = async () => {
		await applyInquiry({ ...searchFilter, page: 1, search: { ...searchFilter.search, text: mobileSearchText || undefined } }, false);
	};

	const updateDraftSearch = (value: Partial<PharmaciesInquiry['search']>) => {
		setMobileDraftFilter((current) => ({ ...current, page: 1, search: { ...current.search, ...value } }));
	};

	const toggleDraftList = (key: 'locationList' | 'typeList', value: PharmacyLocation | PharmacyType) => {
		const current = (mobileDraftFilter.search[key] ?? []) as unknown as Array<PharmacyLocation | PharmacyType>;
		const next = current.includes(value) ? current.filter((item) => item !== value) : [...current, value];
		updateDraftSearch({ [key]: next.length ? next : undefined });
	};

	const removeMobileChip = async (chip: ReturnType<typeof getActiveFilterChips>[number]) => {
		await applyInquiry({ ...searchFilter, page: 1, search: { ...searchFilter.search, ...chip.remove } }, false);
	};

	const loadMoreMobile = async () => {
		await applyInquiry({ ...searchFilter, page: 1, limit: searchFilter.limit + 6 }, false);
	};

	const sortingClickHandler = (e: MouseEvent<HTMLElement>) => {
		setAnchorEl(e.currentTarget);
		setSortingOpen(true);
	};

	const sortingCloseHandler = () => {
		setSortingOpen(false);
		setAnchorEl(null);
	};

	const sortingHandler = async (e: React.MouseEvent<HTMLLIElement>) => {
		let nextFilter = searchFilter;
		switch (e.currentTarget.id) {
			case 'new':
				nextFilter = { ...searchFilter, page: 1, sort: 'createdAt', direction: Direction.DESC };
				setFilterSortName('New');
				break;
			case 'lowest':
				nextFilter = { ...searchFilter, page: 1, sort: 'pharmacyDeliveryFee', direction: Direction.ASC, search: { ...searchFilter.search, hasDelivery: true } };
				setFilterSortName('Lowest delivery fee');
				break;
			case 'highest':
				nextFilter = { ...searchFilter, page: 1, sort: 'pharmacyDeliveryFee', direction: Direction.DESC, search: { ...searchFilter.search, hasDelivery: true } };
				setFilterSortName('Highest delivery fee');
		}
		setSortingOpen(false);
		setAnchorEl(null);
		if (device === 'mobile') {
			await applyInquiry(nextFilter, false);
		} else {
			setSearchFilter(nextFilter);
		}
	};

	const clearFilters = async () => {
		setSearchFilter(initialInput);
		setMobileDraftFilter(initialInput);
		setMobileSearchText('');
		await router.push(`/pharmacies?input=${JSON.stringify(initialInput)}`, undefined, { scroll: false });
	};

	const activeFilterChips = useMemo(() => getActiveFilterChips(searchFilter), [searchFilter]);
	const mobileListVariants = {
		hidden: { opacity: 1 },
		visible: {
			opacity: 1,
			transition: { staggerChildren: reduceMotion ? 0 : 0.055 },
		},
	};
	const mobileCardVariants = {
		hidden: reduceMotion ? { opacity: 0 } : { opacity: 0, y: 14 },
		visible: {
			opacity: 1,
			y: 0,
			transition: { duration: reduceMotion ? 0.01 : 0.34, ease: mobileMotionEase },
		},
	};
	if (device === 'mobile') {
		return (
			<main id="catalog-mobile-page" className="catalog-mobile-page">
				<section className="catalog-mobile-hero">
					<span>Pharmacy directory</span>
					<h1>Find pharmacies across Uzbekistan</h1>
					<p>Filter pharmacies by region, available services, and working hours before you visit.</p>
					<div className="catalog-mobile-hero__meta">
						<strong aria-live="polite">
							{getPharmaciesLoading && !properties.length ? 'Loading pharmacies...' : `${total} ${total === 1 ? 'pharmacy' : 'pharmacies'} available`}
						</strong>
						<button type="button" onClick={sortingClickHandler} aria-haspopup="menu" aria-expanded={sortingOpen}>
							Sort by: <b>{filterSortName}</b>
							<KeyboardArrowDownRoundedIcon />
						</button>
					</div>
				</section>

				<section className="catalog-mobile-search" aria-label="Search and filters">
					<div className="catalog-mobile-search__row">
						<label className="catalog-mobile-search__input">
							<SearchRoundedIcon />
							<input
								value={mobileSearchText}
								placeholder="Name or address"
								onChange={(event) => setMobileSearchText(event.target.value)}
								onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => event.key === 'Enter' && applyMobileSearch()}
							/>
						</label>
						<motion.button
							type="button"
							className="catalog-mobile-search__filter"
							onClick={openMobileFilters}
							whileTap={reduceMotion ? undefined : { scale: 0.96 }}
							aria-label="Open filters"
						>
							<TuneRoundedIcon />
						</motion.button>
					</div>
					<div className="catalog-mobile-chip-row" aria-label="Active pharmacy filters">
						{activeFilterChips.length ? (
							activeFilterChips.map((chip) => (
								<motion.button
									type="button"
									className="catalog-mobile-chip is-active"
									key={chip.key}
									onClick={() => removeMobileChip(chip)}
									whileTap={reduceMotion ? undefined : { scale: 0.96 }}
								>
									{chip.label}
									<CloseRoundedIcon />
								</motion.button>
							))
						) : (
							<span className="catalog-mobile-chip">All pharmacies</span>
						)}
						<button type="button" className="catalog-mobile-chip" onClick={openMobileFilters}>
							More filters
							<KeyboardArrowDownRoundedIcon />
						</button>
					</div>
				</section>

				<section className="catalog-mobile-list" aria-label="Pharmacy results">
					{getPharmaciesLoading && properties.length === 0 ? (
						<div className="catalog-mobile-list__skeletons" aria-label="Loading pharmacies">
							{Array.from({ length: 4 }).map((_, index) => <div className="catalog-pharmacy-skeleton" aria-hidden="true" key={index}><div /><span /><span /><span /><span /></div>)}
						</div>
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
						<>
							<motion.div
								className="catalog-mobile-card-list"
								variants={mobileListVariants}
								initial="hidden"
								animate="visible"
							>
								{properties.map((property: Property) => (
									<motion.div
										className="catalog-mobile-card-motion"
										variants={mobileCardVariants}
										whileTap={reduceMotion ? undefined : { scale: 0.985 }}
										key={property._id}
									>
										<CatalogPharmacyCard pharmacy={property} onFavorite={likePropertyHandler} />
									</motion.div>
								))}
							</motion.div>
							{properties.length < total && (
								<button type="button" className="catalog-mobile-load-more" onClick={loadMoreMobile}>
									Load more pharmacies
								</button>
							)}
						</>
					)}
				</section>

				<AnimatePresence>
					{mobileFiltersOpen && (
						<>
							<motion.button
								type="button"
								className="catalog-mobile-filter-backdrop"
								aria-label="Close filters"
								onClick={() => setMobileFiltersOpen(false)}
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								transition={{ duration: reduceMotion ? 0.01 : 0.18 }}
							/>
							<motion.aside
								className="catalog-mobile-filter-sheet"
								role="dialog"
								aria-modal="true"
								aria-labelledby="catalog-mobile-filter-title"
								initial={reduceMotion ? { opacity: 0 } : { y: '100%' }}
								animate={reduceMotion ? { opacity: 1 } : { y: 0 }}
								exit={reduceMotion ? { opacity: 0 } : { y: '100%' }}
								transition={{ duration: reduceMotion ? 0.01 : 0.38, ease: mobileMotionEase }}
							>
								<div className="catalog-mobile-filter-sheet__handle" />
								<header>
									<div>
										<button type="button" onClick={() => setMobileFiltersOpen(false)} aria-label="Close filters">
											<ArrowBackRoundedIcon />
										</button>
										<h2 id="catalog-mobile-filter-title">Filters</h2>
									</div>
									<button type="button" onClick={() => setMobileDraftFilter(initialInput)}>Reset all</button>
								</header>
								<div className="catalog-mobile-filter-sheet__body">
									<section>
										<h3>Region</h3>
										<div className="catalog-mobile-filter-grid">
											{Object.values(PharmacyLocation).slice(0, 8).map((location) => {
												const checked = mobileDraftFilter.search.locationList?.includes(location) ?? false;
												return (
													<button type="button" className={checked ? 'is-selected' : ''} onClick={() => toggleDraftList('locationList', location)} key={location}>
														{checked ? <CheckBoxRoundedIcon /> : <CheckBoxOutlineBlankRoundedIcon />}
														{getPharmacyLocationLabel(location)}
													</button>
												);
											})}
										</div>
									</section>
									<section>
										<h3>Pharmacy type</h3>
										<div className="catalog-mobile-filter-stack">
											{Object.values(PharmacyType).map((type) => {
												const checked = mobileDraftFilter.search.typeList?.includes(type) ?? false;
												return (
													<button type="button" className={checked ? 'is-selected' : ''} onClick={() => toggleDraftList('typeList', type)} key={type}>
														{checked ? <CheckBoxRoundedIcon /> : <CheckBoxOutlineBlankRoundedIcon />}
														{formatTypeLabel(type)}
													</button>
												);
											})}
										</div>
									</section>
									<section>
										<h3>Services</h3>
										<div className="catalog-mobile-filter-stack">
											<button type="button" className={mobileDraftFilter.search.openNow ? 'is-selected' : ''} onClick={() => updateDraftSearch({ openNow: mobileDraftFilter.search.openNow ? undefined : true })}>
												{mobileDraftFilter.search.openNow ? <CheckBoxRoundedIcon /> : <CheckBoxOutlineBlankRoundedIcon />}
												Open now
											</button>
											<button type="button" className={mobileDraftFilter.search.open24Hours ? 'is-selected' : ''} onClick={() => updateDraftSearch({ open24Hours: mobileDraftFilter.search.open24Hours ? undefined : true })}>
												{mobileDraftFilter.search.open24Hours ? <CheckBoxRoundedIcon /> : <CheckBoxOutlineBlankRoundedIcon />}
												Open 24/7
											</button>
											<button type="button" className={mobileDraftFilter.search.hasDelivery ? 'is-selected' : ''} onClick={() => updateDraftSearch({ hasDelivery: mobileDraftFilter.search.hasDelivery ? undefined : true })}>
												{mobileDraftFilter.search.hasDelivery ? <CheckBoxRoundedIcon /> : <CheckBoxOutlineBlankRoundedIcon />}
												Delivery available
											</button>
											<button type="button" className={mobileDraftFilter.search.acceptsInsurance ? 'is-selected' : ''} onClick={() => updateDraftSearch({ acceptsInsurance: mobileDraftFilter.search.acceptsInsurance ? undefined : true })}>
												{mobileDraftFilter.search.acceptsInsurance ? <CheckBoxRoundedIcon /> : <CheckBoxOutlineBlankRoundedIcon />}
												Accepts insurance
											</button>
										</div>
									</section>
									<section>
										<h3>Delivery fee</h3>
										<div className="catalog-mobile-fee-row">
											<input
												type="number"
												inputMode="numeric"
												placeholder="Min"
												value={mobileDraftFilter.search.deliveryFeeRange?.start ?? ''}
												onChange={(event) => updateDraftSearch({ deliveryFeeRange: { start: Number(event.target.value) || 0, end: mobileDraftFilter.search.deliveryFeeRange?.end ?? 100000 } })}
											/>
											<input
												type="number"
												inputMode="numeric"
												placeholder="Max"
												value={mobileDraftFilter.search.deliveryFeeRange?.end ?? ''}
												onChange={(event) => updateDraftSearch({ deliveryFeeRange: { start: mobileDraftFilter.search.deliveryFeeRange?.start ?? 0, end: Number(event.target.value) || 100000 } })}
											/>
										</div>
									</section>
								</div>
								<footer>
									<button type="button" onClick={() => applyInquiry(mobileDraftFilter)}>Apply filters</button>
								</footer>
							</motion.aside>
						</>
					)}
				</AnimatePresence>

				<Menu anchorEl={anchorEl} open={sortingOpen} onClose={sortingCloseHandler} sx={{ paddingTop: '5px' }}>
					<MenuItem onClick={sortingHandler} id="new" disableRipple>New</MenuItem>
					<MenuItem onClick={sortingHandler} id="lowest" disableRipple>Lowest delivery fee</MenuItem>
					<MenuItem onClick={sortingHandler} id="highest" disableRipple>Highest delivery fee</MenuItem>
				</Menu>
			</main>
		);
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
