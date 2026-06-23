import React, { SyntheticEvent, useState } from 'react';
import MuiAccordion, { AccordionProps } from '@mui/material/Accordion';
import { AccordionDetails, Box, Stack, Typography } from '@mui/material';
import MuiAccordionSummary, { AccordionSummaryProps } from '@mui/material/AccordionSummary';
import { styled } from '@mui/material/styles';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';

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

const categories = [
	{ key: 'gettingStarted', label: 'Getting Started' },
	{ key: 'pharmacySearch', label: 'Pharmacy Search' },
	{ key: 'messaging', label: 'Messaging' },
	{ key: 'account', label: 'Account' },
	{ key: 'pharmacyOwners', label: 'Pharmacy Owners' },
];

const data: Record<string, { id: string; subject: string; content: string }[]> = {
	gettingStarted: [
		{
			id: 'faq-find-pharmacy-near-me',
			subject: 'How do I find a pharmacy near me?',
			content:
				'Use the Pharmacies page to search by name, address, region, pharmacy type, delivery support, insurance support, and opening status when available.',
		},
		{
			id: 'faq-search-name-address',
			subject: 'Can I search by pharmacy name or address?',
			content:
				'Yes. Type a pharmacy name, street, district, or landmark into the search field and QuickMeds will match available pharmacy profiles.',
		},
		{
			id: 'faq-account-needed-browse',
			subject: 'Do I need an account to browse pharmacies?',
			content:
				'No. You can browse public pharmacy listings without signing in. Some actions, such as messaging, following, liking, and commenting, require an account.',
		},
	],
	pharmacySearch: [
		{
			id: 'faq-open-now',
			subject: 'What does "Open now" mean?',
			content:
				"Open status is calculated from the pharmacy's saved working hours and timezone. If hours are missing, QuickMeds does not assume the pharmacy is open.",
		},
		{
			id: 'faq-delivery',
			subject: 'How do I know if a pharmacy offers delivery?',
			content:
				'Pharmacy cards and detail pages show whether delivery is available and, when provided, the delivery fee in UZS.',
		},
		{
			id: 'faq-insurance',
			subject: 'How do I know if a pharmacy accepts insurance?',
			content:
				'Look for the insurance information on the pharmacy card or pharmacy detail page. Confirm directly with the pharmacy before visiting.',
		},
		{
			id: 'faq-stock-prices',
			subject: 'Can QuickMeds confirm medicine stock or prices?',
			content:
				'Not yet. QuickMeds helps you discover and contact pharmacies. Please message or call the pharmacy to confirm current medicine availability and prices.',
		},
	],
	messaging: [
		{
			id: 'faq-contact-pharmacy',
			subject: 'How do I contact a pharmacy?',
			content: 'Open the pharmacy detail page and use the message form or available contact details.',
		},
		{
			id: 'faq-message-location',
			subject: 'Where do my pharmacy messages appear?',
			content: 'Signed-in users can see pharmacy conversations in My Page under Messages.',
		},
		{
			id: 'faq-message-images',
			subject: 'Can I send images in a pharmacy message?',
			content: 'Yes, where messaging is available, you can attach supported image files along with your message.',
		},
		{
			id: 'faq-own-pharmacy-message',
			subject: "Why can't I message my own pharmacy?",
			content: 'Pharmacy Owners cannot start customer conversations with their own pharmacy listing.',
		},
	],
	account: [
		{
			id: 'faq-save-like-pharmacy',
			subject: 'How do I save or like a pharmacy?',
			content:
				'Sign in, then use the heart action on pharmacy cards or detail pages. Saved pharmacies appear in your account areas where supported.',
		},
		{
			id: 'faq-follow-member-owner',
			subject: 'How do I follow a member or Pharmacy Owner?',
			content: 'Open their public profile and use Follow. You can manage followers and followings from My Page.',
		},
		{
			id: 'faq-comments',
			subject: 'Can I leave comments on a pharmacy?',
			content:
				'Yes, signed-in users can comment on pharmacy detail pages where comments are enabled. Keep comments relevant and respectful.',
		},
		{
			id: 'faq-wrong-info',
			subject: 'What should I do if information looks wrong?',
			content:
				'Contact the pharmacy directly for urgent questions. For platform or listing issues, use QuickMeds support/admin contact channels when available.',
		},
	],
	pharmacyOwners: [
		{
			id: 'faq-become-owner',
			subject: 'How do I become a Pharmacy Owner?',
			content:
				'Sign in and use the Pharmacy Owner option in My Page. Once approved or enabled, you can add and manage pharmacy listings.',
		},
		{
			id: 'faq-add-listing',
			subject: 'How do I add a pharmacy listing?',
			content:
				'Pharmacy Owners can go to My Page, choose Add Pharmacy, complete the required pharmacy details, upload images, and save the listing.',
		},
		{
			id: 'faq-edit-listing',
			subject: 'Can I edit my pharmacy after publishing it?',
			content: 'Yes. Pharmacy Owners can manage existing listings from My Page under My Pharmacies.',
		},
	],
};

const Faq = () => {
	const [category, setCategory] = useState<string>('gettingStarted');
	const [expanded, setExpanded] = useState<string | false>('faq-find-pharmacy-near-me');

	/** HANDLERS **/
	const changeCategoryHandler = (nextCategory: string) => {
		setCategory(nextCategory);
		setExpanded(data[nextCategory]?.[0]?.id ?? false);
	};

	const handleChange = (panel: string) => (event: SyntheticEvent, newExpanded: boolean) => {
		setExpanded(newExpanded ? panel : false);
	};

	return (
		<Stack className={'faq-content'}>
			<Box className={'categories'} component={'div'}>
				{categories.map((item) => (
					<div
						key={item.key}
						className={category === item.key ? 'active' : ''}
						onClick={() => {
							changeCategoryHandler(item.key);
						}}
					>
						{item.label}
					</div>
				))}
			</Box>
			<Box className={'wrap'} component={'div'}>
				{data[category].map((ele) => (
					<Accordion expanded={expanded === ele.id} onChange={handleChange(ele.id)} key={ele.id}>
						<AccordionSummary id={`${ele.id}-header`} className="question" aria-controls={`${ele.id}-content`}>
							<Typography className="badge" variant={'h4'}>
								Q
							</Typography>
							<Typography>{ele.subject}</Typography>
						</AccordionSummary>
						<AccordionDetails>
							<Stack className={'answer flex-box'}>
								<Typography className="badge" variant={'h4'} color={'primary'}>
									A
								</Typography>
								<Typography>{ele.content}</Typography>
							</Stack>
						</AccordionDetails>
					</Accordion>
				))}
			</Box>
		</Stack>
	);
};

export default Faq;
