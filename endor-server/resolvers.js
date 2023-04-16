import { getTags, updateTag, deleteTag } from './routes/tag.js';
import {
  createPost,
  getPosts,
  getPostDetails,
  updatePost,
  deletePost,
} from './routes/post.js';

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
