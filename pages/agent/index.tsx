import React, { ChangeEvent, KeyboardEvent, useEffect, useMemo, useState } from 'react';
import { NextPage } from 'next';
import { Button, Menu, MenuItem, Pagination } from '@mui/material';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GET_AGENTS } from '../../apollo/user/query';
import { LIKE_TARGET_MEMBER } from '../../apollo/user/mutation';
import { userVar } from '../../apollo/store';
import PharmacyOwnerCard from '../../libs/components/agent/PharmacyOwnerCard';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { Direction, Message } from '../../libs/enums/common.enum';
import { sweetMixinErrorAlert } from '../../libs/sweetAlert';
import { T } from '../../libs/types/common';
import { Member } from '../../libs/types/member/member';
import { AgentsInquiry } from '../../libs/types/member/member.input';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const sortOptions = {
	recent: { label: 'Recent', sort: 'createdAt', direction: Direction.DESC },
	old: { label: 'Oldest', sort: 'createdAt', direction: Direction.ASC },
	likes: { label: 'Most liked', sort: 'memberLikes', direction: Direction.DESC },
	views: { label: 'Most viewed', sort: 'memberViews', direction: Direction.DESC },
} as const;

const parseInput = (value: string | string[] | undefined, fallback: AgentsInquiry): AgentsInquiry => {
	if (!value || Array.isArray(value)) return fallback;
	try {
		const parsed = JSON.parse(value);
		return {
			...fallback,
			...parsed,
			search: { ...fallback.search, ...parsed.search },
		};
	} catch {
		return fallback;
	}
};

const AgentList: NextPage<{ initialInput?: AgentsInquiry }> = ({ initialInput = defaultInput }) => {
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const [searchFilter, setSearchFilter] = useState<AgentsInquiry>(initialInput);
	const [searchText, setSearchText] = useState('');
	const [agents, setAgents] = useState<Member[]>([]);
	const [total, setTotal] = useState(0);
	const [likingId, setLikingId] = useState<string | null>(null);
	const [sortAnchor, setSortAnchor] = useState<null | HTMLElement>(null);
	const activeSort = useMemo(
		() =>
			Object.values(sortOptions).find(
				(option) => option.sort === searchFilter.sort && option.direction === searchFilter.direction,
			) ?? sortOptions.recent,
		[searchFilter.direction, searchFilter.sort],
	);

	const [likeTargetMember] = useMutation(LIKE_TARGET_MEMBER);
	const { loading, error, refetch } = useQuery(GET_AGENTS, {
		fetchPolicy: 'network-only',
		variables: { input: searchFilter },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setAgents(data?.getAgents?.list ?? []);
			setTotal(data?.getAgents?.metaCounter?.[0]?.total ?? 0);
		},
	});

	useEffect(() => {
		if (!router.isReady) return;
		const input = parseInput(router.query.input, initialInput);
		setSearchFilter(input);
		setSearchText(input.search?.text ?? '');
		if (!router.query.input) {
			router.replace({ pathname: '/agent', query: { input: JSON.stringify(input) } }, undefined, { shallow: true });
		}
	}, [router.isReady, router.query.input]);

	const updateDirectory = async (input: AgentsInquiry) => {
		setSearchFilter(input);
		await router.push({ pathname: '/agent', query: { input: JSON.stringify(input) } }, undefined, { shallow: true, scroll: false });
	};

	const submitSearch = async () => {
		await updateDirectory({
			...searchFilter,
			page: 1,
			search: { ...searchFilter.search, text: searchText.trim() || undefined },
		});
	};

	const likeOwner = async (ownerId: string) => {
		try {
			if (!user._id) throw new Error(Message.SOMETHING_WENT_WRONG);
			setLikingId(ownerId);
			await likeTargetMember({ variables: { input: ownerId } });
			await refetch({ input: searchFilter });
		} catch (err: any) {
			await sweetMixinErrorAlert(err.message);
		} finally {
			setLikingId(null);
		}
	};

	return (
		<main className="pharmacy-owner-directory">
			<div className="container">
				<header className="pharmacy-owner-directory__header">
					<div>
						<span>Pharmacy Owner Directory</span>
						<h1>Meet Pharmacy Owners</h1>
						<p>Discover the people and businesses helping communities access pharmacy services across Uzbekistan.</p>
					</div>
					<strong>{total} {total === 1 ? 'owner' : 'owners'}</strong>
				</header>

				<section className="pharmacy-owner-directory__toolbar" aria-label="Pharmacy Owner directory controls">
					<label>
						<span>Search Pharmacy Owners</span>
						<div>
							<SearchRoundedIcon />
							<input
								type="search"
								value={searchText}
								placeholder="Search by owner name"
								onChange={(event) => setSearchText(event.target.value)}
								onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => event.key === 'Enter' && submitSearch()}
							/>
						</div>
					</label>
					<Button className="pharmacy-owner-directory__search" onClick={submitSearch}>Search</Button>
					<div className="pharmacy-owner-directory__sort">
						<span>Sort by</span>
						<Button onClick={(event) => setSortAnchor(event.currentTarget)} endIcon={<KeyboardArrowDownRoundedIcon />}>
							{activeSort.label}
						</Button>
						<Menu anchorEl={sortAnchor} open={Boolean(sortAnchor)} onClose={() => setSortAnchor(null)}>
							{Object.entries(sortOptions).map(([key, option]) => (
								<MenuItem
									key={key}
									onClick={async () => {
										setSortAnchor(null);
										await updateDirectory({ ...searchFilter, page: 1, sort: option.sort, direction: option.direction });
									}}
								>
									{option.label}
								</MenuItem>
							))}
						</Menu>
					</div>
				</section>

				{loading && !agents.length ? (
					<section className="pharmacy-owner-directory__grid" aria-label="Loading Pharmacy Owners">
						{Array.from({ length: 6 }).map((_, index) => <div className="pharmacy-owner-card-skeleton" key={index} />)}
					</section>
				) : error ? (
					<section className="pharmacy-owner-directory__state" role="alert">
						<h2>Pharmacy Owners could not be loaded</h2>
						<p>Please check your connection and try again.</p>
						<button type="button" onClick={() => refetch({ input: searchFilter })}>Try again</button>
					</section>
				) : agents.length ? (
					<section className="pharmacy-owner-directory__grid" aria-label="Pharmacy Owners">
						{agents.map((owner) => (
							<PharmacyOwnerCard key={owner._id} owner={owner} onLike={likeOwner} liking={likingId === owner._id} />
						))}
					</section>
				) : (
					<section className="pharmacy-owner-directory__state">
						<h2>No Pharmacy Owners found</h2>
						<p>Try another owner name or clear your current search.</p>
						<button
							type="button"
							onClick={async () => {
								setSearchText('');
								await updateDirectory({ ...initialInput, search: {} });
							}}
						>
							Clear search
						</button>
					</section>
				)}

				{agents.length > 0 && (
					<footer className="pharmacy-owner-directory__pagination">
						<Pagination
							page={searchFilter.page}
							count={Math.ceil(total / searchFilter.limit)}
							shape="rounded"
							onChange={(_: ChangeEvent<unknown>, page) => updateDirectory({ ...searchFilter, page })}
						/>
						<p>{total} Pharmacy {total === 1 ? 'Owner' : 'Owners'} available</p>
					</footer>
				)}
			</div>
		</main>
	);
};

const defaultInput: AgentsInquiry = {
	page: 1,
	limit: 9,
	sort: 'createdAt',
	direction: Direction.DESC,
	search: {},
};

export default withLayoutBasic(AgentList);
