import { S3Client } from '@aws-sdk/client-s3';
import { bucketAccessKey, bucketEndpointUrl, bucketKeyId } from './environment';

export function getBucket(): S3Client {
  return new S3Client({
    region: 'us-east-1',
    credentials: {
      accessKeyId: bucketKeyId,
      secretAccessKey: bucketAccessKey,
    },
    endpoint: bucketEndpointUrl,
  });
}
