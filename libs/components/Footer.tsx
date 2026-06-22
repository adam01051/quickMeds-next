import FacebookOutlinedIcon from '@mui/icons-material/FacebookOutlined';
import InstagramIcon from '@mui/icons-material/Instagram';
import TelegramIcon from '@mui/icons-material/Telegram';
import TwitterIcon from '@mui/icons-material/Twitter';
import { Stack, Box } from '@mui/material';
import moment from 'moment';
import BrandLogo from './common/BrandLogo';
import Link from 'next/link';

const Footer = () => {
	return (
		<Stack className={'footer-container'} component="footer">
			<Stack className={'main'}>
				<Stack className={'left'}>
					<Box component={'div'} className={'footer-box footer-box--brand'}>
						<BrandLogo variant="light" />
						<p>Find trusted pharmacies, delivery options, insurance support, and useful community guidance across Uzbekistan.</p>
					</Box>
					<Box component={'div'} className={'footer-box'}>
						<span>Customer care</span>
						<a href="tel:+821095535126">+82 10 9553 5126</a>
						<small>Support for pharmacy discovery and account questions.</small>
					</Box>
					<Box component={'div'} className={'footer-box'}>
						<span>Follow QuickMeds</span>
						<div className={'media-box'} aria-label="QuickMeds social links">
							<span aria-label="Facebook"><FacebookOutlinedIcon /></span>
							<span aria-label="Telegram"><TelegramIcon /></span>
							<span aria-label="Instagram"><InstagramIcon /></span>
							<span aria-label="Twitter"><TwitterIcon /></span>
						</div>
					</Box>
				</Stack>
				<Stack className={'right'}>
					<Box component={'nav'} className={'bottom'} aria-label="Footer navigation">
						<div>
							<strong>Discover</strong>
							<Link href="/pharmacies">Pharmacies</Link>
							<Link href="/pharmacies?input=%7B%22page%22%3A1%2C%22limit%22%3A9%2C%22search%22%3A%7B%22hasDelivery%22%3Atrue%7D%7D">Delivery pharmacies</Link>
							<Link href="/pharmacies?input=%7B%22page%22%3A1%2C%22limit%22%3A9%2C%22search%22%3A%7B%22acceptsInsurance%22%3Atrue%7D%7D">Insurance support</Link>
						</div>
						<div>
							<strong>Quick links</strong>
							<Link href="/community?articleCategory=FREE">Community</Link>
							<Link href="/cs">Support</Link>
							<Link href="/about">About QuickMeds</Link>
						</div>
						<div>
							<strong>Regions</strong>
							<Link href="/pharmacies">Tashkent</Link>
							<Link href="/pharmacies">Samarkand</Link>
							<Link href="/pharmacies">Bukhara</Link>
						</div>
					</Box>
				</Stack>
			</Stack>
			<Stack className={'second'}>
				<span>© {moment().year()} QuickMeds. All rights reserved.</span>
				<span>Privacy · Terms · Sitemap</span>
			</Stack>
		</Stack>
	);
};

export default Footer;
