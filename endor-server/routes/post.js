import moment from 'moment/moment.js';
import { ObjectId } from 'mongodb';
import postDAO from '../dao/postDAO.js';
import tagDAO from '../dao/tagDAO.js';

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

async function getPosts(_, request, __) {
  const postData = await postDAO
    .findPosts([
      {
        $match:
          request && request._id ? { _id: new ObjectId(request._id) } : {},
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

  const thing = await postDAO
    .createPost(post)
    .catch((e) => {
      console.error(e);
    })
    .then((data) => {
      if (data && data.acknowledged && data.acknowledged === true) {
        return data.insertedId.toString();
      }
    });

  return thing;
}

export { getPosts, createPost };
