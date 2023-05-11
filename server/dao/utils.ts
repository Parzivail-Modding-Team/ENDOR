import { MongoClient } from 'mongodb';
import { getMongo } from '../mongo';

export async function connectToMongo(name: string) {
  const client: void | MongoClient = await getMongo();
  if (!client) throw new Error('No Mongo client');
  return getEndorTable(client, name);
}

export async function getEndorTable(client: MongoClient, name: string) {
  if (!client) throw new Error('No Mongo client');
  const database = client.db(process.env.MONGO_DB);
  const table = database.collection(name);
  return table;
}
