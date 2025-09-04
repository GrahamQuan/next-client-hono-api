import { defineRouting } from 'next-intl/routing';

export const defaultLocale = 'en';

export const languages = [
	{
		locale: 'en',
		name: 'English',
	},
	{
		locale: 'es',
		name: 'Español',
	},
] as const;

export const locales = languages.map((language) => language.locale);

export const routing = defineRouting({
	locales,
	defaultLocale,
	localeDetection: false,
	localePrefix: 'as-needed',
});
