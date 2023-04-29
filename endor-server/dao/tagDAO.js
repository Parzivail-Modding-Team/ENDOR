import { connectToMongo } from './utils.js';

class TagDAO {
  static async findTags(query) {
    const useMongo = await connectToMongo('endor-tag');
    return useMongo.aggregate(query).toArray();
  }

  static async createTags(tags) {
    const useMongo = await connectToMongo('endor-tag');
    const response = await useMongo.insertMany(tags, { ordered: true });
    return response.insertedCount;
  }

  static async updateTag(query, updateObject) {
    const useMongo = await connectToMongo('endor-tag');
    const response = await useMongo.findOneAndUpdate(query, updateObject, {
      upsert: false,
    });
    return response.value;
  }

  static async deleteTag(query) {
    const useMongo = await connectToMongo('endor-tag');
    const response = await useMongo.deleteOne(query);
    return response.deletedCount;
  }
}

export default TagDAO;
