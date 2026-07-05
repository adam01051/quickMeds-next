import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@mui/material';
import TelegramIcon from '@mui/icons-material/Telegram';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import withLayoutBasic from '../../../libs/components/layout/LayoutBasic';
import { updateStorage, updateUserInfo } from '../../../libs/auth';
import { REACT_APP_API_URL } from '../../../libs/config';

export const getStaticProps = async ({ locale }: { locale?: string }) => ({
	props: {
		...(await serverSideTranslations(locale ?? 'en', ['common'])),
	},
});

const safeReturnTo = (returnTo: unknown): string => {
	if (typeof returnTo !== 'string' || !returnTo.startsWith('/') || returnTo.startsWith('//')) return '/';
	if (returnTo.startsWith('/_next') || returnTo.startsWith('/api') || returnTo.startsWith('/auth')) return '/';
	if (returnTo.startsWith('/account/join')) return '/';
	return returnTo;
};

const TelegramComplete: NextPage = () => {
	const router = useRouter();
	const [errorMessage, setErrorMessage] = useState('');

	useEffect(() => {
		if (!router.isReady) return;

		const ticket = typeof router.query.ticket === 'string' ? router.query.ticket : '';
		if (!ticket) {
			setErrorMessage('Telegram login could not be completed. Please try again.');
			return;
		}

		let cancelled = false;

		const completeTelegramLogin = async () => {
			try {
				const response = await fetch(`${REACT_APP_API_URL}/auth/telegram/exchange`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ ticket }),
				});

				if (!response.ok) throw new Error('Telegram login session expired. Please try again.');

				const result = await response.json();
				if (!result?.accessToken) throw new Error('QuickMeds did not receive a valid login token.');

				updateStorage({ jwtToken: result.accessToken });
				updateUserInfo(result.accessToken);

				if (!cancelled) await router.replace(safeReturnTo(result.returnTo));
			} catch (error: unknown) {
				if (!cancelled) {
					setErrorMessage(error instanceof Error ? error.message : 'Telegram login failed. Please try again.');
				}
			}
		};

		completeTelegramLogin();

		return () => {
			cancelled = true;
		};
	}, [router]);

	return (
		<main className="telegram-complete">
			<section className="telegram-complete__panel" aria-live="polite">
				<div className="telegram-complete__icon">
					<TelegramIcon />
				</div>
				{errorMessage ? (
					<>
						<p>Telegram login</p>
						<h1>We could not finish signing you in</h1>
						<span>{errorMessage}</span>
						<Link href="/account/join" passHref legacyBehavior>
							<Button component="a" className="telegram-complete__action">
								Back to login
							</Button>
						</Link>
					</>
				) : (
					<>
						<p>Telegram login</p>
						<h1>Signing you in...</h1>
						<span>QuickMeds is completing your secure Telegram login.</span>
					</>
				)}
			</section>
		</main>
	);
};

export default withLayoutBasic(TelegramComplete);
