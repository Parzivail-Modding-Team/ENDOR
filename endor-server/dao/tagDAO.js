import { connectToMongo } from './utils.js';

class TagDAO {
  static async findTags(query) {
    const useMongo = await connectToMongo('endor-tag');

    return useMongo.aggregate(query).toArray();
  }

  static async createTags(tags) {
    const useMongo = await connectToMongo('endor-tag');

    return new Promise(async (resolve) => {
      await useMongo.insertMany(tags, (error, result) => {
        if (error) resolve({});
        else {
          console.log(result);
          resolve(result);
        }
      });
    });
  }
}

export default TagDAO;
