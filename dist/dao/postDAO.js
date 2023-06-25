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
Object.defineProperty(exports, "__esModule", { value: true });
const environment_1 = require("../environment");
const mongo_1 = require("../mongo");
class PostDAO {
    static getPost(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const table = yield (0, mongo_1.getTable)(environment_1.databasePostTable);
            const response = yield table.findOne(query);
            if (!response) {
                throw new Error("Post not found");
            }
            return response;
        });
    }
    static findPosts(query, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            const table = yield (0, mongo_1.getTable)(environment_1.databasePostTable);
            if (limit) {
                return table
                    .aggregate(query)
                    .limit(50)
                    .map((t) => t)
                    .toArray();
            }
            return table
                .aggregate(query)
                .map((t) => t)
                .toArray();
        });
    }
    static createPost(post) {
        return __awaiter(this, void 0, void 0, function* () {
            const table = yield (0, mongo_1.getTable)(environment_1.databasePostTable);
            const response = yield table.insertOne(post);
            if (!response.acknowledged) {
                throw new Error("Database operation failed");
            }
            return response.insertedId;
        });
    }
    static updatePost(query, updateObject) {
        return __awaiter(this, void 0, void 0, function* () {
            const table = yield (0, mongo_1.getTable)(environment_1.databasePostTable);
            const response = yield table.findOneAndUpdate(query, updateObject, {
                upsert: false,
            });
            if (!response || !response.ok || !response.value) {
                throw new Error("Database operation failed");
            }
            return response.value;
        });
    }
    static deletePost(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const table = yield (0, mongo_1.getTable)(environment_1.databasePostTable);
            const response = yield table.deleteOne(query);
            if (!response.acknowledged) {
                throw new Error("Database operation failed");
            }
            return response.deletedCount;
        });
    }
}
exports.default = PostDAO;
