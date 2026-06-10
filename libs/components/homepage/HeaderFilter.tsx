import React, { useEffect, useRef, useState } from 'react';
import { Button, Checkbox, Divider, FormControlLabel, Modal, Stack } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useRouter } from 'next/router';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { PharmacyLocation, PharmacyType } from '../../enums/property.enum';
import { PharmaciesInquiry } from '../../types/property/property.input';

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
			<Stack className="search-box">
				<Stack className="select-box">
					<div className="box on">
						<input
							className="header-search-input"
							placeholder="Search pharmacies"
							value={searchFilter.search.text ?? ''}
							onChange={(event) => updateSearch({ text: event.target.value || undefined })}
							onKeyDown={(event) => event.key === 'Enter' && pushSearchHandler()}
						/>
					</div>
					<div
						className={`box ${openLocation ? 'on' : ''}`}
						onClick={() => {
							setOpenLocation(!openLocation);
							setOpenType(false);
						}}
					>
						<span>{searchFilter.search.locationList?.[0] ?? 'Location'}</span>
						<ExpandMoreIcon />
					</div>
					<div
						className={`box ${openType ? 'on' : ''}`}
						onClick={() => {
							setOpenType(!openType);
							setOpenLocation(false);
						}}
					>
						<span>{searchFilter.search.typeList?.[0] ?? 'Pharmacy type'}</span>
						<ExpandMoreIcon />
					</div>
				</Stack>
				<Stack className="search-box-other">
					<div className="advanced-filter" onClick={() => setOpenAdvancedFilter(true)}>
						<img src="/img/icons/tune.svg" alt="" />
						<span>Advanced</span>
					</div>
					<div className="search-btn" onClick={pushSearchHandler}>
						<img src="/img/icons/search_white.svg" alt="Search" />
					</div>
				</Stack>

				<div className={`filter-location ${openLocation ? 'on' : ''}`} ref={locationRef}>
					{Object.values(PharmacyLocation).map((location) => (
						<div
							key={location}
							onClick={() => {
								updateSearch({ locationList: [location] });
								setOpenLocation(false);
							}}
						>
							<img src="/img/banner/header1.svg" alt="" />
							<span>{location.replaceAll('_', ' ')}</span>
						</div>
					))}
				</div>

				<div className={`filter-type ${openType ? 'on' : ''}`} ref={typeRef}>
					{Object.values(PharmacyType).map((type) => (
						<div
							className="pharmacy-type-option"
							key={type}
							onClick={() => {
								updateSearch({ typeList: [type] });
								setOpenType(false);
							}}
						>
							<img src="/img/icons/securePayment.svg" alt="" />
							<span>{type}</span>
						</div>
					))}
				</div>
			</Stack>

			<Modal open={openAdvancedFilter} onClose={() => setOpenAdvancedFilter(false)}>
				<div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: '#fff', borderRadius: '12px', outline: 'none' }}>
					<div className="advanced-filter-modal">
						<div className="close" onClick={() => setOpenAdvancedFilter(false)}>
							<CloseIcon />
						</div>
						<div className="top">
							<span>Find a pharmacy</span>
							<div className="search-input-box">
								<img src="/img/icons/search.svg" alt="" />
								<input
									value={searchFilter.search.text ?? ''}
									placeholder="Pharmacy name or address"
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
							<div onClick={resetFilterHandler}>
								<img src="/img/icons/reset.svg" alt="" />
								<span>Reset all filters</span>
							</div>
							<Button startIcon={<img src="/img/icons/search.svg" alt="" />} className="search-btn" onClick={pushSearchHandler}>
								Search
							</Button>
						</div>
					</div>
				</div>
			</Modal>
		</>
	);
};

HeaderFilter.defaultProps = {
	initialInput: { page: 1, limit: 9, sort: 'createdAt', direction: 'DESC', search: {} },
};

export default HeaderFilter;
