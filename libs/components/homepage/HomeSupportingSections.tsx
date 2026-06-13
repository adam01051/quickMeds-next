import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@apollo/client';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import HealthAndSafetyOutlinedIcon from '@mui/icons-material/HealthAndSafetyOutlined';
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
	{ icon: <VerifiedUserOutlinedIcon />, title: 'Verified status', copy: 'See verification when it is provided by the pharmacy.' },
	{ icon: <LocalShippingOutlinedIcon />, title: 'Delivery support', copy: 'Compare delivery availability and fees before choosing.' },
	{ icon: <HealthAndSafetyOutlinedIcon />, title: 'Insurance clarity', copy: 'Quickly identify pharmacies that accept insurance.' },
];

const locations = [
	PharmacyLocation.TASHKENT_CITY,
	PharmacyLocation.TASHKENT_REGION,
	PharmacyLocation.SAMARKAND,
	PharmacyLocation.BUKHARA,
	PharmacyLocation.FERGANA,
	PharmacyLocation.ANDIJAN,
];

const HomeSupportingSections = () => {
	const [articles, setArticles] = useState<BoardArticle[]>([]);
	const { loading } = useQuery(GET_BOARD_ARTICLES, {
		fetchPolicy: 'cache-and-network',
		variables: {
			input: { page: 1, limit: 3, sort: 'articleViews', direction: 'DESC', search: { articleCategory: BoardArticleCategory.NEWS } },
		},
		onCompleted: (data: T) => setArticles(data?.getBoardArticles?.list ?? []),
	});
	const useFallbackImage = (event: React.SyntheticEvent<HTMLImageElement>) => {
		event.currentTarget.onerror = null;
		event.currentTarget.src = '/img/community/articleImg.png';
	};

	return (
		<>
			<section className="home-why-section">
				<div className="home-shell home-why-layout">
					<div className="home-why-intro">
						<span>Why QuickMeds</span>
						<h2>A clearer way to choose local pharmacy care.</h2>
						<p>QuickMeds puts location and practical services first, so you can make a confident choice without digging through unnecessary details.</p>
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
					</div>
				</div>
			</section>
			<section className="home-location-section">
				<div className="home-shell home-location-layout">
					<div>
						<h2>Explore supported areas</h2>
						<p>Start with the areas currently available in pharmacy search.</p>
					</div>
					<div className="home-location-links">
						{locations.map((location) => (
							<Link href={`/pharmacies?input=${encodeURIComponent(JSON.stringify({ page: 1, limit: 9, sort: 'createdAt', direction: 'DESC', search: { locationList: [location] } }))}`} key={location}>
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
							<h2>Health-related reading</h2>
							<p>Popular community news and practical updates.</p>
						</div>
						<Link href="/community?articleCategory=NEWS">View all articles <ArrowForwardRoundedIcon /></Link>
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
							const image = article.articleImage ? `${REACT_APP_API_URL}/${article.articleImage}` : '/img/community/articleImg.png';
							return (
								<Link href={`/community/detail?articleCategory=${article.articleCategory}&id=${article._id}`} className="home-article-card" key={article._id}>
									<img src={image} alt="" onError={useFallbackImage} />
									<span>Community news</span>
									<h3>{article.articleTitle}</h3>
									<p>{article.articleViews} views</p>
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
						<h2>Help people discover your pharmacy.</h2>
						<p>Join QuickMeds as a Pharmacy Owner and keep your services and location easy to find.</p>
					</div>
					<Link href="/agent">Explore Pharmacy Owners <ArrowForwardRoundedIcon /></Link>
				</div>
			</section>
		</>
	);
};

export default HomeSupportingSections;
