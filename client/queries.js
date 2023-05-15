import { gql } from 'graphql-tag';

export const GetUser = gql`
  query GetUser {
    getUser {
      id
      role
      avatarUrl
    }
  }
`;

export const GetUsers = gql`
  query GetUsers {
    getUsers {
      id
      role
      username
      avatarUrl
    }
  }
`;

export const UpdateUser = gql`
  mutation UpdateUser($id: String, $role: Int) {
    updateUser(id: $id, role: $role)
  }
`;

export const GetAllTagLabels = gql`
  query GetAllTagLabels {
    getAllTagLabels {
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
  mutation UpdateTag($_id: String, $input: UpdateTagInput) {
    updateTag(_id: $_id, input: $input)
  }
`;

export const DeleteTag = gql`
  mutation DeleteTag($_id: String) {
    deleteTag(_id: $_id)
  }
`;
