import { connectToMongo } from './utils';

class TagDAO {
  static async findTags(query: any) {
    const useMongo = await connectToMongo('endor-tag');
    return useMongo.aggregate(query).toArray();
  }

  static async createTags(tags: any) {
    const useMongo = await connectToMongo('endor-tag');
    const response = await useMongo.insertMany(tags, { ordered: true });
    return response.insertedCount;
  }

  static async updateTag(query: any, updateObject: any) {
    const useMongo = await connectToMongo('endor-tag');
    const response: any = await useMongo.findOneAndUpdate(query, updateObject, {
      upsert: false,
    });
    return response.value._id;
  }

  static async deleteTag(query: any) {
    const useMongo = await connectToMongo('endor-tag');
    const response = await useMongo.deleteOne(query);
    return response.deletedCount;
  }
}

export default TagDAO;
