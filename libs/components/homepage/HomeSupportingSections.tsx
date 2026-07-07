import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@apollo/client';
import { motion, useReducedMotion } from 'framer-motion';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import HealthAndSafetyOutlinedIcon from '@mui/icons-material/HealthAndSafetyOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import { GET_BOARD_ARTICLES } from '../../../apollo/user/query';
import { BoardArticleCategory } from '../../enums/board-article.enum';
import { BoardArticle } from '../../types/board-article/board-article';
import { T } from '../../types/common';
import { REACT_APP_API_URL } from '../../config';
import { PharmacyLocation } from '../../enums/property.enum';
import { useTranslation } from 'next-i18next';

const serviceItems = [
	{ icon: <VerifiedUserOutlinedIcon />, titleKey: 'home.sections.why.items.realSignals.title', copyKey: 'home.sections.why.items.realSignals.copy' },
	{ icon: <LocalShippingOutlinedIcon />, titleKey: 'home.sections.why.items.delivery.title', copyKey: 'home.sections.why.items.delivery.copy' },
	{ icon: <AccessTimeOutlinedIcon />, titleKey: 'home.sections.why.items.hours.title', copyKey: 'home.sections.why.items.hours.copy' },
	{ icon: <HealthAndSafetyOutlinedIcon />, titleKey: 'home.sections.why.items.regions.title', copyKey: 'home.sections.why.items.regions.copy' },
];

const locations = [
	PharmacyLocation.TASHKENT_CITY,
	PharmacyLocation.TASHKENT_REGION,
	PharmacyLocation.ANDIJAN,
	PharmacyLocation.SAMARKAND,
	PharmacyLocation.BUKHARA,
	PharmacyLocation.FERGANA,
	PharmacyLocation.JIZZAKH,
	PharmacyLocation.KARAKALPAKSTAN,
	PharmacyLocation.KASHKADARYA,
	PharmacyLocation.KHOREZM,
	PharmacyLocation.NAMANGAN,
	PharmacyLocation.NAVOI,
	PharmacyLocation.SIRDARYA,
	PharmacyLocation.SURKHANDARYA,
];

const sectionMotion = {
	hidden: { opacity: 0, y: 18 },
	visible: { opacity: 1, y: 0 },
};

const listMotion = {
	hidden: { opacity: 1 },
	visible: {
		opacity: 1,
		transition: { staggerChildren: 0.07, delayChildren: 0.08 },
	},
};

const itemMotion = {
	hidden: { opacity: 0, y: 12 },
	visible: { opacity: 1, y: 0 },
};

const HomeSupportingSections = () => {
	const reduceMotion = useReducedMotion();
	const { t } = useTranslation('common');
	const [articles, setArticles] = useState<BoardArticle[]>([]);
	const { loading } = useQuery(GET_BOARD_ARTICLES, {
		fetchPolicy: 'cache-and-network',
		variables: {
			input: { page: 1, limit: 3, sort: 'articleViews', direction: 'DESC', search: {} },
		},
		onCompleted: (data: T) => setArticles(data?.getBoardArticles?.list ?? []),
	});
	const getArticleExcerpt = (content: string) => {
		const text = content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
		if (!text) return t('home.sections.articles.defaultExcerpt');
		return text.length > 130 ? `${text.slice(0, 127)}...` : text;
	};
	const getArticleLabel = (category: BoardArticleCategory) => {
		if (category === BoardArticleCategory.NEWS) return t('boardCategory.NEWS');
		if (category === BoardArticleCategory.RECOMMEND) return t('boardCategory.RECOMMEND');
		if (category === BoardArticleCategory.HUMOR) return t('boardCategory.HUMOR');
		return t('boardCategory.FREE');
	};

	return (
		<>
			<motion.section
				className="home-why-section"
				initial={false}
				whileInView="visible"
				viewport={{ once: true, amount: 0.26 }}
			>
				<div className="home-shell home-why-layout">
					<motion.div className="home-why-intro" variants={sectionMotion} transition={{ duration: 0.46, ease: [0.22, 1, 0.36, 1] }}>
						<span>{t('home.sections.why.kicker')}</span>
						<h2>{t('home.sections.why.title')}</h2>
						<p>{t('home.sections.why.description')}</p>
					</motion.div>
					<motion.div className="home-service-list" variants={reduceMotion ? undefined : listMotion}>
						{serviceItems.map((item) => (
							<motion.div
								className="home-service-item"
								key={item.titleKey}
								variants={reduceMotion ? undefined : itemMotion}
								transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
								whileHover={reduceMotion ? undefined : { x: 5 }}
							>
								<div>{item.icon}</div>
								<span>
									<strong>{t(item.titleKey)}</strong>
									<p>{t(item.copyKey)}</p>
								</span>
							</motion.div>
						))}
						<motion.div
							className="home-service-note"
							variants={reduceMotion ? undefined : itemMotion}
							transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
						>
							<strong>{t('home.common.comingSoon')}</strong>
							<span>{t('home.sections.why.comingSoonText')}</span>
						</motion.div>
					</motion.div>
				</div>
			</motion.section>
			<motion.section
				className="home-location-section"
				initial={false}
				whileInView="visible"
				viewport={{ once: true, amount: 0.24 }}
			>
				<div className="home-shell home-location-layout">
					<motion.div variants={sectionMotion} transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}>
						<h2>{t('home.sections.locations.title')}</h2>
						<p>{t('home.sections.locations.description')}</p>
					</motion.div>
					<motion.div className="home-location-links" variants={reduceMotion ? undefined : listMotion}>
						{locations.map((location) => (
							<motion.div
								key={location}
								variants={reduceMotion ? undefined : itemMotion}
								transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
								whileHover={reduceMotion ? undefined : { y: -3 }}
							>
								<Link href={`/pharmacies?input=${encodeURIComponent(JSON.stringify({ page: 1, limit: 9, sort: 'createdAt', direction: 'DESC', search: { pharmacyLocationList: [location] } }))}`}>
									<PlaceOutlinedIcon />
									{t(`pharmacyLocation.${location}`)}
								</Link>
							</motion.div>
						))}
					</motion.div>
				</div>
			</motion.section>
			<motion.section
				className="home-articles-section"
				initial={false}
				whileInView="visible"
				viewport={{ once: true, amount: 0.22 }}
			>
				<div className="home-shell">
					<header className="home-section-heading">
						<div>
							<h2>{t('home.sections.articles.title')}</h2>
							<p>{t('home.sections.articles.description')}</p>
						</div>
						<Link href="/community">{t('commonActions.viewAllArticles')} <ArrowForwardRoundedIcon /></Link>
					</header>
					<motion.div className="home-article-grid" variants={reduceMotion ? undefined : listMotion}>
						{loading && articles.length === 0 ? (
							[0, 1, 2].map((item) => <div className="home-article-skeleton" key={item} />)
						) : articles.length === 0 ? (
							<div className="home-article-empty">
								<strong>{t('home.sections.articles.emptyTitle')}</strong>
								<p>{t('home.sections.articles.emptyText')}</p>
							</div>
						) : articles.map((article) => {
							const image = article.articleImage ? `${REACT_APP_API_URL}/${article.articleImage}` : '';
							return (
								<motion.div
									key={article._id}
									variants={reduceMotion ? undefined : itemMotion}
									transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
									whileHover={reduceMotion ? undefined : { y: -3 }}
									whileTap={reduceMotion ? undefined : { scale: 0.985 }}
								>
									<Link href={`/community/detail?articleCategory=${article.articleCategory}&id=${article._id}`} className={`home-article-card ${image ? '' : 'home-article-card--text'}`}>
										{image && <img src={image} alt="" />}
										<span>{getArticleLabel(article.articleCategory)}</span>
										<h3>{article.articleTitle}</h3>
										<strong>{getArticleExcerpt(article.articleContent)}</strong>
										<p>
											{t('home.sections.articles.views', { count: article.articleViews })}
											<em>{t('commonActions.readArticle')} <ArrowForwardRoundedIcon /></em>
										</p>
									</Link>
								</motion.div>
							);
						})}
					</motion.div>
				</div>
			</motion.section>
			<section className="home-owner-cta">
				<div className="home-shell home-owner-cta__inner">
					<motion.div
						className="home-owner-cta__media"
						initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 18 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true, amount: 0.35 }}
						transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
						whileHover={reduceMotion ? undefined : { y: -4 }}
					>
						<motion.img
							src="/img/homepage/owner-pharmacy-spotlight.webp"
							alt={t('home.sections.ownerCta.imageAlt')}
							whileHover={reduceMotion ? undefined : { scale: 1.025 }}
							transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
						/>
						<div className="home-owner-cta__overlay">
							<h2>{t('home.sections.ownerCta.overlayTitle')}</h2>
							<p>{t('home.sections.ownerCta.overlayText')}</p>
							<Link className="home-owner-cta__mobile-link" href="/account/join?mode=signup">
								{t('home.sections.ownerCta.mobileAction')}
							</Link>
						</div>
						<motion.div
							className="home-owner-cta__stat"
							initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 12, scale: 0.98 }}
							whileInView={{ opacity: 1, y: 0, scale: 1 }}
							viewport={{ once: true, amount: 0.35 }}
							transition={{ duration: 0.45, delay: 0.14, ease: [0.22, 1, 0.36, 1] }}
							whileHover={reduceMotion ? undefined : { y: -3 }}
						>
							<StorefrontOutlinedIcon />
							<strong>{t('home.sections.ownerCta.statTitle')}</strong>
							<span>{t('home.sections.ownerCta.statText')}</span>
						</motion.div>
					</motion.div>

					<motion.div
						className="home-owner-cta__content"
						initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true, amount: 0.3 }}
						transition={{ duration: 0.5, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
					>
						<span>{t('home.sections.ownerCta.kicker')}</span>
						<h2>{t('home.sections.ownerCta.title')}</h2>
						<p>{t('home.sections.ownerCta.description')}</p>
						<div className="home-owner-cta__benefits">
							<motion.div whileHover={reduceMotion ? undefined : { x: 4 }} transition={{ duration: 0.2, ease: 'easeOut' }}>
								<PlaceOutlinedIcon />
								<span>
									<strong>{t('home.sections.ownerCta.benefits.discovery.title')}</strong>
									{t('home.sections.ownerCta.benefits.discovery.copy')}
								</span>
							</motion.div>
							<motion.div whileHover={reduceMotion ? undefined : { x: 4 }} transition={{ duration: 0.2, ease: 'easeOut' }}>
								<VerifiedUserOutlinedIcon />
								<span>
									<strong>{t('home.sections.ownerCta.benefits.trust.title')}</strong>
									{t('home.sections.ownerCta.benefits.trust.copy')}
								</span>
							</motion.div>
						</div>
						<div className="home-owner-cta__actions">
							<Link className="home-owner-cta__action home-owner-cta__action--primary" href="/account/join?mode=signup">
								{t('home.sections.ownerCta.primaryAction')}
								<ArrowForwardRoundedIcon />
							</Link>
							<Link className="home-owner-cta__action" href="/agent">
								{t('home.sections.ownerCta.secondaryAction')}
								<ArrowForwardRoundedIcon />
							</Link>
						</div>
					</motion.div>
				</div>
			</section>
		</>
	);
};

export default HomeSupportingSections;
