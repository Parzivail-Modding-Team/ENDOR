import { getMongo } from '../mongo.js';

export async function connectToMongo(name) {
  const client = await getMongo();
  if (!client) throw new Error('No Mongo client');
  const database = client.db('endor');
  const table = database.collection(name);
  return table;
}
