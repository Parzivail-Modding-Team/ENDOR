import express from 'express';
import http from 'http';
import { ApolloServer } from '@apollo/server';
import cors from 'cors';
import { typeDefs } from './typedefs.js';
import { resolvers } from './resolvers.js';

const upload = multer({ dest: 'uploads/' });

// File Uploading via AWS SDK
import aws from 'aws-sdk';
import multer from 'multer';
import multerS3 from 'multer-s3';

import { v4 as uuidv4 } from 'uuid';

// Using middleware implementation because unsure of auth scheme currently
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import pkg from 'body-parser';
import { getMongo } from './mongo.js';
import { createPost } from './routes/post.js';
import { ObjectId } from 'mongodb';
const { json } = pkg;

async function init() {
  const app = express();
  const httpServer = http.createServer(app);

  getMongo();

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });

  await server.start();

  // leaving middleware empty for now till auth scheme decision
  app.use(
    '/api/gql',
    cors(true),
    json(),
    expressMiddleware(server, {
      context: async (c) => {
        return;
      },
    })
  );

  const spacesEndpoint = new aws.Endpoint(process.env.ENDPOINT_URL);
  const s3 = new aws.S3({
    endpoint: spacesEndpoint,
  });

  // Change bucket property to your Space name
  // TODO: line 63 - change file name to something dynamic so it doesn't overwrite things with the same name
  const uploadFunc = multer({
    storage: multerS3({
      s3: s3,
      bucket: process.env.BUCKET,
      acl: 'public-read',
      key: function (request, file, cb) {
        cb(null, uuidv4());
      },
    }),
  });

  app.post(
    '/createPost',
    uploadFunc.single('file'),

    async function (req, res) {
      const body = JSON.parse(JSON.stringify(req.body));

      const newPost = await createPost(
        body,
        process.env.CDN_URL + req.file.key
      );

      if (newPost && newPost.length) {
        return res.json({ _id: newPost });
      }
    }
  );

  await new Promise((resolve) => httpServer.listen({ port: 4000 }, resolve));

  console.log(`Server running at port 4000`);
}

init();
