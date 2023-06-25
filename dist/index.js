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
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const path_1 = __importDefault(require("path"));
const moment_1 = __importDefault(require("moment"));
const server_1 = require("@apollo/server");
const cors_1 = __importDefault(require("cors"));
const typedefs_1 = require("./typedefs");
const resolvers_1 = require("./resolvers");
const vite_express_1 = __importDefault(require("vite-express"));
const multer_1 = __importDefault(require("multer"));
const multer_s3_1 = __importDefault(require("multer-s3"));
const uuid_1 = require("uuid");
const passport_discord_1 = require("@oauth-everything/passport-discord");
const connect_mongo_1 = __importDefault(require("connect-mongo"));
const express_session_1 = __importDefault(require("express-session"));
const passport_1 = __importDefault(require("passport"));
const express4_1 = require("@apollo/server/express4");
const drainHttpServer_1 = require("@apollo/server/plugin/drainHttpServer");
const body_parser_1 = require("body-parser");
const mongo_1 = require("./mongo");
const post_1 = require("./routes/post");
const types_1 = require("./types");
const environment_1 = require("./environment");
const bucket_1 = require("./bucket");
const routeUtils_1 = require("./routes/routeUtils");
function init() {
    return __awaiter(this, void 0, void 0, function* () {
        const app = (0, express_1.default)();
        const httpServer = http_1.default.createServer(app);
        const clientPath = path_1.default.resolve(__dirname, '../client');
        const mongoPromise = (0, mongo_1.getMongo)();
        const mongo = yield mongoPromise;
        app.get('/login', function (req, res) {
            res.sendFile(path_1.default.resolve(clientPath, 'login.html'));
        });
        // Apply a middleware that manages translating session
        // information into client-safe session cookies which somehow
        // uses the master session secret and mongo user table
        app.use((0, express_session_1.default)({
            secret: environment_1.sessionSecret,
            store: connect_mongo_1.default.create({
                clientPromise: mongoPromise,
                collectionName: environment_1.databaseSessionTable,
            }),
            cookie: { maxAge: 1000 * 60 * 60 * 24 * 7 },
            resave: false,
            saveUninitialized: false,
        }));
        app.use(passport_1.default.authenticate('session'));
        // The outgoing HTTP data needs to turn the server's representation
        // of the session (a user object) into something the client can keep,
        // which is their user ID (which I think gets encrypted with SESSION_SECRET?)
        passport_1.default.serializeUser((user, done) => {
            const endorUser = user;
            process.nextTick(() => {
                done(null, endorUser.id);
            });
        });
        // The incoming HTTP request needs to turn the client's ID into a user object for the server to reference
        passport_1.default.deserializeUser((id, done) => {
            process.nextTick(() => __awaiter(this, void 0, void 0, function* () {
                const table = (0, mongo_1.getEndorTable)(mongo, environment_1.databaseUserTable);
                yield table
                    .findOne({
                    id,
                })
                    .then((document) => {
                    return done(null, document);
                });
            }));
        });
        // Wire up the Discord authentication strategy
        passport_1.default.use(new passport_discord_1.Strategy({
            clientID: environment_1.discordClientId,
            clientSecret: environment_1.discordSecret,
            callbackURL: environment_1.discordRedirectUrl,
            scope: [passport_discord_1.Scope.IDENTIFY],
        }, (accessToken, refreshToken, profile, cb) => {
            // Once Discord has auth'd, insert the user's ID and username into
            // the database and always succeed, and the user object is passed
            // back to the server to keep as the session object
            const table = (0, mongo_1.getEndorTable)(mongo, environment_1.databaseUserTable);
            table
                .updateOne({ id: profile.id }, {
                $set: {
                    username: profile.username,
                    avatarUrl: (0, routeUtils_1.getAvatar)(profile),
                    updatedAt: (0, moment_1.default)().unix(),
                },
                $setOnInsert: {
                    role: types_1.Role.Unauthorized,
                },
            }, {
                upsert: true,
            })
                .then(() => {
                cb(null, {
                    id: profile.id,
                    username: profile.username,
                    updatedAt: (0, moment_1.default)().unix(),
                });
            })
                .catch((e) => {
                cb(e);
            });
        }));
        const server = new server_1.ApolloServer({
            typeDefs: typedefs_1.typeDefs,
            resolvers: resolvers_1.resolvers,
            plugins: [(0, drainHttpServer_1.ApolloServerPluginDrainHttpServer)({ httpServer })],
        });
        yield server.start();
        // Wire up the Apollo GQL middleware under the endpoint
        // known to the clients (does not need a proxy)
        app.use('/api', routeUtils_1.isAuthenticated, (0, cors_1.default)(), (0, body_parser_1.json)(), (0, express4_1.expressMiddleware)(server, {
            // eslint-disable-next-line @typescript-eslint/require-await
            context: ({ req }) => __awaiter(this, void 0, void 0, function* () { return ({ identity: req.user }); }),
        }));
        const s3 = (0, bucket_1.getBucket)();
        const uploadFunc = (0, multer_1.default)({
            storage: (0, multer_s3_1.default)({
                s3,
                bucket: environment_1.bucketName,
                acl: 'public-read',
                key(_, __, cb) {
                    cb(null, (0, uuid_1.v4)());
                },
                // eslint-disable-next-line @typescript-eslint/unbound-method
                contentType: multer_s3_1.default.AUTO_CONTENT_TYPE,
            }),
        });
        app.post('/createPost', routeUtils_1.isAuthenticated, uploadFunc.single('file'), (req, res) => {
            if (!req.user || !req.file) {
                res.status(400);
                return;
            }
            const user = req.user;
            if (user.role < types_1.Role.ReadWrite) {
                res.status(403);
                return;
            }
            const multerFile = req.file;
            const body = JSON.parse(JSON.stringify(req.body));
            (0, post_1.createPost)(body, multerFile.key)
                .then((newPost) => {
                res.json({ _id: newPost });
            })
                .catch((e) => {
                res.status(500);
                res.json(JSON.stringify(e));
            });
        });
        // This endpoint redirects the user to the Discord OAuth login page
        // Note: this endpoint is referenced directly in the header as a URL,
        // this endpoint internally generates and redirects to the long Discord
        // OAuth login URL using the callback URL and scopes defined in the
        // auth strategy above
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        app.get('/auth/discord', passport_1.default.authenticate('discord'));
        // The Discord OAuth login page in turn redirects back to this page,
        // which subsequently picks one of these redirects depending on the
        // status of the login
        app.get('/auth/discord/callback', 
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        passport_1.default.authenticate('discord', {
            failureRedirect: '/login',
            successRedirect: '/',
        }));
        app.post('/logout', (req, res, next) => {
            req.logout((err) => {
                if (err) {
                    return next(err);
                }
                res.redirect('/');
            });
        });
        app.get('/*', routeUtils_1.isAuthenticated, (req, res, next) => {
            next();
        });
        yield vite_express_1.default.bind(app, httpServer);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-floating-promises, @typescript-eslint/no-explicit-any
        yield new Promise((resolve) => httpServer.listen({ port: environment_1.port }, resolve));
        console.log(`Server running at port ${environment_1.port}`);
    });
}
init().catch((e) => console.log(e));
