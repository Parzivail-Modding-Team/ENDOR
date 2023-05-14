import { Document } from 'mongodb';
import { databaseUserTable } from '../environment';
import { getTable } from '../mongo';

class UserDAO {
  static async findUser(query: any): Promise<Document[]> {
    const table = await getTable(databaseUserTable);
    return table.aggregate(query).toArray();
  }

  static async updateUser(query: any, updateObject: any): Promise<string> {
    const table = await getTable(databaseUserTable);
    const response: any = await table.findOneAndUpdate(query, updateObject, {
      upsert: false,
    });
    if (!response || !response.ok || !response.value){
      throw new Error("Database operation failed");
    }
    return response.value.id;
  }
}

export default UserDAO;
