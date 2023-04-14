import TagDAO from '../dao/tagDAO.js';

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

  return tagData;
}

async function createTags(tags) {
  const tagData = await TagDAO.insertMany(tags).catch((e) => {
    console.error(error);
    return [];
  });

  return tagData;
}

export { getTags, createTags };
