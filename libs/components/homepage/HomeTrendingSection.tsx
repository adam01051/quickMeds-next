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
import { getPharmacyLocationLabel } from '../../utils/pharmacy-location';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../sweetAlert';

interface HomeTrendingSectionProps {
	initialInput: PharmaciesInquiry;
}

const layoutTransition: Transition = { duration: 0.56, ease: [0.22, 1, 0.36, 1] };
const detailsTransition: Transition = { duration: 0.22, ease: 'easeOut', delay: 0.12 };
const compactTransition: Transition = { duration: 0.2, ease: 'easeOut' };

const getLikeLabel = (likes: number) => `${likes} ${likes === 1 ? 'like' : 'likes'}`;

const getPharmacyImage = (pharmacy: Property) => {
	return pharmacy.pharmacyImages?.[0] ? `${REACT_APP_API_URL}/${pharmacy.pharmacyImages[0]}` : '/img/banner/header1.svg';
};

const useFallbackImage = (event: SyntheticEvent<HTMLImageElement>) => {
	event.currentTarget.onerror = null;
	event.currentTarget.src = '/img/banner/header1.svg';
};

const getHoursLabel = (pharmacy: Property) => {
	if (pharmacy.open24Hours) return 'Open 24/7';
	if (!pharmacy.hoursConfigured) return 'Hours not provided';
	return pharmacy.isOpenNow ? 'Open now' : 'Closed';
};

const getDeliveryLabel = (pharmacy: Property) => {
	if (!pharmacy.hasDelivery) return 'Pickup only';
	if (pharmacy.pharmacyDeliveryFee === 0) return 'Free delivery';
	return `${formatterStr(pharmacy.pharmacyDeliveryFee)} UZS delivery`;
};

const getTypeLabel = (pharmacy: Property) => {
	return pharmacy.pharmacyType.toLowerCase().replace(/_/g, ' ');
};

const getTrendingSummary = (pharmacy: Property) => {
	const serviceMode = pharmacy.hasDelivery ? 'delivery and pickup' : 'pickup service';
	const insurance = pharmacy.acceptsInsurance ? 'insurance support' : 'direct-pay visits';

	return `${pharmacy.pharmacyName} is a ${getTypeLabel(pharmacy)} pharmacy offering ${serviceMode}, ${insurance}, and clear availability signals for QuickMeds users.`;
};

const HomeTrendingSection = ({ initialInput }: HomeTrendingSectionProps) => {
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
				aria-label={isFavorite ? `Unlike ${pharmacy.pharmacyName}` : `Like ${pharmacy.pharmacyName}`}
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

	return (
		<section className="home-trending-section">
			<div className="home-shell">
				<header className="home-section-heading home-trending-heading">
					<div>
						<span className="home-trending-kicker">Liked by the community</span>
						<h2>Trending pharmacies</h2>
						<p>Trend is based on pharmacy likes and community interactions.</p>
					</div>
					<Link href="/pharmacies">
						View all
						<ArrowForwardRoundedIcon />
					</Link>
				</header>

				{loading && pharmacies.length === 0 ? (
					<div className="home-trending-skeleton-grid" aria-label="Loading trending pharmacies">
						<div className="home-trending-feature-skeleton" />
						<div className="home-trending-mini-skeletons">
							{[0, 1, 2, 3].map((item) => <div className="home-trending-mini-skeleton" key={item} />)}
						</div>
					</div>
				) : error ? (
					<div className="home-section-state">
						<strong>Trending pharmacies could not be loaded.</strong>
						<button type="button" onClick={() => refetch({ input: initialInput })}>Try again</button>
					</div>
				) : pharmacies.length === 0 ? (
					<div className="home-section-state">
						<strong>No trending pharmacies are available yet.</strong>
						<span>Browse all pharmacies while community activity builds.</span>
						<Link href="/pharmacies">Browse pharmacies</Link>
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
									<Link href={`/pharmacies/detail?id=${selectedPharmacy._id}`} aria-label={`View ${selectedPharmacy.pharmacyName}`}>
										<motion.img
											src={getPharmacyImage(selectedPharmacy)}
											alt={`${selectedPharmacy.pharmacyName} pharmacy`}
											onError={useFallbackImage}
										/>
									</Link>
									<div className="home-trending-feature__badge">
										{getLikeLabel(selectedPharmacy.pharmacyLikes)}
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
													Verified
												</span>
											)}
										</div>

										<p className="home-trending-feature__summary">{getTrendingSummary(selectedPharmacy)}</p>

										<div className="home-trending-feature__chips">
											<span className={selectedPharmacy.hoursConfigured && !selectedPharmacy.isOpenNow ? 'is-muted' : ''}>
												<AccessTimeRoundedIcon />
												{getHoursLabel(selectedPharmacy)}
											</span>
											<span>
												<StorefrontOutlinedIcon />
												{getTypeLabel(selectedPharmacy)}
											</span>
											<span>
												<LocalShippingOutlinedIcon />
												{getDeliveryLabel(selectedPharmacy)}
											</span>
											{selectedPharmacy.acceptsInsurance && (
												<span>
													<HealthAndSafetyOutlinedIcon />
													Insurance
												</span>
											)}
										</div>

										<div className="home-trending-feature__footer">
											<div>
												<span>QuickMeds signal</span>
												<strong>{getLikeLabel(selectedPharmacy.pharmacyLikes)}</strong>
											</div>
											<Link href={`/pharmacies/detail?id=${selectedPharmacy._id}`}>
												View pharmacy
												<ArrowForwardRoundedIcon />
											</Link>
										</div>
									</motion.div>
								</AnimatePresence>
							</motion.article>

							<motion.div className="home-trending-compact-grid" aria-label="Choose a trending pharmacy to feature">
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
										aria-label={`Feature ${pharmacy.pharmacyName}`}
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
											<motion.img src={getPharmacyImage(pharmacy)} alt={`${pharmacy.pharmacyName} pharmacy`} onError={useFallbackImage} />
											{renderFavoriteButton(pharmacy, 'home-trending-mini-card__favorite')}
										</motion.div>
										<div className="home-trending-mini-card__body">
											<h3>{pharmacy.pharmacyName}</h3>
											<p>{getPharmacyLocationLabel(pharmacy.pharmacyLocation)}</p>
											<div>
												<span>{getHoursLabel(pharmacy)}</span>
												<strong>{getLikeLabel(pharmacy.pharmacyLikes)}</strong>
											</div>
											<Link
												href={`/pharmacies/detail?id=${pharmacy._id}`}
												onClick={(event) => event.stopPropagation()}
												onKeyDown={(event) => event.stopPropagation()}
											>
												View pharmacy
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
