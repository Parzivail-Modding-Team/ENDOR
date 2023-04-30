import moment from 'moment/moment.js';
import { ObjectId } from 'mongodb';
import tagDAO from '../dao/tagDAO';
import PostDAO from '../dao/postDAO';

import aws from 'aws-sdk';
import { Post, Tag } from '../types';

function tagChecker(newT: Tag[], addT: Tag[]): (ObjectId | string)[] {
  // TODO: maybe do something about the tags here since they are passing in value and key which are both just the _id
  console.log(newT, addT);
  if (newT && newT.length && newT.length > 0) {
    return sanitizeArray(newT.map((tag: Tag) => tag._id)).concat(
      sanitizeArray(addT.map((tag: Tag) => new ObjectId(tag.value)))
    );
  } else {
    return sanitizeArray(addT.map((tag: Tag) => new ObjectId(tag.value)));
  }
}

function sanitizeArray(arr: (ObjectId | string)[]) {
  if (!arr || arr.length === 0) return [];
  return [...arr];
}

async function getPostDetails(_: any, request: any) {
  const { _id } = request;

  const postData: any = await PostDAO.findPosts([
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
  ]).catch((error: Error) => {
    throw new Error(error.message);
  });
  return postData;
}

// TODO: Delete unfound tags from post on fetch of post
async function getPosts(_: any, request: any) {
  const { tags } = request;

  if (tags) {
    const postData: any = await PostDAO.findPosts([
      {
        $match: {
          tags: {
            $all: tags.map((tag: any) => new ObjectId(tag)),
          },
        },
      },
    ]).catch((error: Error) => {
      throw new Error(error.message);
    });
    return postData.reverse();
  }

  if (!tags) {
    const postData: any = await PostDAO.findPosts(
      [
        {
          $match: {},
        },
      ],
      true
    ).catch((error: Error) => {
      throw new Error(error.message);
    });
    return postData.reverse();
  }
}

async function createPost(request: any, imageId: any) {
  const { addTags, createTags, message } = request;

  const parsedAddTags: any = JSON.parse(addTags);
  const parsedCreateTags: any = JSON.parse(createTags);

  const time: number = moment().unix();

  let newTagsInsert;

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

  const postData: any = await PostDAO.createPost(post)
    .then((data: any) => {
      if (data && data.acknowledged && data.acknowledged === true) {
        return data.insertedId.toString();
      }
    })
    .catch((error: Error) => {
      throw new Error(error.message);
    });
  return postData;
}

async function updatePost(_: any, request: any) {
  const { _id } = request;
  const { addTags, createTags, message } = request.input;

  const time = moment().unix();

  let newTagsInsert;

  if (createTags && createTags.length && createTags.length > 0) {
    newTagsInsert = await tagDAO.createTags(sanitizeArray(createTags));
  }

  const postData: any = await PostDAO.updatePost(
    { _id: new ObjectId(_id) },
    {
      $set: {
        tags: tagChecker(
          newTagsInsert && newTagsInsert > 0 ? createTags : [],
          addTags
        ),
        message,
        updatedAt: time,
      },
    }
  )
    .then((data: any) => data)
    .catch((error: Error) => {
      throw new Error(error.message);
    });
  return postData;
}

async function deletePost(_: any, request: any) {
  const { _id } = request;

  const postData: any = await PostDAO.deletePost({ _id: new ObjectId(_id) })
    .then((e) => e)
    .catch((error: Error) => {
      throw new Error(error.message);
    });

  if (postData && postData.value && postData.value) {
    const spacesEndpoint: aws.Endpoint = new aws.Endpoint(
      String(process.env.ENDPOINT_URL)
    );
    const s3: aws.S3 = new aws.S3({
      endpoint: spacesEndpoint,
    });

    s3.deleteObject(
      { Bucket: String(process.env.BUCKET), Key: postData.value.imageId },
      (error: Error) => {
        if (!error) {
          return postData;
        } else {
          throw new Error(error.message);
        }
      }
    );
  }
}

export { getPosts, getPostDetails, createPost, updatePost, deletePost };
