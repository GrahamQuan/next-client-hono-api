import type { ErrorHandler } from 'hono';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import { HTTP_STATUS_CODE } from '~/constants/http-status-code';
import env from '~/lib/env';

export const onError: ErrorHandler = (err, c) => {
  const currentStatus = 'status' in err ? err.status : c.newResponse(null).status;
  const statusCode =
    currentStatus !== HTTP_STATUS_CODE.OK
      ? (currentStatus as ContentfulStatusCode)
      : HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR;

  return c.json(
    {
      message: err.message,

      stack: env.NODE_ENV === 'production' ? undefined : err.stack,
    },
    statusCode,
  );
};
