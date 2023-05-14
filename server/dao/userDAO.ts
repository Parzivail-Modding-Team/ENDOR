import { Document, Filter, UpdateFilter } from 'mongodb';
import { databaseUserTable } from '../environment';
import { getTable } from '../mongo';
import { User } from '../types';

class UserDAO {
  static async findUser(query: Document[]): Promise<User[]> {
    const table = await getTable(databaseUserTable);
    return table.aggregate(query).map((t: Document) => t as User).toArray();
  }

  static async updateUser(query: Filter<Document>, updateObject: UpdateFilter<Document>): Promise<string> {
    const table = await getTable(databaseUserTable);
    const response = await table.findOneAndUpdate(query, updateObject, {
      upsert: false,
    });
    if (!response || !response.ok || !response.value){
      throw new Error("Database operation failed");
    }
    const user = response.value as User;
    return user.id;
  }
}

export default UserDAO;
