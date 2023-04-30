import { MongoClient } from 'mongodb';

export async function getMongo(): Promise<MongoClient> {
  try {
    const uri: string = String(process.env.NEW_MONGO_URL);
    const client: MongoClient = new MongoClient(uri);
    await client.connect();
    return client;
  } catch (error: any) {
    throw new Error(error.message);
  }
}
