import type { Session, User } from 'better-auth';
import type { Context } from 'hono';
import type { DecodedAccessToken } from '~/auth/jwt';
import { EnvSchema } from '~/lib/env';

export type Locale = 'en' | 'es';

export type AppEnv = {
  Variables: {
    session: {
      session: Session;
      user: User;
    };
    locale: Locale;
    // JWT access token payload (set by verifyAccessTokenMiddleware)
    tokenPayload?: DecodedAccessToken;
  };
  Bindings: {} & EnvSchema;
};

export type AppContext = Context<AppEnv>;
