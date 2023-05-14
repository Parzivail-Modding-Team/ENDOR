import { ObjectId, Document } from 'mongodb';
import aws from 'aws-sdk';

import tagDAO from '../dao/tagDAO';
import PostDAO from '../dao/postDAO';
import { getTime, requireRole, tagChecker } from './routeUtils';

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
): Promise<Document[] | void> {
  const { tags } = args;

  requireRole(identity, Role.ReadOnly);

  if (tags) {
    const postData: Document[] | void = await PostDAO.findPosts([
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
    ]).catch((e: unknown) => {
      if (e instanceof Error) {
        throw new Error(e.message);
      } else {
        console.error(e);
      }
    });
    return postData;
  }

  if (!tags) {
    const postData: Document[] | void = await PostDAO.findPosts(
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
    ).catch((e: unknown) => {
      if (e instanceof Error) {
        throw new Error(e.message);
      } else {
        console.error(e);
      }
    });
    return postData;
  }
}

async function createPost(
  args: CreatePostArgs,
  imageId: string
): Promise<string | void> {
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

  const postData: string | void = await PostDAO.createPost(post)
    .then((data: InsertResponseType) => {
      if (data.acknowledged === true) {
        return data.insertedId.toString();
      }
    })
    .catch((e: unknown) => {
      if (e instanceof Error) {
        throw new Error(e.message);
      } else {
        console.error(e);
      }
    });
  if (typeof postData === 'string') {
    return postData;
  }
}

async function updatePost(
  _: unknown,
  args: UpdatePostArgs,
  { identity }: IdentityContext
): Promise<string | void> {
  const { _id } = args;
  const { addTags, createTags, message } = args.input;

  requireRole(identity, Role.ReadWrite);

  let newTagsInsert: number = 0;

  if (createTags && createTags.length && createTags.length > 0) {
    newTagsInsert = await tagDAO.createTags(createTags);
  }

  const postData: string | void = await PostDAO.updatePost(
    { _id: new ObjectId(_id) },
    {
      $set: {
        tags: tagChecker(
          newTagsInsert && newTagsInsert > 0 ? createTags : [],
          addTags
        ),
        message,
        updatedAt: getTime(),
      },
    }
  )
    .then((data: ObjectId) => {
      return data.toString();
    })
    .catch((e: unknown) => {
      if (e instanceof Error) {
        throw new Error(e.message);
      } else {
        console.error(e);
      }
    });
  return postData;
}

async function deletePost(
  _: unknown,
  args: PostIdArgs,
  { identity }: IdentityContext
): Promise<boolean | void> {
  const { _id } = args;

  requireRole(identity, Role.ReadWrite);

  const postData: Document | void = await PostDAO.deletePost({
    _id: new ObjectId(_id),
  })
    .then((e: Document) => e)
    .catch((e: unknown) => {
      if (e instanceof Error) {
        throw new Error(e.message);
      } else {
        console.error(e);
      }
    });

  if (postData && postData.value && postData.value._id) {
    const s3: any = getBucket();

    s3.deleteObject(
      { Bucket: bucketName, Key: postData.value.imageId },
      (e: unknown) => {
        return true;
      }
    );
    return true;
  }
  return false;
}

export { getPosts, getPostDetails, createPost, updatePost, deletePost };
