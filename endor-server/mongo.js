import { MongoClient } from 'mongodb';

async function main() {
  const uri = process.env.NEW_MONGO_URL;
  const client = new MongoClient(uri);

  try {
    await client.connect();
    return client;
  } catch (e) {
    console.error(e);
  }
}

main();

export async function getMongo() {
  return await main();
}
