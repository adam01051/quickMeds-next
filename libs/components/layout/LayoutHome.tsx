import React, { useEffect } from 'react';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import Head from 'next/head';
import Top from '../Top';
import Footer from '../Footer';
import { Stack } from '@mui/material';
import HeaderFilter from '../homepage/HeaderFilter';
import { getJwtToken, updateUserInfo } from '../../auth';
import Chat from '../Chat';
import { motion } from 'framer-motion';
//@ts-ignore
import 'swiper/css';
//@ts-ignore
import 'swiper/css/pagination';
//@ts-ignore
import 'swiper/css/navigation';

const withLayoutMain = (Component: any) => {
	return (props: any) => {
		const device = useDeviceDetect();

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
							<Footer />
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
