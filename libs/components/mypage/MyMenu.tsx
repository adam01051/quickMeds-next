import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useReactiveVar } from '@apollo/client';
import { useTranslation } from 'next-i18next';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { userVar } from '../../../apollo/store';
import { REACT_APP_API_URL } from '../../config';
import { logOut } from '../../auth';
import { sweetConfirmAlert } from '../../sweetAlert';
import MyPageMobileMenu from './MyPageMobileMenu';
import { MenuItem, menuGroups, normalizeCategory } from './MyPageMenuConfig';

const MyMenu = () => {
	const router = useRouter();
	const { t } = useTranslation('common');
	const user = useReactiveVar(userVar);
	const category = normalizeCategory(router.query.category);
	const isPharmacyOwner = user.memberType === 'AGENT';

	const logoutHandler = async () => {
		if (await sweetConfirmAlert(t('mypage.common.logoutConfirm'))) logOut();
	};

	const canShowItem = (item: MenuItem) =>
		(!item.ownerOnly || isPharmacyOwner) && (!item.nonOwnerOnly || !isPharmacyOwner);
	const renderMenuGroups = () => (
		<>
			{menuGroups.map((group) => {
				const items = group.items.filter(canShowItem);
				if (items.length === 0) return null;

				return (
					<div className="my-page-menu__group" key={`desktop-${group.labelKey}`}>
						<p>{t(group.labelKey)}</p>
						<ul>
							{items.map((item) => {
								const isActive = category === item.category;
								return (
									<li key={item.category ?? item.href}>
										{item.href ? (
											<Link href={item.href}>
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
											>
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

	return (
		<aside className="my-page-menu" aria-label="My Page navigation">
			<div className="my-page-menu__identity">
				<img
					src={user?.memberImage ? `${REACT_APP_API_URL}/${user.memberImage}` : '/img/profile/defaultUser.svg'}
					alt={`${user?.memberNick || 'Member'} profile`}
				/>
				<div>
					<strong>{user?.memberNick || t('mypage.menu.defaultMember')}</strong>
					<span>{isPharmacyOwner ? t('mypage.menu.ownerRole') : t('mypage.menu.memberRole')}</span>
				</div>
				<MyPageMobileMenu />
			</div>

			<nav className="my-page-menu__nav">
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
		</aside>
	);
};

export default MyMenu;
