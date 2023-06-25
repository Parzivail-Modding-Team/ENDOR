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
class UserDAO {
    static findUser(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const table = yield (0, mongo_1.getTable)(environment_1.databaseUserTable);
            return table.aggregate(query).map((t) => t).toArray();
        });
    }
    static updateUser(query, updateObject) {
        return __awaiter(this, void 0, void 0, function* () {
            const table = yield (0, mongo_1.getTable)(environment_1.databaseUserTable);
            const response = yield table.findOneAndUpdate(query, updateObject, {
                upsert: false,
            });
            if (!response || !response.ok || !response.value) {
                throw new Error("Database operation failed");
            }
            const user = response.value;
            return user.id;
        });
    }
}
exports.default = UserDAO;
