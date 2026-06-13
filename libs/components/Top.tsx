import React, { useCallback, useEffect, useRef } from 'react';
import { useState } from 'react';
import { useRouter, withRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { getJwtToken, logOut, updateUserInfo } from '../auth';
import { Stack, Box } from '@mui/material';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import { alpha, styled } from '@mui/material/styles';
import Menu, { MenuProps } from '@mui/material/Menu';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import { CaretDown } from 'phosphor-react';
import useDeviceDetect from '../hooks/useDeviceDetect';
import Link from 'next/link';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../apollo/store';
import { Logout } from '@mui/icons-material';
import { REACT_APP_API_URL } from '../config';
import BrandLogo from './common/BrandLogo';
import { motion } from 'framer-motion';

const Top = () => {
	const device = useDeviceDetect();
	const user = useReactiveVar(userVar);
	const { t, i18n } = useTranslation('common');
	const router = useRouter();
	const [anchorEl2, setAnchorEl2] = useState<null | HTMLElement>(null);
	const [lang, setLang] = useState<string | null>('en');
	const drop = Boolean(anchorEl2);
	const [colorChange, setColorChange] = useState(false);
	const [anchorEl, setAnchorEl] = React.useState<any | HTMLElement>(null);
	let open = Boolean(anchorEl);
	const [bgColor, setBgColor] = useState<boolean>(false);
	const [logoutAnchor, setLogoutAnchor] = React.useState<null | HTMLElement>(null);
	const logoutOpen = Boolean(logoutAnchor);
	const isHome = router.pathname === '/';
	const isActiveRoute = (pathname: string) =>
		pathname === '/' ? router.pathname === pathname : router.pathname === pathname || router.pathname.startsWith(`${pathname}/`);

	/** LIFECYCLES **/
	useEffect(() => {
		if (localStorage.getItem('locale') === null) {
			localStorage.setItem('locale', 'en');
			setLang('en');
		} else {
			setLang(localStorage.getItem('locale'));
		}
	}, [router]);

	useEffect(() => {
		switch (router.pathname) {
			case '/pharmacies/detail':
				setBgColor(true);
				break;
			default:
				break;
		}
	}, [router]);

	useEffect(() => {
		const jwt = getJwtToken();
		if (jwt) updateUserInfo(jwt);
	}, []);

	useEffect(() => {
		const changeNavbarColor = () => setColorChange(window.scrollY >= 40);

		changeNavbarColor();
		window.addEventListener('scroll', changeNavbarColor, { passive: true });
		return () => window.removeEventListener('scroll', changeNavbarColor);
	}, []);

	/** HANDLERS **/
	const langClick = (e: any) => {
		setAnchorEl2(e.currentTarget);
	};

	const langClose = () => {
		setAnchorEl2(null);
	};

	const langChoice = useCallback(
		async (e: any) => {
			setLang(e.target.id);
			localStorage.setItem('locale', e.target.id);
			setAnchorEl2(null);
			await router.push(router.asPath, router.asPath, { locale: e.target.id });
		},
		[router],
	);

	const handleClose = () => {
		setAnchorEl(null);
	};

	const handleHover = (event: any) => {
		if (anchorEl !== event.currentTarget) {
			setAnchorEl(event.currentTarget);
		} else {
			setAnchorEl(null);
		}
	};

	const StyledMenu = styled((props: MenuProps) => (
		<Menu
			elevation={0}
			anchorOrigin={{
				vertical: 'bottom',
				horizontal: 'right',
			}}
			transformOrigin={{
				vertical: 'top',
				horizontal: 'right',
			}}
			{...props}
		/>
	))(({ theme }) => ({
		'& .MuiPaper-root': {
			top: '109px',
			borderRadius: 6,
			marginTop: theme.spacing(1),
			minWidth: 160,
			color: theme.palette.mode === 'light' ? 'rgb(55, 65, 81)' : theme.palette.grey[300],
			boxShadow:
				'rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px',
			'& .MuiMenu-list': {
				padding: '4px 0',
			},
			'& .MuiMenuItem-root': {
				'& .MuiSvgIcon-root': {
					fontSize: 18,
					color: theme.palette.text.secondary,
					marginRight: theme.spacing(1.5),
				},
				'&:active': {
					backgroundColor: alpha(theme.palette.primary.main, theme.palette.action.selectedOpacity),
				},
			},
		},
	}));

	if (device == 'mobile') {
		if (isHome) {
			return (
				<Stack className="top home-mobile-top">
					<div className="home-mobile-top__bar">
						<Link href="/" aria-label="quickMeds home"><BrandLogo /></Link>
						<Link href="/account/join" className="home-mobile-top__account" aria-label="Login or register">
							<AccountCircleOutlinedIcon />
						</Link>
					</div>
					<nav className="home-mobile-top__nav" aria-label="Primary navigation">
						<Link href="/" aria-current="page">{t('Home')}</Link>
						<Link href="/pharmacies">{t('Pharmacies')}</Link>
						<Link href="/agent">{t('Pharmacy Owners')}</Link>
						<Link href="/community?articleCategory=FREE">{t('Community')}</Link>
						<Link href="/cs">{t('CS')}</Link>
					</nav>
				</Stack>
			);
		}

		return (
			<Stack className={'top'}>
				<Link href={'/'}>
					<div>{t('Home')}</div>
				</Link>
				<Link href={'/pharmacies'}>
					<div>{t('Pharmacies')}</div>
				</Link>
				<Link href={'/agent'}>
					<div> {t('Pharmacy Owners')} </div>
				</Link>
				<Link href={'/community?articleCategory=FREE'}>
					<div> {t('Community')} </div>
				</Link>
				<Link href={'/cs'}>
					<div> {t('CS')} </div>
				</Link>
			</Stack>
		);
	} else {
		return (
			<Stack className={'navbar'}>
				<motion.div
					className={`navbar-main ${colorChange ? 'transparent' : ''} ${bgColor ? 'transparent' : ''} ${
						isHome ? 'home-clinical-navbar' : ''
					}`}
					initial={false}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.35, ease: 'easeOut' }}
				>
					<Stack className={'container'}>
						<Box component={'div'} className={'logo-box'}>
							<Link href={'/'}>
								<BrandLogo variant={isHome ? 'dark' : 'light'} />
							</Link>
						</Box>
						<Box component={'nav'} className={'router-box'} aria-label="Primary navigation">
							<Link href={'/'} aria-current={isActiveRoute('/') ? 'page' : undefined}>
								<div>{t('Home')}</div>
							</Link>
							<Link href={'/pharmacies'} aria-current={isActiveRoute('/pharmacies') ? 'page' : undefined}>
								<div>{t('Pharmacies')}</div>
							</Link>
							<Link href={'/agent'} aria-current={isActiveRoute('/agent') ? 'page' : undefined}>
								<div> {t('Pharmacy Owners')} </div>
							</Link>
							<Link href={'/community?articleCategory=FREE'} aria-current={isActiveRoute('/community') ? 'page' : undefined}>
								<div> {t('Community')} </div>
							</Link>
							{user?._id && (
								<Link href={'/mypage'} aria-current={isActiveRoute('/mypage') ? 'page' : undefined}>
									<div> {t('My Page')} </div>
							</Link>
							)}
							<Link href={'/cs'} aria-current={isActiveRoute('/cs') ? 'page' : undefined}>
								<div> {t('CS')} </div>
							</Link>
						</Box>
						<Box component={'div'} className={'user-box'}>
							{user?._id ? (
								<>
									<div className={'login-user'} onClick={(event: any) => setLogoutAnchor(event.currentTarget)}>
										<img
											src={
												user?.memberImage ? `${REACT_APP_API_URL}/${user?.memberImage}` : '/img/profile/defaultUser.svg'
											}
											alt=""
										/>
									</div>

									<Menu
										id="basic-menu"
										anchorEl={logoutAnchor}
										open={logoutOpen}
										onClose={() => {
											setLogoutAnchor(null);
										}}
										sx={{ mt: '5px' }}
									>
										<MenuItem onClick={() => logOut()}>
											<Logout fontSize="small" style={{ color: 'blue', marginRight: '10px' }} />
											Logout
										</MenuItem>
									</Menu>
								</>
							) : (
								isHome ? (
									<div className="home-auth-actions">
										<Link href="/account/join" className="home-auth-actions__login">{t('Login')}</Link>
										<Link href="/account/join?mode=signup" className="home-auth-actions__register">{t('Register')}</Link>
									</div>
								) : (
									<Link href={'/account/join'}>
										<div className={'join-box'}>
											<AccountCircleOutlinedIcon />
											<span>
												{t('Login')} / {t('Register')}
											</span>
										</div>
									</Link>
								)
							)}

							<div className={'lan-box'}>
								{user?._id && <NotificationsOutlinedIcon className={'notification-icon'} aria-label="Notifications" />}
								<Button
									disableRipple
									className="btn-lang"
									onClick={langClick}
									endIcon={<CaretDown size={14} color="#616161" weight="fill" />}
								>
									<Box component={'div'} className={'flag'}>
										{lang !== null ? (
											<img src={`/img/flag/lang${lang}.png`} alt={'usaFlag'} />
										) : (
											<img src={`/img/flag/langen.png`} alt={'usaFlag'} />
										)}
									</Box>
								</Button>

								<StyledMenu anchorEl={anchorEl2} open={drop} onClose={langClose} sx={{ position: 'absolute' }}>
									<MenuItem disableRipple onClick={langChoice} id="en">
										<img
											className="img-flag"
											src={'/img/flag/langen.png'}
											onClick={langChoice}
											id="en"
											alt={'usaFlag'}
										/>
										{t('English')}
									</MenuItem>
									<MenuItem disableRipple onClick={langChoice} id="kr">
										<img
											className="img-flag"
											src={'/img/flag/langkr.png'}
											onClick={langChoice}
											id="uz"
											alt={'koreanFlag'}
										/>
										{t('Korean')}
									</MenuItem>
									<MenuItem disableRipple onClick={langChoice} id="ru">
										<img
											className="img-flag"
											src={'/img/flag/langru.png'}
											onClick={langChoice}
											id="ru"
											alt={'russiaFlag'}
										/>
										{t('Russian')}
									</MenuItem>
								</StyledMenu>
							</div>
						</Box>
					</Stack>
				</motion.div>
			</Stack>
		);
	}
};

export default withRouter(Top);
