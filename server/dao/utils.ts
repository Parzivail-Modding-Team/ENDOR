import { MongoClient } from 'mongodb';
import { getMongo } from '../mongo';
import { databaseName } from '../environment';

export async function connectToMongo(name: string) {
  const client: void | MongoClient = await getMongo();
  if (!client) throw new Error('No Mongo client');
  return getEndorTable(client, name);
}

export async function getEndorTable(client: MongoClient, name: string) {
  if (!client) throw new Error('No Mongo client');
  const database = client.db(databaseName);
  const table = database.collection(name);
  return table;
}
