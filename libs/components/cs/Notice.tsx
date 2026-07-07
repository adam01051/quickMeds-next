import React from 'react';
import { Stack } from '@mui/material';
import { useTranslation } from 'next-i18next';

const Notice = () => {
	const { t } = useTranslation('common');

	/** APOLLO REQUESTS **/
	/** LIFECYCLES **/
	/** HANDLERS **/

	return (
		<Stack className={'notice-content'}>
			<span className={'title'}>{t('cs.notice.title')}</span>
			<Stack className={'main'}>
				<Stack className={'bottom'}>
					<div className={'notice-card'}>
						<span className={'notice-number'}>{t('cs.notice.badge')}</span>
						<span className={'notice-title'}>{t('cs.notice.emptyTitle')}</span>
						<span className={'notice-date'}>{t('cs.notice.updated')}</span>
					</div>
				</Stack>
			</Stack>
		</Stack>
	);
};

export default Notice;
