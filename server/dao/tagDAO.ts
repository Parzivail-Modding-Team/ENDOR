import { connectToMongo } from './utils';

class TagDAO {
  static async findTags(query: any) {
    const useMongo = await connectToMongo(String(process.env.MONGO_TAG_TABLE));
    return useMongo.aggregate(query).toArray();
  }

  static async createTags(tags: any) {
    const useMongo = await connectToMongo(String(process.env.MONGO_TAG_TABLE));
    const response = await useMongo.insertMany(tags, { ordered: true });
    return response.insertedCount;
  }

  static async updateTag(query: any, updateObject: any) {
    const useMongo = await connectToMongo(String(process.env.MONGO_TAG_TABLE));
    const response: any = await useMongo.findOneAndUpdate(query, updateObject, {
      upsert: false,
    });
    return response.value._id;
  }

  static async deleteTag(query: any) {
    const useMongo = await connectToMongo(String(process.env.MONGO_TAG_TABLE));
    const response = await useMongo.deleteOne(query);
    return response.deletedCount;
  }
}

export default TagDAO;