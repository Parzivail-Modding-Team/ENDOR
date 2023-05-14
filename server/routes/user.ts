import { ObjectId } from 'mongodb';
import UserDAO from '../dao/userDAO';
import { IdentityContext, Role, User } from '../types';
import { requireRole } from './routeUtils';
import { GraphQLError } from 'graphql';

async function getUser(_: unknown, __: unknown, { identity }: IdentityContext) {
  const userData = await UserDAO.findUser([
    {
      $match: {
        _id: new ObjectId(identity._id),
      },
    },
  ]).then((e) => e[0])
  return userData;
}

async function getUsers(
  _: unknown,
  __: unknown,
  { identity }: IdentityContext
) {
  requireRole(identity, Role.Admin);

  const userData = await UserDAO.findUser([
    {
      $match: {},
    }
  ]);
  return userData;
}

async function updateUser(
  _: unknown,
  { id, role }: User,
  { identity }: IdentityContext
): Promise<string | void> {
  requireRole(identity, Role.Admin);

  if (id === identity.id) {
    throw new GraphQLError('You may not edit your own role');
  }

  const userData = await UserDAO.updateUser(
    { id },
    { $set: { role } }
  );
  return userData;
}

export { getUser, getUsers, updateUser };
