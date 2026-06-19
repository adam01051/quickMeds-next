import React, { useState } from 'react';
import Link from 'next/link';
import { IconButton } from '@mui/material';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { REACT_APP_API_URL } from '../../config';
import { Member } from '../../types/member/member';

interface PharmacyOwnerCardProps {
	owner: Member;
	onLike: (ownerId: string) => Promise<void>;
	liking: boolean;
}

const PharmacyOwnerCard = ({ owner, onLike, liking }: PharmacyOwnerCardProps) => {
	const ownerName = owner.memberFullName || owner.memberNick;
	const [hasImage, setHasImage] = useState(Boolean(owner.memberImage));
	const image = owner.memberImage ? `${REACT_APP_API_URL}/${owner.memberImage}` : '';
	const isLiked = owner.meLiked?.[0]?.myFavorite === true;

	const useFallbackImage = (event: React.SyntheticEvent<HTMLImageElement>) => {
		event.currentTarget.onerror = null;
		setHasImage(false);
	};

	return (
		<article className="pharmacy-owner-card">
			<div className={`pharmacy-owner-card__media ${hasImage ? '' : 'is-fallback'}`}>
				{hasImage ? (
					<img src={image} alt={`${ownerName} profile`} onError={useFallbackImage} />
				) : (
					<div className="pharmacy-owner-card__identity" aria-label={`${ownerName} profile placeholder`}>
						<img src="/img/profile/defaultUser.svg" alt="" aria-hidden="true" />
						<span>{ownerName}</span>
						<small>Pharmacy Owner</small>
					</div>
				)}
				<span>
					<StorefrontOutlinedIcon />
					{owner.memberPharmacies ?? 0} {owner.memberPharmacies === 1 ? 'pharmacy' : 'pharmacies'}
				</span>
				<IconButton
					className="pharmacy-owner-card__like"
					aria-label={isLiked ? `Unlike ${ownerName}` : `Like ${ownerName}`}
					disabled={liking}
					onClick={() => onLike(owner._id)}
				>
					{isLiked ? <FavoriteRoundedIcon /> : <FavoriteBorderRoundedIcon />}
				</IconButton>
			</div>

			<div className="pharmacy-owner-card__body">
				<div className="pharmacy-owner-card__heading">
					<div>
						<h2>{ownerName}</h2>
						<p>Pharmacy Owner</p>
					</div>
					<div className="pharmacy-owner-card__stats" aria-label={`${owner.memberViews} views and ${owner.memberLikes} likes`}>
						<span><VisibilityOutlinedIcon /> {owner.memberViews ?? 0}</span>
						<span><FavoriteBorderRoundedIcon /> {owner.memberLikes ?? 0}</span>
					</div>
				</div>

				{owner.memberAddress && (
					<p className="pharmacy-owner-card__address">
						<LocationOnOutlinedIcon />
						{owner.memberAddress}
					</p>
				)}

				<Link href={`/agent/detail?agentId=${owner._id}`} className="pharmacy-owner-card__action">
					View owner profile
					<ArrowForwardRoundedIcon />
				</Link>
			</div>
		</article>
	);
};

export default PharmacyOwnerCard;
