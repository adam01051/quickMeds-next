import React, { useEffect, useRef, useState } from 'react';
import { Button, Checkbox, Divider, FormControlLabel, Modal } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useRouter } from 'next/router';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { PharmacyLocation, PharmacyType } from '../../enums/property.enum';
import { PharmaciesInquiry } from '../../types/property/property.input';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

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
		await router.push(`/property?input=${JSON.stringify(searchFilter)}`);
	};

	const resetFilterHandler = () => setSearchFilter(initialInput);

	if (device === 'mobile') return <div>HEADER FILTER MOBILE</div>;

	return (
		<>
			<motion.div
				className="search-box clinical-search-box"
				initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.4, delay: 0.12, ease: 'easeOut' }}
			>
				<div className="select-box">
					<div className="box search-field on">
						<span className="field-label">Pharmacy</span>
						<input
							className="header-search-input"
							placeholder="Search pharmacy name or address"
							aria-label="Search pharmacy name or address"
							value={searchFilter.search.text ?? ''}
							onChange={(event) => updateSearch({ text: event.target.value || undefined })}
							onKeyDown={(event) => event.key === 'Enter' && pushSearchHandler()}
						/>
					</div>
					<motion.button
						type="button"
						className={`box ${openLocation ? 'on' : ''}`}
						aria-expanded={openLocation}
						aria-label="Choose pharmacy location"
						whileHover={shouldReduceMotion ? undefined : { y: -1 }}
						whileTap={shouldReduceMotion ? undefined : { scale: 0.99 }}
						onClick={() => {
							setOpenLocation(!openLocation);
							setOpenType(false);
						}}
					>
						<span className="field-copy">
							<small>Location</small>
							<strong>{searchFilter.search.locationList?.[0]?.replaceAll('_', ' ') ?? 'Choose area'}</strong>
						</span>
						<ExpandMoreIcon />
					</motion.button>
					<motion.button
						type="button"
						className={`box ${openType ? 'on' : ''}`}
						aria-expanded={openType}
						aria-label="Choose pharmacy type"
						whileHover={shouldReduceMotion ? undefined : { y: -1 }}
						whileTap={shouldReduceMotion ? undefined : { scale: 0.99 }}
						onClick={() => {
							setOpenType(!openType);
							setOpenLocation(false);
						}}
					>
						<span className="field-copy">
							<small>Pharmacy type</small>
							<strong>{searchFilter.search.typeList?.[0] ?? 'All pharmacy types'}</strong>
						</span>
						<ExpandMoreIcon />
					</motion.button>
				</div>

				<div className="search-box-other">
					<motion.button
						type="button"
						className="advanced-filter"
						whileHover={shouldReduceMotion ? undefined : { y: -1 }}
						whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
						onClick={() => setOpenAdvancedFilter(true)}
					>
						<img src="/img/icons/tune.svg" alt="" />
						<span>Advanced</span>
					</motion.button>
					<motion.button
						type="button"
						className="search-btn"
						aria-label="Search pharmacies"
						whileHover={shouldReduceMotion ? undefined : { y: -1 }}
						whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
						onClick={pushSearchHandler}
					>
						<img src="/img/icons/search_white.svg" alt="" />
						<span>Search</span>
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
							{Object.values(PharmacyLocation).map((location) => (
								<button
									type="button"
									key={location}
									onClick={() => {
										updateSearch({ locationList: [location] });
										setOpenLocation(false);
									}}
								>
									<img src="/img/banner/header1.svg" alt="" />
									<span>{location.replaceAll('_', ' ')}</span>
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
													onChange={(e) => updateSearch({ deliveryFeeRange: { start: Number(e.target.value) || 0, end: searchFilter.search.deliveryFeeRange?.end ?? 1000 } })}
												/>
												<div className="minus-line" />
												<input
													type="number"
													placeholder="Maximum"
													value={searchFilter.search.deliveryFeeRange?.end ?? ''}
													onChange={(e) => updateSearch({ deliveryFeeRange: { start: searchFilter.search.deliveryFeeRange?.start ?? 0, end: Number(e.target.value) || 1000 } })}
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
		</>
	);
};

HeaderFilter.defaultProps = {
	initialInput: { page: 1, limit: 9, sort: 'createdAt', direction: 'DESC', search: {} },
};

export default HeaderFilter;
