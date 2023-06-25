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
exports.updateUser = exports.getUsers = exports.getUser = void 0;
const mongodb_1 = require("mongodb");
const userDAO_1 = __importDefault(require("../dao/userDAO"));
const types_1 = require("../types");
const routeUtils_1 = require("./routeUtils");
const graphql_1 = require("graphql");
function getUser(_, __, { identity }) {
    return __awaiter(this, void 0, void 0, function* () {
        const userData = yield userDAO_1.default.findUser([
            {
                $match: {
                    _id: new mongodb_1.ObjectId(identity._id),
                },
            },
        ]).then((e) => e[0]);
        return userData;
    });
}
exports.getUser = getUser;
function getUsers(_, __, { identity }) {
    return __awaiter(this, void 0, void 0, function* () {
        (0, routeUtils_1.requireRole)(identity, types_1.Role.Admin);
        const userData = yield userDAO_1.default.findUser([
            {
                $match: {},
            }
        ]);
        return userData;
    });
}
exports.getUsers = getUsers;
function updateUser(_, { id, role }, { identity }) {
    return __awaiter(this, void 0, void 0, function* () {
        (0, routeUtils_1.requireRole)(identity, types_1.Role.Admin);
        if (id === identity.id) {
            throw new graphql_1.GraphQLError('You may not edit your own role');
        }
        const userData = yield userDAO_1.default.updateUser({ id }, { $set: { role } });
        return userData;
    });
}
exports.updateUser = updateUser;
