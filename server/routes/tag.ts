import { ObjectId, Document } from 'mongodb';
import TagDAO from '../dao/tagDAO';
import {
  DeleteTagArgs,
  GetTagsArgs,
  IdentityContext,
  Role,
  Tag,
  TagLabel,
  UpdateTagArgs,
} from '../types';
import { requireRole } from './routeUtils';

async function getTags(
  _: unknown,
  args: GetTagsArgs,
  { identity }: IdentityContext
): Promise<Document[]> {
  const { label } = args;

  requireRole(identity, Role.ReadOnly);

  const query = [
    { $match: {} },
    {
      $sort: {
        label: 1,
      },
    },
  ];

  if (label) {
    query[0].$match = { label: { $regex: `^${label}.*` } };
  }

  return await TagDAO.findTags(query);
}

async function getAllTagLabels(
  _: unknown,
  __: unknown,
  { identity }: IdentityContext
): Promise<TagLabel[]> {
  requireRole(identity, Role.ReadOnly);

  return await TagDAO.getAllTagLabels();
}

async function createTags(
  _: unknown,
  tags: Tag[],
  { identity }: IdentityContext
): Promise<number> {
  requireRole(identity, Role.ReadWrite);

  return await TagDAO.createTags(tags);
}

async function updateTag(
  _: unknown,
  args: UpdateTagArgs,
  { identity }: IdentityContext
): Promise<string> {
  const { _id } = args;
  const { label } = args.input;

  requireRole(identity, Role.ReadWrite);

  const tagData = await TagDAO.updateTag(
    { _id: new ObjectId(_id) },
    { $set: { label } }
  );
  return tagData.toString();
}

async function deleteTag(
  _: unknown,
  args: DeleteTagArgs,
  { identity }: IdentityContext
): Promise<boolean | void> {
  const { _id } = args;

  requireRole(identity, Role.ReadWrite);

  return (
    (await TagDAO.deleteTag({
      _id: new ObjectId(_id),
    })) > 0
  );
}

export { getTags, getAllTagLabels, createTags, updateTag, deleteTag };
