import React from 'react';
import { Comment } from '../../types/comment/comment';
import { REACT_APP_API_URL } from '../../config';
import Moment from 'react-moment';
import { useRouter } from 'next/router';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';

interface ReviewProps {
	comment: Comment;
}

const Review = (props: ReviewProps) => {
	const { comment } = props;
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const imagePath: string = comment?.memberData?.memberImage
		? `${REACT_APP_API_URL}/${comment?.memberData?.memberImage}`
		: '/img/profile/defaultUser.svg';

	/** HANDLERS **/
	const goMemberPage = (id: string) => {
		if (id === user?._id) router.push('/mypage');
		else router.push(`/member?memberId=${id}`);
	};

	const memberName = comment.memberData?.memberNick ?? 'QuickMeds member';
	const memberId = comment.memberData?._id;

	return (
		<article className="pharmacy-feedback-card">
			<header className="pharmacy-feedback-card__author">
				<img src={imagePath} alt={`${memberName} profile`} />
				<div>
					{memberId ? (
						<button type="button" onClick={() => goMemberPage(memberId)}>
							{memberName}
						</button>
					) : (
						<strong>{memberName}</strong>
					)}
					<p>
						Commented <Moment format="DD MMMM YYYY">{comment.createdAt}</Moment>
					</p>
				</div>
			</header>
			<p className="pharmacy-feedback-card__content">{comment.commentContent}</p>
		</article>
	);
};

export default Review;
