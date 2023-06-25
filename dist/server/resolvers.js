"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolvers = void 0;
const tag_1 = require("./routes/tag");
const post_1 = require("./routes/post");
const user_1 = require("./routes/user");
exports.resolvers = {
    Query: { getTags: tag_1.getTags, getPosts: post_1.getPosts, getPostDetails: post_1.getPostDetails, getUser: user_1.getUser, getUsers: user_1.getUsers },
    Mutation: {
        createPost: post_1.createPost,
        updatePost: post_1.updatePost,
        deletePost: post_1.deletePost,
        updateTag: tag_1.updateTag,
        deleteTag: tag_1.deleteTag,
        updateUser: user_1.updateUser,
    },
};
