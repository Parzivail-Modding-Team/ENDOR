import express from 'express';
import http from 'http';
import moment from 'moment';
import { ApolloServer } from '@apollo/server';
import cors from 'cors';
import { typeDefs } from './typedefs';
import { resolvers } from './resolvers';
import ViteExpress from 'vite-express';

import multer from 'multer';
import multerS3 from 'multer-s3';
import { v4 as uuidv4 } from 'uuid';

import {
  Strategy,
  Profile,
  VerifyCallback,
  Scope,
} from '@oauth-everything/passport-discord';
import MongoStore from 'connect-mongo';

import session from 'express-session';
import passport from 'passport';

import { expressMiddleware as apolloMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { json as jsonBodyParser } from 'body-parser';
import { getEndorTable, getMongo } from './mongo';
import { createPost } from './routes/post';
import { CreatePostArgs, IdentityContext, Role, User } from './types';
import {
  bucketName,
  databaseSessionTable,
  databaseUserTable,
  discordClientId,
  discordRedirectUrl,
  discordSecret,
  port,
  sessionSecret,
} from './environment';
import { getBucket } from './bucket';
import { getAvatar, isAuthenticated } from './routes/routeUtils';

async function init() {
  const app = express();
  const httpServer = http.createServer(app);

  const mongoPromise = getMongo();
  const mongo = await mongoPromise;

  app.get('/login', function (req, res) {
    res.sendFile(__dirname + '/client/login.html');
  });

  // Apply a middleware that manages translating session
  // information into client-safe session cookies which somehow
  // uses the master session secret and mongo user table
  app.use(
    session({
      secret: sessionSecret,
      store: MongoStore.create({
        clientPromise: mongoPromise,
        collectionName: databaseSessionTable,
      }),
      cookie: { maxAge: 1000 * 60 * 60 * 24 * 7 },
      resave: false,
      saveUninitialized: false,
    })
  );
  app.use(passport.authenticate('session'));

  // The outgoing HTTP data needs to turn the server's representation
  // of the session (a user object) into something the client can keep,
  // which is their user ID (which I think gets encrypted with SESSION_SECRET?)
  passport.serializeUser((user: Express.User, done) => {
    const endorUser = user as User;
    process.nextTick(() => {
      done(null, endorUser.id);
    });
  });

  // The incoming HTTP request needs to turn the client's ID into a user object for the server to reference
  passport.deserializeUser((id: string, done) => {
    process.nextTick(async () => {
      const table = getEndorTable(mongo, databaseUserTable);
      await table
        .findOne({
          id,
        })
        .then((document) => {
          return done(null, document as User);
        });
    });
  });

  // Wire up the Discord authentication strategy
  passport.use(
    new Strategy(
      {
        clientID: discordClientId,
        clientSecret: discordSecret,
        callbackURL: discordRedirectUrl,
        scope: [Scope.IDENTIFY],
      },
      (
        accessToken: string,
        refreshToken: string,
        profile: Profile,
        cb: VerifyCallback<Express.User>
      ) => {
        // Once Discord has auth'd, insert the user's ID and username into
        // the database and always succeed, and the user object is passed
        // back to the server to keep as the session object
        const table = getEndorTable(mongo, databaseUserTable);

        table
          .updateOne(
            { id: profile.id },
            {
              $set: {
                username: profile.username,
                avatarUrl: getAvatar(profile),
                updatedAt: moment().unix(),
              },
              $setOnInsert: {
                role: Role.Unauthorized,
              },
            },
            {
              upsert: true,
            }
          )
          .then(() => {
            cb(null, {
              id: profile.id,
              username: profile.username,
              updatedAt: moment().unix(),
            });
          })
          .catch((e: Error | null | undefined) => {
            cb(e);
          });
      }
    )
  );

  const server = new ApolloServer<IdentityContext>({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });
  await server.start();

  // Wire up the Apollo GQL middleware under the endpoint
  // known to the clients (does not need a proxy)
  app.use(
    '/api',
    isAuthenticated,
    cors(),
    jsonBodyParser(),
    apolloMiddleware(server, {
      // eslint-disable-next-line @typescript-eslint/require-await
      context: async ({ req }) => ({ identity: req.user } as IdentityContext),
    })
  );

  const s3 = getBucket();

  const uploadFunc = multer({
    storage: multerS3({
      s3,
      bucket: bucketName,
      acl: 'public-read',
      key(_, __, cb) {
        cb(null, uuidv4());
      },
      // eslint-disable-next-line @typescript-eslint/unbound-method
      contentType: multerS3.AUTO_CONTENT_TYPE,
    }),
  });

  app.post(
    '/createPost',
    isAuthenticated,
    uploadFunc.single('file'),
    (req, res) => {
      if (!req.user || !req.file) {
        res.status(400);
        return;
      }

      const user = req.user as User;

      if (user.role < Role.ReadWrite) {
        res.status(403);
        return;
      }

      const multerFile = req.file as Express.MulterS3.File;

      const body = JSON.parse(JSON.stringify(req.body)) as CreatePostArgs;
      createPost(body, multerFile.key)
        .then((newPost) => {
          res.json({ _id: newPost });
        })
        .catch((e) => {
          res.status(500);
          res.json(JSON.stringify(e));
        });
    }
  );

  // This endpoint redirects the user to the Discord OAuth login page
  // Note: this endpoint is referenced directly in the header as a URL,
  // this endpoint internally generates and redirects to the long Discord
  // OAuth login URL using the callback URL and scopes defined in the
  // auth strategy above
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  app.get('/auth/discord', passport.authenticate('discord'));

  // The Discord OAuth login page in turn redirects back to this page,
  // which subsequently picks one of these redirects depending on the
  // status of the login
  app.get(
    '/auth/discord/callback',
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    passport.authenticate('discord', {
      failureRedirect: '/login',
      successRedirect: '/',
    })
  );

  app.post('/logout', (req, res, next) => {
    req.logout((err) => {
      if (err) {
        return next(err);
      }
      res.redirect('/');
    });
  });

  app.get('/*', isAuthenticated, (req, res, next) => {
    next();
  });

  await ViteExpress.bind(app, httpServer);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-floating-promises, @typescript-eslint/no-explicit-any
  await new Promise((resolve: any) => httpServer.listen({ port }, resolve));
  console.log(`Server running at port ${port}`);
}

init().catch((e) => console.log(e));
