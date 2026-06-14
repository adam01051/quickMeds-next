import React, { useEffect, useRef, useState } from 'react';
import { Button, Checkbox, FormControlLabel, Stack, Typography } from '@mui/material';
import axios from 'axios';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { useRouter } from 'next/router';
import { CREATE_PHARMACY, UPDATE_PHARMACY } from '../../../apollo/user/mutation';
import { GET_PHARMACY } from '../../../apollo/user/query';
import { userVar } from '../../../apollo/store';
import { getJwtToken } from '../../auth';
import { PharmacyLocation, PharmacyType } from '../../enums/property.enum';
import { PharmacyInput } from '../../types/property/property.input';
import { sweetErrorHandling, sweetMixinErrorAlert, sweetMixinSuccessAlert } from '../../sweetAlert';
import { REACT_APP_API_URL } from '../../config';
import { getPharmacyLocationLabel } from '../../utils/pharmacy-location';

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const AddProperty = ({ initialValues }: { initialValues: PharmacyInput }) => {
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const inputRef = useRef<HTMLInputElement>(null);
	const [form, setForm] = useState<PharmacyInput>(initialValues);
	const [createPharmacy] = useMutation(CREATE_PHARMACY);
	const [updatePharmacy] = useMutation(UPDATE_PHARMACY);
	const { data } = useQuery(GET_PHARMACY, {
		variables: { input: router.query.pharmacyId ?? router.query.propertyId },
		skip: !router.query.pharmacyId && !router.query.propertyId,
		fetchPolicy: 'network-only',
	});

	useEffect(() => {
		if (data?.getPharmacy) {
			const pharmacy = data.getPharmacy;
			setForm({
				pharmacyType: pharmacy.pharmacyType,
				pharmacyLocation: pharmacy.pharmacyLocation,
				pharmacyAddress: pharmacy.pharmacyAddress,
				pharmacyName: pharmacy.pharmacyName,
				pharmacyDeliveryFee: pharmacy.pharmacyDeliveryFee,
				pharmacyLatitude: pharmacy.pharmacyLatitude,
				pharmacyLongitude: pharmacy.pharmacyLongitude,
				pharmacyImages: pharmacy.pharmacyImages,
				pharmacyDesc: pharmacy.pharmacyDesc,
				acceptsInsurance: pharmacy.acceptsInsurance,
				hasDelivery: pharmacy.hasDelivery,
				open24Hours: pharmacy.open24Hours,
				pharmacyTimezone: pharmacy.pharmacyTimezone,
				operatingHours: pharmacy.operatingHours,
				openedAt: pharmacy.openedAt,
			});
		}
	}, [data]);

	const update = (value: Partial<PharmacyInput>) => setForm({ ...form, ...value });

	const uploadImages = async () => {
		try {
			const files = Array.from(inputRef.current?.files ?? []);
			if (!files.length) return;
			if (files.length > 5) throw new Error('Cannot upload more than 5 images.');
			const body = new FormData();
			body.append('operations', JSON.stringify({
				query: 'mutation ImagesUploader($files: [Upload!]!, $target: String!) { imagesUploader(files: $files, target: $target) }',
				variables: { files: files.map(() => null), target: 'pharmacy' },
			}));
			body.append('map', JSON.stringify(Object.fromEntries(files.map((_, index) => [index, [`variables.files.${index}`]]))));
			files.forEach((file, index) => body.append(String(index), file));
			const response = await axios.post(`${process.env.REACT_APP_API_GRAPHQL_URL}`, body, {
				headers: { Authorization: `Bearer ${getJwtToken()}`, 'apollo-require-preflight': true },
			});
			update({ pharmacyImages: response.data.data.imagesUploader });
		} catch (error: any) {
			await sweetMixinErrorAlert(error.message);
		}
	};

	const submit = async () => {
		try {
			const id = data?.getPharmacy?._id;
			if (id) await updatePharmacy({ variables: { input: { ...form, _id: id } } });
			else await createPharmacy({ variables: { input: form } });
			await sweetMixinSuccessAlert(`Pharmacy ${id ? 'updated' : 'created'} successfully.`);
			await router.push({ pathname: '/mypage', query: { category: 'myProperties' } });
		} catch (error) {
			await sweetErrorHandling(error);
		}
	};

	const removeImage = (image: string) => update({ pharmacyImages: form.pharmacyImages.filter((item) => item !== image) });

	if (user.memberType !== 'AGENT') return null;

	return (
		<div id="add-property-page">
			<Stack className="main-title-box">
				<Typography className="main-title">Add or edit pharmacy</Typography>
				<Typography className="sub-title">Keep your pharmacy information accurate and useful.</Typography>
			</Stack>
			<Stack className="config">
				<Stack className="description-box">
					<Stack className="config-column">
						<Typography className="title">Pharmacy name</Typography>
						<input className="description-input" placeholder="Pharmacy name" value={form.pharmacyName} onChange={(e) => update({ pharmacyName: e.target.value })} />
					</Stack>

					<Stack className="config-row">
						<Stack className="price-year-after-price">
							<Typography className="title">Pharmacy type</Typography>
							<select className="select-description" value={form.pharmacyType} onChange={(e) => update({ pharmacyType: e.target.value as PharmacyType })}>
								{Object.values(PharmacyType).map((value) => <option key={value} value={value}>{value}</option>)}
							</select>
							<div className="divider" />
							<img src="/img/icons/Vector.svg" className="arrow-down" alt="" />
						</Stack>
						<Stack className="price-year-after-price">
							<Typography className="title">Region</Typography>
							<select className="select-description" value={form.pharmacyLocation} onChange={(e) => update({ pharmacyLocation: e.target.value as PharmacyLocation })}>
								{Object.values(PharmacyLocation).map((value) => <option key={value} value={value}>{getPharmacyLocationLabel(value)}</option>)}
							</select>
							<div className="divider" />
							<img src="/img/icons/Vector.svg" className="arrow-down" alt="" />
						</Stack>
					</Stack>

					<Stack className="config-column">
						<Typography className="title">Address</Typography>
						<input className="description-input" placeholder="Full pharmacy address" value={form.pharmacyAddress} onChange={(e) => update({ pharmacyAddress: e.target.value })} />
					</Stack>

					<Stack className="config-row">
						<Stack className="price-year-after-price">
							<Typography className="title">Delivery fee (UZS)</Typography>
							<input className="description-input" type="number" min="0" step="1" disabled={!form.hasDelivery} placeholder="0 means free delivery" value={form.pharmacyDeliveryFee} onChange={(e) => update({ pharmacyDeliveryFee: Number(e.target.value) })} />
						</Stack>
						<Stack className="price-year-after-price">
							<Typography className="title">Opened date</Typography>
							<input className="description-input" type="date" value={form.openedAt ? new Date(form.openedAt).toISOString().slice(0, 10) : ''} onChange={(e) => update({ openedAt: e.target.value ? new Date(e.target.value) : undefined })} />
						</Stack>
					</Stack>

					<Stack className="config-row">
						<Stack className="price-year-after-price">
							<Typography className="title">Latitude</Typography>
							<input className="description-input" type="number" step="any" value={form.pharmacyLatitude} onChange={(e) => update({ pharmacyLatitude: Number(e.target.value) })} />
						</Stack>
						<Stack className="price-year-after-price">
							<Typography className="title">Longitude</Typography>
							<input className="description-input" type="number" step="any" value={form.pharmacyLongitude} onChange={(e) => update({ pharmacyLongitude: Number(e.target.value) })} />
						</Stack>
					</Stack>

					<Typography className="property-title">Pharmacy services</Typography>
					<Stack className="pharmacy-service-row">
						<FormControlLabel control={<Checkbox checked={form.acceptsInsurance ?? false} onChange={(e) => update({ acceptsInsurance: e.target.checked })} />} label="Accepts insurance" />
						<FormControlLabel control={<Checkbox checked={form.hasDelivery ?? false} onChange={(e) => update({ hasDelivery: e.target.checked, pharmacyDeliveryFee: e.target.checked ? form.pharmacyDeliveryFee || 3000 : 0 })} />} label="Offers delivery" />
						<FormControlLabel control={<Checkbox checked={form.open24Hours ?? false} onChange={(e) => update({ open24Hours: e.target.checked, operatingHours: e.target.checked ? [] : form.operatingHours })} />} label="Open 24/7" />
					</Stack>
					{!form.open24Hours && (
						<Stack className="config-column">
							<Typography className="property-title">Working hours</Typography>
							<Typography className="sub-title">Optional. Leave all days unset to display Hours not provided.</Typography>
							{WEEKDAYS.map((label, index) => {
								const dayOfWeek = index + 1;
								const day = form.operatingHours?.find((item) => item.dayOfWeek === dayOfWeek);
								const updateDay = (value: { isClosed?: boolean; opensAt?: string; closesAt?: string }) => {
									const remaining = (form.operatingHours ?? []).filter((item) => item.dayOfWeek !== dayOfWeek);
									update({ operatingHours: [...remaining, { dayOfWeek, isClosed: false, opensAt: '09:00', closesAt: '18:00', ...day, ...value }].sort((a, b) => a.dayOfWeek - b.dayOfWeek) });
								};
								return (
									<Stack className="config-row" key={label}>
										<Typography className="title">{label}</Typography>
										<FormControlLabel control={<Checkbox checked={day?.isClosed ?? false} onChange={(e) => updateDay({ isClosed: e.target.checked, opensAt: e.target.checked ? undefined : day?.opensAt, closesAt: e.target.checked ? undefined : day?.closesAt })} />} label="Closed" />
										<input className="description-input" type="time" disabled={day?.isClosed} value={day?.opensAt ?? ''} onChange={(e) => updateDay({ opensAt: e.target.value })} />
										<input className="description-input" type="time" disabled={day?.isClosed} value={day?.closesAt ?? ''} onChange={(e) => updateDay({ closesAt: e.target.value })} />
									</Stack>
								);
							})}
						</Stack>
					)}

					<Typography className="property-title">Pharmacy description</Typography>
					<Stack className="config-column">
						<Typography className="title">Description</Typography>
						<textarea className="description-text" value={form.pharmacyDesc ?? ''} onChange={(e) => update({ pharmacyDesc: e.target.value })} />
					</Stack>
				</Stack>

				<Typography className="upload-title">Upload photos of your pharmacy</Typography>
				<Stack className="images-box">
					<Stack className="upload-box">
						<img className="pharmacy-upload-icon" src="/img/icons/discovery.svg" alt="" />
						<Stack className="text-box">
							<Typography className="drag-title">Add clear pharmacy photos</Typography>
							<Typography className="format-title">JPEG or PNG format, up to five images</Typography>
						</Stack>
						<Button className="browse-button" onClick={() => inputRef.current?.click()}>
							<Typography className="browse-button-text">Browse Files</Typography>
							<input ref={inputRef} type="file" hidden accept="image/jpeg,image/jpg,image/png" multiple onChange={uploadImages} />
						</Button>
					</Stack>
					<Stack className="gallery-box">
						{form.pharmacyImages.map((image) => (
							<Stack className="image-box" key={image}>
								<img src={`${REACT_APP_API_URL}/${image}`} alt="Pharmacy" />
								<Button className="absolute-box" onClick={() => removeImage(image)}>×</Button>
							</Stack>
						))}
					</Stack>
				</Stack>

				<Stack className="buttons-row">
					<Button className="next-button" disabled={!form.pharmacyName || !form.pharmacyAddress || !form.pharmacyImages.length} onClick={submit}>
						<Typography className="next-button-text">Save pharmacy</Typography>
					</Button>
				</Stack>
			</Stack>
		</div>
	);
};

AddProperty.defaultProps = {
	initialValues: {
		pharmacyType: PharmacyType.RETAIL,
		pharmacyLocation: PharmacyLocation.TASHKENT_CITY,
		pharmacyAddress: '',
		pharmacyName: '',
		pharmacyDeliveryFee: 3000,
		pharmacyLatitude: 0,
		pharmacyLongitude: 0,
		pharmacyImages: [],
		pharmacyDesc: '',
		acceptsInsurance: false,
		hasDelivery: false,
		open24Hours: false,
		pharmacyTimezone: 'Asia/Tashkent',
		operatingHours: [],
	},
};

export default AddProperty;
