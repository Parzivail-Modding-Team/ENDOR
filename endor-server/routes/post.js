import moment from 'moment/moment.js';
import { ObjectId } from 'mongodb';
import postDAO from '../dao/postDAO.js';
import tagDAO from '../dao/tagDAO.js';
import PostDAO from '../dao/postDAO.js';

function tagChecker(newT, addT) {
  if (newT && newT.length && newT.length > 0) {
    return sanitizeArray(newT.map((tag) => tag._id)).concat(
      sanitizeArray(addT.map((tag) => new ObjectId(tag.value)))
    );
  } else {
    return sanitizeArray(addT.map((tag) => new ObjectId(tag.value)));
  }
}

function sanitizeArray(arr) {
  if (!arr || arr.length === 0) return [];

  return [...arr];
}

async function getPostDetails(_, request, __) {
  const postData = await postDAO
    .findPosts([
      {
        $match: { _id: new ObjectId(request._id) },
      },
      {
        $lookup: {
          from: 'endor-tag',
          localField: 'tags',
          foreignField: '_id',
          as: 'tags',
        },
      },
    ])
    .catch((e) => {
      console.error(e);
      return [];
    });

  return postData;
}

async function getPosts(_, request, __) {
  const { tags } = request;

  if (tags) {
    const postData = await postDAO
      .findPosts([
        {
          $match: {
            tags: {
              $all: tags.map((tag) => new ObjectId(tag)),
            },
          },
        },
      ])
      .catch((e) => {
        console.error(e);
        return [];
      });

    return postData.reverse();
  }

  if (!tags) {
    const postData = await postDAO
      .findPosts(
        [
          {
            $match: {},
          },
        ],
        'limit'
      )
      .catch((e) => {
        console.error(e);
        return [];
      });

    return postData.reverse();
  }
}

async function createPost(request, imageUrl) {
  const requestParams = request;

  const addTags = JSON.parse(requestParams.addTags);
  const createTags = JSON.parse(requestParams.createTags);

  const time = moment().unix();

  let newTagsInsert;

  if (createTags && createTags.length && createTags.length > 0) {
    newTagsInsert = await tagDAO.createTags(sanitizeArray(createTags));
  }

  const post = {
    tags: tagChecker(
      newTagsInsert && newTagsInsert > 0 ? createTags : [],
      addTags
    ),
    message: requestParams.message,
    createdAt: time,
    updatedAt: time,
    imageUrl,
  };

  const postData = await postDAO
    .createPost(post)
    .catch((e) => {
      console.error(e);
    })
    .then((data) => {
      if (data && data.acknowledged && data.acknowledged === true) {
        return data.insertedId.toString();
      }
    });

  return postData;
}

async function updatePost(__, request) {
  const { input } = request;

  const addTags = input.addTags;
  const createTags = input.createTags;

  const time = moment().unix();

  let newTagsInsert;

  if (createTags && createTags.length && createTags.length > 0) {
    newTagsInsert = await tagDAO.createTags(sanitizeArray(createTags));
  }

  const postData = await PostDAO.updatePost(
    { _id: new ObjectId(input._id) },
    {
      $set: {
        tags: tagChecker(
          newTagsInsert && newTagsInsert > 0 ? createTags : [],
          addTags
        ),
        message: input.message,
        updatedAt: time,
      },
    }
  )
    .then((e) => e)
    .catch((e) => {
      console.error(e);
      return [];
    });

  return postData;
}

// TODO: delete image associated with post
async function deletePost(__, request) {
  const { _id } = request;

  const postData = await PostDAO.deletePost({ _id: new ObjectId(_id) })
    .then((e) => e)
    .catch((e) => {
      console.error(e);
      return [];
    });

  if (postData && postData > 0) {
    return postData;
  }
}

export { getPosts, getPostDetails, createPost, updatePost, deletePost };
