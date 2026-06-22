import { gql } from '@apollo/client';

/**************************
 *         MEMBER         *
 *************************/

export const GET_AGENTS = gql`
	query GetAgents($input: AgentsInquiry!) {
		getAgents(input: $input) {
			list {
				_id
				memberType
				memberStatus
				memberAuthType
				memberPhone
				memberNick
				memberFullName
				memberImage
				memberAddress
				memberDesc
				memberWarnings
				memberBlocks
				memberPharmacies
				memberRank
				memberPoints
				memberLikes
				memberViews
				deletedAt
				createdAt
				updatedAt
				accessToken
				meLiked {
					memberId
					likeRefId
					myFavorite
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_MEMBER = gql(`
query GetMember($input: String!) {
    getMember(memberId: $input) {
        _id
        memberType
        memberStatus
        memberAuthType
        memberPhone
        memberNick
        memberFullName
        memberImage
        memberAddress
        memberDesc
        memberPharmacies
        memberArticles
        memberPoints
        memberLikes
        memberViews
        memberFollowings
				memberFollowers
        memberRank
        memberWarnings
        memberBlocks
        deletedAt
        createdAt
        updatedAt
        accessToken
        meFollowed {
					followingId
					followerId
					myFollowing
				}
        meLiked {
          memberId
          likeRefId
          myFavorite
        }
    }
}
`);

/**************************
 *        PHARMACY        *
 *************************/

export const GET_PHARMACY = gql`
	query GetPharmacy($input: String!) {
		getPharmacy(pharmacyId: $input) {
			_id
			pharmacyType
			pharmacyStatus
			pharmacyLocation
			pharmacyAddress
			pharmacyName
			pharmacyDeliveryFee
			pharmacyLatitude
			pharmacyLongitude
			pharmacyMedicationCount
			pharmacyViews
			pharmacyLikes
			pharmacyImages
			pharmacyDesc
			acceptsInsurance
			hasDelivery
			open24Hours
			pharmacyTimezone
			operatingHours {
				dayOfWeek
				isClosed
				opensAt
				closesAt
			}
			hoursConfigured
			isOpenNow
			nextOpeningAt
			nextClosingAt
			memberId
			verifiedAt
			deletedAt
			openedAt
			createdAt
			updatedAt
			memberData {
				_id
				memberType
				memberStatus
				memberAuthType
				memberPhone
				memberNick
				memberFullName
				memberImage
				memberAddress
				memberDesc
				memberWarnings
				memberBlocks
				memberPoints
				memberLikes
				memberViews
				deletedAt
				createdAt
				updatedAt
				accessToken
			}
			meLiked {
				memberId
				likeRefId
				myFavorite
			}
		}
	}
`;

export const GET_PHARMACIES = gql`
	query GetPharmacies($input: PharmaciesInquiry!) {
		getPharmacies(input: $input) {
			list {
				_id
				pharmacyType
				pharmacyStatus
				pharmacyLocation
				pharmacyAddress
				pharmacyName
				pharmacyDeliveryFee
			pharmacyLatitude
			pharmacyLongitude
				pharmacyMedicationCount
				pharmacyViews
				pharmacyLikes
				pharmacyRank
				pharmacyImages
				pharmacyDesc
				acceptsInsurance
				hasDelivery
			open24Hours
			pharmacyTimezone
			operatingHours {
				dayOfWeek
				isClosed
				opensAt
				closesAt
			}
			hoursConfigured
			isOpenNow
			nextOpeningAt
			nextClosingAt
				memberId
				verifiedAt
				deletedAt
				openedAt
				createdAt
				updatedAt
				memberData {
					_id
					memberType
					memberStatus
					memberAuthType
					memberPhone
					memberNick
					memberFullName
					memberImage
					memberAddress
					memberDesc
					memberWarnings
					memberBlocks
					memberPharmacies
					memberRank
					memberPoints
					memberLikes
					memberViews
					deletedAt
					createdAt
					updatedAt
				}
				meLiked {
					memberId
					likeRefId
					myFavorite
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_AGENT_PHARMACIES = gql`
	query GetAgentPharmacies($input: AgentPharmaciesInquiry!) {
		getAgentPharmacies(input: $input) {
			list {
				_id
				pharmacyType
				pharmacyStatus
				pharmacyLocation
				pharmacyAddress
				pharmacyName
				pharmacyDeliveryFee
			pharmacyLatitude
			pharmacyLongitude
				pharmacyMedicationCount
				pharmacyViews
				pharmacyLikes
				pharmacyImages
				pharmacyDesc
				acceptsInsurance
				hasDelivery
			open24Hours
			pharmacyTimezone
			operatingHours {
				dayOfWeek
				isClosed
				opensAt
				closesAt
			}
			hoursConfigured
			isOpenNow
			nextOpeningAt
			nextClosingAt
				memberId
				verifiedAt
				deletedAt
				openedAt
				createdAt
				updatedAt
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_FAVORITES = gql`
	query GetFavorites($input: OrdinaryInquiry!) {
		getFavorites(input: $input) {
			list {
				_id
				pharmacyType
				pharmacyStatus
				pharmacyLocation
				pharmacyAddress
				pharmacyName
				pharmacyDeliveryFee
			pharmacyLatitude
			pharmacyLongitude
				pharmacyMedicationCount
				pharmacyViews
				pharmacyLikes
				pharmacyComments
				pharmacyRank
				pharmacyImages
				pharmacyDesc
				acceptsInsurance
				hasDelivery
			open24Hours
			pharmacyTimezone
			operatingHours {
				dayOfWeek
				isClosed
				opensAt
				closesAt
			}
			hoursConfigured
			isOpenNow
			nextOpeningAt
			nextClosingAt
				memberId
				verifiedAt
				deletedAt
				openedAt
				createdAt
				updatedAt
				memberData {
					_id
					memberType
					memberStatus
					memberAuthType
					memberPhone
					memberNick
					memberFullName
					memberImage
					memberAddress
					memberDesc
					memberPharmacies
					memberArticles
					memberPoints
					memberLikes
					memberViews
					memberComments
					memberFollowings
					memberFollowers
					memberRank
					memberWarnings
					memberBlocks
					deletedAt
					createdAt
					updatedAt
					accessToken
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_VISITED = gql`
	query GetVisited($input: OrdinaryInquiry!) {
		getVisited(input: $input) {
			list {
				_id
				pharmacyType
				pharmacyStatus
				pharmacyLocation
				pharmacyAddress
				pharmacyName
				pharmacyDeliveryFee
			pharmacyLatitude
			pharmacyLongitude
				pharmacyMedicationCount
				pharmacyViews
				pharmacyLikes
				pharmacyComments
				pharmacyRank
				pharmacyImages
				pharmacyDesc
				acceptsInsurance
				hasDelivery
			open24Hours
			pharmacyTimezone
			operatingHours {
				dayOfWeek
				isClosed
				opensAt
				closesAt
			}
			hoursConfigured
			isOpenNow
			nextOpeningAt
			nextClosingAt
				memberId
				verifiedAt
				deletedAt
				openedAt
				createdAt
				updatedAt
				memberData {
					_id
					memberType
					memberStatus
					memberAuthType
					memberPhone
					memberNick
					memberFullName
					memberImage
					memberAddress
					memberDesc
					memberPharmacies
					memberArticles
					memberPoints
					memberLikes
					memberViews
					memberComments
					memberFollowings
					memberFollowers
					memberRank
					memberWarnings
					memberBlocks
					deletedAt
					createdAt
					updatedAt
					accessToken
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

/**************************
 *      BOARD-ARTICLE     *
 *************************/

export const GET_BOARD_ARTICLE = gql`
	query GetBoardArticle($input: String!) {
		getBoardArticle(articleId: $input) {
			_id
			articleCategory
			articleStatus
			articleTitle
			articleContent
			articleImage
			articleViews
			articleLikes
			articleComments
			memberId
			createdAt
			updatedAt
			memberData {
				_id
				memberType
				memberStatus
				memberAuthType
				memberPhone
				memberNick
				memberFullName
				memberImage
				memberAddress
				memberDesc
				memberWarnings
				memberBlocks
				memberPharmacies
				memberRank
				memberPoints
				memberLikes
				memberViews
				deletedAt
				createdAt
				updatedAt
			}
			meLiked {
				memberId
				likeRefId
				myFavorite
			}
		}
	}
`;

export const GET_BOARD_ARTICLES = gql`
	query GetBoardArticles($input: BoardArticlesInquiry!) {
		getBoardArticles(input: $input) {
			list {
				_id
				articleCategory
				articleStatus
				articleTitle
				articleContent
				articleImage
				articleViews
				articleLikes
				articleComments
				memberId
				createdAt
				updatedAt
				meLiked {
					memberId
					likeRefId
					myFavorite
				}
				memberData {
					_id
					memberType
					memberStatus
					memberAuthType
					memberPhone
					memberNick
					memberFullName
					memberImage
					memberAddress
					memberDesc
					memberWarnings
					memberBlocks
					memberPharmacies
					memberRank
					memberPoints
					memberLikes
					memberViews
					deletedAt
					createdAt
					updatedAt
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

/**************************
 *         COMMENT        *
 *************************/

export const GET_COMMENTS = gql`
	query GetComments($input: CommentsInquiry!) {
		getComments(input: $input) {
			list {
				_id
				commentStatus
				commentGroup
				commentContent
				commentRefId
				memberId
				createdAt
				updatedAt
				memberData {
					_id
					memberType
					memberStatus
					memberAuthType
					memberPhone
					memberNick
					memberFullName
					memberImage
					memberAddress
					memberDesc
					memberWarnings
					memberBlocks
					memberPharmacies
					memberRank
					memberPoints
					memberLikes
					memberViews
					deletedAt
					createdAt
					updatedAt
					accessToken
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

/**************************
 *         FOLLOW        *
 *************************/
export const GET_MEMBER_FOLLOWERS = gql`
	query GetMemberFollowers($input: FollowInquiry!) {
		getMemberFollowers(input: $input) {
			list {
				_id
				followingId
				followerId
				createdAt
				updatedAt
				meLiked {
					memberId
					likeRefId
					myFavorite
				}
				meFollowed {
					followingId
					followerId
					myFollowing
				}
				followerData {
					_id
					memberType
					memberStatus
					memberAuthType
					memberPhone
					memberNick
					memberFullName
					memberImage
					memberAddress
					memberDesc
					memberPharmacies
					memberArticles
					memberPoints
					memberLikes
					memberViews
					memberComments
					memberFollowings
					memberFollowers
					memberRank
					memberWarnings
					memberBlocks
					deletedAt
					createdAt
					updatedAt
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_MEMBER_FOLLOWINGS = gql`
	query GetMemberFollowings($input: FollowInquiry!) {
		getMemberFollowings(input: $input) {
			list {
				_id
				followingId
				followerId
				createdAt
				updatedAt
				followingData {
					_id
					memberType
					memberStatus
					memberAuthType
					memberPhone
					memberNick
					memberFullName
					memberImage
					memberAddress
					memberDesc
					memberPharmacies
					memberArticles
					memberPoints
					memberLikes
					memberViews
					memberComments
					memberFollowings
					memberFollowers
					memberRank
					memberWarnings
					memberBlocks
					deletedAt
					createdAt
					updatedAt
					accessToken
				}
				meLiked {
					memberId
					likeRefId
					myFavorite
				}
				meFollowed {
					followingId
					followerId
					myFollowing
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

/**************************
 *        MESSAGE         *
 *************************/

export const GET_MY_MESSAGE_THREADS = gql`
	query GetMyMessageThreads($input: MessageThreadsInquiry!) {
		getMyMessageThreads(input: $input) {
			list {
				_id
				customerId
				ownerId
				pharmacyId
				lastMessageText
				lastMessageAt
				customerUnreadCount
				ownerUnreadCount
				myUnreadCount
				createdAt
				updatedAt
				customerData {
					_id
					memberPhone
					memberNick
					memberFullName
					memberImage
				}
				ownerData {
					_id
					memberPhone
					memberNick
					memberFullName
					memberImage
				}
				pharmacyData {
					_id
					pharmacyName
					pharmacyAddress
					pharmacyImages
					memberId
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_MESSAGES = gql`
	query GetMessages($input: MessagesInquiry!) {
		getMessages(input: $input) {
			list {
				_id
				messageStatus
				threadId
				senderId
				receiverId
				pharmacyId
				messageText
				messageImages
				readAt
				createdAt
				updatedAt
				senderData {
					_id
					memberNick
					memberFullName
					memberImage
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_UNREAD_MESSAGE_COUNT = gql`
	query GetUnreadMessageCount {
		getUnreadMessageCount
	}
`;
