import { databaseUserTable } from '../environment';
import { connectToMongo } from '../mongo';

class UserDAO {
  static async findUser(query: any) {
    const useMongo = await connectToMongo(databaseUserTable);
    return useMongo.aggregate(query).toArray();
  }

  static async updateUser(query: any, updateObject: any) {
    const useMongo = await connectToMongo(databaseUserTable);
    const response: any = await useMongo.findOneAndUpdate(query, updateObject, {
      upsert: false,
    });
    return response.value.id;
  }
}

export default UserDAO;
