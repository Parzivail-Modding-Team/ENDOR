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
const tagDAO_1 = __importDefault(require("../dao/tagDAO"));
const postDAO_1 = __importDefault(require("../dao/postDAO"));
const routeUtils_1 = require("./routeUtils");
const types_1 = require("../types");
const environment_1 = require("../environment");
const bucket_1 = require("../bucket");
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
        if (tags) {
            const postData = yield postDAO_1.default.findPosts([
                {
                    $match: {
                        tags: {
                            $all: tags.map((tag) => new mongodb_1.ObjectId(tag)),
                        },
                    },
                },
                {
                    $sort: {
                        createdAt: 1,
                    },
                },
            ]);
            return postData;
        }
        const postData = yield postDAO_1.default.findPosts([
            {
                $match: {},
            },
            {
                $sort: {
                    createdAt: 1,
                },
            },
        ], true);
        return postData;
    });
}
exports.getPosts = getPosts;
function createPost(args, imageId) {
    return __awaiter(this, void 0, void 0, function* () {
        const { addTags, createTags, message } = args;
        const parsedAddTags = JSON.parse(addTags);
        const parsedCreateTags = JSON.parse(createTags);
        const time = (0, routeUtils_1.getTime)();
        let newTagsInsert = 0;
        if (parsedCreateTags &&
            parsedCreateTags.length &&
            parsedCreateTags.length > 0) {
            newTagsInsert = yield tagDAO_1.default.createTags(parsedCreateTags);
        }
        const post = {
            tags: (0, routeUtils_1.tagChecker)(newTagsInsert && newTagsInsert > 0 ? parsedCreateTags : [], parsedAddTags),
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
        const { addTags, createTags, message } = args.input;
        (0, routeUtils_1.requireRole)(identity, types_1.Role.ReadWrite);
        let newTagsInsert = 0;
        if (createTags && createTags.length && createTags.length > 0) {
            newTagsInsert = yield tagDAO_1.default.createTags(createTags);
        }
        const updatedPostId = yield postDAO_1.default.updatePost({ _id: new mongodb_1.ObjectId(_id) }, {
            $set: {
                tags: (0, routeUtils_1.tagChecker)(newTagsInsert > 0 ? createTags : [], addTags),
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
        const postData = yield postDAO_1.default.deletePost({
            _id: new mongodb_1.ObjectId(_id),
        });
        const s3 = (0, bucket_1.getBucket)();
        yield s3
            .deleteObject({ Bucket: environment_1.bucketName, Key: postData.imageId })
            .promise();
        return true;
    });
}
exports.deletePost = deletePost;
