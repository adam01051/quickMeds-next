import decodeJWT from 'jwt-decode';
import { ApolloError } from '@apollo/client';
import { initializeApollo } from '../../apollo/client';
import { userVar } from '../../apollo/store';
import { CustomJwtPayload } from '../types/customJwtPayload';
import { LOGIN, SIGN_UP } from '../../apollo/user/mutation';

const AUTH_ERROR_MESSAGES: Record<string, string> = {
	'No member with that member nick!': 'No account was found with that nickname.',
	'Wrong password, try again!': 'The password is incorrect. Please try again.',
	'You have been blocked!': 'This account has been blocked.',
	'The member nick is already in use, please choose another one!': 'That nickname or phone number is already in use.',
};

const normalizeAuthError = (error: unknown): Error => {
	if (error instanceof ApolloError) {
		if (error.graphQLErrors.length > 0) {
			const message = error.graphQLErrors[0]?.message;
			if (typeof message === 'string') return new Error(AUTH_ERROR_MESSAGES[message] ?? message);
		}

		if (error.networkError) {
			return new Error('Unable to connect to QuickMeds. Please try again shortly.');
		}
	}

	if (error instanceof Error && error.message) return error;
	return new Error('Authentication failed. Please try again.');
};

export function getJwtToken(): any {
	if (typeof window !== 'undefined') {
		return localStorage.getItem('accessToken') ?? '';
	}
}

export function setJwtToken(token: string) {
	localStorage.setItem('accessToken', token);
}

export const logIn = async (nick: string, password: string): Promise<void> => {
	try {
		const { jwtToken } = await requestJwtToken({ nick, password });

		if (jwtToken) {
			updateStorage({ jwtToken });
			updateUserInfo(jwtToken);
		}
	} catch (error: unknown) {
		throw normalizeAuthError(error);
	}
};

const requestJwtToken = async ({
	nick,
	password,
}: {
	nick: string;
	password: string;
}): Promise<{ jwtToken: string }> => {
	const apolloClient = await initializeApollo();
	const result = await apolloClient.mutate({
		mutation: LOGIN,
		variables: { input: { memberNick: nick, memberPassword: password } },
		fetchPolicy: 'network-only',
		context: { suppressGlobalErrorAlert: true },
	});
	const accessToken = result?.data?.login?.accessToken;

	if (!accessToken) throw new Error('The login response did not include an access token.');
	return { jwtToken: accessToken };
};

export const signUp = async (nick: string, password: string, phone: string, type: string): Promise<void> => {
	try {
		const { jwtToken } = await requestSignUpJwtToken({ nick, password, phone, type });

		if (jwtToken) {
			updateStorage({ jwtToken });
			updateUserInfo(jwtToken);
		}
	} catch (error: unknown) {
		throw normalizeAuthError(error);
	}
};

const requestSignUpJwtToken = async ({
	nick,
	password,
	phone,
	type,
}: {
	nick: string;
	password: string;
	phone: string;
	type: string;
}): Promise<{ jwtToken: string }> => {
	const apolloClient = await initializeApollo();
	const result = await apolloClient.mutate({
		mutation: SIGN_UP,
		variables: {
			input: { memberNick: nick, memberPassword: password, memberPhone: phone, memberType: type },
		},
		fetchPolicy: 'network-only',
		context: { suppressGlobalErrorAlert: true },
	});
	const accessToken = result?.data?.signup?.accessToken;

	if (!accessToken) throw new Error('The signup response did not include an access token.');
	return { jwtToken: accessToken };
};

export const updateStorage = ({ jwtToken }: { jwtToken: any }) => {
	setJwtToken(jwtToken);
	window.localStorage.setItem('login', Date.now().toString());
};

export const updateUserInfo = (jwtToken: any) => {
	if (!jwtToken) return false;

	const claims = decodeJWT<CustomJwtPayload>(jwtToken);
	userVar({
		_id: claims._id ?? '',
		memberType: claims.memberType ?? '',
		memberStatus: claims.memberStatus ?? '',
		memberAuthType: claims.memberAuthType,
		memberPhone: claims.memberPhone ?? '',
		memberNick: claims.memberNick ?? '',
		memberFullName: claims.memberFullName ?? '',
		memberImage:
			claims.memberImage === null || claims.memberImage === undefined
				? '/img/profile/defaultUser.svg'
				: `${claims.memberImage}`,
		memberAddress: claims.memberAddress ?? '',
		memberDesc: claims.memberDesc ?? '',
		memberPharmacies: claims.memberPharmacies,
		memberRank: claims.memberRank,
		memberArticles: claims.memberArticles,
		memberPoints: claims.memberPoints,
		memberLikes: claims.memberLikes,
		memberViews: claims.memberViews,
		memberWarnings: claims.memberWarnings,
		memberBlocks: claims.memberBlocks,
	});
};

export const logOut = () => {
	deleteStorage();
	deleteUserInfo();
	window.location.reload();
};

const deleteStorage = () => {
	localStorage.removeItem('accessToken');
	window.localStorage.setItem('logout', Date.now().toString());
};

const deleteUserInfo = () => {
	userVar({
		_id: '',
		memberType: '',
		memberStatus: '',
		memberAuthType: '',
		memberPhone: '',
		memberNick: '',
		memberFullName: '',
		memberImage: '',
		memberAddress: '',
		memberDesc: '',
		memberPharmacies: 0,
		memberRank: 0,
		memberArticles: 0,
		memberPoints: 0,
		memberLikes: 0,
		memberViews: 0,
		memberWarnings: 0,
		memberBlocks: 0,
	});
};
