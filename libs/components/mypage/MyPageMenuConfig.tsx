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
	labelKey: string;
	icon: React.ReactNode;
	ownerOnly?: boolean;
	nonOwnerOnly?: boolean;
}

export const menuGroups: Array<{ labelKey: string; items: MenuItem[] }> = [
	{
		labelKey: 'mypage.menu.account',
		items: [
			{ category: 'myProfile', labelKey: 'mypage.categories.myProfile.title', icon: <AccountCircleOutlinedIcon /> },
			{ category: 'myFavorites', labelKey: 'mypage.categories.myFavorites.title', icon: <FavoriteBorderOutlinedIcon /> },
			{ category: 'recentlyVisited', labelKey: 'mypage.categories.recentlyVisited.title', icon: <HistoryOutlinedIcon /> },
		],
	},
	{
		labelKey: 'mypage.menu.connections',
		items: [
			{ category: 'followers', labelKey: 'mypage.categories.followers.title', icon: <GroupOutlinedIcon /> },
			{ category: 'followings', labelKey: 'mypage.categories.followings.title', icon: <PersonAddAltOutlinedIcon /> },
			{ category: 'messages', labelKey: 'mypage.categories.messages.title', icon: <MailOutlineRoundedIcon /> },
		],
	},
	{
		labelKey: 'mypage.menu.community',
		items: [
			{ category: 'myArticles', labelKey: 'mypage.categories.myArticles.title', icon: <ArticleOutlinedIcon /> },
			{ category: 'writeArticle', labelKey: 'mypage.categories.writeArticle.title', icon: <EditNoteOutlinedIcon /> },
		],
	},
	{
		labelKey: 'mypage.menu.pharmacyOwners',
		items: [
			{
				href: '/account/join?mode=signup',
				labelKey: 'mypage.menu.becomeOwner',
				icon: <AddBusinessOutlinedIcon />,
				nonOwnerOnly: true,
			},
			{ category: 'myPharmacies', labelKey: 'mypage.categories.myPharmacies.title', icon: <StorefrontOutlinedIcon />, ownerOnly: true },
			{ category: 'addPharmacy', labelKey: 'mypage.categories.addPharmacy.title', icon: <AddBusinessOutlinedIcon />, ownerOnly: true },
			{ href: '/agent', labelKey: 'mypage.menu.exploreOwners', icon: <TravelExploreOutlinedIcon /> },
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
