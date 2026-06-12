import React, { useEffect } from 'react';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import Head from 'next/head';
import Top from '../Top';
import Footer from '../Footer';
import { Stack } from '@mui/material';
import FiberContainer from '../common/FiberContainer';
import HeaderFilter from '../homepage/HeaderFilter';
import { userVar } from '../../../apollo/store';
import { useReactiveVar } from '@apollo/client';
import { getJwtToken, updateUserInfo } from '../../auth';
import Chat from '../Chat';
import { motion, useReducedMotion } from 'framer-motion';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import SupportAgentOutlinedIcon from '@mui/icons-material/SupportAgentOutlined';
//@ts-ignore
import 'swiper/css';
//@ts-ignore
import 'swiper/css/pagination';
//@ts-ignore
import 'swiper/css/navigation';

const withLayoutMain = (Component: any) => {
	return (props: any) => {
		const device = useDeviceDetect();
		const user = useReactiveVar(userVar);
		const shouldReduceMotion = useReducedMotion();

		/** LIFECYCLES **/
		useEffect(() => {
			const jwt = getJwtToken();
			if (jwt) updateUserInfo(jwt);
		}, []);

		/** HANDLERS **/

		if (device == 'mobile') {
			return (
				<>
					<Head>
						<title>quickMeds</title>
						<meta name={'title'} content={`quickMeds`} />
					</Head>
					<Stack id="mobile-wrap">
						<Stack id={'top'}>
							<Top />
						</Stack>

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
					<Head>
						<title>quickMeds</title>
						<meta name={'title'} content={`quickMeds`} />
					</Head>
					<Stack id="pc-wrap">
						<Stack id={'top'}>
							<Top />
						</Stack>

						<Stack className={'header-main'}>
							<FiberContainer />
							<Stack className={'container'}>
								<motion.div
									className="home-healthcare-hero"
									initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.45, ease: 'easeOut' }}
								>
									<span className="hero-kicker">Trusted local pharmacy care</span>
									<h1>Find trusted pharmacies and essential care near you.</h1>
									<p>Search verified pharmacies, compare delivery and insurance support, and get help when you need it.</p>
									<div className="hero-trust-row">
										<span><VerifiedUserOutlinedIcon /> Licensed pharmacies</span>
										<span><LocalShippingOutlinedIcon /> Delivery options</span>
										<span><SupportAgentOutlinedIcon /> Pharmacist support</span>
									</div>
								</motion.div>
								<HeaderFilter />
							</Stack>
						</Stack>

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
