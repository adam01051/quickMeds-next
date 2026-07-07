import React, { FormEvent, useEffect, useState } from 'react';
import { NextPage } from 'next';
import { Button } from '@mui/material';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import LocalPharmacyOutlinedIcon from '@mui/icons-material/LocalPharmacyOutlined';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import TelegramIcon from '@mui/icons-material/Telegram';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import BrandLogo from '../../libs/components/common/BrandLogo';
import { logIn, signUp } from '../../libs/auth';
import { REACT_APP_API_URL } from '../../libs/config';

export const getStaticProps = async ({ locale }: { locale?: string }) => ({
	props: {
		...(await serverSideTranslations(locale ?? 'en', ['common'])),
	},
});

type AccountMode = 'login' | 'signup';
type AccountType = 'USER' | 'AGENT';

const safeReferrer = (referrer: string | string[] | undefined): string => {
	if (typeof referrer !== 'string' || !referrer.startsWith('/') || referrer.startsWith('//')) return '/';
	if (referrer.startsWith('/_next') || referrer.startsWith('/api') || referrer.startsWith('/auth')) return '/';
	if (referrer.startsWith('/account/join')) return '/';
	return referrer;
};

const Join: NextPage = () => {
	const router = useRouter();
	const { t } = useTranslation('common');
	const [mode, setMode] = useState<AccountMode>('login');
	const [input, setInput] = useState({ nick: '', password: '', phone: '', type: 'USER' as AccountType });
	const [showPassword, setShowPassword] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isTelegramRedirecting, setIsTelegramRedirecting] = useState(false);
	const [errorMessage, setErrorMessage] = useState('');

	useEffect(() => {
		if (!router.isReady) return;
		setMode(router.query.mode === 'signup' ? 'signup' : 'login');
		setErrorMessage('');
	}, [router.isReady, router.query.mode]);

	const changeMode = async (nextMode: AccountMode) => {
		setErrorMessage('');
		setMode(nextMode);
		const query = nextMode === 'signup' ? { ...router.query, mode: 'signup' } : { ...router.query };
		if (nextMode === 'login') delete query.mode;
		await router.push({ pathname: '/account/join', query }, undefined, { shallow: true, scroll: false });
	};

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (isSubmitting) return;

		setErrorMessage('');
		setIsSubmitting(true);
		try {
			if (mode === 'login') {
				await logIn(input.nick.trim(), input.password);
			} else {
				await signUp(input.nick.trim(), input.password, input.phone.trim(), input.type);
			}
			await router.push(safeReferrer(router.query.referrer));
		} catch (error: unknown) {
			setErrorMessage(error instanceof Error ? error.message : t('auth.join.errors.authenticationFailed'));
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleTelegramLogin = () => {
		if (isTelegramRedirecting) return;
		setErrorMessage('');
		setIsTelegramRedirecting(true);
		const returnTo = safeReferrer(router.query.referrer);
		window.location.assign(`${REACT_APP_API_URL}/auth/telegram/start?returnTo=${encodeURIComponent(returnTo)}`);
	};

	const isSignup = mode === 'signup';
	const isDisabled =
		isSubmitting || input.nick.trim() === '' || input.password === '' || (isSignup && input.phone.trim() === '');
	const visualItems = t('auth.join.visual.items', { returnObjects: true }) as string[];

	return (
		<main className="join-page">
			<div className="join-page__container">
				<section className="join-page__panel" aria-labelledby="account-title">
					<div className="join-page__form-side">
					

						<div className="join-page__mode-tabs" aria-label={t('auth.join.tabsAria')}>
							<button type="button" className={mode === 'login' ? 'active' : ''} onClick={() => changeMode('login')}>
								{t('auth.tabs.login')}
							</button>
							<button type="button" className={isSignup ? 'active' : ''} onClick={() => changeMode('signup')}>
								{t('auth.tabs.register')}
							</button>
						</div>

						<header className="join-page__header">
							<p>{t(isSignup ? 'auth.join.signup.eyebrow' : 'auth.join.login.eyebrow')}</p>
							<h1 id="account-title">{t(isSignup ? 'auth.join.signup.title' : 'auth.join.login.title')}</h1>
							<span>
								{t(isSignup ? 'auth.join.signup.description' : 'auth.join.login.description')}
							</span>
						</header>

						<form className="join-page__form" onSubmit={handleSubmit}>
							<label>
								<span>{t('auth.join.fields.nickname')}</span>
								<input
									type="text"
									value={input.nick}
									onChange={(event) => setInput((current) => ({ ...current, nick: event.target.value }))}
									placeholder={t('auth.join.fields.nicknamePlaceholder')}
									autoComplete="username"
									required
								/>
							</label>

							<label>
								<span>{t('auth.join.fields.password')}</span>
								<div className="join-page__password">
									<input
										type={showPassword ? 'text' : 'password'}
										value={input.password}
										onChange={(event) => setInput((current) => ({ ...current, password: event.target.value }))}
										placeholder={t('auth.join.fields.passwordPlaceholder')}
										autoComplete={isSignup ? 'new-password' : 'current-password'}
										required
									/>
									<button
										type="button"
										onClick={() => setShowPassword((current) => !current)}
										aria-label={t(showPassword ? 'auth.join.password.hide' : 'auth.join.password.show')}
										aria-pressed={showPassword}
									>
										{showPassword ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}
									</button>
								</div>
							</label>

							{isSignup && (
								<>
									<label>
										<span>{t('auth.join.fields.phone')}</span>
										<input
											type="tel"
											value={input.phone}
											onChange={(event) => setInput((current) => ({ ...current, phone: event.target.value }))}
											placeholder={t('auth.join.fields.phonePlaceholder')}
											autoComplete="tel"
											required
										/>
									</label>

									<fieldset className="join-page__roles">
										<legend>{t('auth.join.roles.legend')}</legend>
										<label className={input.type === 'USER' ? 'selected' : ''}>
											<input
												type="radio"
												name="accountType"
												value="USER"
												checked={input.type === 'USER'}
												onChange={() => setInput((current) => ({ ...current, type: 'USER' }))}
											/>
											<PersonOutlineRoundedIcon />
											<span>
												<strong>{t('auth.join.roles.user')}</strong>
												<small>{t('auth.join.roles.userDescription')}</small>
											</span>
										</label>
										<label className={input.type === 'AGENT' ? 'selected' : ''}>
											<input
												type="radio"
												name="accountType"
												value="AGENT"
												checked={input.type === 'AGENT'}
												onChange={() => setInput((current) => ({ ...current, type: 'AGENT' }))}
											/>
											<LocalPharmacyOutlinedIcon />
											<span>
												<strong>{t('auth.join.roles.agent')}</strong>
												<small>{t('auth.join.roles.agentDescription')}</small>
											</span>
										</label>
									</fieldset>
								</>
							)}

							{errorMessage && (
								<p className="join-page__error" role="alert">
									{errorMessage}
								</p>
							)}

							<Button type="submit" variant="contained" disabled={isDisabled} className="join-page__submit">
								{isSubmitting
									? isSignup
										? t('auth.join.actions.creatingAccount')
										: t('auth.join.actions.loggingIn')
									: isSignup
										? t('auth.join.actions.createAccount')
										: t('auth.join.actions.login')}
							</Button>
						</form>

						<div className="join-page__divider" aria-hidden="true">
							<span>{t('auth.join.divider')}</span>
						</div>

						<button
							type="button"
							className="join-page__telegram"
							onClick={handleTelegramLogin}
							disabled={isTelegramRedirecting}
						>
							<TelegramIcon />
							<span>{isTelegramRedirecting ? t('auth.join.actions.openingTelegram') : t('auth.join.actions.continueTelegram')}</span>
						</button>

						<p className="join-page__switch">
							{t(isSignup ? 'auth.join.switch.toLoginPrompt' : 'auth.join.switch.toSignupPrompt')}
							<button type="button" onClick={() => changeMode(isSignup ? 'login' : 'signup')}>
								{t(isSignup ? 'auth.join.switch.toLoginAction' : 'auth.join.switch.toSignupAction')}
							</button>
						</p>
					</div>

					<aside className="join-page__visual" aria-label={t('auth.join.visual.aria')}>
						<img src="/img/homepage/pharmacy-hero.webp" alt={t('auth.join.visual.imageAlt')} />
						<div>
							<p>{t('auth.join.visual.eyebrow')}</p>
							<h2>{t('auth.join.visual.title')}</h2>
							<ul>
								{visualItems.map((item) => (
									<li key={item}><CheckCircleOutlineRoundedIcon /> {item}</li>
								))}
							</ul>
						</div>
					</aside>
				</section>
			</div>
		</main>
	);
};

export default withLayoutBasic(Join);
