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
							<Typography className="title">Delivery fee</Typography>
							<input className="description-input" type="number" min="0" placeholder="Delivery fee" value={form.pharmacyDeliveryFee} onChange={(e) => update({ pharmacyDeliveryFee: Number(e.target.value) })} />
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
						<FormControlLabel control={<Checkbox checked={form.hasDelivery ?? false} onChange={(e) => update({ hasDelivery: e.target.checked })} />} label="Offers delivery" />
					</Stack>

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
		pharmacyDeliveryFee: 0,
		pharmacyLatitude: 0,
		pharmacyLongitude: 0,
		pharmacyImages: [],
		pharmacyDesc: '',
		acceptsInsurance: false,
		hasDelivery: false,
	},
};

export default AddProperty;
