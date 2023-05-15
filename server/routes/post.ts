import { ObjectId, Document } from 'mongodb';

import PostDAO from '../dao/postDAO';
import { getTime, requireRole } from './routeUtils';

import {
  Post,
  PostIdArgs,
  GetPostsArgs,
  UpdatePostArgs,
  CreatePostArgs,
  Tag,
  Role,
  IdentityContext,
} from '../types';
import { bucketCdnUrl, bucketName } from '../environment';
import { getBucket } from '../bucket';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import TagDAO from '../dao/tagDAO';

async function getPostDetails(
  _: unknown,
  args: PostIdArgs,
  { identity }: IdentityContext
): Promise<Document[]> {
  const { _id } = args;

  requireRole(identity, Role.ReadOnly);

  const postData = await PostDAO.findPosts([
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
  ]);

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

  const mappedTags = await TagDAO.findTags([
    {
      $match:
        tags && tags.length > 0
          ? {
              label: {
                $in: tags,
              },
            }
          : {},
    },
  ]);

  const postData = await PostDAO.findPosts([
    {
      $match:
        tags && tags.length > 0
          ? {
              tags: {
                $all: mappedTags.map((tag) => tag._id),
              },
            }
          : {},
    },
    {
      $sort: {
        createdAt: 1,
      },
    },
  ]);
  return postData;
}

async function findAndCreateTags(tagLabels: string[]): Promise<ObjectId[]> {
  // find the tags that already exist in the database
  const existingTags = await TagDAO.findTags([
    {
      $match:
        tagLabels.length > 0
          ? {
              label: {
                $in: tagLabels,
              },
            }
          : {},
    },
  ]);

  // Remove the existing tags from the set of post tags
  const tagSet = new Set<string>(tagLabels);
  existingTags.forEach((tag) => {
    tagSet.delete(tag.label);
  });

  // Create the missing tags, allowing the mongo driver to
  // give each array entry an _id in-situ
  const newTags = [...tagSet].map((label) => {
    return { label };
  });
  if (newTags.length > 0) {
    await TagDAO.createTags(newTags);
  }

  // Re-combine the arrays of tags
  return existingTags
    .concat(newTags.map((document) => document as Tag))
    .map((tag) => tag._id);
}

async function createPost(
  args: CreatePostArgs,
  imageId: string
): Promise<string> {
  const { tags, message } = args;

  const tagLabels = (JSON.parse(tags) as string[]).map((o) => String(o));
  const tagIds = await findAndCreateTags(tagLabels);

  // Create the post
  const time: number = getTime();
  const post: Post = {
    tags: tagIds,
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
  const { tags, message } = args.input;

  requireRole(identity, Role.ReadWrite);

  const tagIds = await findAndCreateTags(tags);

  const updatedPostId = await PostDAO.updatePost(
    { _id: new ObjectId(_id) },
    {
      $set: {
        tags: tagIds,
        message,
        updatedAt: getTime(),
      },
    }
  );

  return updatedPostId.toString();
}

async function deletePost(
  _: unknown,
  args: PostIdArgs,
  { identity }: IdentityContext
): Promise<boolean> {
  const { _id } = args;

  requireRole(identity, Role.ReadWrite);

  const postData = await PostDAO.getPost({
    _id: new ObjectId(_id),
  });

  const s3 = getBucket();
  await s3.send(
    new DeleteObjectCommand({ Bucket: bucketName, Key: postData.imageId })
  );

  return (
    (await PostDAO.deletePost({
      _id: new ObjectId(_id),
    })) > 0
  );
}

export { getPosts, getPostDetails, createPost, updatePost, deletePost };
