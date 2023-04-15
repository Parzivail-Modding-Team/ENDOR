import { ObjectId } from 'mongodb';
import TagDAO from '../dao/tagDAO.js';

export function sortAlphabetically(arr) {
  return arr.sort((a, b) => {
    if (a.label < b.label) {
      return -1;
    } else if (a.label > b.label) {
      return 1;
    } else {
      return 0;
    }
  });
}

async function getTags(_, request) {
  const { label } = request;

  let query = [{ $match: {} }];

  if (label) {
    query[0].$match = { label: { $regex: `^${label}.*` } };
  }

  const tagData = await TagDAO.findTags(query).catch((e) => {
    console.error(e);
    return [];
  });

  return sortAlphabetically(tagData);
}

async function createTags(tags) {
  const tagData = await TagDAO.insertMany(tags).catch((e) => {
    console.error(error);
    return [];
  });

  return tagData;
}

async function updateTag(__, request) {
  const { input } = request;

  const tagData = await TagDAO.updateTag(
    { _id: new ObjectId(input._id) },
    { $set: { label: input.label } }
  )
    .then((e) => e._id)
    .catch((e) => {
      console.error(error);
      return [];
    });

  return tagData;
}

export { getTags, createTags, updateTag };
