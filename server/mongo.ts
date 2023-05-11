import { MongoClient } from 'mongodb';

export async function getMongo(): Promise<MongoClient> {
  try {
    const uri: string = String(process.env.NEW_MONGO_URL);
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
