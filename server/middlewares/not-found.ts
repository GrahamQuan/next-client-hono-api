import type { NotFoundHandler } from 'hono';
import { HTTP_STATUS_CODE } from '~/constants/http-status-code';

export const notFound: NotFoundHandler = (c) => {
  return c.json(
    {
      message: `Not Found - ${c.req.path}`,
    },
    HTTP_STATUS_CODE.NOT_FOUND,
  );
};
