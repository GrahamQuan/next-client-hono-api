import { z } from 'zod';

export const fileSchema = z.object({
  mimeType: z.string(),
  fileSize: z.number(),
});

export type FileSchema = z.infer<typeof fileSchema>;

export const bucketMultiPartsPresignedUrlResponseSchema = z.object({
  publicUrl: z.string(),
  presignedUrl: z.string(),
});

export type BucketMultiPartsPresignedUrlResponseSchema = z.infer<typeof bucketMultiPartsPresignedUrlResponseSchema>;

export const bucketMultiPartsPresignedUrlCompleteSchema = z.object({
  key: z.string(),
  uploadId: z.string(),
  parts: z.array(
    z.object({
      partNumber: z.number(),
      etag: z.string(),
    }),
  ),
});

export type BucketMultiPartsPresignedUrlCompleteSchema = z.infer<typeof bucketMultiPartsPresignedUrlCompleteSchema>;
