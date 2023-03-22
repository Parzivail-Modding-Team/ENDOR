import { connectToMongo } from './utils.js';

class TagDAO {
  static async findTags(query) {
    const useMongo = await connectToMongo('endor-tag');

    return useMongo.aggregate(query).toArray();
  }

  static async createTags(tags) {
    const useMongo = await connectToMongo('endor-tag');

    const thing = await useMongo.insertMany(tags, { ordered: true });

    return thing.insertedCount;
  }
}

export default TagDAO;
