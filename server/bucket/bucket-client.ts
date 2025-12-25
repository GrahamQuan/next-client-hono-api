import { S3Client } from '@aws-sdk/client-s3';
import env from '~/lib/env';

const BucketClient = new S3Client({
  region: env.BUCKET_REGION,
  endpoint: env.BUCKET_ENDPOINT,
  credentials: {
    accessKeyId: env.BUCKET_ACCESS_KEY_ID,
    secretAccessKey: env.BUCKET_SECRET_ACCESS_KEY,
  },
});

export default BucketClient;
