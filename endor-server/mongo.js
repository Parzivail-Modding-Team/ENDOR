import { MongoClient } from 'mongodb';

async function main() {
  const uri =
    'mongodb+srv://miller:Crusader13@cluster0.fhgpomb.mongodb.net/?retryWrites=true&w=majority';

  const client = new MongoClient(uri);

  try {
    // Connect to the MongoDB cluster
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
