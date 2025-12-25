import { Redis } from 'ioredis';
import env from '~/lib/env';

const redis = new Redis(env.CACHE_URL);

export { redis };
