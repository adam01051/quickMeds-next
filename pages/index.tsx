import { NextPage } from 'next';
import withLayoutMain from '../libs/components/layout/LayoutHome';
import { Stack } from '@mui/material';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import HomePharmacySection from '../libs/components/homepage/HomePharmacySection';
import HomeSupportingSections from '../libs/components/homepage/HomeSupportingSections';
import HomeTrendingSection from '../libs/components/homepage/HomeTrendingSection';
import { Direction } from '../libs/enums/common.enum';
import { useTranslation } from 'next-i18next';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const Home: NextPage = () => {
	const { t } = useTranslation('common');

	return (
		<Stack className={'home-page'}>
			<HomePharmacySection
				title={t('home.sections.featured.title')}
				description={t('home.sections.featured.description')}
				initialInput={{ page: 1, limit: 6, sort: 'pharmacyRank', direction: Direction.DESC, search: {} }}
				mobileOnly
			/>
			<HomeTrendingSection initialInput={{ page: 1, limit: 5, sort: 'pharmacyLikes', direction: Direction.DESC, search: {} }} />
			<HomeSupportingSections />
		</Stack>
	);
};

export default withLayoutMain(Home);
