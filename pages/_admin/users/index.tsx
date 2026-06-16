import React, { useState } from 'react';
import type { NextPage } from 'next';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import { MemberPanelList } from '../../../libs/components/admin/users/MemberList';
import { Button, MenuItem, OutlinedInput, Select, TablePagination, Typography } from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import ClearRoundedIcon from '@mui/icons-material/ClearRounded';
import { MembersInquiry } from '../../../libs/types/member/member.input';
import { MemberStatus, MemberType } from '../../../libs/enums/member.enum';
import { sweetErrorHandling } from '../../../libs/sweetAlert';
import { MemberUpdate } from '../../../libs/types/member/member.update';
import { useMutation, useQuery } from '@apollo/client';
import { UPDATE_MEMBER_BY_ADMIN } from '../../../apollo/admin/mutation';
import { GET_ALL_MEMBERS_BY_ADMIN } from '../../../apollo/admin/query';

type AdminUserActionKind = 'role' | 'status';

interface AdminUserMenuState {
	key: string;
	kind: AdminUserActionKind;
	anchor: HTMLElement;
}

const statusTabs = [
	{ label: 'All', value: 'ALL' },
	{ label: 'Active', value: MemberStatus.ACTIVE },
	{ label: 'Blocked', value: MemberStatus.BLOCK },
	{ label: 'Deleted', value: MemberStatus.DELETE },
];

const roleLabels: Record<'ALL' | MemberType, string> = {
	ALL: 'All roles',
	[MemberType.USER]: 'User',
	[MemberType.AGENT]: 'Pharmacy Owner',
	[MemberType.ADMIN]: 'Admin',
};

const AdminUsers: NextPage = ({ initialInquiry }: any) => {
	const [membersInquiry, setMembersInquiry] = useState<MembersInquiry>(initialInquiry);
	const [searchText, setSearchText] = useState(initialInquiry.search?.text ?? '');
	const [menuState, setMenuState] = useState<AdminUserMenuState | null>(null);
	const [updatingMemberKey, setUpdatingMemberKey] = useState<string | null>(null);

	/** APOLLO REQUESTS **/
	const [updateMemberByAdmin] = useMutation(UPDATE_MEMBER_BY_ADMIN);

	const {
		loading: getAllMembersByAdminLoading,
		data: getAllMembersByAdminData,
		error: getAllMembersByAdminError,
		refetch: getAllMembersRefetch,
	} = useQuery(GET_ALL_MEMBERS_BY_ADMIN, {
		fetchPolicy: 'network-only',
		variables: { input: membersInquiry },
		notifyOnNetworkStatusChange: true,
	});

	const members = getAllMembersByAdminData?.getAllMembersByAdmin?.list ?? [];
	const membersTotal = getAllMembersByAdminData?.getAllMembersByAdmin?.metaCounter?.[0]?.total ?? 0;
	const activeStatus = membersInquiry.search.memberStatus ?? 'ALL';
	const activeRole = membersInquiry.search.memberType ?? 'ALL';

	/** HANDLERS **/
	const changePageHandler = async (event: unknown, newPage: number) => {
		setMembersInquiry((current) => ({ ...current, page: newPage + 1 }));
	};

	const changeRowsPerPageHandler = async (event: React.ChangeEvent<HTMLInputElement>) => {
		setMembersInquiry((current) => ({ ...current, limit: parseInt(event.target.value, 10), page: 1 }));
	};

	const menuIconClickHandler = (event: React.MouseEvent<HTMLElement>, key: string, kind: AdminUserActionKind) => {
		setMenuState({ key, kind, anchor: event.currentTarget });
	};

	const menuIconCloseHandler = () => {
		setMenuState(null);
	};

	const statusChangeHandler = (nextStatus: string) => {
		setSearchText('');
		setMembersInquiry((current) => {
			const nextSearch = { ...current.search };
			delete nextSearch.text;
			if (nextStatus === 'ALL') delete nextSearch.memberStatus;
			else nextSearch.memberStatus = nextStatus as MemberStatus;
			return { ...current, page: 1, sort: 'createdAt', search: nextSearch };
		});
	};

	const roleChangeHandler = (nextRole: string) => {
		setMembersInquiry((current) => {
			const nextSearch = { ...current.search };
			if (nextRole === 'ALL') delete nextSearch.memberType;
			else nextSearch.memberType = nextRole as MemberType;
			return { ...current, page: 1, sort: 'createdAt', search: nextSearch };
		});
	};

	const searchTextHandler = () => {
		setMembersInquiry((current) => {
			const nextSearch = { ...current.search };
			const nextText = searchText.trim();
			if (nextText) nextSearch.text = nextText;
			else delete nextSearch.text;
			return { ...current, page: 1, search: nextSearch };
		});
	};

	const clearSearchHandler = () => {
		setSearchText('');
		setMembersInquiry((current) => {
			const nextSearch = { ...current.search };
			delete nextSearch.text;
			return { ...current, page: 1, search: nextSearch };
		});
	};

	const updateMemberHandler = async (updateData: MemberUpdate) => {
		const key = updateData.memberType ? `${updateData._id}-role` : `${updateData._id}-status`;
		try {
			setUpdatingMemberKey(key);
			await updateMemberByAdmin({ variables: { input: updateData } });
			menuIconCloseHandler();
			await getAllMembersRefetch({ input: membersInquiry });
		} catch (err: any) {
			sweetErrorHandling(err).then();
		} finally {
			setUpdatingMemberKey(null);
		}
	};

	return (
		<div className="content admin-users-page">
			<div className="admin-page-header admin-page-header--with-count">
				<div>
					<Typography component="span">USER MANAGEMENT</Typography>
					<Typography component="h1">Users</Typography>
					<Typography component="p">Manage QuickMeds accounts, roles, and account status.</Typography>
				</div>
				<div className="admin-result-count" aria-live="polite">
					<strong>{membersTotal.toLocaleString()}</strong>
					<span>{membersTotal === 1 ? 'user' : 'users'}</span>
				</div>
			</div>

			<div className="table-wrap admin-management-panel">
				<div className="admin-filter-tabs" role="tablist" aria-label="Filter users by status">
					{statusTabs.map((tab) => (
						<button
							type="button"
							role="tab"
							aria-selected={activeStatus === tab.value}
							aria-current={activeStatus === tab.value ? 'page' : undefined}
							className={activeStatus === tab.value ? 'is-active' : ''}
							onClick={() => statusChangeHandler(tab.value)}
							key={tab.value}
						>
							{tab.label}
						</button>
					))}
				</div>

				<div className="admin-toolbar">
					<div className="admin-search-control">
						<OutlinedInput
							value={searchText}
							onChange={(event) => setSearchText(event.target.value)}
							className="admin-search-control__input"
							placeholder="Search by nickname"
							inputProps={{ 'aria-label': 'Search users by nickname' }}
							onKeyDown={(event) => {
								if (event.key === 'Enter') searchTextHandler();
							}}
							startAdornment={<SearchRoundedIcon fontSize="small" />}
						/>
						<Button onClick={searchTextHandler} variant="contained" className="admin-primary-action">
							Search
						</Button>
						<Button
							onClick={clearSearchHandler}
							variant="outlined"
							className="admin-secondary-action"
							startIcon={<ClearRoundedIcon />}
							disabled={!searchText && !membersInquiry.search.text}
						>
							Clear
						</Button>
					</div>
					<Select
						className="admin-select-control"
						value={activeRole}
						onChange={(event) => roleChangeHandler(event.target.value)}
						displayEmpty
						inputProps={{ 'aria-label': 'Filter users by role' }}
					>
						{Object.entries(roleLabels).map(([value, label]) => (
							<MenuItem value={value} key={value}>
								{label}
							</MenuItem>
						))}
					</Select>
				</div>

				<MemberPanelList
					members={members}
					loading={getAllMembersByAdminLoading}
					error={getAllMembersByAdminError}
					updatingMemberKey={updatingMemberKey}
					menuState={menuState}
					menuIconClickHandler={menuIconClickHandler}
					menuIconCloseHandler={menuIconCloseHandler}
					updateMemberHandler={updateMemberHandler}
					retryHandler={() => getAllMembersRefetch({ input: membersInquiry })}
				/>

				<TablePagination
					rowsPerPageOptions={[10, 20, 40, 60]}
					component="div"
					count={membersTotal}
					rowsPerPage={membersInquiry.limit}
					page={membersInquiry.page - 1}
					onPageChange={changePageHandler}
					onRowsPerPageChange={changeRowsPerPageHandler}
				/>
			</div>
		</div>
	);
};

AdminUsers.defaultProps = {
	initialInquiry: {
		page: 1,
		limit: 10,
		sort: 'createdAt',
		direction: 'DESC',
		search: {},
	},
};

export default withAdminLayout(AdminUsers);
