import moment from 'moment/moment.js';
import postDAO from '../dao/postDAO.js';
import tagDAO from '../dao/tagDAO.js';

async function getPosts() {
  let query = [{ $match: {} }];

  const postData = await postDAO.findPosts(query).catch((e) => {
    console.error(e);
    return [];
  });

  return { posts: postData };
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

  if (newTags) {
    const post = {
      tags: sanitizeArray(newTags).concat(sanitizeArray(requestParams.addTags)),
      message: requestParams.message,
      createdAt: time,
      updatedAt: time,
    };

    console.log(post);

    const newPost = await postDAO.createPost(post).catch((e) => {
      console.error(e);
      return {};
    });

    console.log(newPost);
  }
}

export { getPosts, createPost };
