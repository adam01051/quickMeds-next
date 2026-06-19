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
import { getPharmacyLocationLabel } from '../../utils/pharmacy-location';

const serviceItems = [
	{ icon: <VerifiedUserOutlinedIcon />, title: 'Real pharmacy signals', copy: 'Verified status appears only when a pharmacy has provided verification.' },
	{ icon: <LocalShippingOutlinedIcon />, title: 'Delivery and fee clarity', copy: 'Check delivery availability and UZS fees before you decide.' },
	{ icon: <AccessTimeOutlinedIcon />, title: 'Operating-hours status', copy: 'See 24/7, open or closed, and hours-not-provided states from real pharmacy data.' },
	{ icon: <HealthAndSafetyOutlinedIcon />, title: 'Regional discovery', copy: 'Search across supported Uzbekistan regions instead of vague location buckets.' },
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
		if (!text) return 'Read a practical update from the QuickMeds Community.';
		return text.length > 130 ? `${text.slice(0, 127)}...` : text;
	};
	const getArticleLabel = (category: BoardArticleCategory) => {
		if (category === BoardArticleCategory.NEWS) return 'News';
		if (category === BoardArticleCategory.RECOMMEND) return 'Recommendations';
		if (category === BoardArticleCategory.HUMOR) return 'Community Corner';
		return 'Discussions';
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
						<span>Why QuickMeds</span>
						<h2>Know the essentials before you choose a pharmacy.</h2>
						<p>QuickMeds brings pharmacy location, delivery, insurance, verified status, and operating-hours information into one calm search experience.</p>
					</motion.div>
					<motion.div className="home-service-list" variants={reduceMotion ? undefined : listMotion}>
						{serviceItems.map((item) => (
							<motion.div
								className="home-service-item"
								key={item.title}
								variants={reduceMotion ? undefined : itemMotion}
								transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
								whileHover={reduceMotion ? undefined : { x: 5 }}
							>
								<div>{item.icon}</div>
								<span>
									<strong>{item.title}</strong>
									<p>{item.copy}</p>
								</span>
							</motion.div>
						))}
						<motion.div
							className="home-service-note"
							variants={reduceMotion ? undefined : itemMotion}
							transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
						>
							<strong>Coming soon</strong>
							<span>Current-location distance search, verified-only filtering, notifications, and chat will be added when their backend behavior is ready.</span>
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
						<h2>Explore supported areas</h2>
						<p>Select a region to open pharmacy search with that Uzbekistan region already applied.</p>
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
									{getPharmacyLocationLabel(location)}
								</Link>
							</motion.div>
						))}
					</motion.div>
				</div>
			</motion.section>
			<section className="home-articles-section">
				<div className="home-shell">
					<header className="home-section-heading">
						<div>
							<h2>Community health reading</h2>
							<p>Useful updates and pharmacy-discovery notes from QuickMeds Community.</p>
						</div>
						<Link href="/community">View all articles <ArrowForwardRoundedIcon /></Link>
					</header>
					<div className="home-article-grid">
						{loading && articles.length === 0 ? (
							[0, 1, 2].map((item) => <div className="home-article-skeleton" key={item} />)
						) : articles.length === 0 ? (
							<div className="home-article-empty">
								<strong>More practical reading is on the way.</strong>
								<p>Health-related community articles will appear here as they are published.</p>
							</div>
						) : articles.map((article) => {
							const image = article.articleImage ? `${REACT_APP_API_URL}/${article.articleImage}` : '';
							return (
								<Link href={`/community/detail?articleCategory=${article.articleCategory}&id=${article._id}`} className={`home-article-card ${image ? '' : 'home-article-card--text'}`} key={article._id}>
									{image && <img src={image} alt="" />}
									<span>{getArticleLabel(article.articleCategory)}</span>
									<h3>{article.articleTitle}</h3>
									<strong>{getArticleExcerpt(article.articleContent)}</strong>
									<p>
										{article.articleViews} views
										<em>Read article <ArrowForwardRoundedIcon /></em>
									</p>
								</Link>
							);
						})}
					</div>
				</div>
			</section>
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
							alt="Modern pharmacy counter and shelves"
							whileHover={reduceMotion ? undefined : { scale: 1.025 }}
							transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
						/>
						<div className="home-owner-cta__overlay">
							<h2>Your pharmacy, easier to find</h2>
							<p>QuickMeds helps nearby customers compare services before they visit.</p>
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
							<strong>Visible services</strong>
							<span>Hours, delivery, insurance</span>
						</motion.div>
					</motion.div>

					<motion.div
						className="home-owner-cta__content"
						initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true, amount: 0.3 }}
						transition={{ duration: 0.5, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
					>
						<span>For Pharmacy Owners</span>
						<h2>Join the QuickMeds pharmacy network.</h2>
						<p>Make your pharmacy easier to find, keep services visible, and connect with people searching nearby.</p>
						<div className="home-owner-cta__benefits">
							<motion.div whileHover={reduceMotion ? undefined : { x: 4 }} transition={{ duration: 0.2, ease: 'easeOut' }}>
								<PlaceOutlinedIcon />
								<span>
									<strong>Boost local discovery</strong>
									Show location, delivery, hours, and services in one searchable profile.
								</span>
							</motion.div>
							<motion.div whileHover={reduceMotion ? undefined : { x: 4 }} transition={{ duration: 0.2, ease: 'easeOut' }}>
								<VerifiedUserOutlinedIcon />
								<span>
									<strong>Build patient trust</strong>
									Create a clear pharmacy presence with availability and contact paths.
								</span>
							</motion.div>
						</div>
						<div className="home-owner-cta__actions">
							<Link className="home-owner-cta__action home-owner-cta__action--primary" href="/account/join?mode=signup">
								Become a Pharmacy Owner
								<ArrowForwardRoundedIcon />
							</Link>
							<Link className="home-owner-cta__action" href="/agent">
								Explore Pharmacy Owners
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
