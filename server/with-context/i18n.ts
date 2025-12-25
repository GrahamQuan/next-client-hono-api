import { createAppMiddleware } from '~/lib/factory';
import type { Locale } from '~/types/app-context';

export const withLocale = createAppMiddleware(async (c, next) => {
  const locale = c.req.header('x-locale') || 'en';
  c.set('locale', locale as Locale);

  await next();
});
