import { useEffect, useState } from 'react';

const detectDevice = (): string => {
	if (typeof window === 'undefined') return 'desktop';
	const userAgent = navigator.userAgent;
	const isMobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
	const isMobileViewport = window.innerWidth <= 767;
	return isMobileUserAgent || isMobileViewport ? 'mobile' : 'desktop';
};

const useDeviceDetect = (): string => {
	const [device, setDevice] = useState('desktop');

	useEffect(() => {
		const updateDevice = () => setDevice(detectDevice());

		updateDevice();
		window.addEventListener('resize', updateDevice);
		return () => window.removeEventListener('resize', updateDevice);
	}, []);

	return device;
};

export default useDeviceDetect;
