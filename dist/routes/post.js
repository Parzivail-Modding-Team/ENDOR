"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePost = exports.updatePost = exports.createPost = exports.getPostDetails = exports.getPosts = void 0;
const mongodb_1 = require("mongodb");
const postDAO_1 = __importDefault(require("../dao/postDAO"));
const routeUtils_1 = require("./routeUtils");
const types_1 = require("../types");
const environment_1 = require("../environment");
const bucket_1 = require("../bucket");
const client_s3_1 = require("@aws-sdk/client-s3");
const tagDAO_1 = __importDefault(require("../dao/tagDAO"));
function getPostDetails(_, args, { identity }) {
    return __awaiter(this, void 0, void 0, function* () {
        const { _id } = args;
        (0, routeUtils_1.requireRole)(identity, types_1.Role.ReadOnly);
        const postData = yield postDAO_1.default.findPosts([
            {
                $match: { _id: new mongodb_1.ObjectId(_id) },
            },
            {
                $lookup: {
                    from: 'endor-tag',
                    localField: 'tags',
                    foreignField: '_id',
                    as: 'tags',
                },
            },
            {
                $addFields: {
                    tags: { $sortArray: { input: '$tags', sortBy: { label: 1 } } },
                },
            },
        ]);
        return postData;
    });
}
exports.getPostDetails = getPostDetails;
// TODO: Delete unfound tags from post on fetch of post
// Edit: it actually just passes over any tags it can't find without failing
function getPosts(_, args, { identity }) {
    return __awaiter(this, void 0, void 0, function* () {
        const { tags } = args;
        (0, routeUtils_1.requireRole)(identity, types_1.Role.ReadOnly);
        const mappedTags = yield tagDAO_1.default.findTags([
            {
                $match: tags && tags.length > 0
                    ? {
                        label: {
                            $in: tags,
                        },
                    }
                    : {},
            },
        ]);
        const postData = yield postDAO_1.default.findPosts([
            {
                $match: tags && tags.length > 0
                    ? {
                        tags: {
                            $all: mappedTags.map((tag) => tag._id),
                        },
                    }
                    : {},
            },
            {
                $sort: {
                    createdAt: 1,
                },
            },
        ]);
        return postData;
    });
}
exports.getPosts = getPosts;
function findAndCreateTags(tagLabels) {
    return __awaiter(this, void 0, void 0, function* () {
        // find the tags that already exist in the database
        const existingTags = yield tagDAO_1.default.findTags([
            {
                $match: tagLabels.length > 0
                    ? {
                        label: {
                            $in: tagLabels,
                        },
                    }
                    : {},
            },
        ]);
        // Remove the existing tags from the set of post tags
        const tagSet = new Set(tagLabels);
        existingTags.forEach((tag) => {
            tagSet.delete(tag.label);
        });
        // Create the missing tags, allowing the mongo driver to
        // give each array entry an _id in-situ
        const newTags = [...tagSet].map((label) => {
            return { label };
        });
        if (newTags.length > 0) {
            yield tagDAO_1.default.createTags(newTags);
        }
        // Re-combine the arrays of tags
        return existingTags
            .concat(newTags.map((document) => document))
            .map((tag) => tag._id);
    });
}
function createPost(args, imageId) {
    return __awaiter(this, void 0, void 0, function* () {
        const { tags, message } = args;
        const tagLabels = JSON.parse(tags).map((o) => String(o));
        const tagIds = yield findAndCreateTags(tagLabels);
        // Create the post
        const time = (0, routeUtils_1.getTime)();
        const post = {
            tags: tagIds,
            message,
            createdAt: time,
            updatedAt: time,
            imageUrl: environment_1.bucketCdnUrl + imageId,
            imageId,
        };
        const createdPostId = yield postDAO_1.default.createPost(post);
        return createdPostId.toString();
    });
}
exports.createPost = createPost;
function updatePost(_, args, { identity }) {
    return __awaiter(this, void 0, void 0, function* () {
        const { _id } = args;
        const { tags, message } = args.input;
        (0, routeUtils_1.requireRole)(identity, types_1.Role.ReadWrite);
        const tagIds = yield findAndCreateTags(tags);
        const updatedPostId = yield postDAO_1.default.updatePost({ _id: new mongodb_1.ObjectId(_id) }, {
            $set: {
                tags: tagIds,
                message,
                updatedAt: (0, routeUtils_1.getTime)(),
            },
        });
        return updatedPostId.toString();
    });
}
exports.updatePost = updatePost;
function deletePost(_, args, { identity }) {
    return __awaiter(this, void 0, void 0, function* () {
        const { _id } = args;
        (0, routeUtils_1.requireRole)(identity, types_1.Role.ReadWrite);
        const postData = yield postDAO_1.default.getPost({
            _id: new mongodb_1.ObjectId(_id),
        });
        const s3 = (0, bucket_1.getBucket)();
        yield s3.send(new client_s3_1.DeleteObjectCommand({ Bucket: environment_1.bucketName, Key: postData.imageId }));
        return ((yield postDAO_1.default.deletePost({
            _id: new mongodb_1.ObjectId(_id),
        })) > 0);
    });
}
exports.deletePost = deletePost;
