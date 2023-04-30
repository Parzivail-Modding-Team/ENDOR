import { ObjectId } from 'mongodb';

type User = {
  _id: string;
  sub: string;
  email: string;
};

type Tag = {
  _id?: string;
  label: string;
  value?: string;
};

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

export { User, Tag, Post };
