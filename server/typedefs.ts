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

  type TagLabel {
    label: String
  }

  input PostInput {
    message: String
    tags: [String]
  }

  input UpdateTagInput {
    label: String
  }

  type Query {
    getPosts(tags: [String]): [Post]
    getPostDetails(_id: String): [Post]
    getTags(label: String): [Tag]
    getAllTagLabels: [TagLabel]
    getUser: User
    getUsers: [User]
  }

  type Mutation {
    createPost(input: PostInput): String
    updatePost(_id: String, input: PostInput): String
    deletePost(_id: String): Boolean
    updateTag(_id: String, input: UpdateTagInput): String
    deleteTag(_id: String): Boolean
    updateUser(id: String, role: Int): String
  }
`;
