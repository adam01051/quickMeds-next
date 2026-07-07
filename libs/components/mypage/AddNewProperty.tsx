import React, { useEffect, useRef, useState } from 'react';
import { Button, Checkbox, FormControlLabel, Stack, Typography } from '@mui/material';
import axios from 'axios';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { CREATE_PHARMACY, UPDATE_PHARMACY } from '../../../apollo/user/mutation';
import { GET_PHARMACY } from '../../../apollo/user/query';
import { userVar } from '../../../apollo/store';
import { getJwtToken } from '../../auth';
import { PharmacyLocation, PharmacyType } from '../../enums/property.enum';
import { PharmacyInput } from '../../types/property/property.input';
import { sweetErrorHandling, sweetMixinErrorAlert, sweetMixinSuccessAlert } from '../../sweetAlert';
import { REACT_APP_API_URL } from '../../config';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import PharmacyLocationPicker from './PharmacyLocationPicker';
import { isValidLatLng, toPharmacyCoordinateFields } from '../../utils/coordinates';

const WEEKDAY_KEYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const AddProperty = ({ initialValues }: { initialValues: PharmacyInput }) => {
	const router = useRouter();
	const { t } = useTranslation('common');
	const device = useDeviceDetect();
	const user = useReactiveVar(userVar);
	const inputRef = useRef<HTMLInputElement>(null);
	const [form, setForm] = useState<PharmacyInput>(initialValues);
	const [locationConfirmed, setLocationConfirmed] = useState(false);
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
			setLocationConfirmed(isValidLatLng(pharmacy.pharmacyLatitude, pharmacy.pharmacyLongitude));
		}
	}, [data]);

	const update = (value: Partial<PharmacyInput>) => setForm((current) => ({ ...current, ...value }));

	const uploadImages = async () => {
		try {
			const files = Array.from(inputRef.current?.files ?? []);
			if (!files.length) return;
			if (files.length > 5) throw new Error(t('addPharmacy.errors.maxImages'));
			const body = new FormData();
			body.append(
				'operations',
				JSON.stringify({
					query:
						'mutation ImagesUploader($files: [Upload!]!, $target: String!) { imagesUploader(files: $files, target: $target) }',
					variables: { files: files.map(() => null), target: 'pharmacy' },
				}),
			);
			body.append(
				'map',
				JSON.stringify(Object.fromEntries(files.map((_, index) => [index, [`variables.files.${index}`]]))),
			);
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
			if (!isValidLatLng(form.pharmacyLatitude, form.pharmacyLongitude) || !locationConfirmed) {
				await sweetMixinErrorAlert(t('addPharmacy.errors.confirmLocation'));
				return;
			}
			const id = data?.getPharmacy?._id;
			const input = {
				...form,
				...toPharmacyCoordinateFields({ lat: form.pharmacyLatitude, lng: form.pharmacyLongitude }),
			};
			if (id) await updatePharmacy({ variables: { input: { ...input, _id: id } } });
			else await createPharmacy({ variables: { input } });
			await sweetMixinSuccessAlert(t(id ? 'addPharmacy.success.updated' : 'addPharmacy.success.created'));
			await router.push({ pathname: '/mypage', query: { category: 'myPharmacies' } });
		} catch (error) {
			await sweetErrorHandling(error);
		}
	};

	const removeImage = (image: string) =>
		update({ pharmacyImages: form.pharmacyImages.filter((item) => item !== image) });

	if (user.memberType !== 'AGENT') return null;

	const isEditMode = Boolean(router.query.pharmacyId || router.query.propertyId);
	const hasConfirmedLocation = locationConfirmed && isValidLatLng(form.pharmacyLatitude, form.pharmacyLongitude);
	const canSave = Boolean(form.pharmacyName && form.pharmacyAddress && form.pharmacyImages.length && hasConfirmedLocation);

	if (device === 'mobile') {
		return (
			<div id="add-property-page" className="add-pharmacy-mobile">
				{isEditMode && (
					<section className="add-pharmacy-mobile__summary">
						<span>{t('addPharmacy.summary.eyebrow')}</span>
						<h2>{t('addPharmacy.summary.title')}</h2>
						<p>{t('addPharmacy.summary.description')}</p>
					</section>
				)}

				<section className="add-pharmacy-mobile__card">
					<div className="add-pharmacy-mobile__card-head">
						<span>{t('addPharmacy.sections.basics')}</span>
						<strong>{t('addPharmacy.sections.basicsDescription')}</strong>
					</div>
					<label className="add-pharmacy-mobile__field">
						<span>{t('addPharmacy.fields.name')}</span>
						<input
							placeholder={t('addPharmacy.fields.namePlaceholder')}
							value={form.pharmacyName}
							onChange={(e) => update({ pharmacyName: e.target.value })}
						/>
					</label>
					<label className="add-pharmacy-mobile__field">
						<span>{t('addPharmacy.fields.type')}</span>
						<select
							value={form.pharmacyType}
							onChange={(e) => update({ pharmacyType: e.target.value as PharmacyType })}
						>
							{Object.values(PharmacyType).map((value) => (
								<option key={value} value={value}>
									{t(`pharmacyType.${value}`)}
								</option>
							))}
						</select>
					</label>
				</section>

				<section className="add-pharmacy-mobile__card">
					<div className="add-pharmacy-mobile__card-head">
						<span>{t('addPharmacy.sections.services')}</span>
						<strong>{t('addPharmacy.sections.servicesDescription')}</strong>
					</div>
					<div className="add-pharmacy-mobile__toggles">
						<FormControlLabel
							control={
								<Checkbox
									checked={form.acceptsInsurance ?? false}
									onChange={(e) => update({ acceptsInsurance: e.target.checked })}
								/>
							}
							label={t('addPharmacy.services.acceptsInsurance')}
						/>
						<FormControlLabel
							control={
								<Checkbox
									checked={form.hasDelivery ?? false}
									onChange={(e) =>
										update({
											hasDelivery: e.target.checked,
											pharmacyDeliveryFee: e.target.checked ? form.pharmacyDeliveryFee || 3000 : 0,
										})
									}
								/>
							}
							label={t('addPharmacy.services.offersDelivery')}
						/>
					</div>
					<div className="add-pharmacy-mobile__grid">
						<label className="add-pharmacy-mobile__field">
							<span>{t('addPharmacy.fields.deliveryFee')}</span>
							<input
								type="number"
								min="0"
								step="1"
								disabled={!form.hasDelivery}
								placeholder={t('addPharmacy.fields.deliveryFeePlaceholder')}
								value={form.pharmacyDeliveryFee}
								onChange={(e) => update({ pharmacyDeliveryFee: Number(e.target.value) })}
							/>
						</label>
						<label className="add-pharmacy-mobile__field">
							<span>{t('addPharmacy.fields.openedDate')}</span>
							<input
								type="date"
								value={form.openedAt ? new Date(form.openedAt).toISOString().slice(0, 10) : ''}
								onChange={(e) => update({ openedAt: e.target.value ? new Date(e.target.value) : undefined })}
							/>
						</label>
					</div>
				</section>

				<section className="add-pharmacy-mobile__card">
					<div className="add-pharmacy-mobile__card-head">
						<span>{t('addPharmacy.location.eyebrow')}</span>
						<strong>{t('addPharmacy.location.title')}</strong>
					</div>
					<PharmacyLocationPicker
						value={form}
						onChange={update}
						confirmed={locationConfirmed}
						onConfirm={() => setLocationConfirmed(true)}
						onDirtyPin={() => setLocationConfirmed(false)}
						mode="mobile"
					/>
				</section>

				<section className="add-pharmacy-mobile__card">
					<div className="add-pharmacy-mobile__card-head">
						<span>{t('addPharmacy.hours.title')}</span>
						<strong>{t('addPharmacy.hours.mobileDescription')}</strong>
					</div>
					<div className="add-pharmacy-mobile__toggles">
						<FormControlLabel
							control={
								<Checkbox
									checked={form.open24Hours ?? false}
									onChange={(e) =>
										update({
											open24Hours: e.target.checked,
											operatingHours: e.target.checked ? [] : form.operatingHours,
										})
									}
								/>
							}
							label={t('addPharmacy.hours.open247')}
						/>
					</div>
					{!form.open24Hours && (
						<div className="add-pharmacy-mobile__hours">
							<p>{t('addPharmacy.hours.emptyHint')}</p>
							{WEEKDAY_KEYS.map((key, index) => {
								const dayOfWeek = index + 1;
								const day = form.operatingHours?.find((item) => item.dayOfWeek === dayOfWeek);
								const updateDay = (value: { isClosed?: boolean; opensAt?: string; closesAt?: string }) => {
									const remaining = (form.operatingHours ?? []).filter((item) => item.dayOfWeek !== dayOfWeek);
									update({
										operatingHours: [
											...remaining,
											{ dayOfWeek, isClosed: false, opensAt: '09:00', closesAt: '18:00', ...day, ...value },
										].sort((a, b) => a.dayOfWeek - b.dayOfWeek),
									});
								};
								return (
									<div className="add-pharmacy-mobile__day" key={key}>
										<strong>{t(`addPharmacy.weekdays.${key}`)}</strong>
										<FormControlLabel
											control={
												<Checkbox
													checked={day?.isClosed ?? false}
													onChange={(e) =>
														updateDay({
															isClosed: e.target.checked,
															opensAt: e.target.checked ? undefined : day?.opensAt,
															closesAt: e.target.checked ? undefined : day?.closesAt,
														})
													}
												/>
											}
											label={t('addPharmacy.hours.closed')}
										/>
										<div>
											<input
												type="time"
												disabled={day?.isClosed}
												value={day?.opensAt ?? ''}
												onChange={(e) => updateDay({ opensAt: e.target.value })}
											/>
											<input
												type="time"
												disabled={day?.isClosed}
												value={day?.closesAt ?? ''}
												onChange={(e) => updateDay({ closesAt: e.target.value })}
											/>
										</div>
									</div>
								);
							})}
						</div>
					)}
				</section>

				<section className="add-pharmacy-mobile__card">
					<div className="add-pharmacy-mobile__card-head">
						<span>{t('addPharmacy.photos.title')}</span>
						<strong>{t('addPharmacy.photos.mobileDescription')}</strong>
					</div>
					<button className="add-pharmacy-mobile__upload" type="button" onClick={() => inputRef.current?.click()}>
						<img src="/img/icons/discovery.svg" alt="" />
						<span>{t('addPharmacy.photos.add')}</span>
						<small>{t('addPharmacy.photos.formatShort')}</small>
						<input
							ref={inputRef}
							type="file"
							hidden
							accept="image/jpeg,image/jpg,image/png"
							multiple
							onChange={uploadImages}
						/>
					</button>
					{form.pharmacyImages.length > 0 && (
						<div className="add-pharmacy-mobile__gallery">
							{form.pharmacyImages.map((image) => (
								<div className="add-pharmacy-mobile__image" key={image}>
									<img src={`${REACT_APP_API_URL}/${image}`} alt={t('addPharmacy.photos.imageAlt')} />
									<button type="button" onClick={() => removeImage(image)}>
										{t('addPharmacy.photos.remove')}
									</button>
								</div>
							))}
						</div>
					)}
				</section>

				<section className="add-pharmacy-mobile__card">
					<div className="add-pharmacy-mobile__card-head">
						<span>{t('addPharmacy.sections.description')}</span>
						<strong>{t('addPharmacy.sections.descriptionHelp')}</strong>
					</div>
					<label className="add-pharmacy-mobile__field">
						<span>{t('addPharmacy.fields.description')}</span>
						<textarea value={form.pharmacyDesc ?? ''} onChange={(e) => update({ pharmacyDesc: e.target.value })} />
					</label>
				</section>

				<div className="add-pharmacy-mobile__save">
					<Button disabled={!canSave} onClick={submit}>
						{hasConfirmedLocation ? t('addPharmacy.actions.save') : t('addPharmacy.actions.confirmToSave')}
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div id="add-property-page">
			<Stack className="config">
				<Stack className="description-box">
					<Stack className="config-column">
						<Typography className="title">{t('addPharmacy.fields.name')}</Typography>
						<input
							className="description-input"
							placeholder={t('addPharmacy.fields.namePlaceholder')}
							value={form.pharmacyName}
							onChange={(e) => update({ pharmacyName: e.target.value })}
						/>
					</Stack>

					<Stack className="config-row">
						<Stack className="price-year-after-price">
							<Typography className="title">{t('addPharmacy.fields.type')}</Typography>
							<select
								className="select-description"
								value={form.pharmacyType}
								onChange={(e) => update({ pharmacyType: e.target.value as PharmacyType })}
							>
								{Object.values(PharmacyType).map((value) => (
									<option key={value} value={value}>
										{t(`pharmacyType.${value}`)}
									</option>
								))}
							</select>
							<div className="divider" />
							<img src="/img/icons/Vector.svg" className="arrow-down" alt="" />
						</Stack>
					</Stack>

					<Stack className="config-column">
						<Typography className="property-title">{t('addPharmacy.location.desktopTitle')}</Typography>
						<Typography className="sub-title">
							{t('addPharmacy.location.desktopDescription')}
						</Typography>
						<PharmacyLocationPicker
							value={form}
							onChange={update}
							confirmed={locationConfirmed}
							onConfirm={() => setLocationConfirmed(true)}
							onDirtyPin={() => setLocationConfirmed(false)}
							mode="desktop"
						/>
					</Stack>

					<Stack className="config-row">
						<Stack className="price-year-after-price">
							<Typography className="title">{t('addPharmacy.fields.deliveryFee')}</Typography>
							<input
								className="description-input"
								type="number"
								min="0"
								step="1"
								disabled={!form.hasDelivery}
								placeholder={t('addPharmacy.fields.deliveryFeePlaceholder')}
								value={form.pharmacyDeliveryFee}
								onChange={(e) => update({ pharmacyDeliveryFee: Number(e.target.value) })}
							/>
						</Stack>
						<Stack className="price-year-after-price">
							<Typography className="title">{t('addPharmacy.fields.openedDate')}</Typography>
							<input
								className="description-input"
								type="date"
								value={form.openedAt ? new Date(form.openedAt).toISOString().slice(0, 10) : ''}
								onChange={(e) => update({ openedAt: e.target.value ? new Date(e.target.value) : undefined })}
							/>
						</Stack>
					</Stack>

					<Typography className="property-title">{t('addPharmacy.sections.pharmacyServices')}</Typography>
					<Stack className="pharmacy-service-row">
						<FormControlLabel
							control={
								<Checkbox
									checked={form.acceptsInsurance ?? false}
									onChange={(e) => update({ acceptsInsurance: e.target.checked })}
								/>
							}
							label={t('addPharmacy.services.acceptsInsurance')}
						/>
						<FormControlLabel
							control={
								<Checkbox
									checked={form.hasDelivery ?? false}
									onChange={(e) =>
										update({
											hasDelivery: e.target.checked,
											pharmacyDeliveryFee: e.target.checked ? form.pharmacyDeliveryFee || 3000 : 0,
										})
									}
								/>
							}
							label={t('addPharmacy.services.offersDelivery')}
						/>
						<FormControlLabel
							control={
								<Checkbox
									checked={form.open24Hours ?? false}
									onChange={(e) =>
										update({
											open24Hours: e.target.checked,
											operatingHours: e.target.checked ? [] : form.operatingHours,
										})
									}
								/>
							}
							label={t('addPharmacy.hours.open247')}
						/>
					</Stack>
					{!form.open24Hours && (
						<Stack className="config-column">
							<Typography className="property-title">{t('addPharmacy.hours.title')}</Typography>
							<Typography className="sub-title">
								{t('addPharmacy.hours.desktopDescription')}
							</Typography>
							{WEEKDAY_KEYS.map((key, index) => {
								const dayOfWeek = index + 1;
								const day = form.operatingHours?.find((item) => item.dayOfWeek === dayOfWeek);
								const updateDay = (value: { isClosed?: boolean; opensAt?: string; closesAt?: string }) => {
									const remaining = (form.operatingHours ?? []).filter((item) => item.dayOfWeek !== dayOfWeek);
									update({
										operatingHours: [
											...remaining,
											{ dayOfWeek, isClosed: false, opensAt: '09:00', closesAt: '18:00', ...day, ...value },
										].sort((a, b) => a.dayOfWeek - b.dayOfWeek),
									});
								};
								return (
									<Stack className="config-row" key={key}>
										<Typography className="title">{t(`addPharmacy.weekdays.${key}`)}</Typography>
										<FormControlLabel
											control={
												<Checkbox
													checked={day?.isClosed ?? false}
													onChange={(e) =>
														updateDay({
															isClosed: e.target.checked,
															opensAt: e.target.checked ? undefined : day?.opensAt,
															closesAt: e.target.checked ? undefined : day?.closesAt,
														})
													}
												/>
											}
											label={t('addPharmacy.hours.closed')}
										/>
										<input
											className="description-input"
											type="time"
											disabled={day?.isClosed}
											value={day?.opensAt ?? ''}
											onChange={(e) => updateDay({ opensAt: e.target.value })}
										/>
										<input
											className="description-input"
											type="time"
											disabled={day?.isClosed}
											value={day?.closesAt ?? ''}
											onChange={(e) => updateDay({ closesAt: e.target.value })}
										/>
									</Stack>
								);
							})}
						</Stack>
					)}

					<Typography className="property-title">{t('addPharmacy.sections.pharmacyDescription')}</Typography>
					<Stack className="config-column">
						<Typography className="title">{t('addPharmacy.fields.description')}</Typography>
						<textarea
							className="description-text"
							value={form.pharmacyDesc ?? ''}
							onChange={(e) => update({ pharmacyDesc: e.target.value })}
						/>
					</Stack>
				</Stack>

				<Typography className="upload-title">{t('addPharmacy.photos.uploadTitle')}</Typography>
				<Stack className="images-box">
					<Stack className="upload-box">
						<img className="pharmacy-upload-icon" src="/img/icons/discovery.svg" alt="" />
						<Stack className="text-box">
							<Typography className="drag-title">{t('addPharmacy.photos.add')}</Typography>
							<Typography className="format-title">{t('addPharmacy.photos.formatLong')}</Typography>
						</Stack>
						<Button className="browse-button" onClick={() => inputRef.current?.click()}>
							<Typography className="browse-button-text">{t('addPharmacy.photos.browse')}</Typography>
							<input
								ref={inputRef}
								type="file"
								hidden
								accept="image/jpeg,image/jpg,image/png"
								multiple
								onChange={uploadImages}
							/>
						</Button>
					</Stack>
					<Stack className="gallery-box">
						{form.pharmacyImages.map((image) => (
							<Stack className="image-box" key={image}>
								<img src={`${REACT_APP_API_URL}/${image}`} alt={t('addPharmacy.photos.imageAlt')} />
								<Button className="absolute-box" onClick={() => removeImage(image)}>
									×
								</Button>
							</Stack>
						))}
					</Stack>
				</Stack>

				<Stack className="buttons-row">
					<Button
						className="next-button"
						disabled={!canSave}
						onClick={submit}
					>
						<Typography className="next-button-text">{hasConfirmedLocation ? t('addPharmacy.actions.save') : t('addPharmacy.actions.confirmLocation')}</Typography>
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
