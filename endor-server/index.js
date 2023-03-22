import express from 'express';
import http from 'http';
import { ApolloServer } from '@apollo/server';
import cors from 'cors';
import { typeDefs } from './typedefs.js';
import { resolvers } from './resolvers.js';

// File Uploading via AWS SDK
import aws from 'aws-sdk';
import multer from 'multer';
import multerS3 from 'multer-s3';

// Using middleware implementation because unsure of auth scheme currently
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import pkg from 'body-parser';
import { getMongo } from './mongo.js';
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

  const spacesEndpoint = new aws.Endpoint(process.env.CDN_URL);
  const s3 = new aws.S3({
    endpoint: spacesEndpoint,
  });

  // Change bucket property to your Space name
  const upload = multer({
    storage: multerS3({
      s3: s3,
      bucket: 'endor-cdn',
      acl: 'public-read',
      key: function (request, file, cb) {
        console.log(file);
        cb(null, file.originalname);
      },
    }),
  }).array('upload', 1);

  app.post('/upload', function (request, response, next) {
    upload(request, response, function (error) {
      if (error) {
        console.log(error);
        return response.send('There was a problem uploading an image');
      }
      console.log('File uploaded successfully.');
      return response.send();
    });
  });

  await new Promise((resolve) => httpServer.listen({ port: 4000 }, resolve));

  console.log(`Server running at port 4000`);
}

init();
