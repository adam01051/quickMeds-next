import React, { useEffect } from 'react';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Top from '../Top';
import Footer from '../Footer';
import { Stack } from '@mui/material';
import { getJwtToken, updateUserInfo } from '../../auth';
import Chat from '../Chat';
//@ts-ignore
import 'swiper/css';
//@ts-ignore
import 'swiper/css/pagination';
//@ts-ignore
import 'swiper/css/navigation';

const withLayoutBasic = (Component: any) => {
	return (props: any) => {
		const device = useDeviceDetect();
		const router = useRouter();
		const isMyPage = router.pathname === '/mypage';
		const isCatalog = router.pathname === '/pharmacies';
		const isCommunity = router.pathname === '/community' || router.pathname === '/community/detail';
		const isMessagesPage = router.pathname === '/mypage' && router.query.category === 'messages';
		const shouldRenderMobile = device === 'mobile';

		/** LIFECYCLES **/
		useEffect(() => {
			const jwt = getJwtToken();
			if (jwt) updateUserInfo(jwt);
		}, []);

		/** HANDLERS **/

		if (shouldRenderMobile) {
			return (
				<>
					<Head>
						<title>quickMeds</title>
						<meta name={'title'} content={`quickMeds`} />
					</Head>
					<Stack
						id="mobile-wrap"
						className={[isCatalog ? 'quickmeds-catalog' : '', isCommunity ? 'quickmeds-community' : '']
							.filter(Boolean)
							.join(' ')}
					>
						<Stack id={'top'}>
							<Top />
						</Stack>

						<Stack id={'main'}>
							<Component {...props} />
						</Stack>

						{!isMessagesPage && <Chat />}

						{!isMyPage && (
							<Stack id={'footer'}>
								<Footer />
							</Stack>
						)}
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
					<Stack id="pc-wrap" className="quickmeds-public-layout quickmeds-public-layout--basic">
						<Stack id={'top'}>
							<Top />
						</Stack>

						<Stack id={'main'}>
							<Component {...props} />
						</Stack>

						{!isMessagesPage && <Chat />}

						{!isMyPage && (
							<Stack id={'footer'}>
								<Footer />
							</Stack>
						)}
					</Stack>
				</>
			);
		}
	};
};

export default withLayoutBasic;
