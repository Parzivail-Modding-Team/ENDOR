import { gql } from 'graphql-tag';

export const GetTags = gql`
  query GetTags {
    getTags {
      value
      label
    }
  }
`;

export const CreatePost = gql`
  mutation CreatePost($input: PostInput) {
    createPost(input: $input)
  }
`;
