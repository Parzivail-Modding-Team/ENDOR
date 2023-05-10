import express from 'express';
import http from 'http';
import { ApolloServer } from '@apollo/server';
import cors from 'cors';
import { typeDefs } from './typedefs';
import { resolvers } from './resolvers';

import aws from 'aws-sdk';
import multer, { Options } from 'multer';
import multerS3 from 'multer-s3';
import { v4 as uuidv4 } from 'uuid';

import session from 'express-session';
import MongoStore from 'connect-mongo';

import passport from 'passport';
import { Strategy as DiscordStrategy } from 'passport-discord';

import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import pkg from 'body-parser';
import { getMongo } from './mongo';
import { createPost } from './routes/post';
import { connectToMongo } from './dao/utils';
const { json } = pkg;

async function init() {
  const app = express();
  const httpServer = http.createServer(app);

  const mongo: any = getMongo();

  const thing = new DiscordStrategy(
    {
      clientID: String(process.env.DISCORD_CLIENT_ID),
      clientSecret: String(process.env.DISCORD_SECRET),
      callbackURL: String(process.env.DISCORD_REDIRECT_URL),
      scope: ['identify', 'email'],
    },
    function (accessToken, refreshToken, profile, cb) {
      cb();
      console.log('$$$$$$$', accessToken, '#######', profile);
    }
  );

  passport.use(thing);

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });
  await server.start();

  app.use('/api/gql', cors(), json(), expressMiddleware(server));

  // app.use(
  //   session({
  //     secret: String(process.env.SESSION_SECRET),
  //     store: MongoStore.create({
  //       clientPromise: mongo,
  //       collectionName: String(process.env.MONGO_USER_TABLE),
  //     }),
  //   })
  // );
  // app.use(passport.authenticate('session'));

  const spacesEndpoint: aws.Endpoint = new aws.Endpoint(
    String(process.env.ENDPOINT_URL)
  );
  const s3: any = new aws.S3({
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

  app.get(
    '/auth',
    passport.authenticate(thing, {
      failureRedirect: '/',
    }),
    function (req, res) {
      console.log('butt');
    }
  );

  await new Promise((resolve: any) =>
    httpServer.listen({ port: 4000 }, resolve)
  );
  console.log(`Server running at port 4000`);
}

init();
