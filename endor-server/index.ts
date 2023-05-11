import express from 'express';
import http from 'http';
import { ApolloServer } from '@apollo/server';
import cors from 'cors';
import { typeDefs } from './typedefs';
import { resolvers } from './resolvers';
import ViteExpress from "vite-express";

import aws from 'aws-sdk';
import multer, { Options } from 'multer';
import multerS3 from 'multer-s3';
import { v4 as uuidv4 } from 'uuid';

import { Strategy, Profile, VerifyCallback, Scope } from '@oauth-everything/passport-discord';
import MongoStore from 'connect-mongo';

import session from 'express-session';
import passport from 'passport';

import { expressMiddleware as apolloMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { json as jsonBodyParser } from 'body-parser';
import { getMongo } from './mongo';
import { createPost } from './routes/post';
import { getEndorTable } from './dao/utils';
import { MongoClient } from 'mongodb';

async function init() {
  const app = express();
  const httpServer = http.createServer(app);

  const mongoPromise = getMongo();
  const mongo = await mongoPromise;

  // Wire Vite into the Express server, which does not
  // require proxies in the vite.config.js
  ViteExpress.bind(app, httpServer);

  // Apply a middleware that manages translating session
  // information into client-safe session cookies which somehow
  // uses the master session secret and mongo user table
  // Note: this user table (currently `endor-user`) IS NOT and
  // CANNOT be the user table used for serializing and
  // deserializing the user (currently `endor-users`)
  // TODO: consider renaming `endor-user` to `endor-session` or something
  app.use(
    session({
      secret: String(process.env.SESSION_SECRET),
      store: MongoStore.create({
        clientPromise: mongoPromise,
        collectionName: String(process.env.MONGO_USER_TABLE)
      }),
      resave: false,
      saveUninitialized: false
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
  })

  // The incoming HTTP request needs to turn the client's ID into a user object for the server to reference
  passport.deserializeUser((id: string, done) => {
    process.nextTick(async () => {
      const useMongo = await getEndorTable(mongo, 'endor-users');
      await useMongo.findOne(
        {
          id,
        },
      ).then(document => {
        return done(null, document);
      })
    });
  });

  // Wire up the Discord authentication strategy
  passport.use(new Strategy(
    {
      clientID: String(process.env.DISCORD_CLIENT_ID),
      clientSecret: String(process.env.DISCORD_SECRET),
      callbackURL: String(process.env.DISCORD_REDIRECT_URL),
      // TODO: do we even need EMAIL?
      scope: [Scope.IDENTIFY, Scope.EMAIL]
    },
    async (accessToken: string, refreshToken: string, profile: Profile, cb: VerifyCallback<Express.User>) => {
      // Once Discord has auth'd, insert the user's ID and username into
      // the database and always succeed, and the user object is passed
      // back to the server to keep as the sessoion object
      const user = {
        id: profile.id,
        username: profile.username
      };
      const useMongo = await getEndorTable(mongo, 'endor-users');
      await useMongo.updateOne(
        user,
        {
          "$set": {
            // Set nothing
          }
        },
        {
          upsert: true
        }
      ).then(result => {
        cb(null, user)
      })
    }
  ));

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });
  await server.start();

  // Wire up the Apollo GQL middleware under the endpoint
  // known to the clients (does not need a proxy)
  app.use('/api', cors(), jsonBodyParser(), apolloMiddleware(server));

  const spacesEndpoint: aws.Endpoint = new aws.Endpoint(
    String(process.env.ENDPOINT_URL)
  );
  const creds = new aws.Credentials({
    accessKeyId: String(process.env.BUCKET_KEY_ID),
    secretAccessKey: String(process.env.BUCKET_ACCESS_KEY)
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
  app.get("/auth/discord", passport.authenticate("discord"));

  // The Discord OAuth login page in turn redirects back to this page,
  // which subsequently picks one of these redirects depending on the
  // status of the login
  app.get("/auth/discord/callback", passport.authenticate("discord", {
      failureRedirect: "/login",
      successRedirect: "/"
  }));

  // The client can POST to this endpoint to log out
  app.post('/logout', (req, res, next) => {
    req.logout((err) => {
      if (err) { return next(err); }

      // Redirect to the homepage after logout
      res.redirect('/');
    });
  });

  // Sanity check endpoint to get all known info on
  // the currently logged in user (if any)
  app.get('/whoami', (req, res, next) => {
    if (req.user)
      res.json({
        authenticated: true,
        user: req.user
      });
    else
      res.json({
        authenticated: false
      });
  });

  const httpParams = {
    port: 8080
  };
  await new Promise((resolve: any) =>
    httpServer.listen(httpParams, resolve)
  );
  console.log(`Server running at port ${httpParams.port}`);
}

init();
