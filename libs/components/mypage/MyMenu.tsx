import React from 'react';
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
import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import AddBusinessOutlinedIcon from '@mui/icons-material/AddBusinessOutlined';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
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
	| 'myArticles'
	| 'writeArticle'
	| 'addPharmacy'
	| 'myPharmacies';

interface MenuItem {
	category: MenuCategory;
	label: string;
	icon: React.ReactNode;
	ownerOnly?: boolean;
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
		label: 'Pharmacy Owner',
		items: [
			{ category: 'myPharmacies', label: 'My Pharmacies', icon: <StorefrontOutlinedIcon />, ownerOnly: true },
			{ category: 'addPharmacy', label: 'Add Pharmacy', icon: <AddBusinessOutlinedIcon />, ownerOnly: true },
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
	const category = normalizeCategory(router.query.category);
	const isPharmacyOwner = user.memberType === 'AGENT';

	const logoutHandler = async () => {
		if (await sweetConfirmAlert('Do you want to logout?')) logOut();
	};

	const visibleItems = menuGroups.flatMap((group) => group.items).filter((item) => !item.ownerOnly || isPharmacyOwner);

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
			</div>

			<label className="my-page-menu__mobile-label" htmlFor="my-page-section">
				My Page section
			</label>
			<select
				id="my-page-section"
				className="my-page-menu__mobile-select"
				value={category}
				onChange={(event) =>
					router.push({ pathname: '/mypage', query: { category: event.target.value } }, undefined, { scroll: false })
				}
			>
				{visibleItems.map((item) => (
					<option key={item.category} value={item.category}>
						{item.label}
					</option>
				))}
			</select>

			<nav className="my-page-menu__nav">
				{menuGroups.map((group) => {
					const items = group.items.filter((item) => !item.ownerOnly || isPharmacyOwner);
					if (items.length === 0) return null;

					return (
						<div className="my-page-menu__group" key={group.label}>
							<p>{group.label}</p>
							<ul>
								{items.map((item) => {
									const isActive = category === item.category;
									return (
										<li key={item.category}>
											<Link
												href={{ pathname: '/mypage', query: { category: item.category } }}
												scroll={false}
												className={isActive ? 'active' : ''}
												aria-current={isActive ? 'page' : undefined}
											>
												{item.icon}
												<span>{item.label}</span>
											</Link>
										</li>
									);
								})}
							</ul>
						</div>
					);
				})}

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
		</aside>
	);
};

export default MyMenu;
