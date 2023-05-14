import { ObjectId } from 'mongodb';

enum Role {
  Unauthorized = 0,
  ReadOnly = 1,
  ReadWrite = 2,
  Admin = 3,
}

type User = {
  _id: string | ObjectId;
  id: string;
  role: Role;
  updatedAt: number;
  avatarUrl: string;
  username: string;
};

interface IdentityContext {
  identity: User;
}

/**
 * Tag and related request and response types
 */
type Tag = {
  _id?: string | ObjectId;
  label: string;
  value?: string;
};

type GetTagsArgs = {
  label: string;
};

type UpdateTagArgs = {
  _id: string;
  input: { label: string };
};

type DeleteTagArgs = {
  _id: string;
};

/**
 * Posts and related request and response types
 */
type Post = {
  _id?: ObjectId;
  author?: User;
  createdAt: number;
  updatedAt: number;
  imageUrl: string;
  imageId: string;
  message: string;
  tags: ObjectId[];
};

type InsertResponseType = {
  acknowledged: boolean;
  insertedId: ObjectId;
};

type PostIdArgs = {
  _id: string;
};

type GetPostsArgs = {
  tags: string[];
};

type CreatePostArgs = {
  message: string;
  addTags: string;
  createTags: string;
};

type UpdatePostArgs = {
  _id: string;
  input: UpdatePostInput;
};

type UpdatePostInput = {
  message: string;
  addTags: Tag[];
  createTags: Tag[];
};

export {
  User,
  Role,
  IdentityContext,
  Tag,
  Post,
  InsertResponseType,
  PostIdArgs,
  GetPostsArgs,
  CreatePostArgs,
  UpdatePostArgs,
  GetTagsArgs,
  UpdateTagArgs,
  DeleteTagArgs,
};
