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
import DeleteIcon from '@mui/icons-material/Delete';
import { CaretDown } from 'phosphor-react';
import Moment from 'react-moment';
import { BoardArticle } from '../../../types/board-article/board-article';
import { REACT_APP_API_URL } from '../../../config';
import { BoardArticleCategory, BoardArticleStatus } from '../../../enums/board-article.enum';

interface CommunityArticleListProps {
	articles: BoardArticle[];
	loading: boolean;
	error?: Error;
	anchorEl: HTMLElement[];
	menuIconClickHandler: (event: React.MouseEvent<HTMLElement>, index: number) => void;
	menuIconCloseHandler: () => void;
	updateArticleHandler: (updateData: { _id: string; articleStatus: BoardArticleStatus }) => void;
	removeArticleHandler: (id: string) => void;
	retryHandler: () => void;
}

const categoryLabels: Record<BoardArticleCategory, string> = {
	[BoardArticleCategory.FREE]: 'Discussions',
	[BoardArticleCategory.RECOMMEND]: 'Recommendations',
	[BoardArticleCategory.NEWS]: 'News',
	[BoardArticleCategory.HUMOR]: 'Community Corner',
};

const statusLabels: Record<BoardArticleStatus, string> = {
	[BoardArticleStatus.ACTIVE]: 'Active',
	[BoardArticleStatus.DELETE]: 'Deleted',
};

const getStatusClass = (status: BoardArticleStatus) =>
	status === BoardArticleStatus.ACTIVE ? 'is-active' : 'is-deleted';

const getMemberImage = (article: BoardArticle) =>
	article.memberData?.memberImage ? `${REACT_APP_API_URL}/${article.memberData.memberImage}` : '/img/profile/defaultUser.svg';

const AdminCommunitySkeletonRows = () => (
	<>
		{Array.from({ length: 6 }).map((_, index) => (
			<TableRow key={`admin-community-skeleton-${index}`}>
				<TableCell><Skeleton variant="text" width={180} /></TableCell>
				<TableCell><Skeleton variant="text" width={240} /></TableCell>
				<TableCell><Skeleton variant="text" width={120} /></TableCell>
				<TableCell>
					<div className="admin-author-cell">
						<Skeleton variant="circular" width={34} height={34} />
						<Skeleton variant="text" width={90} />
					</div>
				</TableCell>
				<TableCell><Skeleton variant="text" width={50} /></TableCell>
				<TableCell><Skeleton variant="text" width={50} /></TableCell>
				<TableCell><Skeleton variant="text" width={104} /></TableCell>
				<TableCell><Skeleton variant="rounded" width={112} height={28} /></TableCell>
				<TableCell><Skeleton variant="rounded" width={132} height={40} /></TableCell>
			</TableRow>
		))}
	</>
);

const CommunityArticleList = (props: CommunityArticleListProps) => {
	const {
		articles,
		loading,
		error,
		anchorEl,
		menuIconClickHandler,
		menuIconCloseHandler,
		updateArticleHandler,
		removeArticleHandler,
		retryHandler,
	} = props;

	if (error) {
		return (
			<div className="admin-table-state admin-table-state--error" role="alert">
				<Typography component="strong">Unable to load articles</Typography>
				<Typography component="p">The admin Community query could not be completed. Please retry the current filters.</Typography>
				<Button onClick={retryHandler}>Retry</Button>
			</div>
		);
	}

	return (
		<TableContainer className="admin-users-table admin-community-table">
			<Table aria-label="QuickMeds community articles table">
				<TableHead>
					<TableRow>
						<TableCell>Reference ID</TableCell>
						<TableCell>Article</TableCell>
						<TableCell>Category</TableCell>
						<TableCell>Author</TableCell>
						<TableCell align="center">Views</TableCell>
						<TableCell align="center">Likes</TableCell>
						<TableCell>Published</TableCell>
						<TableCell>Status</TableCell>
						<TableCell align="right">Actions</TableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{loading && <AdminCommunitySkeletonRows />}
					{!loading && articles.length === 0 && (
						<TableRow>
							<TableCell align="center" colSpan={9}>
								<div className="admin-table-state">
									<Typography component="strong">No articles found</Typography>
									<Typography component="p">Try changing the status or category filter.</Typography>
								</div>
							</TableCell>
						</TableRow>
					)}
					{!loading &&
						articles.map((article, index) => (
							<TableRow hover key={article._id}>
								<TableCell>
									<span className="admin-reference-id">{article._id}</span>
								</TableCell>
								<TableCell>
									<Link
										href={`/community/detail?articleCategory=${article.articleCategory}&id=${article._id}`}
										className="admin-article-link"
									>
										{article.articleTitle}
									</Link>
								</TableCell>
								<TableCell>{categoryLabels[article.articleCategory]}</TableCell>
								<TableCell>
									<Link href={`/member?memberId=${article.memberData?._id || article.memberId}`} className="admin-author-cell">
										<Avatar alt={`${article.memberData?.memberNick || 'Member'} avatar`} src={getMemberImage(article)} />
										<span>{article.memberData?.memberNick || 'Unknown member'}</span>
									</Link>
								</TableCell>
								<TableCell align="center">{article.articleViews}</TableCell>
								<TableCell align="center">{article.articleLikes}</TableCell>
								<TableCell>
									<Moment format="DD.MM.YY HH:mm">{article.createdAt}</Moment>
								</TableCell>
								<TableCell>
									<span className={`admin-status-chip ${getStatusClass(article.articleStatus)}`}>
										{statusLabels[article.articleStatus]}
									</span>
								</TableCell>
								<TableCell align="right">
									{article.articleStatus === BoardArticleStatus.DELETE ? (
										<Button
											className="admin-action-button admin-action-button--danger"
											onClick={() => removeArticleHandler(article._id)}
											startIcon={<DeleteIcon fontSize="small" />}
										>
											Remove
										</Button>
									) : (
										<>
											<Button
												className="admin-action-button"
												onClick={(event) => menuIconClickHandler(event, index)}
												aria-label={`Change status for ${article.articleTitle}`}
												endIcon={<CaretDown size={14} />}
											>
												Change status
											</Button>
											<Menu
												className="admin-action-menu"
												anchorEl={anchorEl[index]}
												open={Boolean(anchorEl[index])}
												onClose={menuIconCloseHandler}
												TransitionComponent={Fade}
											>
												{Object.values(BoardArticleStatus)
													.filter((status) => status !== article.articleStatus)
													.map((status) => (
														<MenuItem
															onClick={() => updateArticleHandler({ _id: article._id, articleStatus: status })}
															key={status}
														>
															{statusLabels[status]}
														</MenuItem>
													))}
											</Menu>
										</>
									)}
								</TableCell>
							</TableRow>
						))}
				</TableBody>
			</Table>
		</TableContainer>
	);
};

export default CommunityArticleList;
