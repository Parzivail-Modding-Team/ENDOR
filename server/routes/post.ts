import { ObjectId, Document } from 'mongodb';
import aws from 'aws-sdk';

import tagDAO from '../dao/tagDAO';
import PostDAO from '../dao/postDAO';
import { getTime, requireRole, rethrowAsGqlError, tagChecker } from './routeUtils';

import { GraphQLError } from 'graphql';

import {
  Post,
  InsertResponseType,
  PostIdArgs,
  GetPostsArgs,
  UpdatePostArgs,
  CreatePostArgs,
  Tag,
  User,
  Role,
  IdentityContext,
} from '../types';
import { bucketCdnUrl, bucketName } from '../environment';
import { getBucket } from '../bucket';

async function getPostDetails(
  _: unknown,
  args: PostIdArgs,
  { identity }: IdentityContext
): Promise<Document[] | void> {
  const { _id } = args;

  requireRole(identity, Role.ReadOnly);

  const postData: Document[] | void = await PostDAO.findPosts([
    {
      $match: { _id: new ObjectId(_id) },
    },
    {
      $lookup: {
        from: 'endor-tag',
        localField: 'tags',
        foreignField: '_id',
        as: 'tags',
      },
    },
    {
      $addFields: {
        tags: { $sortArray: { input: '$tags', sortBy: { label: 1 } } },
      },
    },
  ]).catch((e: unknown) => {
    if (e instanceof Error) {
      throw new Error(e.message);
    } else {
      console.error(e);
    }
  });
  return postData;
}

// TODO: Delete unfound tags from post on fetch of post
// Edit: it actually just passes over any tags it can't find without failing
async function getPosts(
  _: unknown,
  args: GetPostsArgs,
  { identity }: IdentityContext
): Promise<Document[]> {
  const { tags } = args;

  requireRole(identity, Role.ReadOnly);

  if (tags) {
    const postData = await PostDAO.findPosts([
      {
        $match: {
          tags: {
            $all: tags.map((tag: string) => new ObjectId(tag)),
          },
        },
      },
      {
        $sort: {
          createdAt: 1,
        },
      },
    ]);
    return postData;
  }

  const postData = await PostDAO.findPosts(
    [
      {
        $match: {},
      },
      {
        $sort: {
          createdAt: 1,
        },
      },
    ],
    true
  );
  return postData;
}

async function createPost(
  args: CreatePostArgs,
  imageId: string
): Promise<string> {
  const { addTags, createTags, message } = args;

  const parsedAddTags: Tag[] = JSON.parse(addTags);
  const parsedCreateTags: Tag[] = JSON.parse(createTags);

  const time: number = getTime();

  let newTagsInsert: number = 0;

  if (
    parsedCreateTags &&
    parsedCreateTags.length &&
    parsedCreateTags.length > 0
  ) {
    newTagsInsert = await tagDAO.createTags(parsedCreateTags);
  }

  const post: Post = {
    tags: tagChecker(
      newTagsInsert && newTagsInsert > 0 ? parsedCreateTags : [],
      parsedAddTags
    ),
    message,
    createdAt: time,
    updatedAt: time,
    imageUrl: bucketCdnUrl + imageId,
    imageId,
  };

  const createdPostId = await PostDAO.createPost(post);
  return createdPostId.toString();
}

async function updatePost(
  _: unknown,
  args: UpdatePostArgs,
  { identity }: IdentityContext
): Promise<string> {
  const { _id } = args;
  const { addTags, createTags, message } = args.input;

  requireRole(identity, Role.ReadWrite);

  let newTagsInsert: number = 0;

  if (createTags && createTags.length && createTags.length > 0) {
    newTagsInsert = await tagDAO.createTags(createTags);
  }

  const updatedPostId = await PostDAO.updatePost(
    { _id: new ObjectId(_id) },
    {
      $set: {
        tags: tagChecker(
          newTagsInsert > 0 ? createTags : [],
          addTags
        ),
        message,
        updatedAt: getTime(),
      },
    }
  )

  return updatedPostId.toString();
}

async function deletePost(
  _: unknown,
  args: PostIdArgs,
  { identity }: IdentityContext
): Promise<boolean> {
  const { _id } = args;

  requireRole(identity, Role.ReadWrite);

  const postData = await PostDAO.deletePost({
    _id: new ObjectId(_id),
  });

  const s3 = getBucket();
  await s3.deleteObject({ Bucket: bucketName, Key: postData.imageId }).promise();

  return true;
}

export { getPosts, getPostDetails, createPost, updatePost, deletePost };
