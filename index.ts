import express from 'express';
import http from 'http';
import moment from 'moment';
import { ApolloServer } from '@apollo/server';
import cors from 'cors';
import { typeDefs } from './server/typedefs';
import { resolvers } from './server/resolvers';
import ViteExpress from 'vite-express';

import aws from 'aws-sdk';
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
import { getMongo } from './server/mongo';
import { createPost } from './server/routes/post';
import { getEndorTable } from './server/dao/utils';
import { Role, User } from './server/types';

function isAuthenticated(req: any, res: any, next: any) {
  if (req.user) {
    next();
  } else {
    res.redirect('/login');
  }
}

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
      secret: String(process.env.SESSION_SECRET),
      store: MongoStore.create({
        clientPromise: mongoPromise,
        collectionName: String(process.env.MONGO_SESSION_TABLE),
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
  passport.serializeUser((user: any, done) => {
    process.nextTick(() => {
      done(null, user.id);
    });
  });

  // The incoming HTTP request needs to turn the client's ID into a user object for the server to reference
  passport.deserializeUser((id: string, done) => {
    process.nextTick(async () => {
      const useMongo = await getEndorTable(
        mongo,
        String(process.env.MONGO_USER_TABLE)
      );
      await useMongo
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
        clientID: String(process.env.DISCORD_CLIENT_ID),
        clientSecret: String(process.env.DISCORD_SECRET),
        callbackURL: String(process.env.DISCORD_REDIRECT_URL),
        scope: [Scope.IDENTIFY],
      },
      async (
        accessToken: string,
        refreshToken: string,
        profile: Profile,
        cb: VerifyCallback<Express.User>
      ) => {
        // Once Discord has auth'd, insert the user's ID and username into
        // the database and always succeed, and the user object is passed
        // back to the server to keep as the session object
        const useMongo = await getEndorTable(
          mongo,
          String(process.env.MONGO_USER_TABLE)
        );
        await useMongo
          .updateOne(
            { id: profile.id },
            {
              $set: {
                username: profile.username,
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
          });
      }
    )
  );

  const server = new ApolloServer({
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
      context: async ({ req }: any) => {
        return { identity: req.user as User };
      },
    })
  );

  const spacesEndpoint: aws.Endpoint = new aws.Endpoint(
    String(process.env.ENDPOINT_URL)
  );
  const creds = new aws.Credentials({
    accessKeyId: String(process.env.BUCKET_KEY_ID),
    secretAccessKey: String(process.env.BUCKET_ACCESS_KEY),
  });
  const s3: any = new aws.S3({
    credentials: creds,
    endpoint: spacesEndpoint,
  });

  const uploadFunc = multer({
    storage: multerS3({
      s3,
      bucket: String(process.env.BUCKET),
      acl: 'public-read',
      key(_, __, cb) {
        cb(null, uuidv4());
      },
      contentType: multerS3.AUTO_CONTENT_TYPE,
    }),
  });

  app.post(
    '/createPost',
    isAuthenticated,
    uploadFunc.single('file'),
    async (req: any, res: any) => {
      const body = JSON.parse(JSON.stringify(req.body));
      const newPost = await createPost(body, req.file.key);
      if (newPost && newPost.length) {
        return res.json({ _id: newPost });
      }
    }
  );

  // This endpoint redirects the user to the Discord OAuth login page
  // Note: this endpoint is referenced directly in the header as a URL,
  // this endpoint internally generates and redirects to the long Discord
  // OAuth login URL using the callback URL and scopes defined in the
  // auth strategy above
  app.get('/auth/discord', passport.authenticate('discord'));

  // The Discord OAuth login page in turn redirects back to this page,
  // which subsequently picks one of these redirects depending on the
  // status of the login
  app.get(
    '/auth/discord/callback',
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

  app.get('/*', isAuthenticated, async (req, res, next) => {
    next();
  });

  ViteExpress.bind(app, httpServer);

  await new Promise((resolve: any) =>
    httpServer.listen({ port: process.env.PORT }, resolve)
  );
  console.log(`Server running at port ${process.env.PORT}`);
}

init();
