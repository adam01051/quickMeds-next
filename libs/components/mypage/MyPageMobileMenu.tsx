import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useReactiveVar } from '@apollo/client';
import { useTranslation } from 'next-i18next';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import MenuOpenRoundedIcon from '@mui/icons-material/MenuOpenRounded';
import { AnimatePresence, motion } from 'framer-motion';
import { userVar } from '../../../apollo/store';
import { logOut } from '../../auth';
import { sweetConfirmAlert } from '../../sweetAlert';
import { MenuItem, menuGroups, normalizeCategory } from './MyPageMenuConfig';

interface MyPageMobileMenuProps {
	triggerClassName?: string;
}

const MyPageMobileMenu = ({ triggerClassName = 'my-page-menu__mobile-trigger' }: MyPageMobileMenuProps) => {
	const router = useRouter();
	const { t } = useTranslation('common');
	const user = useReactiveVar(userVar);
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const [mounted, setMounted] = useState(false);
	const category = normalizeCategory(router.query.category);
	const isPharmacyOwner = user.memberType === 'AGENT';

	useEffect(() => {
		setMounted(true);
	}, []);

	useEffect(() => {
		setMobileMenuOpen(false);
	}, [router.asPath]);

	useEffect(() => {
		if (!mobileMenuOpen) return;
		const originalOverflow = document.body.style.overflow;
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') setMobileMenuOpen(false);
		};
		document.body.style.overflow = 'hidden';
		window.addEventListener('keydown', handleKeyDown);
		return () => {
			document.body.style.overflow = originalOverflow;
			window.removeEventListener('keydown', handleKeyDown);
		};
	}, [mobileMenuOpen]);

	const logoutHandler = async () => {
		if (await sweetConfirmAlert(t('mypage.common.logoutConfirm'))) logOut();
	};

	const canShowItem = (item: MenuItem) =>
		(!item.ownerOnly || isPharmacyOwner) && (!item.nonOwnerOnly || !isPharmacyOwner);
	const visibleItems = menuGroups.flatMap((group) => group.items).filter(canShowItem);
	const activeItem = visibleItems.find((item) => item.category === category);

	const renderMenuGroups = () => (
		<>
			{menuGroups.map((group) => {
				const items = group.items.filter(canShowItem);
				if (items.length === 0) return null;

				return (
					<div className="my-page-menu__group" key={`mobile-${group.labelKey}`}>
						<p>{t(group.labelKey)}</p>
						<ul>
							{items.map((item) => {
								const isActive = category === item.category;
								return (
									<li key={item.category ?? item.href}>
										{item.href ? (
											<Link href={item.href} onClick={() => setMobileMenuOpen(false)}>
												{item.icon}
												<span>{t(item.labelKey)}</span>
												<ArrowForwardRoundedIcon className="my-page-menu__external" aria-hidden="true" />
											</Link>
										) : item.category ? (
											<Link
												href={{ pathname: '/mypage', query: { category: item.category } }}
												scroll={false}
												className={isActive ? 'active' : ''}
												aria-current={isActive ? 'page' : undefined}
												onClick={() => setMobileMenuOpen(false)}
											>
												<CheckRoundedIcon className="my-page-menu__check" aria-hidden={isActive ? 'false' : 'true'} />
												{item.icon}
												<span>{t(item.labelKey)}</span>
											</Link>
										) : null}
									</li>
								);
							})}
						</ul>
					</div>
				);
			})}
		</>
	);

	const mobileSheet = (
		<AnimatePresence>
			{mobileMenuOpen && (
				<motion.div
					className="my-page-menu__mobile-backdrop"
					role="presentation"
					onPointerDown={(event: React.PointerEvent<HTMLDivElement>) => {
						if (event.target === event.currentTarget) setMobileMenuOpen(false);
					}}
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
				>
					<motion.div
						className="my-page-menu__mobile-sheet"
						role="dialog"
						aria-modal="true"
						aria-label={t('mypage.menu.sections')}
						onPointerDown={(event: React.PointerEvent<HTMLDivElement>) => event.stopPropagation()}
						initial={{ opacity: 0, x: -24, scale: 0.98 }}
						animate={{ opacity: 1, x: 0, scale: 1 }}
						exit={{ opacity: 0, x: -24, scale: 0.98 }}
						transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
					>
						<div className="my-page-menu__mobile-head">
							<strong>{t('nav.myPage')}</strong>
							<button type="button" aria-label={t('mypage.menu.closeMenu')} onClick={() => setMobileMenuOpen(false)}>
								<CloseRoundedIcon />
							</button>
						</div>
						<nav aria-label={t('mypage.menu.mobileNavigation')}>
							{renderMenuGroups()}
							{user.memberType === 'ADMIN' && (
								<a className="my-page-menu__admin" href="/_admin/users" target="_blank" rel="noreferrer">
									<AdminPanelSettingsOutlinedIcon />
									<span>{t('mypage.menu.openAdmin')}</span>
								</a>
							)}
							<button className="my-page-menu__logout" type="button" onClick={logoutHandler}>
								<LogoutOutlinedIcon />
								<span>{t('mypage.common.logout')}</span>
							</button>
						</nav>
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>
	);

	return (
		<>
			<button
				type="button"
				className={triggerClassName}
				aria-haspopup="dialog"
				aria-expanded={mobileMenuOpen}
				onClick={() => setMobileMenuOpen(true)}
			>
				<MenuOpenRoundedIcon aria-hidden="true" />
				<span>{t(activeItem?.labelKey ?? 'mypage.categories.myProfile.title')}</span>
			</button>
			{mounted ? createPortal(mobileSheet, document.body) : null}
		</>
	);
};

export default MyPageMobileMenu;
