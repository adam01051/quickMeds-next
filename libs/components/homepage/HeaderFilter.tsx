import React, { useEffect, useRef, useState } from 'react';
import { Button, Checkbox, Divider, FormControlLabel, Modal } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import NightlightOutlinedIcon from '@mui/icons-material/NightlightOutlined';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import LocalPharmacyOutlinedIcon from '@mui/icons-material/LocalPharmacyOutlined';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import { useRouter } from 'next/router';
import { PharmacyLocation, PharmacyType } from '../../enums/property.enum';
import { PharmaciesInquiry } from '../../types/property/property.input';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { getPharmacyLocationLabel } from '../../utils/pharmacy-location';
import useDeviceDetect from '../../hooks/useDeviceDetect';

interface HeaderFilterProps {
	initialInput: PharmaciesInquiry;
}

const HeaderFilter = ({ initialInput }: HeaderFilterProps) => {
	const device = useDeviceDetect();
	const router = useRouter();
	const locationRef = useRef<HTMLDivElement>(null);
	const typeRef = useRef<HTMLDivElement>(null);
	const [searchFilter, setSearchFilter] = useState<PharmaciesInquiry>(initialInput);
	const [openLocation, setOpenLocation] = useState(false);
	const [openType, setOpenType] = useState(false);
	const [openAdvancedFilter, setOpenAdvancedFilter] = useState(false);
	const shouldReduceMotion = useReducedMotion();

	const updateSearch = (value: Partial<PharmaciesInquiry['search']>) =>
		setSearchFilter({ ...searchFilter, search: { ...searchFilter.search, ...value } });

	useEffect(() => {
		const closeMenus = (event: MouseEvent) => {
			if (!locationRef.current?.contains(event.target as Node)) setOpenLocation(false);
			if (!typeRef.current?.contains(event.target as Node)) setOpenType(false);
		};
		document.addEventListener('mousedown', closeMenus);
		return () => document.removeEventListener('mousedown', closeMenus);
	}, []);

	const pushSearchHandler = async () => {
		await router.push(`/pharmacies?input=${JSON.stringify(searchFilter)}`);
	};

	const resetFilterHandler = () => setSearchFilter(initialInput);

	return (
		<div className="home-search-area">
			<motion.div
				className="search-box clinical-search-box"
				initial={false}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.4, delay: 0.12, ease: 'easeOut' }}
			>
				<div className="select-box">
					<div className="box search-field on">
						{device !== 'mobile' && <SearchRoundedIcon className="field-icon" />}
						<span className="field-label">Pharmacy</span>
						<input
							className="header-search-input"
							placeholder={device === 'mobile' ? 'Search pharmacy name or address' : 'Pharmacy or address'}
							aria-label="Search pharmacy name or address"
							value={searchFilter.search.text ?? ''}
							onChange={(event) => updateSearch({ text: event.target.value || undefined })}
							onKeyDown={(event) => event.key === 'Enter' && pushSearchHandler()}
						/>
					</div>
					<motion.button
						type="button"
						className={`box location-field ${openLocation ? 'on' : ''}`}
						aria-expanded={openLocation}
						aria-label="Choose pharmacy region"
						whileHover={shouldReduceMotion ? undefined : { y: -1 }}
						whileTap={shouldReduceMotion ? undefined : { scale: 0.99 }}
						onClick={() => {
							setOpenLocation(!openLocation);
							setOpenType(false);
						}}
					>
						{device !== 'mobile' && <LocationOnOutlinedIcon className="field-icon" />}
						<span className="field-copy">
							<small>Region</small>
							<strong>{getPharmacyLocationLabel(searchFilter.search.locationList?.[0])}</strong>
						</span>
						<ExpandMoreIcon />
					</motion.button>
					<motion.button
						type="button"
						className={`box type-field ${openType ? 'on' : ''}`}
						aria-expanded={openType}
						aria-label="Choose pharmacy type"
						whileHover={shouldReduceMotion ? undefined : { y: -1 }}
						whileTap={shouldReduceMotion ? undefined : { scale: 0.99 }}
						onClick={() => {
							setOpenType(!openType);
							setOpenLocation(false);
						}}
					>
						{device !== 'mobile' && <LocalPharmacyOutlinedIcon className="field-icon" />}
						<span className="field-copy">
							<small>Pharmacy type</small>
							<strong>{searchFilter.search.typeList?.[0] ?? (device === 'mobile' ? 'All pharmacy types' : 'Pharmacy type')}</strong>
						</span>
						<ExpandMoreIcon />
					</motion.button>
				</div>

				<div className="search-box-other">
					<motion.button
						type="button"
						className={`advanced-filter ${openAdvancedFilter ? 'is-active' : ''}`}
						aria-label="Open advanced pharmacy filters"
						aria-expanded={openAdvancedFilter}
						whileHover={shouldReduceMotion ? undefined : { y: -1 }}
						whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
						onClick={() => setOpenAdvancedFilter(true)}
					>
						<TuneRoundedIcon />
						<span>Filters</span>
					</motion.button>
					<motion.button
						type="button"
						className="search-btn"
						aria-label="Search pharmacies"
						whileHover={shouldReduceMotion ? undefined : { y: -1 }}
						whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
						onClick={pushSearchHandler}
					>
						{device === 'mobile' && <img src="/img/icons/search_white.svg" alt="" />}
						<span>Search</span>
						{device !== 'mobile' && <ArrowForwardRoundedIcon />}
					</motion.button>
				</div>

				<AnimatePresence>
					{openLocation && (
						<motion.div
							className="filter-location on clinical-filter-panel"
							ref={locationRef}
							initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -4 }}
							transition={{ duration: 0.18 }}
						>
							<button
								type="button"
								onClick={() => {
									updateSearch({ locationList: undefined });
									setOpenLocation(false);
								}}
							>
								<span>All regions</span>
							</button>
							{Object.values(PharmacyLocation).map((location) => (
								<button
									type="button"
									key={location}
									onClick={() => {
										updateSearch({ locationList: [location] });
										setOpenLocation(false);
									}}
								>
									<span>{getPharmacyLocationLabel(location)}</span>
								</button>
							))}
						</motion.div>
					)}
				</AnimatePresence>

				<AnimatePresence>
					{openType && (
						<motion.div
							className="filter-type on clinical-filter-panel"
							ref={typeRef}
							initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -4 }}
							transition={{ duration: 0.18 }}
						>
							{Object.values(PharmacyType).map((type) => (
								<button
									type="button"
									className="pharmacy-type-option"
									key={type}
									onClick={() => {
										updateSearch({ typeList: [type] });
										setOpenType(false);
									}}
								>
									<img src="/img/icons/securePayment.svg" alt="" />
									<span>{type}</span>
								</button>
							))}
						</motion.div>
					)}
				</AnimatePresence>
			</motion.div>
			<div className="home-search-future" aria-label="Pharmacy discovery options">
				<button
					type="button"
					className={searchFilter.search.openNow ? 'is-active' : ''}
					aria-pressed={searchFilter.search.openNow === true}
					onClick={() => updateSearch({ openNow: searchFilter.search.openNow ? undefined : true })}
				>
					<AccessTimeRoundedIcon />
					<span><strong>Open now</strong></span>
				</button>
				<button
					type="button"
					className={searchFilter.search.open24Hours ? 'is-active' : ''}
					aria-pressed={searchFilter.search.open24Hours === true}
					onClick={() => updateSearch({ open24Hours: searchFilter.search.open24Hours ? undefined : true })}
				>
					<NightlightOutlinedIcon />
					<span><strong>24/7 pharmacies</strong></span>
				</button>
				<button type="button" disabled>
					<LocationOnOutlinedIcon />
					<span><strong>Use current location</strong><small className="future-item-label">Coming soon</small></span>
				</button>
				{device !== 'mobile' && <span className="home-search-future__label">Current location coming soon</span>}
			</div>

			<AnimatePresence>
				{openAdvancedFilter && (
					<Modal open onClose={() => setOpenAdvancedFilter(false)} className="clinical-advanced-modal">
						<motion.div
							className="advanced-filter-modal-shell"
							initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.985 }}
							animate={{ opacity: 1, y: 0, scale: 1 }}
							exit={{ opacity: 0, y: shouldReduceMotion ? 0 : 8, scale: 0.99 }}
							transition={{ duration: 0.2, ease: 'easeOut' }}
						>
							<div className="advanced-filter-modal">
								<button type="button" aria-label="Close advanced filters" className="close" onClick={() => setOpenAdvancedFilter(false)}>
									<CloseIcon />
								</button>
								<div className="top">
									<span>Find a pharmacy</span>
									<div className="search-input-box">
										<img src="/img/icons/search.svg" alt="" />
										<input
											value={searchFilter.search.text ?? ''}
											placeholder="Pharmacy name or address"
											aria-label="Pharmacy name or address"
											onChange={(event) => updateSearch({ text: event.target.value || undefined })}
										/>
									</div>
								</div>
								<Divider sx={{ mt: '30px', mb: '35px' }} />
								<div className="middle pharmacy-advanced-middle">
									<div className="row-box">
										<div className="box">
											<span>services</span>
											<div className="inside pharmacy-service-options">
												<FormControlLabel
													control={<Checkbox checked={searchFilter.search.hasDelivery === true} onChange={(e) => updateSearch({ hasDelivery: e.target.checked || undefined })} />}
													label="Delivery"
												/>
												<FormControlLabel
													control={<Checkbox checked={searchFilter.search.acceptsInsurance === true} onChange={(e) => updateSearch({ acceptsInsurance: e.target.checked || undefined })} />}
													label="Insurance"
												/>
											</div>
										</div>
										<div className="box">
											<span>delivery fee</span>
											<div className="inside pharmacy-range">
												<input
													type="number"
													placeholder="Minimum"
													value={searchFilter.search.deliveryFeeRange?.start ?? ''}
													onChange={(e) => updateSearch({ deliveryFeeRange: { start: Number(e.target.value) || 0, end: searchFilter.search.deliveryFeeRange?.end ?? 100000 } })}
												/>
												<div className="minus-line" />
												<input
													type="number"
													placeholder="Maximum"
													value={searchFilter.search.deliveryFeeRange?.end ?? ''}
													onChange={(e) => updateSearch({ deliveryFeeRange: { start: searchFilter.search.deliveryFeeRange?.start ?? 0, end: Number(e.target.value) || 100000 } })}
												/>
											</div>
										</div>
									</div>
								</div>
								<Divider sx={{ mt: '60px', mb: '18px' }} />
								<div className="bottom">
									<button type="button" className="reset-filter" onClick={resetFilterHandler}>
										<img src="/img/icons/reset.svg" alt="" />
										<span>Reset all filters</span>
									</button>
									<Button startIcon={<img src="/img/icons/search.svg" alt="" />} className="search-btn" onClick={pushSearchHandler}>
										Search
									</Button>
								</div>
							</div>
						</motion.div>
					</Modal>
				)}
			</AnimatePresence>
		</div>
	);
};

HeaderFilter.defaultProps = {
	initialInput: { page: 1, limit: 9, sort: 'createdAt', direction: 'DESC', search: {} },
};

export default HeaderFilter;
