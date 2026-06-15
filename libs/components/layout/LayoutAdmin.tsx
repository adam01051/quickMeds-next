import type { ComponentType } from 'react';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import MenuList from '../admin/AdminMenuList';
import Toolbar from '@mui/material/Toolbar';
import Stack from '@mui/material/Stack';
import { Button, Menu, MenuItem, useMediaQuery } from '@mui/material';
import Drawer from '@mui/material/Drawer';
import AppBar from '@mui/material/AppBar';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import { getJwtToken, logOut, updateUserInfo } from '../../auth';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { REACT_APP_API_URL } from '../../config';
import { MemberType } from '../../enums/member.enum';
import BrandLogo from '../common/BrandLogo';
import { List, SignOut, X } from 'phosphor-react';
const drawerWidth = 280;

const withAdminLayout = (Component: ComponentType) => {
	return (props: object) => {
		const router = useRouter();
		const user = useReactiveVar(userVar);
		const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);
		const [loading, setLoading] = useState(true);
		const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
		const tabletLayout = useMediaQuery('(max-width:1100px)');
		const phoneLayout = useMediaQuery('(max-width:600px)');

		/** LIFECYCLES **/
		useEffect(() => {
			const jwt = getJwtToken();
			if (jwt) updateUserInfo(jwt);
			setLoading(false);
		}, []);

		useEffect(() => {
			if (!loading && user.memberType !== MemberType.ADMIN) {
				router.push('/').then();
			}
		}, [loading, user, router]);

		/** HANDLERS **/
		const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
			setAnchorElUser(event.currentTarget);
		};

		const handleCloseUserMenu = () => {
			setAnchorElUser(null);
		};

		const logoutHandler = () => {
			logOut();
			router.push('/').then();
		};

		const drawerContent: React.ReactNode = (
			<>
				<div className="admin-sidebar__brand">
					<BrandLogo />
					{tabletLayout && (
						<IconButton
							className="admin-sidebar__close"
							onClick={() => setMobileDrawerOpen(false)}
							aria-label="Close admin navigation"
						>
							<X size={20} />
						</IconButton>
					)}
				</div>
				<div className="admin-sidebar__identity">
					<Avatar
						alt={`${user?.memberNick ?? 'Administrator'} profile`}
						src={user?.memberImage ? `${REACT_APP_API_URL}/${user.memberImage}` : '/img/profile/defaultUser.svg'}
					/>
					<div>
						<Typography component="strong">{user?.memberNick ?? 'Administrator'}</Typography>
						<Typography component="span">Platform administrator</Typography>
					</div>
				</div>
				<Divider />
				<MenuList onNavigate={() => setMobileDrawerOpen(false)} />
				<div className="admin-sidebar__footer">
					<Button onClick={logoutHandler} startIcon={<SignOut size={19} />} fullWidth>
						Logout
					</Button>
				</div>
			</>
		);

		if (loading) {
			return (
				<main id="pc-wrap" className="admin admin-session-state">
					<div className="admin-session-state__panel" role="status">
						<span className="admin-session-state__mark" />
						<Typography component="h1">Checking administrator access</Typography>
						<Typography component="p">Preparing your QuickMeds operations workspace.</Typography>
					</div>
				</main>
			);
		}

		if (!user || user.memberType !== MemberType.ADMIN) return null;

		if (phoneLayout) {
			return (
				<main id="pc-wrap" className="admin admin-phone-state">
					<div className="admin-phone-state__top">
						<BrandLogo />
						<Button onClick={logoutHandler} startIcon={<SignOut size={18} />}>
							Logout
						</Button>
					</div>
					<div className="admin-phone-state__panel">
						<Typography component="span">ADMIN WORKSPACE</Typography>
						<Typography component="h1">Use a larger screen to manage QuickMeds</Typography>
						<Typography component="p">
							Administrative tables and moderation actions are designed for tablet and desktop screens.
						</Typography>
						<Button variant="contained" onClick={() => router.push('/')}>
							Return to QuickMeds
						</Button>
					</div>
				</main>
			);
		}

		return (
			<main id="pc-wrap" className="admin">
				<div className="admin-workspace">
					<AppBar position="fixed" className="admin-topbar">
						<Toolbar>
							{tabletLayout && (
								<IconButton
									className="admin-topbar__menu"
									onClick={() => setMobileDrawerOpen(true)}
									aria-label="Open admin navigation"
								>
									<List size={22} />
								</IconButton>
							)}
							<div className="admin-topbar__context">
								<Typography component="span">QuickMeds administration</Typography>
								<Typography component="strong">Operations workspace</Typography>
							</div>
							<Tooltip title="Open administrator menu">
								<IconButton onClick={handleOpenUserMenu} className="admin-topbar__profile" aria-label="Open administrator menu">
									<Avatar
										alt={`${user.memberNick} profile`}
										src={
											user?.memberImage ? `${REACT_APP_API_URL}/${user?.memberImage}` : '/img/profile/defaultUser.svg'
										}
									/>
								</IconButton>
							</Tooltip>
							<Menu
								sx={{ mt: '45px' }}
								id="menu-appbar"
								className={'pop-menu'}
								anchorEl={anchorElUser}
								anchorOrigin={{
									vertical: 'top',
									horizontal: 'right',
								}}
								keepMounted
								transformOrigin={{
									vertical: 'top',
									horizontal: 'right',
								}}
								open={Boolean(anchorElUser)}
								onClose={handleCloseUserMenu}
							>
								<div
									onClick={handleCloseUserMenu}
									className="admin-profile-menu"
								>
									<Stack className="admin-profile-menu__identity">
										<Typography component="strong">
											{user?.memberNick}
										</Typography>
										<Typography component="span">
											{user?.memberPhone}
										</Typography>
									</Stack>
									<Divider />
									<div onClick={logoutHandler}>
										<MenuItem className="admin-profile-menu__logout">
											<SignOut size={18} />
											<Typography component="span">Logout</Typography>
										</MenuItem>
									</div>
								</div>
							</Menu>
						</Toolbar>
					</AppBar>

					<Drawer
						variant={tabletLayout ? 'temporary' : 'permanent'}
						open={tabletLayout ? mobileDrawerOpen : true}
						onClose={() => setMobileDrawerOpen(false)}
						ModalProps={{ keepMounted: true }}
						className="admin-sidebar"
						sx={{ width: drawerWidth, flexShrink: 0, '& .MuiDrawer-paper': { width: drawerWidth } }}
					>
						{drawerContent}
					</Drawer>

					<div id="bunker">
						<Component {...props} />
					</div>
				</div>
			</main>
		);
	};
};

export default withAdminLayout;
