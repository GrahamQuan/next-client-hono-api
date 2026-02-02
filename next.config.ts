import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  /* config options here */
  // swcMinify: true,
  typedRoutes: true,
  experimental: {
    rootParams: true,
  },
};

export default () => [withNextIntl].reduce((acc, next) => next(acc), nextConfig);
