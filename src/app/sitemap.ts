import type { MetadataRoute } from 'next';
import { HEADER_LINKS } from '@/constants/navigation';
import { envClient } from '@/env-client';
import { locales } from '@/i18n/routing';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return HEADER_LINKS.map((el) => {
    const routeSlug = el.href.slice(1);
    const languagesUrls = Object.fromEntries(
      locales.map((locale) => [locale, `${envClient.NEXT_PUBLIC_WEBSITE_URL}/${locale}/${routeSlug}`]),
    );
    return {
      url: `${envClient.NEXT_PUBLIC_WEBSITE_URL}/${routeSlug}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1 as const,
      alternates: {
        languages: languagesUrls,
      },
    };
  });
}
