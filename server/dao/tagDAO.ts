import { Document, ObjectId } from 'mongodb';
import { databaseTagTable } from '../environment';
import { getTable } from '../mongo';

class TagDAO {
  static async findTags(query: any): Promise<Document[]> {
    const table = await getTable(databaseTagTable);
    return table.aggregate(query).toArray();
  }

  static async createTags(tags: any): Promise<number> {
    const table = await getTable(databaseTagTable);
    const response = await table.insertMany(tags, { ordered: true });
    if (!response.acknowledged) {
      throw new Error("Database operation failed");
    }
    return response.insertedCount;
  }

  static async updateTag(query: any, updateObject: any): Promise<ObjectId> {
    const table = await getTable(databaseTagTable);
    const response: any = await table.findOneAndUpdate(query, updateObject, {
      upsert: false,
    });
    if (!response || !response.ok || !response.value){
      throw new Error("Database operation failed");
    }
    return response.value._id;
  }

  static async deleteTag(query: any): Promise<number> {
    const table = await getTable(databaseTagTable);
    const response = await table.deleteOne(query);
    if (!response.acknowledged) {
      throw new Error("Database operation failed");
    }
    return response.deletedCount;
  }
}

export default TagDAO;
