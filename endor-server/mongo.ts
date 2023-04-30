import { MongoClient } from 'mongodb';

export async function getMongo(): Promise<MongoClient> {
  const uri: string = String(process.env.NEW_MONGO_URL);
  const client = new MongoClient(uri);
  await client.connect();
  return client;
}
