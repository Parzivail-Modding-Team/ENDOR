import aws from 'aws-sdk';
import { bucketAccessKey, bucketEndpointUrl, bucketKeyId } from './environment';

export function getBucket(): aws.S3 {
  return new aws.S3({
    credentials: new aws.Credentials({
      accessKeyId: bucketKeyId,
      secretAccessKey: bucketAccessKey,
    }),
    endpoint: new aws.Endpoint(
      bucketEndpointUrl
    ),
  });
}
