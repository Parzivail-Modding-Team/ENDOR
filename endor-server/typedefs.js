export const typeDefs = `#graphql
  type User {
    _id: String
    sub: String
    email: String
  }

  type Post {
    _id: String
    author: User
    createdAt: String
    updatedAt: String
    imageUrl: String
    message: String
    tags: [Tag]
  }

  type Tag {
    _id: String
    label: String
  }

  input TagInput {
    _id: String
    label: String
  }

  input PostInput {
    message: String
    addTags: [TagInput]
    createTags: [TagInput]
  }

  type Query {
    getPosts(tags: [String]): [Post]
    getPostDetails(_id: String): [Post]
    getTags(label: String): [Tag]
  }

  type Mutation {
    createPost(input: PostInput): String
  }
`;
