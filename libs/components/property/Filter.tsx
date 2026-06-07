import React from 'react';
import { Button, Checkbox, FormControlLabel, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { useRouter } from 'next/router';
import { PharmacyLocation, PharmacyType } from '../../enums/property.enum';
import { PharmaciesInquiry } from '../../types/property/property.input';

interface FilterProps {
	searchFilter: PharmaciesInquiry;
	setSearchFilter: (input: PharmaciesInquiry) => void;
	initialInput: PharmaciesInquiry;
}

const Filter = ({ searchFilter, setSearchFilter, initialInput }: FilterProps) => {
	const router = useRouter();

	const updateSearch = (value: Partial<PharmaciesInquiry['search']>) => {
		setSearchFilter({ ...searchFilter, page: 1, search: { ...searchFilter.search, ...value } });
	};

	const applyFilter = async () => {
		await router.push(`/property?input=${JSON.stringify(searchFilter)}`, undefined, { scroll: false });
	};

	return (
		<Stack className="filter-main">
			<Typography variant="h5">Find a pharmacy</Typography>
			<TextField
				label="Search"
				value={searchFilter.search.text ?? ''}
				onChange={(event) => updateSearch({ text: event.target.value || undefined })}
			/>
			<TextField
				select
				label="Location"
				value={searchFilter.search.locationList?.[0] ?? ''}
				onChange={(event) => updateSearch({ locationList: event.target.value ? [event.target.value as PharmacyLocation] : undefined })}
			>
				<MenuItem value="">All locations</MenuItem>
				{Object.values(PharmacyLocation).map((location) => <MenuItem key={location} value={location}>{location}</MenuItem>)}
			</TextField>
			<TextField
				select
				label="Pharmacy type"
				value={searchFilter.search.typeList?.[0] ?? ''}
				onChange={(event) => updateSearch({ typeList: event.target.value ? [event.target.value as PharmacyType] : undefined })}
			>
				<MenuItem value="">All types</MenuItem>
				{Object.values(PharmacyType).map((type) => <MenuItem key={type} value={type}>{type}</MenuItem>)}
			</TextField>
			<FormControlLabel
				control={<Checkbox checked={searchFilter.search.hasDelivery === true} onChange={(event) => updateSearch({ hasDelivery: event.target.checked ? true : undefined })} />}
				label="Delivery available"
			/>
			<FormControlLabel
				control={<Checkbox checked={searchFilter.search.acceptsInsurance === true} onChange={(event) => updateSearch({ acceptsInsurance: event.target.checked ? true : undefined })} />}
				label="Accepts insurance"
			/>
			<Stack direction="row" spacing={1}>
				<Button variant="contained" onClick={applyFilter}>Search</Button>
				<Button variant="outlined" onClick={() => setSearchFilter(initialInput)}>Reset</Button>
			</Stack>
		</Stack>
	);
};

export default Filter;
