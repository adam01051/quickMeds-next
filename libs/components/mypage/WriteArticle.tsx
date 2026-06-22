import React from 'react';
import { NextPage } from 'next';
import dynamic from 'next/dynamic';
const TuiEditor = dynamic(() => import('../community/Teditor'), { ssr: false });

const WriteArticle: NextPage = () => {
	return (
		<div id="write-article-page">
			<TuiEditor />
		</div>
	);
};

export default WriteArticle;
