"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBucket = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const environment_1 = require("./environment");
function getBucket() {
    return new client_s3_1.S3Client({
        region: 'us-east-1',
        credentials: {
            accessKeyId: environment_1.bucketKeyId,
            secretAccessKey: environment_1.bucketAccessKey,
        },
        endpoint: environment_1.bucketEndpointUrl,
    });
}
exports.getBucket = getBucket;
