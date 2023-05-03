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

import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import pkg from 'body-parser';
import { getMongo } from './mongo';
import { createPost } from './routes/post';
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

  app.use('/api/gql', cors(), json(), expressMiddleware(server));

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

  await new Promise((resolve: any) =>
    httpServer.listen({ port: 4000 }, resolve)
  );
  console.log(`Server running at port 4000`);
}

init();