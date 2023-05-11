import { connectToMongo } from './utils';

class UserDAO {
  static async findUser(query: any) {
    const useMongo = await connectToMongo(String(process.env.MONGO_USER_TABLE));
    return useMongo.aggregate(query).toArray();
  }
}

export default UserDAO;
