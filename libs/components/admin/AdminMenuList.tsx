import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { List, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import Collapse from '@mui/material/Collapse';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { ChatsCircle, Gauge, Headset, User, UserCircleGear } from 'phosphor-react';

interface AdminMenuListProps {
	onNavigate?: () => void;
}

const AdminMenuList = ({ onNavigate }: AdminMenuListProps) => {
	const router = useRouter();
	const [expanded, setExpanded] = useState<string | null>(null);

	/** HANDLERS **/
	const subMenuChangeHandler = (target: string) => {
		setExpanded(expanded === target ? null : target);
	};

	const menu_set = [
		{
			title: 'Overview',
			icon: <Gauge size={20} />,
			url: '/_admin',
		},
		{
			title: 'Users',
			icon: <User size={20} />,
			url: '/_admin/users',
		},
		{
			title: 'Pharmacies',
			icon: <UserCircleGear size={20} />,
			url: '/_admin/properties',
		},
		{
			title: 'Community',
			icon: <ChatsCircle size={20} />,
			url: '/_admin/community',
		},
		{
			title: 'Support',
			icon: <Headset size={20} />,
			children: [
				{ title: 'FAQ', url: '/_admin/cs/faq' },
				{ title: 'Notices', url: '/_admin/cs/notice' },
				{ title: 'Inquiries', url: '/_admin/cs/inquiry' },
			],
		},
	];

	const isRouteActive = (url: string) => (url === '/_admin' ? router.pathname === url : router.pathname.startsWith(url));

	return (
		<nav className="admin-nav" aria-label="Admin navigation">
			<span className="admin-nav__label">OPERATIONS</span>
			{menu_set.map((item, index) => (
				<List className="admin-nav__group" key={item.title} disablePadding>
					{item.url ? (
						<Link href={item.url} onClick={onNavigate}>
							<ListItemButton className={isRouteActive(item.url) ? 'admin-nav__item is-active' : 'admin-nav__item'}>
								<ListItemIcon>{item.icon}</ListItemIcon>
								<ListItemText primary={item.title} />
							</ListItemButton>
						</Link>
					) : (
						<>
							<ListItemButton
								onClick={() => subMenuChangeHandler(item.title)}
								className={router.pathname.startsWith('/_admin/cs') ? 'admin-nav__item is-active' : 'admin-nav__item'}
								aria-expanded={expanded === item.title}
							>
								<ListItemIcon>{item.icon}</ListItemIcon>
								<ListItemText primary={item.title} secondary="Coming soon" />
								{expanded === item.title ? <ExpandLess /> : <ExpandMore />}
							</ListItemButton>
							<Collapse in={expanded === item.title} timeout="auto" unmountOnExit>
								<List className="admin-nav__sublist" disablePadding>
									{item.children?.map((sub) => (
										<Link href={sub.url} onClick={onNavigate} key={sub.url}>
											<ListItemButton className={isRouteActive(sub.url) ? 'admin-nav__subitem is-active' : 'admin-nav__subitem'}>
												<ListItemText primary={sub.title} />
											</ListItemButton>
										</Link>
									))}
								</List>
							</Collapse>
						</>
					)}
				</List>
			))}
		</nav>
	);
};

export default AdminMenuList;
