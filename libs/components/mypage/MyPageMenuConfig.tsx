import React from 'react';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import AddBusinessOutlinedIcon from '@mui/icons-material/AddBusinessOutlined';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import EditNoteOutlinedIcon from '@mui/icons-material/EditNoteOutlined';
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import MailOutlineRoundedIcon from '@mui/icons-material/MailOutlineRounded';
import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import TravelExploreOutlinedIcon from '@mui/icons-material/TravelExploreOutlined';

export type MenuCategory =
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

export interface MenuItem {
	category?: MenuCategory;
	href?: string;
	label: string;
	icon: React.ReactNode;
	ownerOnly?: boolean;
	nonOwnerOnly?: boolean;
}

export const menuGroups: Array<{ label: string; items: MenuItem[] }> = [
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

export const normalizeCategory = (value: string | string[] | undefined): MenuCategory => {
	const category = Array.isArray(value) ? value[0] : value;

	if (category === 'addProperty') return 'addPharmacy';
	if (category === 'myProperties') return 'myPharmacies';

	const validCategory = menuGroups.flatMap((group) => group.items).find((item) => item.category === category);
	return validCategory?.category ?? 'myProfile';
};
