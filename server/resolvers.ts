import { getTags, getAllTagLabels, updateTag, deleteTag } from './routes/tag';
import {
  createPost,
  getPosts,
  getPostDetails,
  updatePost,
  deletePost,
} from './routes/post';
import { getUser, getUsers, updateUser } from './routes/user';

export const resolvers = {
  Query: {
    getTags,
    getAllTagLabels,
    getPosts,
    getPostDetails,
    getUser,
    getUsers,
  },
  Mutation: {
    createPost,
    updatePost,
    deletePost,
    updateTag,
    deleteTag,
    updateUser,
  },
};
