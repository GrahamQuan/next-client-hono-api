export interface TurnstileRenderOptions {
	sitekey: string;
	theme?: 'light' | 'dark' | 'auto';
	size?: 'normal' | 'compact';
	appearance?: 'always' | 'execute' | 'interaction-only';
	tabindex?: number;
	'expired-callback'?: () => void;
	'timeout-callback'?: () => void;
	'error-callback'?: (error: any) => void;
	'unsupported-callback'?: () => void;
	callback: (token: string) => void;
	'callback-function'?: (data: TurnstileResponse) => void;
	action?: string;
	cdata?: string;
	retry?: 'auto' | 'never';
	'retry-interval'?: number;
	'refresh-expired'?: 'auto' | 'manual' | 'never';
	language?: string;
}

export interface TurnstileResponse {
	token: string;
	execution_time?: number;
	hostname?: string;
	error_codes?: string[];
	action?: string;
	cdata?: string;
	[key: string]: any;
}

export interface TurnstileVerificationResponse {
	success: boolean;
	challenge_ts?: string;
	hostname?: string;
	'error-codes'?: string[];
	action?: string;
	cdata?: string;
}

declare global {
	interface Window {
		turnstile: {
			render: (
				container: HTMLElement,
				options: TurnstileRenderOptions,
			) => string;
			reset: (widgetId: string) => void;
			remove: (widgetId: string) => void;
			getResponse: (widgetId: string) => string;
			execute: (
				widgetId: string | HTMLElement,
				options?: Partial<TurnstileRenderOptions>,
			) => void;
		};
	}
}
