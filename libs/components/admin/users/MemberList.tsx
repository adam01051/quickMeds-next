import React from 'react';
import Link from 'next/link';
import {
	Avatar,
	Button,
	Fade,
	Menu,
	MenuItem,
	Skeleton,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Typography,
} from '@mui/material';
import { CaretDown } from 'phosphor-react';
import { Member } from '../../../types/member/member';
import { REACT_APP_API_URL } from '../../../config';
import { MemberStatus, MemberType } from '../../../enums/member.enum';

type AdminUserActionKind = 'role' | 'status';

interface AdminUserMenuState {
	key: string;
	kind: AdminUserActionKind;
	anchor: HTMLElement;
}

interface MemberPanelListType {
	members: Member[];
	loading: boolean;
	error?: Error;
	updatingMemberKey?: string | null;
	menuState: AdminUserMenuState | null;
	menuIconClickHandler: (event: React.MouseEvent<HTMLElement>, key: string, kind: AdminUserActionKind) => void;
	menuIconCloseHandler: () => void;
	updateMemberHandler: (updateData: { _id: string; memberType?: MemberType; memberStatus?: MemberStatus }) => void;
	retryHandler: () => void;
}

const roleLabels: Record<MemberType, string> = {
	[MemberType.USER]: 'User',
	[MemberType.AGENT]: 'Pharmacy Owner',
	[MemberType.ADMIN]: 'Admin',
};

const statusLabels: Record<MemberStatus, string> = {
	[MemberStatus.ACTIVE]: 'Active',
	[MemberStatus.BLOCK]: 'Blocked',
	[MemberStatus.DELETE]: 'Deleted',
};

const getStatusClass = (status: MemberStatus) => {
	if (status === MemberStatus.ACTIVE) return 'is-active';
	if (status === MemberStatus.BLOCK) return 'is-blocked';
	return 'is-deleted';
};

const getMemberImage = (member: Member) =>
	member.memberImage ? `${REACT_APP_API_URL}/${member.memberImage}` : '/img/profile/defaultUser.svg';

const AdminUserSkeletonRows = () => (
	<>
		{Array.from({ length: 6 }).map((_, index) => (
			<TableRow key={`admin-user-skeleton-${index}`}>
				<TableCell>
					<div className="admin-users-table__user">
						<Skeleton variant="circular" width={40} height={40} />
						<div>
							<Skeleton variant="text" width={130} height={20} />
							<Skeleton variant="text" width={190} height={16} />
						</div>
					</div>
				</TableCell>
				<TableCell><Skeleton variant="text" width={110} /></TableCell>
				<TableCell><Skeleton variant="rounded" width={120} height={36} /></TableCell>
				<TableCell><Skeleton variant="text" width={36} /></TableCell>
				<TableCell><Skeleton variant="text" width={36} /></TableCell>
				<TableCell><Skeleton variant="rounded" width={88} height={28} /></TableCell>
				<TableCell><Skeleton variant="text" width={90} /></TableCell>
				<TableCell><Skeleton variant="rounded" width={128} height={40} /></TableCell>
			</TableRow>
		))}
	</>
);

export const MemberPanelList = (props: MemberPanelListType) => {
	const {
		members,
		loading,
		error,
		updatingMemberKey,
		menuState,
		menuIconClickHandler,
		menuIconCloseHandler,
		updateMemberHandler,
		retryHandler,
	} = props;

	if (error) {
		return (
			<div className="admin-table-state admin-table-state--error" role="alert">
				<Typography component="strong">Unable to load users</Typography>
				<Typography component="p">The admin member query could not be completed. Please retry the current filters.</Typography>
				<Button onClick={retryHandler}>Retry</Button>
			</div>
		);
	}

	return (
		<TableContainer className="admin-users-table">
			<Table aria-label="QuickMeds users table">
				<TableHead>
					<TableRow>
						<TableCell>User</TableCell>
						<TableCell>Phone</TableCell>
						<TableCell>Role</TableCell>
						<TableCell align="center">Warnings</TableCell>
						<TableCell align="center">Blocks</TableCell>
						<TableCell>Status</TableCell>
						<TableCell>Joined</TableCell>
						<TableCell align="right">Actions</TableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{loading && <AdminUserSkeletonRows />}
					{!loading && members.length === 0 && (
						<TableRow>
							<TableCell align="center" colSpan={8}>
								<div className="admin-table-state">
									<Typography component="strong">No users found</Typography>
									<Typography component="p">Try changing the status, role, or nickname search.</Typography>
								</div>
							</TableCell>
						</TableRow>
					)}
					{!loading &&
						members.map((member) => {
							const roleKey = `${member._id}-role`;
							const statusKey = `${member._id}-status`;
							const isRoleUpdating = updatingMemberKey === roleKey;
							const isStatusUpdating = updatingMemberKey === statusKey;

							return (
								<TableRow hover key={member._id}>
									<TableCell>
										<div className="admin-users-table__user">
											<Link href={`/member?memberId=${member._id}`} aria-label={`Open ${member.memberNick} profile`}>
												<Avatar alt={`${member.memberNick} avatar`} src={getMemberImage(member)} />
											</Link>
											<div>
												<Link href={`/member?memberId=${member._id}`}>{member.memberNick}</Link>
												<span>{member.memberFullName || member._id}</span>
											</div>
										</div>
									</TableCell>
									<TableCell>{member.memberPhone || '-'}</TableCell>
									<TableCell>
										<Button
											className="admin-action-button"
											onClick={(event) => menuIconClickHandler(event, roleKey, 'role')}
											disabled={Boolean(updatingMemberKey)}
											aria-label={`Change role for ${member.memberNick}`}
											endIcon={<CaretDown size={14} />}
										>
											{isRoleUpdating ? 'Updating...' : roleLabels[member.memberType]}
										</Button>
										<Menu
											className="admin-action-menu"
											anchorEl={menuState?.key === roleKey ? menuState.anchor : null}
											open={menuState?.key === roleKey}
											onClose={menuIconCloseHandler}
											TransitionComponent={Fade}
										>
											{Object.values(MemberType)
												.filter((type) => type !== member.memberType)
												.map((type) => (
													<MenuItem
														onClick={() => updateMemberHandler({ _id: member._id, memberType: type })}
														key={type}
													>
														{roleLabels[type]}
													</MenuItem>
												))}
										</Menu>
									</TableCell>
									<TableCell align="center">{member.memberWarnings}</TableCell>
									<TableCell align="center">{member.memberBlocks}</TableCell>
									<TableCell>
										<span className={`admin-status-chip ${getStatusClass(member.memberStatus)}`}>
											{statusLabels[member.memberStatus]}
										</span>
									</TableCell>
									<TableCell>{member.createdAt ? new Date(member.createdAt).toLocaleDateString() : '-'}</TableCell>
									<TableCell align="right">
										<Button
											className="admin-action-button"
											onClick={(event) => menuIconClickHandler(event, statusKey, 'status')}
											disabled={Boolean(updatingMemberKey)}
											aria-label={`Change status for ${member.memberNick}`}
											endIcon={<CaretDown size={14} />}
										>
											{isStatusUpdating ? 'Updating...' : 'Change status'}
										</Button>
										<Menu
											className="admin-action-menu"
											anchorEl={menuState?.key === statusKey ? menuState.anchor : null}
											open={menuState?.key === statusKey}
											onClose={menuIconCloseHandler}
											TransitionComponent={Fade}
										>
											{Object.values(MemberStatus)
												.filter((status) => status !== member.memberStatus)
												.map((status) => (
													<MenuItem
														onClick={() => updateMemberHandler({ _id: member._id, memberStatus: status })}
														key={status}
													>
														{statusLabels[status]}
													</MenuItem>
												))}
										</Menu>
									</TableCell>
								</TableRow>
							);
						})}
				</TableBody>
			</Table>
		</TableContainer>
	);
};
