import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
	return (
		<Html lang="en">
			<Head>
				<meta name="robots" content="index,follow" />
				<link rel="icon" type="image/svg+xml" href="/img/logo/favicon.svg" />

				{/* SEO */}
				<meta name="keyword" content={'quickmeds, quickmeds.uz, devex mern, mern nestjs fullstack'} />
				<meta
					name={'description'}
					content={'Discover trusted pharmacies, delivery options, insurance support, and essential pharmacy services with quickMeds.'}
				/>
			</Head>
			<body>
				<Main />
				<NextScript />
			</body>
		</Html>
	);
}
