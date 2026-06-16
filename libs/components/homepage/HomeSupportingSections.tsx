import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@apollo/client';
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

const HomeSupportingSections = () => {
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
			<section className="home-why-section">
				<div className="home-shell home-why-layout">
					<div className="home-why-intro">
						<span>Why QuickMeds</span>
						<h2>Know the essentials before you choose a pharmacy.</h2>
						<p>QuickMeds brings pharmacy location, delivery, insurance, verified status, and operating-hours information into one calm search experience.</p>
					</div>
					<div className="home-service-list">
						{serviceItems.map((item) => (
							<div className="home-service-item" key={item.title}>
								<div>{item.icon}</div>
								<span>
									<strong>{item.title}</strong>
									<p>{item.copy}</p>
								</span>
							</div>
						))}
						<div className="home-service-note">
							<strong>Coming soon</strong>
							<span>Current-location distance search, verified-only filtering, notifications, and chat will be added when their backend behavior is ready.</span>
						</div>
					</div>
				</div>
			</section>
			<section className="home-location-section">
				<div className="home-shell home-location-layout">
					<div>
						<h2>Explore supported areas</h2>
						<p>Select a region to open pharmacy search with that Uzbekistan region already applied.</p>
					</div>
					<div className="home-location-links">
						{locations.map((location) => (
							<Link href={`/pharmacies?input=${encodeURIComponent(JSON.stringify({ page: 1, limit: 9, sort: 'createdAt', direction: 'DESC', search: { pharmacyLocationList: [location] } }))}`} key={location}>
								<PlaceOutlinedIcon />
								{getPharmacyLocationLabel(location)}
							</Link>
						))}
					</div>
				</div>
			</section>
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
					<div className="home-owner-cta__icon"><StorefrontOutlinedIcon /></div>
					<div>
						<span>For Pharmacy Owners</span>
						<h2>Help people discover your pharmacy.</h2>
						<p>Join QuickMeds as a Pharmacy Owner and keep your services and location easy to find.</p>
						<ul>
							<li>Manage services</li>
							<li>Keep location visible</li>
						</ul>
					</div>
					<Link href="/agent">Explore Pharmacy Owners <ArrowForwardRoundedIcon /></Link>
				</div>
			</section>
		</>
	);
};

export default HomeSupportingSections;
