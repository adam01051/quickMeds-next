import { gql } from '@apollo/client';

/**************************
 *         MEMBER         *
 *************************/

export const UPDATE_MEMBER_BY_ADMIN = gql`
	mutation UpdateMemberByAdmin($input: MemberUpdate!) {
		updateMemberByAdmin(input: $input) {
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
			memberRank
			memberArticles
			memberPoints
			memberLikes
			memberViews
			memberWarnings
			memberBlocks
			deletedAt
			createdAt
			updatedAt
			accessToken
		}
	}
`;

/**************************
 *        PHARMACY        *
 *************************/

export const UPDATE_PHARMACY_BY_ADMIN = gql`
	mutation UpdatePharmacyByAdmin($input: PharmacyUpdate!) {
		updatePharmacyByAdmin(input: $input) {
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
	}
`;

export const REMOVE_PHARMACY_BY_ADMIN = gql`
	mutation RemovePharmacyByAdmin($input: String!) {
		removePharmacyByAdmin(pharmacyId: $input) {
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
	}
`;

/**************************
 *      BOARD-ARTICLE     *
 *************************/

export const UPDATE_BOARD_ARTICLE_BY_ADMIN = gql`
	mutation UpdateBoardArticleByAdmin($input: BoardArticleUpdate!) {
		updateBoardArticleByAdmin(input: $input) {
			_id
			articleCategory
			articleStatus
			articleTitle
			articleContent
			articleImage
			articleViews
			articleLikes
			memberId
			createdAt
			updatedAt
		}
	}
`;

export const REMOVE_BOARD_ARTICLE_BY_ADMIN = gql`
	mutation RemoveBoardArticleByAdmin($input: String!) {
		removeBoardArticleByAdmin(articleId: $input) {
			_id
			articleCategory
			articleStatus
			articleTitle
			articleContent
			articleImage
			articleViews
			articleLikes
			memberId
			createdAt
			updatedAt
		}
	}
`;

/**************************
 *         COMMENT        *
 *************************/

export const REMOVE_COMMENT_BY_ADMIN = gql`
	mutation RemoveCommentByAdmin($input: String!) {
		removeCommentByAdmin(commentId: $input) {
			_id
			commentStatus
			commentGroup
			commentContent
			commentRefId
			memberId
			createdAt
			updatedAt
		}
	}
`;
