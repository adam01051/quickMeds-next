import FacebookOutlinedIcon from '@mui/icons-material/FacebookOutlined';
import InstagramIcon from '@mui/icons-material/Instagram';
import TelegramIcon from '@mui/icons-material/Telegram';
import TwitterIcon from '@mui/icons-material/Twitter';
import { Stack, Box } from '@mui/material';
import moment from 'moment';
import BrandLogo from './common/BrandLogo';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';

const Footer = () => {
	const { t } = useTranslation('common');

	return (
		<Stack className={'footer-container'} component="footer">
			<Stack className={'main'}>
				<Stack className={'left'}>
					<Box component={'div'} className={'footer-box footer-box--brand'}>
						<BrandLogo variant="light" />
						<p>{t('footer.brandText')}</p>
					</Box>
					<Box component={'div'} className={'footer-box'}>
						<span>{t('footer.customerCare')}</span>
						<a href="tel:+821095535126">+82 10 9553 5126</a>
						<small>{t('footer.supportText')}</small>
					</Box>
					<Box component={'div'} className={'footer-box'}>
						<span>{t('footer.follow')}</span>
						<div className={'media-box'} aria-label={t('footer.socialAria')}>
							<span aria-label="Facebook"><FacebookOutlinedIcon /></span>
							<span aria-label="Telegram"><TelegramIcon /></span>
							<span aria-label="Instagram"><InstagramIcon /></span>
							<span aria-label="Twitter"><TwitterIcon /></span>
						</div>
					</Box>
				</Stack>
				<Stack className={'right'}>
					<Box component={'nav'} className={'bottom'} aria-label={t('footer.navigationAria')}>
						<div>
							<strong>{t('footer.discover')}</strong>
							<Link href="/pharmacies">{t('nav.pharmacies')}</Link>
							<Link href="/pharmacies?input=%7B%22page%22%3A1%2C%22limit%22%3A9%2C%22search%22%3A%7B%22hasDelivery%22%3Atrue%7D%7D">{t('footer.deliveryPharmacies')}</Link>
							<Link href="/pharmacies?input=%7B%22page%22%3A1%2C%22limit%22%3A9%2C%22search%22%3A%7B%22acceptsInsurance%22%3Atrue%7D%7D">{t('footer.insuranceSupport')}</Link>
						</div>
						<div>
							<strong>{t('footer.quickLinks')}</strong>
							<Link href="/community?articleCategory=FREE">{t('nav.community')}</Link>
							<Link href="/cs">{t('footer.support')}</Link>
							<Link href="/about">{t('footer.about')}</Link>
						</div>
						<div>
							<strong>{t('footer.regions')}</strong>
							<Link href="/pharmacies">{t('pharmacyLocation.TASHKENT_CITY')}</Link>
							<Link href="/pharmacies">{t('pharmacyLocation.SAMARKAND')}</Link>
							<Link href="/pharmacies">{t('pharmacyLocation.BUKHARA')}</Link>
						</div>
					</Box>
				</Stack>
			</Stack>
			<Stack className={'second'}>
				<span>{t('footer.copyright', { year: moment().year() })}</span>
				<span>{t('footer.legal')}</span>
			</Stack>
		</Stack>
	);
};

export default Footer;
