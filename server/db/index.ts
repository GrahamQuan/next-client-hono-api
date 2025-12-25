import { drizzle } from 'drizzle-orm/neon-http';

import * as schema from '~/db/schema';
import env from '~/lib/env';

const db = drizzle(env.DATABASE_URL, { schema, casing: 'snake_case' });

export { db };

export type Database = typeof db;
