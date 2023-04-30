import { Post } from '../types';
import { connectToMongo } from './utils';

class PostDAO {
  static async findPosts(query: any, limit?: boolean) {
    const useMongo = await connectToMongo('endor-post');
    if (limit) {
      return useMongo.aggregate(query).limit(50).toArray();
    }
    return useMongo.aggregate(query).toArray();
  }

  static async createPost(post: any) {
    const useMongo = await connectToMongo('endor-post');
    const response = await useMongo.insertOne(post);
    return response;
  }

  static async updatePost(query: any, updateObject: any) {
    const useMongo = await connectToMongo('endor-post');
    const response: any = await useMongo.findOneAndUpdate(query, updateObject, {
      upsert: false,
    });
    return response.value._id;
  }

  static async deletePost(query: any) {
    const useMongo = await connectToMongo('endor-post');
    const response = await useMongo.findOneAndDelete(query);
    return response;
  }
}

export default PostDAO;
