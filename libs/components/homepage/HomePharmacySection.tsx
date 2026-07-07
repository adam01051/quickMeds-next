import React, { useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { motion, useReducedMotion } from 'framer-motion';
import { GET_PHARMACIES } from '../../../apollo/user/query';
import { LIKE_TARGET_PHARMACY } from '../../../apollo/user/mutation';
import { userVar } from '../../../apollo/store';
import { PharmaciesInquiry } from '../../types/property/property.input';
import { Property } from '../../types/property/property';
import { T } from '../../types/common';
import { Message } from '../../enums/common.enum';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../sweetAlert';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import HomePharmacyCard from './HomePharmacyCard';
import { useTranslation } from 'next-i18next';

interface HomePharmacySectionProps {
	title: string;
	description: string;
	initialInput: PharmaciesInquiry;
	tone?: 'default' | 'soft';
	mobileOnly?: boolean;
}

const HomePharmacySection = ({
	title,
	description,
	initialInput,
	tone = 'default',
	mobileOnly = false,
}: HomePharmacySectionProps) => {
	const device = useDeviceDetect();
	const { t } = useTranslation('common');
	const user = useReactiveVar(userVar);
	const reduceMotion = useReducedMotion();
	const [pharmacies, setPharmacies] = useState<Property[]>([]);
	const [likeTargetPharmacy] = useMutation(LIKE_TARGET_PHARMACY);
	const isMobile = device === 'mobile';
	const shouldRender = !mobileOnly || isMobile;
	const { loading, error, refetch } = useQuery(GET_PHARMACIES, {
		fetchPolicy: 'cache-and-network',
		variables: { input: initialInput },
		skip: !shouldRender,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => setPharmacies(data?.getPharmacies?.list ?? []),
	});

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

	if (!shouldRender) return null;

	return (
		<section className={`home-discovery-section home-discovery-section--${tone}`}>
			<div className="home-shell">
				<header className="home-section-heading">
					<div>
						<h2>{title}</h2>
						<p>{description}</p>
					</div>
					<Link href="/pharmacies">
						{t('commonActions.viewAll')}
						<ArrowForwardRoundedIcon />
					</Link>
				</header>
				{loading && pharmacies.length === 0 ? (
					<div className="home-pharmacy-grid" aria-label={t('home.sections.featured.loadingAria')}>
						{[0, 1, 2].map((item) => <div className="home-pharmacy-skeleton" key={item} />)}
					</div>
				) : error ? (
					<div className="home-section-state">
						<strong>{t('home.states.pharmaciesLoadError')}</strong>
						<button type="button" onClick={() => refetch({ input: initialInput })}>{t('mypage.common.tryAgain')}</button>
					</div>
				) : pharmacies.length === 0 ? (
					<div className="home-section-state">
						<strong>{t('home.states.noPharmaciesTitle')}</strong>
						<span>{t('home.states.noPharmaciesText')}</span>
					</div>
				) : isMobile ? (
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
				) : (
					<div className="home-pharmacy-grid">
						{pharmacies.slice(0, 3).map((pharmacy) => (
							<HomePharmacyCard pharmacy={pharmacy} onFavorite={favoritePharmacy} key={pharmacy._id} />
						))}
					</div>
				)}
			</div>
		</section>
	);
};

export default HomePharmacySection;
