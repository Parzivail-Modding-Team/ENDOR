import { ObjectId } from 'mongodb';

type User = {
  _id: string;
  sub: string;
  email: string;
};

/**
 * Tag and related request and response types
 */
type Tag = {
  _id?: string;
  key?: string;
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
  _id?: string | ObjectId;
  author?: User;
  createdAt: number;
  updatedAt: number;
  imageUrl: string;
  imageId: string;
  message: string;
  tags: (Tag | ObjectId | string)[];
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

type InputPostArgs = {
  message: string;
  addTags: any;
  createTags: any;
};

type UpdatePostArgs = {
  _id: string;
  input: InputPostArgs;
};

export {
  User,
  Tag,
  Post,
  InsertResponseType,
  PostIdArgs,
  GetPostsArgs,
  InputPostArgs,
  UpdatePostArgs,
  GetTagsArgs,
  UpdateTagArgs,
  DeleteTagArgs,
};
