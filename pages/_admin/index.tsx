import React from 'react';
import type { NextPage } from 'next';
import withAdminLayout from '../../libs/components/layout/LayoutAdmin';
import Link from 'next/link';
import { useQuery } from '@apollo/client';
import { Button, Skeleton, Typography } from '@mui/material';
import { ArrowRight, ChatsCircle, FirstAidKit, User, WarningCircle } from 'phosphor-react';
import { GET_ALL_BOARD_ARTICLES_BY_ADMIN, GET_ALL_MEMBERS_BY_ADMIN, GET_ALL_PHARMACIES_BY_ADMIN } from '../../apollo/admin/query';
import { PharmacyStatus } from '../../libs/enums/property.enum';

const AdminHome: NextPage = () => {
	const membersQuery = useQuery(GET_ALL_MEMBERS_BY_ADMIN, {
		variables: { input: { page: 1, limit: 1, sort: 'createdAt', direction: 'DESC', search: {} } },
	});
	const pharmaciesQuery = useQuery(GET_ALL_PHARMACIES_BY_ADMIN, {
		variables: { input: { page: 1, limit: 1, sort: 'createdAt', direction: 'DESC', search: {} } },
	});
	const pendingQuery = useQuery(GET_ALL_PHARMACIES_BY_ADMIN, {
		variables: {
			input: { page: 1, limit: 1, sort: 'createdAt', direction: 'DESC', search: { pharmacyStatus: PharmacyStatus.HOLD } },
		},
	});
	const articlesQuery = useQuery(GET_ALL_BOARD_ARTICLES_BY_ADMIN, {
		variables: { input: { page: 1, limit: 1, sort: 'createdAt', direction: 'DESC', search: {} } },
	});

	const cards = [
		{
			label: 'Total users',
			description: 'Registered QuickMeds accounts',
			value: membersQuery.data?.getAllMembersByAdmin?.metaCounter?.[0]?.total ?? 0,
			loading: membersQuery.loading,
			error: membersQuery.error,
			href: '/_admin/users',
			icon: <User size={22} />,
		},
		{
			label: 'Total pharmacies',
			description: 'All pharmacy records',
			value: pharmaciesQuery.data?.getAllPharmaciesByAdmin?.metaCounter?.[0]?.total ?? 0,
			loading: pharmaciesQuery.loading,
			error: pharmaciesQuery.error,
			href: '/_admin/properties',
			icon: <FirstAidKit size={22} />,
		},
		{
			label: 'Pending review',
			description: 'Pharmacies currently on hold',
			value: pendingQuery.data?.getAllPharmaciesByAdmin?.metaCounter?.[0]?.total ?? 0,
			loading: pendingQuery.loading,
			error: pendingQuery.error,
			href: '/_admin/properties',
			icon: <WarningCircle size={22} />,
		},
		{
			label: 'Community articles',
			description: 'All published and removed articles',
			value: articlesQuery.data?.getAllBoardArticlesByAdmin?.metaCounter?.[0]?.total ?? 0,
			loading: articlesQuery.loading,
			error: articlesQuery.error,
			href: '/_admin/community',
			icon: <ChatsCircle size={22} />,
		},
	];

	return (
		<div className="admin-overview">
			<div className="admin-page-header">
				<Typography component="span">ADMIN OVERVIEW</Typography>
				<Typography component="h1">QuickMeds operations</Typography>
				<Typography component="p">Review the marketplace and open the management area that needs attention.</Typography>
			</div>

			<div className="admin-overview__grid">
				{cards.map((card) => (
					<div className="admin-overview-card" key={card.label}>
						<div className="admin-overview-card__top">
							<span className="admin-overview-card__icon">{card.icon}</span>
							<Typography component="span">{card.label}</Typography>
						</div>
						{card.loading ? (
							<Skeleton variant="text" width={90} height={58} />
						) : card.error ? (
							<div className="admin-overview-card__error" role="alert">
								<Typography component="strong">Unavailable</Typography>
								<Button onClick={() => window.location.reload()}>Retry</Button>
							</div>
						) : (
							<Typography component="strong" className="admin-overview-card__value">
								{card.value.toLocaleString()}
							</Typography>
						)}
						<Typography component="p">{card.description}</Typography>
						<Link href={card.href} className="admin-overview-card__link">
							Open management <ArrowRight size={16} />
						</Link>
					</div>
				))}
			</div>
		</div>
	);
};

export default withAdminLayout(AdminHome);
