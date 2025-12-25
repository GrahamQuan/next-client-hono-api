import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v7 as uuidv7 } from 'uuid';
import env from '~/lib/env';
import BucketClient from './bucket-client';
import { createDateFolderPath, getFileExtensionByMimeType } from './bucket-utils';

export default async function createPresignedUrl(
  mimeType: string,
): Promise<{ publicUrl: string; presignedUrl: string }> {
  // key be like: 2025/03/01/0198bbfd-19f2-72e7-b12b-a0c21d970866.png
  const key = `${createDateFolderPath()}/${uuidv7()}.${getFileExtensionByMimeType(mimeType)}`;

  const command = new PutObjectCommand({
    Bucket: env.BUCKET_NAME,
    Key: key,
    ContentType: mimeType,
  });

  const presignedUrl = await getSignedUrl(BucketClient, command, {
    expiresIn: 3600,
  });

  const publicUrl = `${env.BUCKET_PUBLIC_URL}/${key}`;

  return { publicUrl, presignedUrl };
}
