import { getTags, updateTag, deleteTag } from './routes/tag';
import {
  createPost,
  getPosts,
  getPostDetails,
  updatePost,
  deletePost,
} from './routes/post';
import { getUser } from './routes/user';

export const resolvers = {
  Query: { getTags, getPosts, getPostDetails, getUser },
  Mutation: {
    createPost,
    updatePost,
    deletePost,
    updateTag,
    deleteTag,
  },
};
