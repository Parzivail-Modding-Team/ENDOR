import { gql } from 'graphql-tag';

export const GetTags = gql`
  query GetTags($label: String) {
    getTags(label: $label) {
      _id
      label
    }
  }
`;

export const GetPosts = gql`
  query GetPosts($tags: [String]) {
    getPosts(tags: $tags) {
      _id
      imageUrl
    }
  }
`;

export const GetPostDetails = gql`
  query GetPostDetails($_id: String) {
    getPostDetails(_id: $_id) {
      _id
      message
      imageUrl
      createdAt
      updatedAt
      tags {
        _id
        label
      }
    }
  }
`;

export const CreatePost = gql`
  mutation CreatePost($input: PostInput) {
    createPost(input: $input)
  }
`;

export const UpdatePost = gql`
  mutation UpdatePost($_id: String, $input: PostInput) {
    updatePost(_id: $_id, input: $input)
  }
`;

export const DeletePost = gql`
  mutation DeletePost($_id: String) {
    deletePost(_id: $_id)
  }
`;

export const UpdateTag = gql`
  mutation UpdateTag($input: UpdateTagInput) {
    updateTag(input: $input)
  }
`;

export const DeleteTag = gql`
  mutation DeleteTag($_id: String) {
    deleteTag(_id: $_id)
  }
`;
