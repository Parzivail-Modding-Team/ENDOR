"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTime = exports.tagChecker = void 0;
const moment_js_1 = __importDefault(require("moment/moment.js"));
const mongodb_1 = require("mongodb");
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
    return (0, moment_js_1.default)().unix();
}
exports.getTime = getTime;
