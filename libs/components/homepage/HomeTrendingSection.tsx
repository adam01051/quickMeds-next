import React, { KeyboardEvent, SyntheticEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { IconButton } from '@mui/material';
import { AnimatePresence, LayoutGroup, motion, Transition, useReducedMotion } from 'framer-motion';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import HealthAndSafetyOutlinedIcon from '@mui/icons-material/HealthAndSafetyOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { GET_PHARMACIES } from '../../../apollo/user/query';
import { LIKE_TARGET_PHARMACY } from '../../../apollo/user/mutation';
import { userVar } from '../../../apollo/store';
import { PharmaciesInquiry } from '../../types/property/property.input';
import { Property } from '../../types/property/property';
import { T } from '../../types/common';
import { Message } from '../../enums/common.enum';
import { REACT_APP_API_URL } from '../../config';
import { formatterStr } from '../../utils';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../sweetAlert';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import HomePharmacyCard from './HomePharmacyCard';
import { useTranslation } from 'next-i18next';

interface HomeTrendingSectionProps {
	initialInput: PharmaciesInquiry;
}

const layoutTransition: Transition = { duration: 0.56, ease: [0.22, 1, 0.36, 1] };
const detailsTransition: Transition = { duration: 0.22, ease: 'easeOut', delay: 0.12 };
const compactTransition: Transition = { duration: 0.2, ease: 'easeOut' };

const getLikeLabel = (t: any, likes: number) => t('home.pharmacyCard.likeCount', { count: likes });

const getPharmacyImage = (pharmacy: Property) => {
	return pharmacy.pharmacyImages?.[0] ? `${REACT_APP_API_URL}/${pharmacy.pharmacyImages[0]}` : '/img/banner/header1.svg';
};

const useFallbackImage = (event: SyntheticEvent<HTMLImageElement>) => {
	event.currentTarget.onerror = null;
	event.currentTarget.src = '/img/banner/header1.svg';
};

const getHoursLabel = (t: any, pharmacy: Property) => {
	if (pharmacy.open24Hours) return t('home.pharmacyCard.open247');
	if (!pharmacy.hoursConfigured) return t('home.pharmacyCard.hoursNotProvided');
	return pharmacy.isOpenNow ? t('home.pharmacyCard.openNow') : t('home.pharmacyCard.closed');
};

const getDeliveryLabel = (t: any, pharmacy: Property) => {
	if (!pharmacy.hasDelivery) return t('home.pharmacyCard.pickupOnly');
	if (pharmacy.pharmacyDeliveryFee === 0) return t('home.pharmacyCard.freeDelivery');
	return t('home.pharmacyCard.deliveryWithFee', { fee: formatterStr(pharmacy.pharmacyDeliveryFee) });
};

const getTypeLabel = (t: any, pharmacy: Property) => {
	return t(`pharmacyType.${pharmacy.pharmacyType}`);
};

const getTrendingSummary = (t: any, pharmacy: Property) => {
	const serviceMode = pharmacy.hasDelivery ? t('home.pharmacyCard.deliveryAndPickup') : t('home.pharmacyCard.pickupService');
	const insurance = pharmacy.acceptsInsurance ? t('home.pharmacyCard.insuranceSupport') : t('home.pharmacyCard.directPayVisits');

	return t('home.sections.trending.summary', {
		name: pharmacy.pharmacyName,
		type: getTypeLabel(t, pharmacy),
		serviceMode,
		insurance,
	});
};

const HomeTrendingSection = ({ initialInput }: HomeTrendingSectionProps) => {
	const device = useDeviceDetect();
	const { t } = useTranslation('common');
	const user = useReactiveVar(userVar);
	const reduceMotion = useReducedMotion();
	const [pharmacies, setPharmacies] = useState<Property[]>([]);
	const [selectedId, setSelectedId] = useState<string>('');
	const [likeTargetPharmacy] = useMutation(LIKE_TARGET_PHARMACY);
	const { loading, error, refetch } = useQuery(GET_PHARMACIES, {
		fetchPolicy: 'cache-and-network',
		variables: { input: initialInput },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => setPharmacies(data?.getPharmacies?.list ?? []),
	});

	useEffect(() => {
		if (pharmacies.length === 0) {
			setSelectedId('');
			return;
		}

		if (!selectedId || !pharmacies.some((pharmacy) => pharmacy._id === selectedId)) {
			setSelectedId(pharmacies[0]._id);
		}
	}, [pharmacies, selectedId]);

	const selectedPharmacy = useMemo(() => {
		return pharmacies.find((pharmacy) => pharmacy._id === selectedId) ?? pharmacies[0];
	}, [pharmacies, selectedId]);

	const compactPharmacies = useMemo(() => {
		if (!selectedPharmacy) return [];
		return pharmacies.filter((pharmacy) => pharmacy._id !== selectedPharmacy._id).slice(0, 4);
	}, [pharmacies, selectedPharmacy]);

	const favoritePharmacy = async (pharmacyId: string) => {
		try {
			if (!user._id) throw new Error(Message.SOMETHING_WENT_WRONG);
			await likeTargetPharmacy({ variables: { input: pharmacyId } });
			await refetch({ input: initialInput });
			await sweetTopSmallSuccessAlert('success', 800);
		} catch (caughtError) {
			const message = caughtError instanceof Error ? caughtError.message : Message.SOMETHING_WENT_WRONG;
			await sweetMixinErrorAlert(message);
		}
	};

	const handleCompactKeyDown = (event: KeyboardEvent<HTMLElement>, pharmacyId: string) => {
		if (event.key !== 'Enter' && event.key !== ' ') return;
		event.preventDefault();
		setSelectedId(pharmacyId);
	};

	const renderFavoriteButton = (pharmacy: Property, className: string) => {
		const isFavorite = pharmacy.meLiked?.[0]?.myFavorite === true;

		return (
			<IconButton
				className={className}
				aria-label={t(isFavorite ? 'home.pharmacyCard.unlikeAria' : 'home.pharmacyCard.likeAria', { name: pharmacy.pharmacyName })}
				onClick={(event) => {
					event.stopPropagation();
					favoritePharmacy(pharmacy._id);
				}}
				onKeyDown={(event) => event.stopPropagation()}
			>
				{isFavorite ? <FavoriteRoundedIcon /> : <FavoriteBorderRoundedIcon />}
			</IconButton>
		);
	};

	const isMobile = device === 'mobile';
	const mobileListVariants = {
		hidden: { opacity: 1 },
		visible: {
			opacity: 1,
			transition: { staggerChildren: reduceMotion ? 0 : 0.06 },
		},
	};
	const mobileCardVariants = {
		hidden: reduceMotion ? { opacity: 0 } : { opacity: 0, y: 14 },
		visible: {
			opacity: 1,
			y: 0,
			transition: { duration: reduceMotion ? 0.01 : 0.42, ease: [0.22, 1, 0.36, 1] },
		},
	};

	if (isMobile) {
		return (
			<section className="home-trending-section home-trending-section--mobile-list">
				<div className="home-shell">
					<header className="home-section-heading home-trending-heading">
						<div>
							<span className="home-trending-kicker">{t('home.sections.trending.kicker')}</span>
							<h2>{t('home.sections.trending.title')}</h2>
							<p>{t('home.sections.trending.description')}</p>
						</div>
						<Link href="/pharmacies">
							{t('commonActions.viewAll')}
							<ArrowForwardRoundedIcon />
						</Link>
					</header>

					{loading && pharmacies.length === 0 ? (
						<div className="home-pharmacy-grid" aria-label={t('home.sections.trending.loadingAria')}>
							{[0, 1, 2].map((item) => <div className="home-pharmacy-skeleton" key={item} />)}
						</div>
					) : error ? (
						<div className="home-section-state">
							<strong>{t('home.states.trendingLoadError')}</strong>
							<button type="button" onClick={() => refetch({ input: initialInput })}>{t('mypage.common.tryAgain')}</button>
						</div>
					) : pharmacies.length === 0 ? (
						<div className="home-section-state">
							<strong>{t('home.states.noTrendingTitle')}</strong>
							<span>{t('home.states.noTrendingText')}</span>
							<Link href="/pharmacies">{t('commonActions.browsePharmacies')}</Link>
						</div>
					) : (
						<motion.div
							className="home-pharmacy-grid"
							variants={mobileListVariants}
							initial="hidden"
							whileInView="visible"
							viewport={{ once: true, margin: '-40px' }}
						>
							{pharmacies.slice(0, 3).map((pharmacy) => (
								<motion.div
									className="home-pharmacy-card-motion"
									variants={mobileCardVariants}
									whileTap={reduceMotion ? undefined : { scale: 0.985 }}
									key={pharmacy._id}
								>
									<HomePharmacyCard pharmacy={pharmacy} onFavorite={favoritePharmacy} />
								</motion.div>
							))}
						</motion.div>
					)}
				</div>
			</section>
		);
	}

	return (
		<section className="home-trending-section">
			<div className="home-shell">
				<header className="home-section-heading home-trending-heading">
					<div>
						<span className="home-trending-kicker">{t('home.sections.trending.kicker')}</span>
						<h2>{t('home.sections.trending.title')}</h2>
						<p>{t('home.sections.trending.description')}</p>
					</div>
					<Link href="/pharmacies">
						{t('commonActions.viewAll')}
						<ArrowForwardRoundedIcon />
					</Link>
				</header>

				{loading && pharmacies.length === 0 ? (
					<div className="home-trending-skeleton-grid" aria-label={t('home.sections.trending.loadingAria')}>
						<div className="home-trending-feature-skeleton" />
						<div className="home-trending-mini-skeletons">
							{[0, 1, 2, 3].map((item) => <div className="home-trending-mini-skeleton" key={item} />)}
						</div>
					</div>
				) : error ? (
					<div className="home-section-state">
						<strong>{t('home.states.trendingLoadError')}</strong>
						<button type="button" onClick={() => refetch({ input: initialInput })}>{t('mypage.common.tryAgain')}</button>
					</div>
				) : pharmacies.length === 0 ? (
					<div className="home-section-state">
						<strong>{t('home.states.noTrendingTitle')}</strong>
						<span>{t('home.states.noTrendingText')}</span>
						<Link href="/pharmacies">{t('commonActions.browsePharmacies')}</Link>
					</div>
				) : selectedPharmacy ? (
					<LayoutGroup id="home-trending-pharmacies">
						<div className="home-trending-layout">
							<motion.article
								className="home-trending-feature"
								key={selectedPharmacy._id}
								layout={!reduceMotion}
								layoutId={reduceMotion ? undefined : `home-trending-card-${selectedPharmacy._id}`}
								transition={layoutTransition}
								initial={reduceMotion ? { opacity: 0 } : false}
								animate={{ opacity: 1 }}
								whileHover={reduceMotion ? undefined : { y: -3 }}
							>
								<motion.div
									className="home-trending-feature__media"
									layout={!reduceMotion}
									layoutId={reduceMotion ? undefined : `home-trending-media-${selectedPharmacy._id}`}
									transition={layoutTransition}
								>
									<Link href={`/pharmacies/detail?id=${selectedPharmacy._id}`} aria-label={t('home.pharmacyCard.viewPharmacyAria', { name: selectedPharmacy.pharmacyName })}>
										<motion.img
											src={getPharmacyImage(selectedPharmacy)}
											alt={t('home.pharmacyCard.imageAlt', { name: selectedPharmacy.pharmacyName })}
											onError={useFallbackImage}
										/>
									</Link>
									<div className="home-trending-feature__badge">
										{getLikeLabel(t, selectedPharmacy.pharmacyLikes)}
									</div>
									{renderFavoriteButton(selectedPharmacy, 'home-trending-feature__favorite')}
								</motion.div>

								<AnimatePresence mode="wait">
									<motion.div
										className="home-trending-feature__body"
										key={`details-${selectedPharmacy._id}`}
										initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
										animate={{ opacity: 1, y: 0 }}
										exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
										transition={detailsTransition}
									>
										<div className="home-trending-feature__title-row">
											<div>
												<h3>{selectedPharmacy.pharmacyName}</h3>
												<p><LocationOnOutlinedIcon /> {selectedPharmacy.pharmacyAddress}</p>
											</div>
											{selectedPharmacy.verifiedAt && (
												<span className="home-trending-feature__verified">
													<VerifiedRoundedIcon />
													{t('home.pharmacyCard.verified')}
												</span>
											)}
										</div>

										<p className="home-trending-feature__summary">{getTrendingSummary(t, selectedPharmacy)}</p>

										<div className="home-trending-feature__chips">
											<span className={selectedPharmacy.hoursConfigured && !selectedPharmacy.isOpenNow ? 'is-muted' : ''}>
												<AccessTimeRoundedIcon />
												{getHoursLabel(t, selectedPharmacy)}
											</span>
											<span>
												<StorefrontOutlinedIcon />
												{getTypeLabel(t, selectedPharmacy)}
											</span>
											<span>
												<LocalShippingOutlinedIcon />
												{getDeliveryLabel(t, selectedPharmacy)}
											</span>
											{selectedPharmacy.acceptsInsurance && (
												<span>
													<HealthAndSafetyOutlinedIcon />
													{t('home.pharmacyCard.insurance')}
												</span>
											)}
										</div>

										<div className="home-trending-feature__footer">
											<div>
												<span>{t('home.sections.trending.signal')}</span>
												<strong>{getLikeLabel(t, selectedPharmacy.pharmacyLikes)}</strong>
											</div>
											<Link href={`/pharmacies/detail?id=${selectedPharmacy._id}`}>
												{t('home.pharmacyCard.viewPharmacy')}
												<ArrowForwardRoundedIcon />
											</Link>
										</div>
									</motion.div>
								</AnimatePresence>
							</motion.article>

							<motion.div className="home-trending-compact-grid" aria-label={t('home.sections.trending.chooseFeatureAria')}>
								{compactPharmacies.map((pharmacy) => (
									<motion.article
										className="home-trending-mini-card"
										key={pharmacy._id}
										layout={!reduceMotion}
										layoutId={reduceMotion ? undefined : `home-trending-card-${pharmacy._id}`}
										initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
										animate={{ opacity: 1, y: 0 }}
										transition={reduceMotion ? compactTransition : layoutTransition}
										role="button"
										tabIndex={0}
										aria-pressed={selectedId === pharmacy._id}
										aria-label={t('home.sections.trending.featureAria', { name: pharmacy.pharmacyName })}
										onClick={() => setSelectedId(pharmacy._id)}
										onKeyDown={(event: KeyboardEvent<HTMLElement>) => handleCompactKeyDown(event, pharmacy._id)}
										whileHover={reduceMotion ? undefined : { y: -5, scale: 1.015 }}
										whileTap={reduceMotion ? undefined : { scale: 0.98 }}
									>
										<motion.div
											className="home-trending-mini-card__media"
											layout={!reduceMotion}
											layoutId={reduceMotion ? undefined : `home-trending-media-${pharmacy._id}`}
											transition={layoutTransition}
										>
											<motion.img src={getPharmacyImage(pharmacy)} alt={t('home.pharmacyCard.imageAlt', { name: pharmacy.pharmacyName })} onError={useFallbackImage} />
											{renderFavoriteButton(pharmacy, 'home-trending-mini-card__favorite')}
										</motion.div>
										<div className="home-trending-mini-card__body">
											<h3>{pharmacy.pharmacyName}</h3>
											<p>{t(`pharmacyLocation.${pharmacy.pharmacyLocation}`)}</p>
											<div>
												<span>{getHoursLabel(t, pharmacy)}</span>
												<strong>{getLikeLabel(t, pharmacy.pharmacyLikes)}</strong>
											</div>
											<Link
												href={`/pharmacies/detail?id=${pharmacy._id}`}
												onClick={(event) => event.stopPropagation()}
												onKeyDown={(event) => event.stopPropagation()}
											>
												{t('home.pharmacyCard.viewPharmacy')}
												<ArrowForwardRoundedIcon />
											</Link>
										</div>
									</motion.article>
								))}
							</motion.div>
						</div>
					</LayoutGroup>
				) : null}
			</div>
		</section>
	);
};

export default HomeTrendingSection;
