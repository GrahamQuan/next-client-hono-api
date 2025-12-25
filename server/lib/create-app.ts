import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from '~/middlewares/logger';
import { notFound } from '~/middlewares/not-found';
import { onError } from '~/middlewares/on-error';
import type { AppEnv } from '~/types/app-context';
import { withLocale } from '~/with-context/i18n';
import env from './env';

export const createApp = () => {
  const app = new Hono<AppEnv>();

  const corsOrigin: string[] = [env.WEBSITE_URL];

  if (env.NODE_ENV === 'development') {
    corsOrigin.push('http://localhost:3000', 'http://localhost:3001', 'http://localhost:8787');
  }

  app.onError(onError);
  app.notFound(notFound);

  app.use('*', logger());
  app.use('*', withLocale);
  app.use(
    '*',
    cors({
      origin: corsOrigin,
      allowHeaders: ['Content-Type', 'Authorization', 'Cookie', 'Set-Cookie', 'x-turnstile-token'],
      allowMethods: ['POST', 'GET', 'OPTIONS', 'PUT', 'DELETE'],
      exposeHeaders: ['Content-Length', 'Set-Cookie'],
      maxAge: 600,
      credentials: true,
    }),
  );

  return app;
};
