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
exports.getEndorTable = exports.connectToMongo = void 0;
const mongo_1 = require("../mongo");
function connectToMongo(name) {
    return __awaiter(this, void 0, void 0, function* () {
        const client = yield (0, mongo_1.getMongo)();
        if (!client)
            throw new Error('No Mongo client');
        return getEndorTable(client, name);
    });
}
exports.connectToMongo = connectToMongo;
function getEndorTable(client, name) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!client)
            throw new Error('No Mongo client');
        const database = client.db(process.env.MONGO_DB);
        const table = database.collection(name);
        return table;
    });
}
exports.getEndorTable = getEndorTable;
