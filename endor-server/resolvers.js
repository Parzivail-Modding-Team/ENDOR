import { getTags } from './routes/tag.js';
import { createPost, getPosts, getPostDetails } from './routes/post.js';

export const resolvers = {
  Query: { getTags, getPosts, getPostDetails },
  Mutation: {
    createPost,
  },
};
