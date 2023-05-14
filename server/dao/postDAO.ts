import { Document, ObjectId } from 'mongodb';
import { databasePostTable } from '../environment';
import { getTable } from '../mongo';

class PostDAO {
  static async findPosts(query: Document[], limit?: boolean): Promise<Document[]> {
    const table = await getTable(databasePostTable);
    if (limit) {
      return table.aggregate(query).limit(50).toArray();
    }
    return table.aggregate(query).toArray();
  }

  static async createPost(post: any): Promise<ObjectId> {
    const table = await getTable(databasePostTable);
    const response = await table.insertOne(post);
    if (!response.acknowledged) {
      throw new Error("Database operation failed");
    }
    return response.insertedId;
  }

  static async updatePost(query: Document, updateObject: any): Promise<Document> {
    const table = await getTable(databasePostTable);
    const response = await table.findOneAndUpdate(query, updateObject, {
      upsert: false,
    });
    if (!response || !response.ok || !response.value){
      throw new Error("Database operation failed");
    }
    return response.value;
  }

  static async deletePost(query: Document): Promise<Document> {
    const table = await getTable(databasePostTable);
    const response = await table.findOneAndDelete(query);
    if (!response || !response.ok || !response.value){
      throw new Error("Database operation failed");
    }
    return response.value;
  }
}

export default PostDAO;
