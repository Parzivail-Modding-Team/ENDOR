"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBucket = void 0;
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const environment_1 = require("./environment");
function getBucket() {
    return new aws_sdk_1.default.S3({
        credentials: new aws_sdk_1.default.Credentials({
            accessKeyId: environment_1.bucketKeyId,
            secretAccessKey: environment_1.bucketAccessKey,
        }),
        endpoint: new aws_sdk_1.default.Endpoint(environment_1.bucketEndpointUrl),
    });
}
exports.getBucket = getBucket;
