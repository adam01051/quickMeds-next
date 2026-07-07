import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@mui/material';
import TelegramIcon from '@mui/icons-material/Telegram';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
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
	const { t } = useTranslation('common');
	const [errorMessage, setErrorMessage] = useState('');

	useEffect(() => {
		if (!router.isReady) return;

		const ticket = typeof router.query.ticket === 'string' ? router.query.ticket : '';
		if (!ticket) {
			setErrorMessage(t('auth.telegramComplete.errors.missingTicket'));
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

				if (!response.ok) throw new Error(t('auth.telegramComplete.errors.expired'));

				const result = await response.json();
				if (!result?.accessToken) throw new Error(t('auth.telegramComplete.errors.missingToken'));

				updateStorage({ jwtToken: result.accessToken });
				updateUserInfo(result.accessToken);

				if (!cancelled) await router.replace(safeReturnTo(result.returnTo));
			} catch (error: unknown) {
				if (!cancelled) {
					setErrorMessage(error instanceof Error ? error.message : t('auth.telegramComplete.errors.failed'));
				}
			}
		};

		completeTelegramLogin();

		return () => {
			cancelled = true;
		};
	}, [router, t]);

	return (
		<main className="telegram-complete">
			<section className="telegram-complete__panel" aria-live="polite">
				<div className="telegram-complete__icon">
					<TelegramIcon />
				</div>
				{errorMessage ? (
					<>
						<p>{t('auth.telegramComplete.label')}</p>
						<h1>{t('auth.telegramComplete.errorTitle')}</h1>
						<span>{errorMessage}</span>
						<Link href="/account/join" passHref legacyBehavior>
							<Button component="a" className="telegram-complete__action">
								{t('auth.telegramComplete.backToLogin')}
							</Button>
						</Link>
					</>
				) : (
					<>
						<p>{t('auth.telegramComplete.label')}</p>
						<h1>{t('auth.telegramComplete.loadingTitle')}</h1>
						<span>{t('auth.telegramComplete.loadingDescription')}</span>
					</>
				)}
			</section>
		</main>
	);
};

export default withLayoutBasic(TelegramComplete);
