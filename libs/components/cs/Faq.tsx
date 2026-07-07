import React, { SyntheticEvent, useState } from 'react';
import MuiAccordion, { AccordionProps } from '@mui/material/Accordion';
import { AccordionDetails, Box, Stack, Typography } from '@mui/material';
import MuiAccordionSummary, { AccordionSummaryProps } from '@mui/material/AccordionSummary';
import { styled } from '@mui/material/styles';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import { useTranslation } from 'next-i18next';

const Accordion = styled((props: AccordionProps) => <MuiAccordion disableGutters elevation={0} square {...props} />)(
	({ theme }) => ({
		border: `1px solid ${theme.palette.divider}`,
		'&:not(:last-child)': {
			borderBottom: 0,
		},
		'&:before': {
			display: 'none',
		},
	}),
);

const AccordionSummary = styled((props: AccordionSummaryProps) => (
	<MuiAccordionSummary expandIcon={<KeyboardArrowDownRoundedIcon sx={{ fontSize: '1.4rem' }} />} {...props} />
))(({ theme }) => ({
	backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, .05)' : '#fff',
	'& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
		transform: 'rotate(180deg)',
	},
	'& .MuiAccordionSummary-content': {
		marginLeft: theme.spacing(1),
	},
}));

const categories = ['gettingStarted', 'pharmacySearch', 'messaging', 'account', 'pharmacyOwners'];

const data: Record<string, string[]> = {
	gettingStarted: ['faq-find-pharmacy-near-me', 'faq-search-name-address', 'faq-account-needed-browse'],
	pharmacySearch: ['faq-open-now', 'faq-delivery', 'faq-insurance', 'faq-stock-prices'],
	messaging: ['faq-contact-pharmacy', 'faq-message-location', 'faq-message-images', 'faq-own-pharmacy-message'],
	account: ['faq-save-like-pharmacy', 'faq-follow-member-owner', 'faq-comments', 'faq-wrong-info'],
	pharmacyOwners: ['faq-become-owner', 'faq-add-listing', 'faq-edit-listing'],
};

const Faq = () => {
	const { t } = useTranslation('common');
	const [category, setCategory] = useState<string>('gettingStarted');
	const [expanded, setExpanded] = useState<string | false>('faq-find-pharmacy-near-me');

	/** HANDLERS **/
	const changeCategoryHandler = (nextCategory: string) => {
		setCategory(nextCategory);
		setExpanded(data[nextCategory]?.[0] ?? false);
	};

	const handleChange = (panel: string) => (event: SyntheticEvent, newExpanded: boolean) => {
		setExpanded(newExpanded ? panel : false);
	};

	return (
		<Stack className={'faq-content'}>
			<Box className={'categories'} component={'div'}>
				{categories.map((item) => (
					<div
						key={item}
						className={category === item ? 'active' : ''}
						onClick={() => {
							changeCategoryHandler(item);
						}}
					>
						{t(`cs.faq.categories.${item}`)}
					</div>
				))}
			</Box>
			<Box className={'wrap'} component={'div'}>
				{data[category].map((ele) => (
					<Accordion expanded={expanded === ele} onChange={handleChange(ele)} key={ele}>
						<AccordionSummary id={`${ele}-header`} className="question" aria-controls={`${ele}-content`}>
							<Typography className="badge" variant={'h4'}>
								{t('cs.faq.badges.question')}
							</Typography>
							<Typography>{t(`cs.faq.items.${ele}.subject`)}</Typography>
						</AccordionSummary>
						<AccordionDetails>
							<Stack className={'answer flex-box'}>
								<Typography className="badge" variant={'h4'} color={'primary'}>
									{t('cs.faq.badges.answer')}
								</Typography>
								<Typography>{t(`cs.faq.items.${ele}.content`)}</Typography>
							</Stack>
						</AccordionDetails>
					</Accordion>
				))}
			</Box>
		</Stack>
	);
};

export default Faq;
