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
exports.deleteTag = exports.updateTag = exports.createTags = exports.getTags = void 0;
const mongodb_1 = require("mongodb");
const tagDAO_1 = __importDefault(require("../dao/tagDAO"));
const types_1 = require("../types");
const routeUtils_1 = require("./routeUtils");
function getTags(_, args, { identity }) {
    return __awaiter(this, void 0, void 0, function* () {
        const { label } = args;
        (0, routeUtils_1.requireRole)(identity, types_1.Role.ReadOnly);
        const query = [
            { $match: {} },
            {
                $sort: {
                    label: 1,
                },
            },
        ];
        if (label) {
            query[0].$match = { label: { $regex: `^${label}.*` } };
        }
        return yield tagDAO_1.default.findTags(query);
    });
}
exports.getTags = getTags;
function createTags(_, tags, { identity }) {
    return __awaiter(this, void 0, void 0, function* () {
        (0, routeUtils_1.requireRole)(identity, types_1.Role.ReadWrite);
        return yield tagDAO_1.default.createTags(tags);
    });
}
exports.createTags = createTags;
function updateTag(_, args, { identity }) {
    return __awaiter(this, void 0, void 0, function* () {
        const { _id } = args;
        const { label } = args.input;
        (0, routeUtils_1.requireRole)(identity, types_1.Role.ReadWrite);
        const tagData = yield tagDAO_1.default.updateTag({ _id: new mongodb_1.ObjectId(_id) }, { $set: { label } });
        return tagData.toString();
    });
}
exports.updateTag = updateTag;
function deleteTag(_, args, { identity }) {
    return __awaiter(this, void 0, void 0, function* () {
        const { _id } = args;
        (0, routeUtils_1.requireRole)(identity, types_1.Role.ReadWrite);
        return (yield tagDAO_1.default.deleteTag({
            _id: new mongodb_1.ObjectId(_id),
        })) > 0;
    });
}
exports.deleteTag = deleteTag;
