"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAvatar = exports.isAuthenticated = exports.requireRole = exports.getTime = void 0;
const moment_1 = __importDefault(require("moment"));
const graphql_1 = require("graphql");
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
    return '/unknown_avatar.png';
}
exports.getAvatar = getAvatar;
