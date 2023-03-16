import express from 'express';
import http from 'http';
import { ApolloServer } from '@apollo/server';
import cors from 'cors';
import { typeDefs } from './typedefs.js';
import { resolvers } from './resolvers.js';

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

  await new Promise((resolve) => httpServer.listen({ port: 4000 }, resolve));

  console.log(`Server running at port 4000`);
}

init();
