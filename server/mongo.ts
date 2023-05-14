import { MongoClient } from 'mongodb';
import { databaseUrl } from './environment';

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
      throw new Error("No Mongo client: " + e);
    }
  }
}
