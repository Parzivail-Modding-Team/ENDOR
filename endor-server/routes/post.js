import moment from 'moment/moment.js';
import { ObjectId } from 'mongodb';
import postDAO from '../dao/postDAO.js';
import tagDAO from '../dao/tagDAO.js';

async function getPosts(_, request, __) {
  let query = [{ $match: {} }];

  if (request && request._id) {
    const postData = await postDAO
      .findPosts([{ $match: { _id: new ObjectId(request._id) } }])
      .catch((e) => {
        console.error(e);
        return [];
      });

    return postData;
  }

  const postData = await postDAO.findPosts(query).catch((e) => {
    console.error(e);
    return [];
  });

  return postData;
}

async function createPost(_, request, __) {
  const requestParams = JSON.parse(JSON.stringify(request.input));

  const time = moment().unix();

  function sanitizeArray(arr) {
    if (!arr || arr.length === 0) return [];

    return [...arr];
  }

  const newTags = await tagDAO.createTags(
    sanitizeArray(requestParams.createTags)
  );

  if (newTags && newTags >= 0) {
    const post = {
      tags: sanitizeArray(requestParams.createTags)
        .map((tag) => {
          return {
            _id: tag._id.toString(),
          };
        })
        .concat(sanitizeArray(requestParams.addTags)),
      message: requestParams.message,
      createdAt: time,
      updatedAt: time,
    };

    const newPost = await postDAO.createPost(post).catch((e) => {
      console.error(e);
      return {};
    });

    return newPost;
  }
}

export { getPosts, createPost };
