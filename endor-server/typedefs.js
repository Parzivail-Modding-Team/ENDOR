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
    key: String
    label: String
    value: String
  }

  input UpdateTagInput {
    _id: String
    label: String
  }

  input UpdatePostTagInput {
    key: String
    label: String
    value: String
  }

  input PostInput {
    message: String
    addTags: [TagInput]
    createTags: [TagInput]
  }

  input UpdatePostInput {
    _id: String
    message: String
    addTags: [UpdatePostTagInput]
    createTags: [UpdatePostTagInput]
  }

  type Query {
    getPosts(tags: [String]): [Post]
    getPostDetails(_id: String): [Post]
    getTags(label: String): [Tag]
  }

  type Mutation {
    createPost(input: PostInput): String
    updatePost(input: UpdatePostInput): String
    deletePost(_id: String): Boolean
    updateTag(input: UpdateTagInput): String
    deleteTag(_id: String): Boolean
  }
`;
