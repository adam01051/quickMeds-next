import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { NextPage } from 'next';
import { Stack } from '@mui/material';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import MyProperties from '../../libs/components/mypage/MyProperties';
import MyFavorites from '../../libs/components/mypage/MyFavorites';
import RecentlyVisited from '../../libs/components/mypage/RecentlyVisited';
import AddProperty from '../../libs/components/mypage/AddNewProperty';
import MyProfile from '../../libs/components/mypage/MyProfile';
import MyArticles from '../../libs/components/mypage/MyArticles';
import { useMutation, useReactiveVar } from '@apollo/client';
import { userVar } from '../../apollo/store';
import MyMenu from '../../libs/components/mypage/MyMenu';
import WriteArticle from '../../libs/components/mypage/WriteArticle';
import MemberFollowers from '../../libs/components/member/MemberFollowers';
import { sweetErrorHandling, sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';
import MemberFollowings from '../../libs/components/member/MemberFollowings';
import MyMessages from '../../libs/components/mypage/MyMessages';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { LIKE_TARGET_MEMBER, SUBSCRIBE, UNSUBSCRIBE } from '../../apollo/user/mutation';
import { Messages } from '../../libs/config';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const MyPage: NextPage = () => {
	const user = useReactiveVar(userVar);
	const router = useRouter();
	const requestedCategory = Array.isArray(router.query.category) ? router.query.category[0] : router.query.category;
	const pageDetails: Record<string, { eyebrow: string; title: string; description: string }> = {
		myProfile: {
			eyebrow: 'Account',
			title: 'My Profile',
			description: 'Keep your QuickMeds account information current.',
		},
		myFavorites: {
			eyebrow: 'Pharmacy discovery',
			title: 'My Favorites',
			description: 'Return to the pharmacies you trust and want to remember.',
		},
		recentlyVisited: {
			eyebrow: 'Pharmacy discovery',
			title: 'Recently Visited',
			description: 'Continue exploring pharmacies you recently viewed.',
		},
		followers: {
			eyebrow: 'Connections',
			title: 'Followers',
			description: 'View members who follow your QuickMeds activity.',
		},
		followings: {
			eyebrow: 'Connections',
			title: 'Followings',
			description: 'Manage the QuickMeds members you follow.',
		},
		messages: {
			eyebrow: 'Connections',
			title: 'Messages',
			description: 'Continue conversations with Pharmacy Owners.',
		},
		myArticles: {
			eyebrow: 'Community',
			title: 'My Articles',
			description: 'Review the articles you have shared with the community.',
		},
		writeArticle: {
			eyebrow: 'Community',
			title: 'Write Article',
			description: 'Share a useful experience or update with the QuickMeds community.',
		},
		myPharmacies: {
			eyebrow: 'Pharmacy Owner',
			title: 'My Pharmacies',
			description: 'Manage the pharmacies registered to your account.',
		},
		addPharmacy: {
			eyebrow: 'Pharmacy Owner',
			title: 'Add Pharmacy',
			description: 'Register a pharmacy and provide accurate service information.',
		},
	};
	const aliasedCategory =
		requestedCategory === 'addProperty'
			? 'addPharmacy'
			: requestedCategory === 'myProperties'
				? 'myPharmacies'
				: requestedCategory;
	const category = aliasedCategory && pageDetails[aliasedCategory] ? aliasedCategory : 'myProfile';
	const pageDetail = pageDetails[category] ?? pageDetails.myProfile;

	/** APOLLO REQUESTS **/

	const [subscribe] = useMutation(SUBSCRIBE);
	const [unsubscribe] = useMutation(UNSUBSCRIBE);
	const [likeTargetMember] = useMutation(LIKE_TARGET_MEMBER);

	const likeMemberHandler = async (id: string, refetch: any, query: any) => {
		try {
			if (!id) return;
			if (!user._id) throw new Error(Messages.error2);

			await likeTargetMember({
				variables: {
					input: id,
				},
			});
			await sweetTopSmallSuccessAlert('Success!', 800);
			await refetch({ input: query });
		} catch (error: any) {
			console.log('Error in like memberHandler', error.message);
			sweetMixinErrorAlert(error.message).then();
		}
	};

	/** LIFECYCLES **/
	useEffect(() => {
		if (!user._id) router.push('/').then();
	}, [user]);

	/** HANDLERS **/
	const subscribeHandler = async (id: string, refetch: any, query: any) => {
		try {
			if (!id) throw new Error(Messages.error1);
			if (!user._id) throw new Error(Messages.error2);

			await subscribe({
				variables: {
					input: id,
				},
			});
			await sweetTopSmallSuccessAlert('Subscribed!', 800);
			await refetch({ input: query });
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	};

	const unsubscribeHandler = async (id: string, refetch: any, query: any) => {
		try {
			if (!id) throw new Error(Messages.error1);
			if (!user._id) throw new Error(Messages.error2);

			await unsubscribe({
				variables: {
					input: id,
				},
			});
			await sweetTopSmallSuccessAlert('Unsubscribed!', 800);
			await refetch({ input: query });
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	};

	const redirectToMemberPageHandler = async (memberId: string) => {
		try {
			if (memberId === user?._id) await router.push(`/mypage?memberId=${memberId}`);
			else await router.push(`/member?memberId=${memberId}`);
		} catch (error) {
			await sweetErrorHandling(error);
		}
	};

	return (
		<div id="my-page" className={category === 'messages' ? 'my-page--messages' : undefined}>
			<div className="my-page-shell">
				<MyMenu />
				<main className={`my-page-workspace ${category === 'messages' ? 'my-page-workspace--messages' : ''}`} id="my-page-content">
					{category !== 'messages' && (
						<header className="my-page-header">
							<span>{pageDetail.eyebrow}</span>
							<h1>{pageDetail.title}</h1>
							<p>{pageDetail.description}</p>
						</header>
					)}
					<Stack className="main-config">
						<Stack className="list-config">
									{category === 'addPharmacy' && <AddProperty />}
									{category === 'myPharmacies' && <MyProperties />}
									{category === 'myFavorites' && <MyFavorites />}
									{category === 'recentlyVisited' && <RecentlyVisited />}
									{category === 'myArticles' && <MyArticles />}
									{category === 'writeArticle' && <WriteArticle />}
									{category === 'myProfile' && <MyProfile />}
									{category === 'messages' && <MyMessages />}
									{category === 'followers' && (
										<MemberFollowers
											subscribeHandler={subscribeHandler}
											unsubscribeHandler={unsubscribeHandler}
												likeMemberHandler= {likeMemberHandler}
											redirectToMemberPageHandler={redirectToMemberPageHandler}
										/>
									)}
									{category === 'followings' && (
										<MemberFollowings
											subscribeHandler={subscribeHandler}
											unsubscribeHandler={unsubscribeHandler}
											redirectToMemberPageHandler={redirectToMemberPageHandler}
											likeMemberHandler= {likeMemberHandler}
										/>
									)}
						</Stack>
					</Stack>
				</main>
			</div>
		</div>
	);
};

export default withLayoutBasic(MyPage);
