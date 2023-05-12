import { ObjectId } from 'mongodb';
import UserDAO from '../dao/userDAO';
import { IdentityContext, Role } from '../types';
import { requireRole } from './utils';
import { GraphQLError } from 'graphql';

async function getUser(_: unknown, __: unknown, { identity }: IdentityContext) {
  const userData: any = await UserDAO.findUser([
    {
      $match: {
        _id: new ObjectId(identity._id),
      },
    },
  ])
    .then((e) => e[0])
    .catch((e: unknown) => {
      if (e instanceof Error) {
        throw new Error(e.message);
      } else {
        console.error(e);
      }
    });
  return userData;
}

async function getUsers(
  _: unknown,
  __: unknown,
  { identity }: IdentityContext
) {
  requireRole(identity, Role.Admin);

  const userData: any = await UserDAO.findUser([
    {
      $match: {},
    },
  ])
    .then((e) => e)
    .catch((e: unknown) => {
      if (e instanceof Error) {
        throw new Error(e.message);
      } else {
        console.error(e);
      }
    });
  return userData;
}

async function updateUser(
  _: unknown,
  { id, role }: any,
  { identity }: IdentityContext
): Promise<string | void> {
  requireRole(identity, Role.Admin);

  if (id === identity.id) {
    throw new GraphQLError('You may not edit your own role');
  }

  const userData: string | void = await UserDAO.updateUser(
    { id },
    { $set: { role } }
  )
    .then((data) => data)
    .catch((e: unknown) => {
      if (e instanceof Error) {
        throw new Error(e.message);
      } else {
        console.error(e);
      }
    });
  return userData;
}

export { getUser, getUsers, updateUser };
