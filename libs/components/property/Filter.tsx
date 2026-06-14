import React, { useState } from 'react';
import { Button, Checkbox, Stack, Typography } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useRouter } from 'next/router';
import { PharmacyLocation, PharmacyType } from '../../enums/property.enum';
import { PharmaciesInquiry } from '../../types/property/property.input';
import { getPharmacyLocationLabel } from '../../utils/pharmacy-location';

interface FilterProps {
	searchFilter: PharmaciesInquiry;
	setSearchFilter: (input: PharmaciesInquiry) => void;
	initialInput: PharmaciesInquiry;
}

const Filter = ({ searchFilter, setSearchFilter, initialInput }: FilterProps) => {
	const router = useRouter();
	const [showMore, setShowMore] = useState(false);

	const apply = async (next: PharmaciesInquiry) => {
		setSearchFilter(next);
		await router.push(`/pharmacies?input=${JSON.stringify(next)}`, undefined, { scroll: false });
	};

	const updateSearch = (value: Partial<PharmaciesInquiry['search']>) =>
		apply({ ...searchFilter, page: 1, search: { ...searchFilter.search, ...value } });

	const toggleList = (key: 'locationList' | 'typeList', value: PharmacyLocation | PharmacyType) => {
		const current = (searchFilter.search[key] ?? []) as unknown as Array<PharmacyLocation | PharmacyType>;
		const next = current.includes(value) ? current.filter((item) => item !== value) : [...current, value];
		updateSearch({ [key]: next.length ? next : undefined });
	};

	return (
		<Stack className="filter-main">
			<Stack className="find-your-home">
				<Typography className="title-main">Find your pharmacy</Typography>
				<Stack className="input-box">
					<img src="/img/icons/search.svg" alt="" />
					<input
						className="search-input"
						placeholder="Name or address"
						value={searchFilter.search.text ?? ''}
						onChange={(event) => setSearchFilter({ ...searchFilter, page: 1, search: { ...searchFilter.search, text: event.target.value || undefined } })}
						onKeyDown={(event) => event.key === 'Enter' && apply(searchFilter)}
					/>
				</Stack>

				<Typography className="title">Region</Typography>
				<Stack className="property-location" sx={{ height: showMore ? 'auto !important' : undefined }}>
					{Object.values(PharmacyLocation).map((location) => (
						<Stack className="input-box" key={location}>
							<Checkbox
								className="property-checkbox"
								checked={searchFilter.search.locationList?.includes(location) ?? false}
								onChange={() => toggleList('locationList', location)}
							/>
							<Typography className="property-type">{getPharmacyLocationLabel(location)}</Typography>
						</Stack>
					))}
				</Stack>
				<Button className="show-more-filter" onClick={() => setShowMore(!showMore)}>
					{showMore ? 'Show less' : 'Show more'}
				</Button>

				<Typography className="title">Pharmacy type</Typography>
				{Object.values(PharmacyType).map((type) => (
					<Stack className="input-box" key={type}>
						<Checkbox
							className="property-checkbox"
							checked={searchFilter.search.typeList?.includes(type) ?? false}
							onChange={() => toggleList('typeList', type)}
						/>
						<Typography className="property-type">{type}</Typography>
					</Stack>
				))}

				<Typography className="title">Services</Typography>
				<Stack className="input-box">
					<Checkbox className="property-checkbox" checked={searchFilter.search.hasDelivery === true} onChange={(e) => updateSearch({ hasDelivery: e.target.checked || undefined })} />
					<Typography className="property-type">Delivery available</Typography>
				</Stack>
				<Stack className="input-box">
					<Checkbox className="property-checkbox" checked={searchFilter.search.acceptsInsurance === true} onChange={(e) => updateSearch({ acceptsInsurance: e.target.checked || undefined })} />
					<Typography className="property-type">Accepts insurance</Typography>
				</Stack>
				<Stack className="input-box">
					<Checkbox className="property-checkbox" checked={searchFilter.search.openNow === true} onChange={(e) => updateSearch({ openNow: e.target.checked || undefined })} />
					<Typography className="property-type">Open now</Typography>
				</Stack>
				<Stack className="input-box">
					<Checkbox className="property-checkbox" checked={searchFilter.search.open24Hours === true} onChange={(e) => updateSearch({ open24Hours: e.target.checked || undefined })} />
					<Typography className="property-type">Open 24/7</Typography>
				</Stack>

				<Typography className="title">Delivery fee</Typography>
				<Stack className="square-year-input">
					<input
						type="number"
						placeholder="Min"
						value={searchFilter.search.deliveryFeeRange?.start ?? ''}
						onChange={(e) => setSearchFilter({ ...searchFilter, page: 1, search: { ...searchFilter.search, deliveryFeeRange: { start: Number(e.target.value) || 0, end: searchFilter.search.deliveryFeeRange?.end ?? 100000 } } })}
					/>
					<div className="central-divider" />
					<input
						type="number"
						placeholder="Max"
						value={searchFilter.search.deliveryFeeRange?.end ?? ''}
						onChange={(e) => setSearchFilter({ ...searchFilter, page: 1, search: { ...searchFilter.search, deliveryFeeRange: { start: searchFilter.search.deliveryFeeRange?.start ?? 0, end: Number(e.target.value) || 100000 } } })}
					/>
				</Stack>

				<Stack className="button-group">
					<Button variant="contained" onClick={() => apply(searchFilter)}>Search</Button>
					<Button startIcon={<RefreshIcon />} onClick={() => apply(initialInput)}>Reset</Button>
				</Stack>
			</Stack>
		</Stack>
	);
};

export default Filter;
