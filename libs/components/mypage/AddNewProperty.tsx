import React, { useEffect, useRef, useState } from 'react';
import { Button, Checkbox, FormControlLabel, MenuItem, Stack, TextField, Typography } from '@mui/material';
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

	if (user.memberType !== 'AGENT') return null;

	return (
		<div id="add-property-page">
			<Stack className="main-title-box">
				<Typography className="main-title">Add or edit pharmacy</Typography>
				<Typography className="sub-title">Keep your pharmacy information accurate and useful.</Typography>
			</Stack>
			<Stack className="config" spacing={2}>
				<TextField label="Pharmacy name" value={form.pharmacyName} onChange={(e) => update({ pharmacyName: e.target.value })} />
				<TextField select label="Type" value={form.pharmacyType} onChange={(e) => update({ pharmacyType: e.target.value as PharmacyType })}>
					{Object.values(PharmacyType).map((value) => <MenuItem key={value} value={value}>{value}</MenuItem>)}
				</TextField>
				<TextField select label="Location" value={form.pharmacyLocation} onChange={(e) => update({ pharmacyLocation: e.target.value as PharmacyLocation })}>
					{Object.values(PharmacyLocation).map((value) => <MenuItem key={value} value={value}>{value}</MenuItem>)}
				</TextField>
				<TextField label="Address" value={form.pharmacyAddress} onChange={(e) => update({ pharmacyAddress: e.target.value })} />
				<TextField label="Delivery fee" type="number" value={form.pharmacyDeliveryFee} onChange={(e) => update({ pharmacyDeliveryFee: Number(e.target.value) })} />
				<TextField label="Latitude" type="number" value={form.pharmacyLatitude} onChange={(e) => update({ pharmacyLatitude: Number(e.target.value) })} />
				<TextField label="Longitude" type="number" value={form.pharmacyLongitude} onChange={(e) => update({ pharmacyLongitude: Number(e.target.value) })} />
				<TextField label="Description" multiline minRows={4} value={form.pharmacyDesc ?? ''} onChange={(e) => update({ pharmacyDesc: e.target.value })} />
				<FormControlLabel control={<Checkbox checked={form.acceptsInsurance ?? false} onChange={(e) => update({ acceptsInsurance: e.target.checked })} />} label="Accepts insurance" />
				<FormControlLabel control={<Checkbox checked={form.hasDelivery ?? false} onChange={(e) => update({ hasDelivery: e.target.checked })} />} label="Offers delivery" />
				<input ref={inputRef} type="file" accept="image/jpeg,image/jpg,image/png" multiple onChange={uploadImages} />
				<Typography>{form.pharmacyImages.length} image(s) uploaded</Typography>
				<Button variant="contained" disabled={!form.pharmacyName || !form.pharmacyAddress || !form.pharmacyImages.length} onClick={submit}>Save pharmacy</Button>
			</Stack>
		</div>
	);
};

AddProperty.defaultProps = {
	initialValues: {
		pharmacyType: PharmacyType.RETAIL,
		pharmacyLocation: PharmacyLocation.CENTRAL,
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
