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
    _id: ID
    value: String
    label: String
  }

  input TagInput {
    _id: ID
    value: String
    label: String
  }

  input PostInput {
    message: String
    addTags: [TagInput]
    createTags: [TagInput]
  }

  type Query {
    getPosts(_id: String): [Post]
    getTags: [Tag]
  }

  type Mutation {
    createPost(input: PostInput): String
  }
`;
