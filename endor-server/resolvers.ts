import { getTags, updateTag, deleteTag } from './routes/tag';
import {
  createPost,
  getPosts,
  getPostDetails,
  updatePost,
  deletePost,
} from './routes/post';

export const resolvers = {
  Query: { getTags, getPosts, getPostDetails },
  Mutation: {
    createPost,
    updatePost,
    deletePost,
    updateTag,
    deleteTag,
  },
};
