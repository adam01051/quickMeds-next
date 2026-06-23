import React from 'react';
import { Stack } from '@mui/material';

const Notice = () => {
	/** APOLLO REQUESTS **/
	/** LIFECYCLES **/
	/** HANDLERS **/

	return (
		<Stack className={'notice-content'}>
			<span className={'title'}>Notice</span>
			<Stack className={'main'}>
				<Stack className={'bottom'}>
					<div className={'notice-card'}>
						<span className={'notice-number'}>Info</span>
						<span className={'notice-title'}>No platform notices right now. Check FAQ for common questions.</span>
						<span className={'notice-date'}>Updated as needed</span>
					</div>
				</Stack>
			</Stack>
		</Stack>
	);
};

export default Notice;
