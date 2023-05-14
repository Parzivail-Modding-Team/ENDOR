import { MongoClient } from 'mongodb';
import { databaseName, databaseUrl } from './environment';

export async function getMongo(): Promise<MongoClient> {
  try {
    const uri: string = databaseUrl;
    const client: MongoClient = new MongoClient(uri);
    await client.connect();
    return client;
  } catch (e: unknown) {
    if (e instanceof Error) {
      throw new Error(e.message);
    } else {
      throw new Error('Unable to connect to database: ' + e);
    }
  }
}

export function getEndorTable(client: MongoClient, name: string) {
  if (!client) throw new Error('No Mongo client');
  const database = client.db(databaseName);
  const table = database.collection(name);
  return table;
}

export async function getTable(name: string) {
  const client: void | MongoClient = await getMongo();
  if (!client) throw new Error('No Mongo client');
  return getEndorTable(client, name);
}
