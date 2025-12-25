import { CompleteMultipartUploadCommand, CreateMultipartUploadCommand, UploadPartCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v7 as uuidv7 } from 'uuid';
import env from '~/lib/env';
import BucketClient from './bucket-client';
import { createDateFolderPath, getFileExtensionByMimeType } from './bucket-utils';

/**
 * Creates a presigned URL for a multipart upload.
 *
 * @param {Object} options - The options for creating the presigned URL.
 * @param {string} options.mimeType - The MIME type of the file, e.g., 'image/png'.
 * @param {number} options.fileSize - The size of the file in bytes. (5 Mb ~ 5 Gb)
 * @param {number} [options.partSize=5242880] - The size of each part in bytes. Defaults to 5MB, the minimum part size requirement for R2/S3 Bucket.
 *
 */
export async function createMultiPartsPresignedUrl({
  mimeType,
  fileSize,
  partSize = 5 * 1024 * 1024,
}: {
  mimeType: string;
  fileSize: number;
  partSize?: number;
}): Promise<{
  key: string;
  uploadId: string;
  presignedUrlList: { presignedUrl: string; partNumber: number }[];
}> {
  // 5 Gb
  if (fileSize > 5 * 1024 * 1024 * 1024) {
    throw new Error('File size is too large, max is 5 GB');
  }

  const bucketName = env.BUCKET_NAME;
  // key be like: 2025/03/01/0198bbfd-19f2-72e7-b12b-a0c21d970866.png
  const key = `${createDateFolderPath()}/${uuidv7()}.${getFileExtensionByMimeType(mimeType)}`;

  // Calculate the part size and count
  const partCount = Math.ceil(fileSize / partSize);

  // Initialize the multipart upload
  const multipartUpload = await BucketClient.send(
    new CreateMultipartUploadCommand({
      Bucket: bucketName,
      Key: key,
      ContentType: mimeType,
    }),
  );

  const uploadId = multipartUpload.UploadId;

  if (!uploadId) {
    throw new Error('Failed to initialize multipart upload');
  }

  // Generate presigned URLs for all parts in parallel
  const presignedUrlList = await Promise.all(
    Array.from({ length: partCount }, async (_, index) => {
      // AWS S3 API PartNumber starts from 1
      const partNumber = index + 1;

      const command = new UploadPartCommand({
        Bucket: bucketName,
        Key: key,
        UploadId: uploadId,
        PartNumber: partNumber,
      });

      const presignedUrl = await getSignedUrl(BucketClient, command, {
        expiresIn: 3600,
      });

      return {
        presignedUrl,
        partNumber,
      };
    }),
  );

  return {
    key,
    uploadId,
    presignedUrlList,
  };
}

/**
 * Completes a multipart upload.
 *
 * @param {Object} options - The options for completing the multipart upload.
 * @param {string} options.key - The key of the file.
 * @param {string} options.uploadId - The upload ID of the multipart upload.
 * @param {Object[]} options.parts - The parts of the multipart upload.
 * @param {number} options.parts[].partNumber - The part number.
 * @param {string} options.parts[].etag - The ETag of the part.
 *
 */
export async function completeMultiPartsPresignedUrl({
  key,
  uploadId,
  parts,
}: {
  key: string;
  uploadId: string;
  parts: { partNumber: number; etag: string }[];
}): Promise<string> {
  const completedParts = parts
    .sort((a, b) => a.partNumber - b.partNumber)
    .map((part) => ({
      PartNumber: part.partNumber,
      ETag: part.etag,
    }));

  const completeCommand = new CompleteMultipartUploadCommand({
    Bucket: env.BUCKET_NAME,
    Key: key,
    UploadId: uploadId,
    MultipartUpload: {
      Parts: completedParts,
    },
  });

  try {
    const result = await BucketClient.send(completeCommand);
    console.log('Multipart upload completed successfully:', result);
  } catch (error) {
    console.error('S3 CompleteMultipartUpload error details:', error);
    throw error;
  }

  const publicUrl = `${env.BUCKET_PUBLIC_URL}/${key}`;
  return publicUrl;
}
