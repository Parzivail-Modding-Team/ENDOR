import TagDAO from '../dao/tagDAO.js';

async function getTags() {
  let query = [{ $match: {} }];

  const tagData = await TagDAO.findTags(query).catch((e) => {
    console.error(e);
    return [];
  });

  const fixedTags = tagData.map((tag) => {
    return { value: tag._id.toString(), label: tag.label };
  });

  return fixedTags;
}

async function createTags() {
  const tagData = await TagDAO.insertMany(tags).catch((e) => {
    console.error(error);
    return [];
  });

  return tagData;
}

export { getTags, createTags };
