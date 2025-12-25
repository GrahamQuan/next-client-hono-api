import { z } from 'zod';

export const postParamSchema = z.object({ id: z.string() });

export type PostParamSchema = z.infer<typeof postParamSchema>;

export const postBodySchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
});

export type PostBodySchema = z.infer<typeof postBodySchema>;
