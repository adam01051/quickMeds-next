import React, { useState } from 'react';
import { Button, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { useRouter } from 'next/router';
import { PharmacyLocation, PharmacyType } from '../../enums/property.enum';
import { PharmaciesInquiry } from '../../types/property/property.input';

interface HeaderFilterProps {
	initialInput: PharmaciesInquiry;
}

const HeaderFilter = ({ initialInput }: HeaderFilterProps) => {
	const router = useRouter();
	const [searchFilter, setSearchFilter] = useState<PharmaciesInquiry>(initialInput);
	const updateSearch = (value: Partial<PharmaciesInquiry['search']>) =>
		setSearchFilter({ ...searchFilter, search: { ...searchFilter.search, ...value } });

	return (
		<Stack className="search-box">
			<Typography variant="h3">Find trusted pharmacies near you</Typography>
			<Stack direction="row" spacing={2}>
				<TextField
					placeholder="Search pharmacies"
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
					label="Type"
					value={searchFilter.search.typeList?.[0] ?? ''}
					onChange={(event) => updateSearch({ typeList: event.target.value ? [event.target.value as PharmacyType] : undefined })}
				>
					<MenuItem value="">All types</MenuItem>
					{Object.values(PharmacyType).map((type) => <MenuItem key={type} value={type}>{type}</MenuItem>)}
				</TextField>
				<Button variant="contained" onClick={() => router.push(`/property?input=${JSON.stringify(searchFilter)}`)}>Search</Button>
			</Stack>
		</Stack>
	);
};

HeaderFilter.defaultProps = {
	initialInput: { page: 1, limit: 9, sort: 'createdAt', direction: 'DESC', search: {} },
};

export default HeaderFilter;
