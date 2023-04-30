import moment from 'moment/moment.js';
import { ObjectId, Document } from 'mongodb';
import aws from 'aws-sdk';

import tagDAO from '../dao/tagDAO';
import PostDAO from '../dao/postDAO';
import { getTime, sanitizeArray, tagChecker } from './utils';

import {
  Post,
  InsertResponseType,
  PostIdArgs,
  GetPostsArgs,
  InputPostArgs,
  UpdatePostArgs,
} from '../types';

async function getPostDetails(
  _: any,
  args: PostIdArgs
): Promise<Document[] | void> {
  const { _id } = args;

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
  _: any,
  args: GetPostsArgs
): Promise<Document[] | void> {
  const { tags } = args;

  if (tags) {
    const postData: Document[] | void = await PostDAO.findPosts([
      {
        $match: {
          tags: {
            $all: tags.map((tag: any) => new ObjectId(tag)),
          },
        },
      },
    ]).catch((e: unknown) => {
      if (e instanceof Error) {
        throw new Error(e.message);
      } else {
        console.error(e);
      }
    });
    if (typeof postData === 'object') {
      return postData.reverse();
    }
  }

  if (!tags) {
    const postData: Document[] | void = await PostDAO.findPosts(
      [
        {
          $match: {},
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
    if (typeof postData === 'object') {
      return postData.reverse();
    }
  }
}

async function createPost(
  args: InputPostArgs,
  imageId: string
): Promise<string | void> {
  const { addTags, createTags, message } = args;

  const parsedAddTags: any = JSON.parse(addTags);
  const parsedCreateTags: any = JSON.parse(createTags);

  const time: number = getTime();

  let newTagsInsert: number = 0;

  if (
    parsedCreateTags &&
    parsedCreateTags.length &&
    parsedCreateTags.length > 0
  ) {
    newTagsInsert = await tagDAO.createTags(sanitizeArray(parsedCreateTags));
  }

  const post: Post = {
    tags: tagChecker(
      newTagsInsert && newTagsInsert > 0 ? parsedCreateTags : [],
      parsedAddTags
    ),
    message,
    createdAt: time,
    updatedAt: time,
    imageUrl: process.env.CDN_URL + imageId,
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
  _: any,
  args: UpdatePostArgs
): Promise<string | void> {
  const { _id } = args;
  const { addTags, createTags, message } = args.input;

  let newTagsInsert: number = 0;

  if (createTags && createTags.length && createTags.length > 0) {
    newTagsInsert = await tagDAO.createTags(sanitizeArray(createTags));
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

async function deletePost(_: any, args: PostIdArgs): Promise<boolean | void> {
  const { _id } = args;

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
    const spacesEndpoint: aws.Endpoint = new aws.Endpoint(
      String(process.env.ENDPOINT_URL)
    );
    const s3: aws.S3 = new aws.S3({
      endpoint: spacesEndpoint,
    });

    s3.deleteObject(
      { Bucket: String(process.env.BUCKET), Key: postData.value.imageId },
      (e: unknown) => {
        if (!e) {
          return true;
        } else if (e instanceof Error) {
          throw new Error(e.message);
        } else {
          console.error(e);
        }
      }
    );
  }
}

export { getPosts, getPostDetails, createPost, updatePost, deletePost };
