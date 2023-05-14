import { Document, ObjectId } from 'mongodb';
import { Post } from '../types';
import { connectToMongo } from './utils';
import { databasePostTable } from '../environment';

class PostDAO {
  static async findPosts(query: Document[], limit?: boolean) {
    const useMongo = await connectToMongo(databasePostTable);
    if (limit) {
      return useMongo.aggregate(query).limit(50).toArray();
    }
    return useMongo.aggregate(query).toArray();
  }

  static async createPost(post: any) {
    const useMongo = await connectToMongo(databasePostTable);
    const response = await useMongo.insertOne(post);
    return response;
  }

  static async updatePost(
    query: Document,
    updateObject: any
  ): Promise<ObjectId> {
    const useMongo = await connectToMongo(databasePostTable);
    const response: any = await useMongo.findOneAndUpdate(query, updateObject, {
      upsert: false,
    });
    return response.value._id;
  }

  static async deletePost(query: Document) {
    const useMongo = await connectToMongo(databasePostTable);
    const response = await useMongo.findOneAndDelete(query);
    return response;
  }
}

export default PostDAO;
