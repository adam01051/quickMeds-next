import React, { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@mui/material';
import { useTranslation } from 'next-i18next';
import { PharmacyLocation } from '../../enums/property.enum';
import { PharmacyInput } from '../../types/property/property.input';
import { LatLng, isValidLatLng, toPharmacyCoordinateFields } from '../../utils/coordinates';
import { GeocodingResult, inferPharmacyLocation, reverseGeocode, searchAddress } from '../../utils/geocoding';

const PharmacyMap = dynamic(() => import('../common/PharmacyMap'), { ssr: false });

interface PharmacyLocationPickerValue {
	pharmacyLocation: PharmacyLocation;
	pharmacyAddress: string;
	pharmacyLatitude: number;
	pharmacyLongitude: number;
}

interface PharmacyLocationPickerProps {
	value: PharmacyLocationPickerValue;
	onChange: (next: Partial<PharmacyInput>) => void;
	confirmed: boolean;
	onConfirm: () => void;
	onDirtyPin: () => void;
	mode: 'desktop' | 'mobile';
	disabled?: boolean;
}

const emptyAddressParts = {
	city: '',
	district: '',
	street: '',
	landmark: '',
};

const composeAddress = (parts: typeof emptyAddressParts) =>
	[parts.city, parts.district, parts.street, parts.landmark].map((item) => item.trim()).filter(Boolean).join(', ');

const PharmacyLocationPicker = ({
	value,
	onChange,
	confirmed,
	onConfirm,
	onDirtyPin,
	mode,
	disabled = false,
}: PharmacyLocationPickerProps) => {
	const { t } = useTranslation('common');
	const [query, setQuery] = useState(value.pharmacyAddress ?? '');
	const [results, setResults] = useState<GeocodingResult[]>([]);
	const [addressParts, setAddressParts] = useState({ ...emptyAddressParts, street: value.pharmacyAddress ?? '' });
	const [selectedAddressPreview, setSelectedAddressPreview] = useState(value.pharmacyAddress ?? '');
	const [isSearching, setIsSearching] = useState(false);
	const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
	const [geoError, setGeoError] = useState('');
	const [showMobileMap, setShowMobileMap] = useState(mode === 'desktop');

	const marker = useMemo<LatLng | null>(() => {
		if (!isValidLatLng(value.pharmacyLatitude, value.pharmacyLongitude)) return null;
		return { lat: value.pharmacyLatitude, lng: value.pharmacyLongitude };
	}, [value.pharmacyLatitude, value.pharmacyLongitude]);

	useEffect(() => {
		setSelectedAddressPreview(value.pharmacyAddress ?? '');
		setQuery(value.pharmacyAddress ?? '');
		setAddressParts((current) => {
			if (current.city || current.district || current.landmark || current.street === value.pharmacyAddress) return current;
			return { ...current, street: value.pharmacyAddress ?? '' };
		});
	}, [value.pharmacyAddress]);

	useEffect(() => {
		const trimmed = query.trim();
		if (trimmed.length < 3) {
			setResults([]);
			return;
		}

		let cancelled = false;
		const timer = window.setTimeout(async () => {
			try {
				setIsSearching(true);
				setGeoError('');
				const nextResults = await searchAddress(trimmed);
				if (!cancelled) setResults(nextResults);
			} catch (error: any) {
				if (!cancelled) {
					setResults([]);
					setGeoError(error.message || t('locationPicker.errors.searchUnavailable'));
				}
			} finally {
				if (!cancelled) setIsSearching(false);
			}
		}, 450);

		return () => {
			cancelled = true;
			window.clearTimeout(timer);
		};
	}, [query]);

	const updateAddressPart = (key: keyof typeof emptyAddressParts, nextValue: string) => {
		const nextParts = { ...addressParts, [key]: nextValue };
		const nextAddress = composeAddress(nextParts);
		setAddressParts(nextParts);
		setSelectedAddressPreview(nextAddress);
		onChange({
			pharmacyAddress: nextAddress,
			pharmacyLocation: inferPharmacyLocation(nextAddress) ?? value.pharmacyLocation,
		});
	};

	const applyGeocodingResult = (result: GeocodingResult, shouldConfirm = false) => {
		const nextAddress = result.address || result.label;
		setSelectedAddressPreview(nextAddress);
		setAddressParts({ ...emptyAddressParts, street: nextAddress });
		setQuery(nextAddress);
		setResults([]);
		onChange({
			pharmacyAddress: nextAddress,
			pharmacyLocation: result.location ?? value.pharmacyLocation,
			...toPharmacyCoordinateFields({ lat: result.latitude, lng: result.longitude }),
		});
		if (shouldConfirm) onConfirm();
		else onDirtyPin();
		setShowMobileMap(true);
	};

	const updateMarker = async (nextMarker: LatLng) => {
		onDirtyPin();
		onChange(toPharmacyCoordinateFields(nextMarker));
		setGeoError('');

		try {
			setIsReverseGeocoding(true);
			const result = await reverseGeocode(nextMarker.lat, nextMarker.lng);
			if (result) {
				const nextAddress = result.address || result.label;
				setSelectedAddressPreview(nextAddress);
				setAddressParts({ ...emptyAddressParts, street: nextAddress });
				setQuery(nextAddress);
				onChange({
					pharmacyAddress: nextAddress,
					pharmacyLocation: result.location ?? value.pharmacyLocation,
					...toPharmacyCoordinateFields({ lat: result.latitude, lng: result.longitude }),
				});
			}
		} catch (error: any) {
			setGeoError(error.message || t('locationPicker.errors.reverseFailed'));
		} finally {
			setIsReverseGeocoding(false);
		}
	};

	const useCurrentLocation = () => {
		if (!navigator.geolocation) {
			setGeoError(t('locationPicker.errors.currentLocationUnsupported'));
			return;
		}

		setGeoError('');
		navigator.geolocation.getCurrentPosition(
			(position) => {
				setShowMobileMap(true);
				updateMarker({ lat: position.coords.latitude, lng: position.coords.longitude });
			},
			() => setGeoError(t('locationPicker.errors.permissionDenied')),
			{ enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 },
		);
	};

	const canConfirm = Boolean(marker && value.pharmacyAddress.trim() && isValidLatLng(marker.lat, marker.lng));

	return (
		<div className={`pharmacy-location-picker pharmacy-location-picker--${mode}`}>
			<div className="pharmacy-location-picker__panel">
				<label className="pharmacy-location-picker__field">
					<span>{t('locationPicker.searchLabel')}</span>
					<input
						value={query}
						disabled={disabled}
						placeholder={t('locationPicker.searchPlaceholder')}
						onChange={(event) => setQuery(event.target.value)}
					/>
				</label>
				{(isSearching || results.length > 0) && (
					<div className="pharmacy-location-picker__results">
						{isSearching && <p>{t('locationPicker.searching')}</p>}
						{results.map((result) => (
							<button type="button" key={result.id} onClick={() => applyGeocodingResult(result)} disabled={disabled}>
								{result.label}
							</button>
						))}
					</div>
				)}

				<div className="pharmacy-location-picker__grid">
					<label className="pharmacy-location-picker__field">
						<span>{t('locationPicker.region')}</span>
						<select
							value={value.pharmacyLocation}
							disabled={disabled}
							onChange={(event) => onChange({ pharmacyLocation: event.target.value as PharmacyLocation })}
						>
							{Object.values(PharmacyLocation).map((location) => (
								<option key={location} value={location}>
									{t(`pharmacyLocation.${location}`)}
								</option>
							))}
						</select>
					</label>
					<label className="pharmacy-location-picker__field">
						<span>{t('locationPicker.city')}</span>
						<input value={addressParts.city} disabled={disabled} onChange={(event) => updateAddressPart('city', event.target.value)} />
					</label>
					<label className="pharmacy-location-picker__field">
						<span>{t('locationPicker.district')}</span>
						<input value={addressParts.district} disabled={disabled} onChange={(event) => updateAddressPart('district', event.target.value)} />
					</label>
					<label className="pharmacy-location-picker__field">
						<span>{t('locationPicker.street')}</span>
						<input value={addressParts.street} disabled={disabled} onChange={(event) => updateAddressPart('street', event.target.value)} />
					</label>
					<label className="pharmacy-location-picker__field pharmacy-location-picker__field--wide">
						<span>{t('locationPicker.landmark')}</span>
						<input value={addressParts.landmark} disabled={disabled} onChange={(event) => updateAddressPart('landmark', event.target.value)} />
					</label>
				</div>

				<div className="pharmacy-location-picker__actions">
					<Button type="button" onClick={useCurrentLocation} disabled={disabled}>
						{t('locationPicker.useCurrentLocation')}
					</Button>
					{mode === 'mobile' && (
						<Button type="button" onClick={() => setShowMobileMap(true)} disabled={disabled}>
							{t('locationPicker.openMap')}
						</Button>
					)}
				</div>

				<div className={`pharmacy-location-picker__preview ${confirmed ? 'is-confirmed' : ''}`}>
					<span>{confirmed ? t('locationPicker.confirmedLocation') : t('locationPicker.selectedPreview')}</span>
					<strong>{selectedAddressPreview || t('locationPicker.chooseAddress')}</strong>
					{marker && <small>{t('locationPicker.pinSet')}</small>}
				</div>
				{geoError && <p className="pharmacy-location-picker__error">{geoError}</p>}
				{isReverseGeocoding && <p className="pharmacy-location-picker__hint">{t('locationPicker.reverseGeocoding')}</p>}
			</div>

			{showMobileMap && (
				<div className="pharmacy-location-picker__map-shell">
					<PharmacyMap marker={marker} onMarkerChange={updateMarker} />
					<div className="pharmacy-location-picker__map-footer">
						<span>{t('locationPicker.mapHelp')}</span>
						<Button type="button" disabled={disabled || !canConfirm} onClick={onConfirm}>
							{t('locationPicker.confirm')}
						</Button>
					</div>
				</div>
			)}
		</div>
	);
};

export default PharmacyLocationPicker;
