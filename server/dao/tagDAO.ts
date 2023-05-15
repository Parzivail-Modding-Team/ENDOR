import { Document, Filter, ObjectId, OptionalId, UpdateFilter } from 'mongodb';
import { databaseTagTable } from '../environment';
import { getTable } from '../mongo';
import { Tag, TagLabel } from '../types';

class TagDAO {
  static async findTags(query: Document[]): Promise<Tag[]> {
    const table = await getTable(databaseTagTable);
    return table
      .aggregate(query)
      .map((t: Document) => t as Tag)
      .toArray();
  }

  static async getAllTagLabels(): Promise<TagLabel[]> {
    const table = await getTable(databaseTagTable);
    return table
      .aggregate()
      .map((t: Document) => t as TagLabel)
      .toArray();
  }

  static async createTags(tags: OptionalId<Document[]>): Promise<number> {
    const table = await getTable(databaseTagTable);
    const response = await table.insertMany(tags, { ordered: true });
    if (!response.acknowledged) {
      throw new Error('Database operation failed');
    }
    return response.insertedCount;
  }

  static async updateTag(
    query: Filter<Document>,
    updateObject: UpdateFilter<Document>
  ): Promise<ObjectId> {
    const table = await getTable(databaseTagTable);
    const response = await table.findOneAndUpdate(query, updateObject, {
      upsert: false,
    });
    if (!response || !response.ok || !response.value) {
      throw new Error('Database operation failed');
    }
    return response.value._id;
  }

  static async deleteTag(query: Filter<Document>): Promise<number> {
    const table = await getTable(databaseTagTable);
    const response = await table.deleteOne(query);
    if (!response.acknowledged) {
      throw new Error('Database operation failed');
    }
    return response.deletedCount;
  }
}

export default TagDAO;
