import { ObjectId, Document } from 'mongodb';
import TagDAO from '../dao/tagDAO';
import { DeleteTagArgs, GetTagsArgs, Tag, UpdateTagArgs } from '../types';
import { sortAlphabetically } from './utils';

async function getTags(_: any, args: GetTagsArgs): Promise<Document[] | void> {
  const { label } = args;

  const query = [{ $match: {} }];

  if (label) {
    query[0].$match = { label: { $regex: `^${label}.*` } };
  }

  // TODO: unify to the .then() return style, some type mismatch or something makes getTags return null when I try
  const tagData: Document[] | void = await TagDAO.findTags(query).catch(
    (e: unknown) => {
      if (e instanceof Error) {
        throw new Error(e.message);
      } else {
        console.error(e);
      }
    }
  );
  if (typeof tagData === 'object') {
    return sortAlphabetically(tagData);
  }
}

async function createTags(_: any, tags: any): Promise<number | void> {
  await TagDAO.createTags(tags)
    .then((e: number) => e)
    .catch((e: unknown) => {
      if (e instanceof Error) {
        throw new Error(e.message);
      } else {
        console.error(e);
      }
    });
}

async function updateTag(_: any, args: UpdateTagArgs): Promise<string | void> {
  const { _id } = args;
  const { label } = args.input;

  const tagData: string | void = await TagDAO.updateTag(
    { _id: new ObjectId(_id) },
    { $set: { label } }
  )
    .then((data: any) => String(data))
    .catch((e: unknown) => {
      if (e instanceof Error) {
        throw new Error(e.message);
      } else {
        console.error(e);
      }
    });
  if (typeof tagData === 'string') {
    return tagData;
  }
}

async function deleteTag(_: any, args: DeleteTagArgs): Promise<boolean | void> {
  const { _id } = args;

  await TagDAO.deleteTag({
    _id: new ObjectId(_id),
  })
    .then((e: number) => {
      if (e && e > 0) {
        true;
      }
    })
    .catch((error: Error) => {
      throw new Error(error.message);
    });
}

export { getTags, createTags, updateTag, deleteTag };
