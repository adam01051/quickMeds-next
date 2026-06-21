import React, { useEffect } from 'react';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import Head from 'next/head';
import Link from 'next/link';
import Top from '../Top';
import Footer from '../Footer';
import { Stack } from '@mui/material';
import HeaderFilter from '../homepage/HeaderFilter';
import { getJwtToken, updateUserInfo } from '../../auth';
import Chat from '../Chat';
import { motion, useReducedMotion } from 'framer-motion';
import BrandLogo from '../common/BrandLogo';
//@ts-ignore
import 'swiper/css';
//@ts-ignore
import 'swiper/css/pagination';
//@ts-ignore
import 'swiper/css/navigation';

const withLayoutMain = (Component: any) => {
	return (props: any) => {
		const device = useDeviceDetect();
		const reduceMotion = useReducedMotion();

		/** LIFECYCLES **/
		useEffect(() => {
			const jwt = getJwtToken();
			if (jwt) updateUserInfo(jwt);
		}, []);

		/** HANDLERS **/
		const homeHead = (
			<Head>
				<title>quickMeds</title>
				<meta name={'title'} content={`quickMeds`} />
			</Head>
		);

		const homeHeader = (
			<Stack className={'header-main'}>
				<Stack className={'container'}>
					<div className="home-hero-grid">
						<motion.div
							className="home-healthcare-hero"
							initial={false}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.35, ease: 'easeOut' }}
						>
							<span className="hero-kicker">Pharmacy discovery for everyday care</span>
							<h1>Find a trusted pharmacy near you.</h1>
							<p>Search by pharmacy name, address, or area, then compare useful services before you visit.</p>
						</motion.div>
						<div className="home-hero-visual" aria-hidden="true">
							<img src="/img/homepage/pharmacy-hero.webp" alt="" width="960" height="720" />
						</div>
					</div>
					<HeaderFilter />
				</Stack>
			</Stack>
		);

		const mobileFooter = (
			<motion.footer
				className="home-mobile-footer"
				initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={{ once: true, margin: '-20px' }}
				transition={{ duration: reduceMotion ? 0.01 : 0.38, ease: [0.22, 1, 0.36, 1] }}
			>
				<Link href="/" aria-label="quickMeds home" className="home-mobile-footer__brand">
					<BrandLogo />
				</Link>
				<nav className="home-mobile-footer__links" aria-label="Homepage footer links">
					<Link href="/pharmacies">Pharmacies</Link>
					<Link href="/community?articleCategory=FREE">Community</Link>
					<Link href="/cs">Support</Link>
				</nav>
				<div className="home-mobile-footer__meta">
					<span>English</span>
					<span>© {new Date().getFullYear()} QuickMeds Uzbekistan</span>
				</div>
			</motion.footer>
		);

		if (device == 'mobile') {
			return (
				<>
					{homeHead}
					<Stack id="mobile-wrap" className="quickmeds-home">
						<Stack id={'top'}>
							<Top />
						</Stack>

						{homeHeader}

						<Stack id={'main'}>
							<Component {...props} />
						</Stack>

						<Stack id={'footer'}>
							{mobileFooter}
						</Stack>
					</Stack>
				</>
			);
		} else {
			return (
				<>
					{homeHead}
					<Stack id="pc-wrap" className="quickmeds-home">
						<Stack id={'top'}>
							<Top />
						</Stack>

						{homeHeader}

						<Stack id={'main'}>
							<Component {...props} />
						</Stack>

						<Chat />

						<Stack id={'footer'}>
							<Footer />
						</Stack>
					</Stack>
				</>
			);
		}
	};
};

export default withLayoutMain;
