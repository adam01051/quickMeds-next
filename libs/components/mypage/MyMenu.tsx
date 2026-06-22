import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useReactiveVar } from '@apollo/client';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import EditNoteOutlinedIcon from '@mui/icons-material/EditNoteOutlined';
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import MailOutlineRoundedIcon from '@mui/icons-material/MailOutlineRounded';
import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import AddBusinessOutlinedIcon from '@mui/icons-material/AddBusinessOutlined';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import TravelExploreOutlinedIcon from '@mui/icons-material/TravelExploreOutlined';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import MenuOpenRoundedIcon from '@mui/icons-material/MenuOpenRounded';
import { AnimatePresence, motion } from 'framer-motion';
import { userVar } from '../../../apollo/store';
import { REACT_APP_API_URL } from '../../config';
import { logOut } from '../../auth';
import { sweetConfirmAlert } from '../../sweetAlert';

type MenuCategory =
	| 'myProfile'
	| 'myFavorites'
	| 'recentlyVisited'
	| 'followers'
	| 'followings'
	| 'messages'
	| 'myArticles'
	| 'writeArticle'
	| 'addPharmacy'
	| 'myPharmacies';

interface MenuItem {
	category?: MenuCategory;
	href?: string;
	label: string;
	icon: React.ReactNode;
	ownerOnly?: boolean;
	nonOwnerOnly?: boolean;
}

const menuGroups: Array<{ label: string; items: MenuItem[] }> = [
	{
		label: 'Account',
		items: [
			{ category: 'myProfile', label: 'My Profile', icon: <AccountCircleOutlinedIcon /> },
			{ category: 'myFavorites', label: 'My Favorites', icon: <FavoriteBorderOutlinedIcon /> },
			{ category: 'recentlyVisited', label: 'Recently Visited', icon: <HistoryOutlinedIcon /> },
		],
	},
	{
		label: 'Connections',
		items: [
			{ category: 'followers', label: 'Followers', icon: <GroupOutlinedIcon /> },
			{ category: 'followings', label: 'Followings', icon: <PersonAddAltOutlinedIcon /> },
			{ category: 'messages', label: 'Messages', icon: <MailOutlineRoundedIcon /> },
		],
	},
	{
		label: 'Community',
		items: [
			{ category: 'myArticles', label: 'My Articles', icon: <ArticleOutlinedIcon /> },
			{ category: 'writeArticle', label: 'Write Article', icon: <EditNoteOutlinedIcon /> },
		],
	},
	{
		label: 'For Pharmacy Owners',
		items: [
			{
				href: '/account/join?mode=signup',
				label: 'Become a Pharmacy Owner',
				icon: <AddBusinessOutlinedIcon />,
				nonOwnerOnly: true,
			},
			{ category: 'myPharmacies', label: 'My Pharmacies', icon: <StorefrontOutlinedIcon />, ownerOnly: true },
			{ category: 'addPharmacy', label: 'Add Pharmacy', icon: <AddBusinessOutlinedIcon />, ownerOnly: true },
			{ href: '/agent', label: 'Explore Pharmacy Owners', icon: <TravelExploreOutlinedIcon /> },
		],
	},
];

const normalizeCategory = (value: string | string[] | undefined): MenuCategory => {
	const category = Array.isArray(value) ? value[0] : value;

	if (category === 'addProperty') return 'addPharmacy';
	if (category === 'myProperties') return 'myPharmacies';

	const validCategory = menuGroups.flatMap((group) => group.items).find((item) => item.category === category);
	return validCategory?.category ?? 'myProfile';
};

const MyMenu = () => {
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const category = normalizeCategory(router.query.category);
	const isPharmacyOwner = user.memberType === 'AGENT';

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
		if (await sweetConfirmAlert('Do you want to logout?')) logOut();
	};

	const canShowItem = (item: MenuItem) =>
		(!item.ownerOnly || isPharmacyOwner) && (!item.nonOwnerOnly || !isPharmacyOwner);
	const visibleItems = menuGroups.flatMap((group) => group.items).filter(canShowItem);
	const activeItem = visibleItems.find((item) => item.category === category);

	const renderMenuGroups = (variant: 'desktop' | 'mobile') => (
		<>
			{menuGroups.map((group) => {
				const items = group.items.filter(canShowItem);
				if (items.length === 0) return null;

				return (
					<div className="my-page-menu__group" key={`${variant}-${group.label}`}>
						<p>{group.label}</p>
						<ul>
							{items.map((item) => {
								const isActive = category === item.category;
								return (
									<li key={item.category ?? item.href}>
										{item.href ? (
											<Link href={item.href} onClick={() => setMobileMenuOpen(false)}>
												{item.icon}
												<span>{item.label}</span>
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
												{variant === 'mobile' && (
													<CheckRoundedIcon className="my-page-menu__check" aria-hidden={isActive ? 'false' : 'true'} />
												)}
												{item.icon}
												<span>{item.label}</span>
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

	return (
		<aside className="my-page-menu" aria-label="My Page navigation">
			<div className="my-page-menu__identity">
				<img
					src={user?.memberImage ? `${REACT_APP_API_URL}/${user.memberImage}` : '/img/profile/defaultUser.svg'}
					alt={`${user?.memberNick || 'Member'} profile`}
				/>
				<div>
					<strong>{user?.memberNick || 'QuickMeds member'}</strong>
					<span>{isPharmacyOwner ? 'Pharmacy Owner' : 'My QuickMeds account'}</span>
				</div>
				<button
					type="button"
					className="my-page-menu__mobile-trigger"
					aria-haspopup="dialog"
					aria-expanded={mobileMenuOpen}
					onClick={() => setMobileMenuOpen(true)}
				>
					<MenuOpenRoundedIcon aria-hidden="true" />
					<span>{activeItem?.label ?? 'My Profile'}</span>
				</button>
			</div>

			<nav className="my-page-menu__nav">
				{renderMenuGroups('desktop')}

				{user.memberType === 'ADMIN' && (
					<a className="my-page-menu__admin" href="/_admin/users" target="_blank" rel="noreferrer">
						<AdminPanelSettingsOutlinedIcon />
						<span>Open Admin</span>
					</a>
				)}

				<button className="my-page-menu__logout" type="button" onClick={logoutHandler}>
					<LogoutOutlinedIcon />
					<span>Logout</span>
				</button>
			</nav>

			<AnimatePresence>
				{mobileMenuOpen && (
					<>
						<motion.button
							type="button"
							className="my-page-menu__mobile-backdrop"
							aria-label="Close My Page menu"
							onClick={() => setMobileMenuOpen(false)}
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
						/>
						<motion.div
							className="my-page-menu__mobile-sheet"
							role="dialog"
							aria-modal="true"
							aria-label="My Page sections"
							initial={{ opacity: 0, x: -24, scale: 0.98 }}
							animate={{ opacity: 1, x: 0, scale: 1 }}
							exit={{ opacity: 0, x: -24, scale: 0.98 }}
							transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
						>
							<div className="my-page-menu__mobile-head">
								<strong>My Page</strong>
								<button type="button" aria-label="Close My Page menu" onClick={() => setMobileMenuOpen(false)}>
									<CloseRoundedIcon />
								</button>
							</div>
							<nav aria-label="My Page mobile navigation">
								{renderMenuGroups('mobile')}
								{user.memberType === 'ADMIN' && (
									<a className="my-page-menu__admin" href="/_admin/users" target="_blank" rel="noreferrer">
										<AdminPanelSettingsOutlinedIcon />
										<span>Open Admin</span>
									</a>
								)}
								<button className="my-page-menu__logout" type="button" onClick={logoutHandler}>
									<LogoutOutlinedIcon />
									<span>Logout</span>
								</button>
							</nav>
						</motion.div>
					</>
				)}
			</AnimatePresence>
		</aside>
	);
};

export default MyMenu;
