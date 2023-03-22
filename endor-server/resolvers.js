import { getTags } from './routes/tag.js';
import { createPost, getPosts } from './routes/post.js';

export const resolvers = {
  Query: { getTags, getPosts },
  Mutation: {
    createPost,
  },
};
