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
exports.getTable = exports.getEndorTable = exports.getMongo = void 0;
const mongodb_1 = require("mongodb");
const environment_1 = require("./environment");
function getMongo() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const uri = environment_1.databaseUrl;
            const client = new mongodb_1.MongoClient(uri);
            yield client.connect();
            return client;
        }
        catch (e) {
            if (e instanceof Error) {
                throw new Error(e.message);
            }
            else {
                throw new Error(`Unable to connect to database: {e}`);
            }
        }
    });
}
exports.getMongo = getMongo;
function getEndorTable(client, name) {
    if (!client)
        throw new Error('No Mongo client');
    const database = client.db(environment_1.databaseName);
    const table = database.collection(name);
    return table;
}
exports.getEndorTable = getEndorTable;
function getTable(name) {
    return __awaiter(this, void 0, void 0, function* () {
        const client = yield getMongo();
        if (!client)
            throw new Error('No Mongo client');
        return getEndorTable(client, name);
    });
}
exports.getTable = getTable;
