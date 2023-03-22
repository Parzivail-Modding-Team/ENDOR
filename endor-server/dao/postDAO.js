import { connectToMongo } from './utils.js';

class PostDAO {
  static async findPosts(query) {
    const useMongo = await connectToMongo('endor-post');
    return useMongo.aggregate(query).toArray();
  }

  static async createPost(post) {
    const useMongo = await connectToMongo('endor-post');

    const thing = await useMongo.insertOne(post);

    return thing.insertedId;
  }
}

export default PostDAO;
