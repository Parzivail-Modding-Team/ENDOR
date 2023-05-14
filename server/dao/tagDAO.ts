import { databaseTagTable } from '../environment';
import { connectToMongo } from '../mongo';

class TagDAO {
  static async findTags(query: any) {
    const useMongo = await connectToMongo(databaseTagTable);
    return useMongo.aggregate(query).toArray();
  }

  static async createTags(tags: any) {
    const useMongo = await connectToMongo(databaseTagTable);
    const response = await useMongo.insertMany(tags, { ordered: true });
    return response.insertedCount;
  }

  static async updateTag(query: any, updateObject: any) {
    const useMongo = await connectToMongo(databaseTagTable);
    const response: any = await useMongo.findOneAndUpdate(query, updateObject, {
      upsert: false,
    });
    return response.value._id;
  }

  static async deleteTag(query: any) {
    const useMongo = await connectToMongo(databaseTagTable);
    const response = await useMongo.deleteOne(query);
    return response.deletedCount;
  }
}

export default TagDAO;
