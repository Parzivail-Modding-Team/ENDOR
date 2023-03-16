import { connectToMongo } from './utils.js';

class PostDAO {
  static async findPosts(query) {
    const useMongo = await connectToMongo('endor-post');
    return useMongo.aggregate(query).toArray();
  }

  static async createPost(post) {
    const useMongo = await connectToMongo('endor-post');

    return new Promise((resolve) => {
      useMongo.insertOne(post, (error, result) => {
        if (error) resolve({});
        else {
          resolve(result);
        }
      });
    });
  }
}

export default PostDAO;
