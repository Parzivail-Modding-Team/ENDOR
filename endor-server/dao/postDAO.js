import { connectToMongo } from './utils.js';

class PostDAO {
  static async findPosts(query, limit) {
    const useMongo = await connectToMongo('endor-post');
    if (limit) {
      return useMongo.aggregate(query).limit(50).toArray();
    }
    return useMongo.aggregate(query).toArray();
  }

  static async createPost(post) {
    const useMongo = await connectToMongo('endor-post');
    const thing = await useMongo.insertOne(post);
    return thing;
  }

  static async updatePost(query, updateObject) {
    const useMongo = await connectToMongo('endor-post');
    const thing = await useMongo.findOneAndUpdate(query, updateObject, {
      upsert: false,
    });
    return thing.value._id;
  }

  static async deletePost(query) {
    const useMongo = await connectToMongo('endor-post');
    const thing = await useMongo.deleteOne(query);
    return thing.deletedCount;
  }
}

export default PostDAO;
