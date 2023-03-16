import { getTags } from './routes/tag.js';
import { createPost } from './routes/post.js';

export const resolvers = {
  Query: { getTags },
  Mutation: {
    createPost,
  },
};
