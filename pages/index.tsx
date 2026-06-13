import { NextPage } from 'next';
import withLayoutMain from '../libs/components/layout/LayoutHome';
import { Stack } from '@mui/material';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import HomePharmacySection from '../libs/components/homepage/HomePharmacySection';
import HomeSupportingSections from '../libs/components/homepage/HomeSupportingSections';
import { Direction } from '../libs/enums/common.enum';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const Home: NextPage = () => {
	return (
		<Stack className={'home-page'}>
			<HomePharmacySection
				title="Featured pharmacies"
				description="Highly ranked pharmacies ready to support everyday care."
				initialInput={{ page: 1, limit: 6, sort: 'pharmacyRank', direction: Direction.DESC, search: {} }}
			/>
			<HomePharmacySection
				title="Popular choices"
				description="Pharmacies people are viewing most across supported areas."
				tone="soft"
				initialInput={{ page: 1, limit: 6, sort: 'pharmacyViews', direction: Direction.DESC, search: {} }}
			/>
			<HomeSupportingSections />
		</Stack>
	);
};

export default withLayoutMain(Home);
