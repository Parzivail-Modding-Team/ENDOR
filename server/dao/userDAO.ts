import { connectToMongo } from './utils';

class UserDAO {
  static async findUser(query: any) {
    const useMongo = await connectToMongo(String(process.env.MONGO_USER_TABLE));
    return useMongo.aggregate(query).toArray();
  }

  static async updateUser(query: any, updateObject: any) {
    const useMongo = await connectToMongo(String(process.env.MONGO_USER_TABLE));
    const response: any = await useMongo.findOneAndUpdate(query, updateObject, {
      upsert: false,
    });
    return response.value.id;
  }
}

export default UserDAO;
