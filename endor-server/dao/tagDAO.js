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

  static async updateTag(query, updateObject) {
    const useMongo = await connectToMongo('endor-tag');

    const thing = await useMongo.findOneAndUpdate(query, updateObject, {
      upsert: false,
    });

    return thing.value;
  }

  static async deleteTag(query) {
    const useMongo = await connectToMongo('endor-tag');

    const thing = await useMongo.deleteOne(query);

    return thing.deletedCount;
  }
}

export default TagDAO;
