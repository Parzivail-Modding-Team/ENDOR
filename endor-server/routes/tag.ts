import { ObjectId } from 'mongodb';
import TagDAO from '../dao/tagDAO';
import { Tag } from '../types';

export function sortAlphabetically(arr: [Tag]) {
  return arr.sort((a: any, b: any) => {
    if (a.label < b.label) {
      return -1;
    } else if (a.label > b.label) {
      return 1;
    } else {
      return 0;
    }
  });
}

async function getTags(_: any, request: any) {
  const { label } = request;

  const query = [{ $match: {} }];

  if (label) {
    query[0].$match = { label: { $regex: `^${label}.*` } };
  }

  const tagData: any = await TagDAO.findTags(query).catch((error: Error) => {
    throw new Error(error.message);
  });
  return sortAlphabetically(tagData);
}

async function createTags(_: any, tags: any) {
  const tagData: any = await TagDAO.createTags(tags).catch((error: Error) => {
    throw new Error(error.message);
  });
  return tagData;
}

async function updateTag(_: any, request: any) {
  const { input } = request;

  const tagData: any = await TagDAO.updateTag(
    { _id: new ObjectId(input._id) },
    { $set: { label: input.label } }
  )
    .then((data: any) => data._id)
    .catch((error: Error) => {
      throw new Error(error.message);
    });
  return tagData;
}

async function deleteTag(_: any, request: any) {
  const { _id } = request;

  const tagData: any = await TagDAO.deleteTag({ _id: new ObjectId(_id) })
    .then((e: any) => e)
    .catch((error: Error) => {
      throw new Error(error.message);
    });

  if (tagData && tagData > 0) {
    return tagData;
  }
}

export { getTags, createTags, updateTag, deleteTag };
