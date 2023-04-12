import { connectToMongo } from './utils.js';

class PostDAO {
  static async findPosts(query) {
    const useMongo = await connectToMongo('endor-post');
    return useMongo.aggregate(query).toArray();
  }

  static async createPost(post) {
    const useMongo = await connectToMongo('endor-post');

    const thing = await useMongo.insertOne(post);

    return thing;
  }

  static async updatePost(query, updateObject) {
    const useMongo = await connectToMongo('endor-post');

    return new Promise((resolve, reject) => {
      useMongo.findOneAndUpdate(
        query,
        updateObject,
        { upsert: false },
        (err, res) => {
          if (err) reject(err);
          else {
            resolve(res.value);
          }
        }
      );
    });
  }
}

export default PostDAO;
