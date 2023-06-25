"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAvatar = exports.isAuthenticated = exports.requireRole = exports.getTime = exports.tagChecker = void 0;
const moment_1 = __importDefault(require("moment"));
const mongodb_1 = require("mongodb");
const graphql_1 = require("graphql");
function tagChecker(newT, addT) {
    // TODO: tags are all kinds of weird, clean it up
    if (newT && newT.length && newT.length > 0) {
        return newT
            .map((tag) => tag._id)
            .concat(addT.map((tag) => new mongodb_1.ObjectId(tag.value)));
    }
    else {
        return addT.map((tag) => new mongodb_1.ObjectId(tag.value));
    }
}
exports.tagChecker = tagChecker;
function getTime() {
    return (0, moment_1.default)().unix();
}
exports.getTime = getTime;
function requireRole(user, role) {
    if (user.role < role) {
        throw new graphql_1.GraphQLError('User is not authorized to access this function');
    }
}
exports.requireRole = requireRole;
function isAuthenticated(req, res, next) {
    if (req.user) {
        next();
    }
    else {
        res.redirect('/login');
    }
}
exports.isAuthenticated = isAuthenticated;
function getAvatar(profile) {
    if (profile.photos) {
        for (const { primary, type, value } of profile.photos) {
            if (primary && type === 'avatar')
                return value;
        }
    }
    return "/unknown_avatar.png";
}
exports.getAvatar = getAvatar;
