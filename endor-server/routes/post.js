import moment from 'moment/moment.js';
import { ObjectId } from 'mongodb';
import postDAO from '../dao/postDAO.js';
import tagDAO from '../dao/tagDAO.js';

function fixOutput(data) {
  const updatedPosts = data.map(async (post) => {
    const cleanedTags = post.tags.map((tag) => new ObjectId(tag._id));

    const fetchedTags = await tagDAO.findTags([
      { $match: { _id: { $in: cleanedTags } } },
    ]);

    const fixedTags = fetchedTags.map((tag) => {
      return { value: tag._id.toString(), label: tag.label };
    });

    const thing = { ...post, tags: fixedTags };

    return thing;
  });

  return updatedPosts;
}

async function getPosts(_, request, __) {
  const postData = await postDAO
    .findPosts(
      request && request._id
        ? [{ $match: { _id: new ObjectId(request._id) } }]
        : [{ $match: {} }]
    )
    .catch((e) => {
      console.error(e);
      return [];
    });

  return fixOutput(postData);
}

async function createPost(request, imageUrl) {
  // Checks to see if there are new tags to concat with
  function tagChecker(newT, addT) {
    if (newT && newT.length && newT.length > 0) {
      return sanitizeArray(newT)
        .map((tag) => {
          return {
            _id: tag._id.toString(),
          };
        })
        .concat(sanitizeArray(addT));
    } else {
      return sanitizeArray(addT);
    }
  }

  const requestParams = request;

  const addTags = JSON.parse(requestParams.addTags);
  const createTags = JSON.parse(requestParams.createTags);

  const time = moment().unix();

  function sanitizeArray(arr) {
    if (!arr || arr.length === 0) return [];

    return [...arr];
  }

  let newTagsInsert;

  if (createTags) {
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
