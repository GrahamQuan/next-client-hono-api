import { auth } from '~/auth';
import { createAppRouter } from '~/lib/factory';

const authRouter = createAppRouter();

/**
 * Better Auth handler - all auth endpoints are handled by Better Auth
 */
authRouter.on(['POST', 'GET'], '/**', async (c) => {
  return auth.handler(c.req.raw);
});

export default authRouter;
