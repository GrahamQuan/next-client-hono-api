import type { AppContext } from '../types/app-context';

export const contextJson = <T extends any>(c: AppContext, { message, data }: { message: string; data: T }) => {
  return c.json({
    code: c.status,
    message,
    data,
  });
};
