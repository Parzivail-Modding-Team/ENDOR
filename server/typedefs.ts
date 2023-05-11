export const typeDefs = `#graphql
  type User {
    _id: String
    id: String
    role: Int
    updatedAt: Float
    avatarUrl: String
    username: String
  }

  type Post {
    _id: String
    author: User
    createdAt: String
    updatedAt: String
    imageUrl: String
    imageId: String
    message: String
    tags: [Tag]
  }

  type Tag {
    _id: String
    label: String
  }

  input PostInput {
    message: String
    addTags: [TagInput]
    createTags: [TagInput]
  }

  input TagInput {
    _id: String
    label: String
    value: String
  }

  input UpdateTagInput {
    _id: String
    label: String
  }

  type Query {
    getPosts(tags: [String]): [Post]
    getPostDetails(_id: String): [Post]
    getTags(label: String): [Tag]
    getUser: User
  }

  type Mutation {
    createPost(input: PostInput): String
    updatePost(_id: String, input: PostInput): String
    deletePost(_id: String): Boolean
    updateTag(_id: String, input: UpdateTagInput): String
    deleteTag(_id: String): Boolean
  }
`;
