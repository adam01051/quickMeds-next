import React, { useState } from 'react';
import { Button, Checkbox, Stack, Typography } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useRouter } from 'next/router';
import { PharmacyLocation, PharmacyType } from '../../enums/property.enum';
import { PharmaciesInquiry } from '../../types/property/property.input';
import { useTranslation } from 'next-i18next';

interface FilterProps {
	searchFilter: PharmaciesInquiry;
	setSearchFilter: (input: PharmaciesInquiry) => void;
	initialInput: PharmaciesInquiry;
}

const Filter = ({ searchFilter, setSearchFilter, initialInput }: FilterProps) => {
	const router = useRouter();
	const { t } = useTranslation('common');
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
				<Typography className="title-main">{t('pharmacyFilters.findYourPharmacy')}</Typography>
				<Stack className="input-box">
					<img src="/img/icons/search.svg" alt="" />
					<input
						className="search-input"
						placeholder={t('pharmacyFilters.nameOrAddress')}
						value={searchFilter.search.text ?? ''}
						onChange={(event) => setSearchFilter({ ...searchFilter, page: 1, search: { ...searchFilter.search, text: event.target.value || undefined } })}
						onKeyDown={(event) => event.key === 'Enter' && apply(searchFilter)}
					/>
				</Stack>

				<Typography className="title">{t('pharmacyFilters.region')}</Typography>
				<Stack className="property-location" sx={{ height: showMore ? 'auto !important' : undefined }}>
					{Object.values(PharmacyLocation).map((location) => (
						<Stack className="input-box" key={location}>
							<Checkbox
								className="property-checkbox"
								checked={searchFilter.search.locationList?.includes(location) ?? false}
								onChange={() => toggleList('locationList', location)}
							/>
							<Typography className="property-type">{t(`pharmacyLocation.${location}`)}</Typography>
						</Stack>
					))}
				</Stack>
				<Button className="show-more-filter" onClick={() => setShowMore(!showMore)}>
					{showMore ? t('pharmacyFilters.showLess') : t('pharmacyFilters.showMore')}
				</Button>

				<Typography className="title">{t('pharmacyFilters.pharmacyType')}</Typography>
				{Object.values(PharmacyType).map((type) => (
					<Stack className="input-box" key={type}>
						<Checkbox
							className="property-checkbox"
							checked={searchFilter.search.typeList?.includes(type) ?? false}
							onChange={() => toggleList('typeList', type)}
						/>
						<Typography className="property-type">{t(`pharmacyType.${type}`)}</Typography>
					</Stack>
				))}

				<Typography className="title">{t('pharmacyFilters.services')}</Typography>
				<Stack className="input-box">
					<Checkbox className="property-checkbox" checked={searchFilter.search.hasDelivery === true} onChange={(e) => updateSearch({ hasDelivery: e.target.checked || undefined })} />
					<Typography className="property-type">{t('pharmacyFilters.deliveryAvailable')}</Typography>
				</Stack>
				<Stack className="input-box">
					<Checkbox className="property-checkbox" checked={searchFilter.search.acceptsInsurance === true} onChange={(e) => updateSearch({ acceptsInsurance: e.target.checked || undefined })} />
					<Typography className="property-type">{t('pharmacyFilters.acceptsInsurance')}</Typography>
				</Stack>
				<Stack className="input-box">
					<Checkbox className="property-checkbox" checked={searchFilter.search.openNow === true} onChange={(e) => updateSearch({ openNow: e.target.checked || undefined })} />
					<Typography className="property-type">{t('pharmacyFilters.openNow')}</Typography>
				</Stack>
				<Stack className="input-box">
					<Checkbox className="property-checkbox" checked={searchFilter.search.open24Hours === true} onChange={(e) => updateSearch({ open24Hours: e.target.checked || undefined })} />
					<Typography className="property-type">{t('pharmacyFilters.open247')}</Typography>
				</Stack>

				<Typography className="title">{t('pharmacyFilters.deliveryFee')}</Typography>
				<Stack className="square-year-input">
					<input
						type="number"
						placeholder={t('pharmacyFilters.min')}
						value={searchFilter.search.deliveryFeeRange?.start ?? ''}
						onChange={(e) => setSearchFilter({ ...searchFilter, page: 1, search: { ...searchFilter.search, deliveryFeeRange: { start: Number(e.target.value) || 0, end: searchFilter.search.deliveryFeeRange?.end ?? 100000 } } })}
					/>
					<div className="central-divider" />
					<input
						type="number"
						placeholder={t('pharmacyFilters.max')}
						value={searchFilter.search.deliveryFeeRange?.end ?? ''}
						onChange={(e) => setSearchFilter({ ...searchFilter, page: 1, search: { ...searchFilter.search, deliveryFeeRange: { start: searchFilter.search.deliveryFeeRange?.start ?? 0, end: Number(e.target.value) || 100000 } } })}
					/>
				</Stack>

				<Stack className="button-group">
					<Button variant="contained" onClick={() => apply(searchFilter)}>{t('pharmacyFilters.search')}</Button>
					<Button startIcon={<RefreshIcon />} onClick={() => apply(initialInput)}>{t('pharmacyFilters.reset')}</Button>
				</Stack>
			</Stack>
		</Stack>
	);
};

export default Filter;
