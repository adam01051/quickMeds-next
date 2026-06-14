import React from 'react';

type BrandLogoProps = {
	variant?: 'dark' | 'light';
	iconOnly?: boolean;
	className?: string;
};

const BrandLogo = ({ variant = 'dark', iconOnly = false, className = '' }: BrandLogoProps) => {
	const textColor = variant === 'light' ? '#FFFFFF' : '#181A20';

	return (
		<span
			className={`brand-logo ${iconOnly ? 'brand-logo--icon-only' : ''} ${className}`.trim()}
			aria-label="quickMeds"
			role={iconOnly ? 'img' : undefined}
		>
			<svg className="brand-logo__mark" viewBox="0 0 48 48" aria-hidden="true">
				<rect width="48" height="48" rx="14" fill="#1C9A92" />
				<path
					d="M24 9.5c2.2 0 4 1.8 4 4V20h6.5a4 4 0 0 1 0 8H28v6.5a4 4 0 0 1-8 0V28h-6.5a4 4 0 0 1 0-8H20v-6.5c0-2.2 1.8-4 4-4Z"
					fill="#FFFFFF"
				/>
				<g transform="rotate(-38 34 34)">
					<rect x="26.5" y="30" width="15" height="8" rx="4" fill="#064E3B" stroke="#FFFFFF" strokeWidth="2" />
					<path d="M34 30v8" stroke="#FFFFFF" strokeWidth="2" />
				</g>
			</svg>
			{!iconOnly && (
				<span className="brand-logo__wordmark" style={{ color: textColor }}>
					<span>quick</span>
					<span className="brand-logo__meds">Meds</span>
				</span>
			)}
		</span>
	);
};

export default BrandLogo;
