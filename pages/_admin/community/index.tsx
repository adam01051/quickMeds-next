import React, { useEffect, useState } from 'react';
import type { NextPage } from 'next';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import { MenuItem, Select, TablePagination, Typography } from '@mui/material';
import CommunityArticleList from '../../../libs/components/admin/community/CommunityArticleList';
import { AllBoardArticlesInquiry } from '../../../libs/types/board-article/board-article.input';
import { BoardArticle } from '../../../libs/types/board-article/board-article';
import { BoardArticleCategory, BoardArticleStatus } from '../../../libs/enums/board-article.enum';
import { sweetConfirmAlert, sweetErrorHandling } from '../../../libs/sweetAlert';
import { BoardArticleUpdate } from '../../../libs/types/board-article/board-article.update';
import { REMOVE_BOARD_ARTICLE_BY_ADMIN, UPDATE_BOARD_ARTICLE_BY_ADMIN } from '../../../apollo/admin/mutation';
import { useMutation, useQuery } from '@apollo/client';
import { GET_ALL_BOARD_ARTICLES_BY_ADMIN } from '../../../apollo/admin/query';
import { T } from '../../../libs/types/common';

const statusTabs = [
	{ label: 'All', value: 'ALL' },
	{ label: 'Active', value: BoardArticleStatus.ACTIVE },
	{ label: 'Deleted', value: BoardArticleStatus.DELETE },
];

const categoryLabels: Record<'ALL' | BoardArticleCategory, string> = {
	ALL: 'All categories',
	[BoardArticleCategory.FREE]: 'Discussions',
	[BoardArticleCategory.RECOMMEND]: 'Recommendations',
	[BoardArticleCategory.NEWS]: 'News',
	[BoardArticleCategory.HUMOR]: 'Community Corner',
};

const AdminCommunity: NextPage = ({ initialInquiry, ...props }: any) => {
	const [anchorEl, setAnchorEl] = useState<HTMLElement[]>([]);
	const [communityInquiry, setCommunityInquiry] = useState<AllBoardArticlesInquiry>(initialInquiry);
	const [articles, setArticles] = useState<BoardArticle[]>([]);
	const [articleTotal, setArticleTotal] = useState<number>(0);
	const [value, setValue] = useState<string>(
		communityInquiry?.search?.articleStatus ? communityInquiry?.search?.articleStatus : 'ALL',
	);
	const [searchType, setSearchType] = useState('ALL');

	/** APOLLO REQUESTS **/

	const [updateBoardArticleByAdmin] = useMutation(UPDATE_BOARD_ARTICLE_BY_ADMIN);
	const [removeBoardArticleByAdmin] = useMutation(REMOVE_BOARD_ARTICLE_BY_ADMIN);

	const {
		loading: getAllBoardArticlesByAdminLoading,
		data: getAllBoardArticlesByAdminData,
		error: getAllBoardArticleByAdminError,
		refetch: getAllBoardArticlesByAdminRefetch,
	} = useQuery(GET_ALL_BOARD_ARTICLES_BY_ADMIN, {
		fetchPolicy: 'network-only',
		variables: { input: communityInquiry },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setArticles(data?.getAllBoardArticlesByAdmin?.list);
			setArticleTotal(data?.getAllBoardArticlesByAdmin?.metaCounter[0]?.total ?? 0);
		},
	});
	/** LIFECYCLES **/
	useEffect(() => {
		getAllBoardArticlesByAdminRefetch({ input: communityInquiry }).then();
	}, [communityInquiry]);

	/** HANDLERS **/
	const changePageHandler = async (event: unknown, newPage: number) => {
		communityInquiry.page = newPage + 1;
		 await getAllBoardArticlesByAdminRefetch({input:communityInquiry});
		setCommunityInquiry({ ...communityInquiry });
	};

	const changeRowsPerPageHandler = async (event: React.ChangeEvent<HTMLInputElement>) => {
		communityInquiry.limit = parseInt(event.target.value, 10);
		communityInquiry.page = 1;
			await getAllBoardArticlesByAdminRefetch({input:communityInquiry});
		setCommunityInquiry({ ...communityInquiry });
	};

	const menuIconClickHandler = (e: any, index: number) => {
		const tempAnchor = anchorEl.slice();
		tempAnchor[index] = e.currentTarget;
		setAnchorEl(tempAnchor);
	};

	const menuIconCloseHandler = () => {
		setAnchorEl([]);
	};

	const tabChangeHandler = async (event: any, newValue: string) => {
		setValue(newValue);

		setCommunityInquiry((current) => {
			const nextSearch = { ...current.search };
			if (newValue === 'ALL') delete nextSearch.articleStatus;
			else nextSearch.articleStatus = newValue as BoardArticleStatus;
			return { ...current, page: 1, sort: 'createdAt', search: nextSearch };
		});
	};

	const searchTypeHandler = async (newValue: string) => {
		setSearchType(newValue);

		if (newValue !== 'ALL') {
			setCommunityInquiry((current) => ({
				...current,
				page: 1,
				sort: 'createdAt',
				search: {
					...current.search,
					articleCategory: newValue as BoardArticleCategory,
				},
			}));
		} else {
			setCommunityInquiry((current) => {
				const nextSearch = { ...current.search };
				delete nextSearch.articleCategory;
				return { ...current, page: 1, search: nextSearch };
			});
		}
	};

	const updateArticleHandler = async (updateData: BoardArticleUpdate) => {
		try {
			await updateBoardArticleByAdmin({
				variables:{
					input:updateData,
				}});
			menuIconCloseHandler();
			await getAllBoardArticlesByAdminRefetch({ input: communityInquiry });
		} catch (err: any) {
			menuIconCloseHandler();
			sweetErrorHandling(err).then();
		}
	};

	const removeArticleHandler = async (id: string) => {
		try {
			if (await sweetConfirmAlert('are you sure to remove?')) {
				await removeBoardArticleByAdmin({
				variables:{
					input:id,
				}});
			}

		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	};

	return (
		<div className="content admin-users-page">
			<div className="admin-page-header admin-page-header--with-count">
				<div>
					<Typography component="span">COMMUNITY MANAGEMENT</Typography>
					<Typography component="h1">Community</Typography>
					<Typography component="p">Moderate QuickMeds articles while preserving the public Community taxonomy.</Typography>
				</div>
				<div className="admin-result-count" aria-live="polite">
					<strong>{articleTotal.toLocaleString()}</strong>
					<span>{articleTotal === 1 ? 'article' : 'articles'}</span>
				</div>
			</div>

			<div className="table-wrap admin-management-panel">
				<div className="admin-filter-tabs" role="tablist" aria-label="Filter Community articles by status">
					{statusTabs.map((tab) => (
						<button
							type="button"
							role="tab"
							aria-selected={value === tab.value}
							aria-current={value === tab.value ? 'page' : undefined}
							className={value === tab.value ? 'is-active' : ''}
							onClick={(event) => tabChangeHandler(event, tab.value)}
							key={tab.value}
						>
							{tab.label}
						</button>
					))}
				</div>

				<div className="admin-toolbar">
					<div className="admin-toolbar__context">
						<strong>Category filter</strong>
						<span>Uses existing backend article category values.</span>
					</div>
					<Select
						className="admin-select-control"
						value={searchType}
						onChange={(event) => searchTypeHandler(event.target.value)}
						inputProps={{ 'aria-label': 'Filter articles by category' }}
					>
						{Object.entries(categoryLabels).map(([value, label]) => (
							<MenuItem value={value} key={value}>
								{label}
							</MenuItem>
						))}
					</Select>
				</div>

				<CommunityArticleList
					articles={articles}
					loading={getAllBoardArticlesByAdminLoading}
					error={getAllBoardArticleByAdminError}
					anchorEl={anchorEl}
					menuIconClickHandler={menuIconClickHandler}
					menuIconCloseHandler={menuIconCloseHandler}
					updateArticleHandler={updateArticleHandler}
					removeArticleHandler={removeArticleHandler}
					retryHandler={() => getAllBoardArticlesByAdminRefetch({ input: communityInquiry })}
				/>

				<TablePagination
					rowsPerPageOptions={[10, 20, 40, 60]}
					component="div"
					count={articleTotal}
					rowsPerPage={communityInquiry?.limit}
					page={communityInquiry?.page - 1}
					onPageChange={changePageHandler}
					onRowsPerPageChange={changeRowsPerPageHandler}
				/>
			</div>
		</div>
	);
};

AdminCommunity.defaultProps = {
	initialInquiry: {
		page: 1,
		limit: 10,
		sort: 'createdAt',
		direction: 'DESC',
		search: {},
	},
};

export default withAdminLayout(AdminCommunity);
