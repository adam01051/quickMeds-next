import React, { useCallback, useEffect } from 'react';
import { useState } from 'react';
import { useRouter, withRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { getJwtToken, logOut, updateUserInfo } from '../auth';
import { Badge, Stack, Box } from '@mui/material';
import MenuItem from '@mui/material/MenuItem';
import { alpha, styled } from '@mui/material/styles';
import Menu, { MenuProps } from '@mui/material/Menu';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import SupportAgentOutlinedIcon from '@mui/icons-material/SupportAgentOutlined';
import { CaretDown } from 'phosphor-react';
import useDeviceDetect from '../hooks/useDeviceDetect';
import Link from 'next/link';
import MailOutlineRoundedIcon from '@mui/icons-material/MailOutlineRounded';
import { useQuery, useReactiveVar } from '@apollo/client';
import { socketVar, userVar } from '../../apollo/store';
import { Logout } from '@mui/icons-material';
import { REACT_APP_API_URL } from '../config';
import BrandLogo from './common/BrandLogo';
import { AnimatePresence, motion } from 'framer-motion';
import { GET_UNREAD_MESSAGE_COUNT } from '../../apollo/user/query';

const LANGUAGE_OPTIONS = [
	{ locale: 'en', labelKey: 'English', flagSrc: '/img/flag/langen.png' },
	{ locale: 'kr', labelKey: 'Korean', flagSrc: '/img/flag/langkr.png' },
	{ locale: 'ru', labelKey: 'Russian', flagSrc: '/img/flag/langru.png' },
	{ locale: 'uz', labelKey: 'Uzbek', flagSrc: '/img/flag/languz.svg' },
];

const resolveLocale = (value?: string | null) =>
	LANGUAGE_OPTIONS.some((option) => option.locale === value) ? value! : 'en';

const Top = () => {
	const device = useDeviceDetect();
	const user = useReactiveVar(userVar);
	const socket = useReactiveVar(socketVar);
	const { t } = useTranslation('common');
	const router = useRouter();
	const [unreadMessages, setUnreadMessages] = useState(0);
	const [anchorEl2, setAnchorEl2] = useState<null | HTMLElement>(null);
	const [lang, setLang] = useState<string | null>('en');
	const drop = Boolean(anchorEl2);
	const [colorChange, setColorChange] = useState(false);
	const [logoutAnchor, setLogoutAnchor] = React.useState<null | HTMLElement>(null);
	const logoutOpen = Boolean(logoutAnchor);
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const isHome = router.pathname === '/';
	const isActiveRoute = (pathname: string) =>
		pathname === '/' ? router.pathname === pathname : router.pathname === pathname || router.pathname.startsWith(`${pathname}/`);
	const mobileNavLinks = [
		{ href: '/', label: t('nav.home'), icon: <HomeRoundedIcon /> },
		{ href: '/pharmacies', label: t('nav.pharmacies'), icon: <SearchRoundedIcon /> },
		{ href: '/community?articleCategory=FREE', label: t('nav.community'), icon: <ForumOutlinedIcon /> },
		...(user?._id
			? [{ href: '/mypage', label: t('nav.myPage'), icon: <AccountCircleOutlinedIcon /> }]
			: [
					{ href: '/account/join', label: t('nav.login'), icon: <AccountCircleOutlinedIcon /> },
					{ href: '/account/join?mode=signup', label: t('nav.register'), icon: <AccountCircleOutlinedIcon /> },
			  ]),
		{ href: '/cs', label: t('nav.cs'), icon: <SupportAgentOutlinedIcon /> },
	];

	useQuery(GET_UNREAD_MESSAGE_COUNT, {
		skip: !user?._id,
		fetchPolicy: 'network-only',
		onCompleted: (data) => setUnreadMessages(data?.getUnreadMessageCount ?? 0),
	});

	/** LIFECYCLES **/
	useEffect(() => {
		const nextLocale = resolveLocale(router.locale || localStorage.getItem('locale'));
		localStorage.setItem('locale', nextLocale);
		setLang(nextLocale);
	}, [router.locale]);

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

	useEffect(() => {
		if (!socket || !user?._id) return;

		const handleMessageEvent = (event: MessageEvent) => {
			try {
				const data = JSON.parse(event.data);
				if (data.event === 'message:unreadCount') setUnreadMessages(data.count ?? 0);
			} catch {
				// Ignore unrelated socket payloads.
			}
		};

		socket.addEventListener('message', handleMessageEvent);
		return () => socket.removeEventListener('message', handleMessageEvent);
	}, [socket, user?._id]);

	useEffect(() => {
		setMobileMenuOpen(false);
	}, [router.asPath]);

	useEffect(() => {
		if (!mobileMenuOpen) return;
		const originalOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		return () => {
			document.body.style.overflow = originalOverflow;
		};
	}, [mobileMenuOpen]);

	/** HANDLERS **/
	const langClick = (e: any) => {
		setAnchorEl2(e.currentTarget);
	};

	const langClose = () => {
		setAnchorEl2(null);
	};

	const langChoice = useCallback(
		async (e: any) => {
			const nextLang = resolveLocale(e.currentTarget.dataset.locale || e.currentTarget.id || e.target.id);
			setLang(nextLang);
			localStorage.setItem('locale', nextLang);
			setAnchorEl2(null);
			await router.push(router.asPath, router.asPath, { locale: nextLang });
		},
		[router],
	);

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
			top: '64px',
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

	const activeLanguage = LANGUAGE_OPTIONS.find((option) => option.locale === lang) ?? LANGUAGE_OPTIONS[0];

	if (device == 'mobile') {
		return (
			<Stack className="top catalog-mobile-top">
				<div className="catalog-mobile-top__bar">
					<Link href="/" aria-label={t('nav.homeAria')}><BrandLogo /></Link>
					<div className="catalog-mobile-top__actions">
						<button
							type="button"
							className="catalog-mobile-top__menu"
							aria-label={t('nav.openMenu')}
							aria-expanded={mobileMenuOpen}
							onClick={() => setMobileMenuOpen(true)}
						>
							<MenuRoundedIcon />
						</button>
						{user?._id ? (
							<>
								<Link href="/mypage?category=messages" className="catalog-mobile-top__icon" aria-label={t('nav.messages')}>
									<Badge badgeContent={unreadMessages} color="error" max={99} overlap="circular">
										<MailOutlineRoundedIcon />
									</Badge>
								</Link>
								<button
									type="button"
									className="catalog-mobile-top__avatar"
									aria-label={t('nav.accountMenu')}
									aria-haspopup="menu"
									aria-expanded={logoutOpen}
									onClick={(event) => setLogoutAnchor(event.currentTarget)}
								>
									<img src={user?.memberImage ? `${REACT_APP_API_URL}/${user.memberImage}` : '/img/profile/defaultUser.svg'} alt="" />
								</button>
								<Menu
									anchorEl={logoutAnchor}
									open={logoutOpen}
									onClose={() => setLogoutAnchor(null)}
									sx={{ mt: '5px' }}
								>
									<MenuItem onClick={() => logOut()}>
										<Logout fontSize="small" style={{ color: '#064e3b', marginRight: '10px' }} />
										{t('mypage.common.logout')}
									</MenuItem>
								</Menu>
							</>
						) : (
							<Link href="/account/join" className="catalog-mobile-top__login" aria-label={t('nav.loginOrCreate')}>
								<AccountCircleOutlinedIcon />
							</Link>
						)}
					</div>
				</div>
				<AnimatePresence>
					{mobileMenuOpen && (
						<motion.div
							className="catalog-mobile-nav-backdrop"
							role="presentation"
							onPointerDown={(event: React.PointerEvent<HTMLDivElement>) => {
								if (event.target === event.currentTarget) setMobileMenuOpen(false);
							}}
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
						>
							<motion.nav
								className="catalog-mobile-nav-sheet"
								aria-label={t('nav.mobileNavigation')}
								onPointerDown={(event: React.PointerEvent<HTMLElement>) => event.stopPropagation()}
								initial={{ opacity: 0, y: -10, scale: 0.98 }}
								animate={{ opacity: 1, y: 0, scale: 1 }}
								exit={{ opacity: 0, y: -8, scale: 0.98 }}
								transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
							>
								<div className="catalog-mobile-nav-sheet__head">
									<span>{t('nav.navigateQuickMeds')}</span>
									<button type="button" aria-label={t('nav.closeMenu')} onClick={() => setMobileMenuOpen(false)}>
										<CloseRoundedIcon />
									</button>
								</div>
								<div className="catalog-mobile-nav-sheet__links">
									{mobileNavLinks.map((item) => (
										<Link
											key={item.href}
											href={item.href}
											aria-current={isActiveRoute(item.href.split('?')[0]) ? 'page' : undefined}
										>
											{item.icon}
											<span>{item.label}</span>
										</Link>
									))}
								</div>
								<div className="catalog-mobile-nav-sheet__language" aria-label={t('nav.language')}>
									{LANGUAGE_OPTIONS.map((option) => (
										<button
											type="button"
											key={option.locale}
											data-locale={option.locale}
											className={lang === option.locale ? 'is-active' : ''}
											onClick={langChoice}
										>
											<img src={option.flagSrc} alt="" />
											{t(option.labelKey)}
										</button>
									))}
								</div>
							</motion.nav>
						</motion.div>
					)}
				</AnimatePresence>
			</Stack>
		);
	} else {
		return (
			<Stack className={'navbar'}>
				<motion.div
					className={`navbar-main public-clinical-navbar ${colorChange ? 'transparent' : ''} ${
						isHome ? 'home-clinical-navbar' : ''
					}`}
					initial={false}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.35, ease: 'easeOut' }}
				>
					<Stack className={'container'}>
						<Box component={'div'} className={'logo-box'}>
							<Link href={'/'}>
								<BrandLogo variant="dark" />
							</Link>
						</Box>
						<Box component={'nav'} className={'router-box'} aria-label={t('nav.primaryNavigation')}>
							<Link href={'/'} aria-current={isActiveRoute('/') ? 'page' : undefined}>
								<div>{t('nav.home')}</div>
							</Link>
							<Link href={'/pharmacies'} aria-current={isActiveRoute('/pharmacies') ? 'page' : undefined}>
								<div>{t('nav.pharmacies')}</div>
							</Link>
							<Link href={'/community?articleCategory=FREE'} aria-current={isActiveRoute('/community') ? 'page' : undefined}>
								<div> {t('nav.community')} </div>
							</Link>
							{user?._id && (
								<Link href={'/mypage'} aria-current={isActiveRoute('/mypage') ? 'page' : undefined}>
									<div> {t('nav.myPage')} </div>
							</Link>
							)}
							<Link href={'/cs'} aria-current={isActiveRoute('/cs') ? 'page' : undefined}>
								<div> {t('nav.cs')} </div>
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
											{t('mypage.common.logout')}
										</MenuItem>
									</Menu>
								</>
							) : (
								<div className="public-auth-actions">
									<Link href="/account/join" className="public-auth-actions__login">{t('nav.login')}</Link>
									<Link href="/account/join?mode=signup" className="public-auth-actions__register">{t('nav.register')}</Link>
								</div>
							)}

							<div className={'lan-box'}>
								{user?._id && (
									<Link href="/mypage?category=messages" className="message-icon-link" aria-label={t('nav.messages')}>
										<Badge badgeContent={unreadMessages} color="error" max={99} overlap="circular">
											<MailOutlineRoundedIcon className="message-icon" />
										</Badge>
									</Link>
								)}
<<<<<<< HEAD
								{user?._id && <NotificationsOutlinedIcon className={'notification-icon'} aria-label={t('nav.notifications')} />}
=======
>>>>>>> master
								<button
									type="button"
									className="btn-lang"
									onClick={langClick}
									aria-label={t('nav.language')}
								>
									<Box component={'div'} className={'flag'}>
										<img src={activeLanguage.flagSrc} alt={t(activeLanguage.labelKey)} />
									</Box>
									<CaretDown size={14} color="#616161" weight="fill" aria-hidden="true" />
								</button>

								<StyledMenu anchorEl={anchorEl2} open={drop} onClose={langClose} sx={{ position: 'absolute' }}>
									{LANGUAGE_OPTIONS.map((option) => (
										<MenuItem disableRipple onClick={langChoice} data-locale={option.locale} key={option.locale}>
											<img className="img-flag" src={option.flagSrc} alt={t(option.labelKey)} />
											{t(option.labelKey)}
										</MenuItem>
									))}
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
