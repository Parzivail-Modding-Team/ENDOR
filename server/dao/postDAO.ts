import { Document, ObjectId } from "mongodb";
import { databasePostTable } from "../environment";
import { getTable } from "../mongo";
import { Post } from "../types";

class PostDAO {
  static async getPost(query: Document): Promise<Post> {
    const table = await getTable(databasePostTable);
    const response = await table.findOne(query);
    if (!response) {
      throw new Error("Post not found");
    }
    return response as Post;
  }

  static async findPosts(query: Document[], limit?: boolean): Promise<Post[]> {
    const table = await getTable(databasePostTable);
    if (limit) {
      return table
        .aggregate(query)
        .limit(50)
        .map((t: Document) => t as Post)
        .toArray();
    }
    return table
      .aggregate(query)
      .map((t: Document) => t as Post)
      .toArray();
  }

  static async createPost(post: Post): Promise<ObjectId> {
    const table = await getTable(databasePostTable);
    const response = await table.insertOne(post);
    if (!response.acknowledged) {
      throw new Error("Database operation failed");
    }
    return response.insertedId;
  }

  static async updatePost(
    query: Document,
    updateObject: Document
  ): Promise<Post> {
    const table = await getTable(databasePostTable);
    const response = await table.findOneAndUpdate(query, updateObject, {
      upsert: false,
    });
    if (!response || !response.ok || !response.value) {
      throw new Error("Database operation failed");
    }
    return response.value as Post;
  }

  static async deletePost(query: Document): Promise<number> {
    const table = await getTable(databasePostTable);
    const response = await table.deleteOne(query);
    if (!response.acknowledged) {
      throw new Error("Database operation failed");
    }
    return response.deletedCount;
  }
}

export default PostDAO;
