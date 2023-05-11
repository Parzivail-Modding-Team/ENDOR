import { ObjectId } from 'mongodb';
import UserDAO from '../dao/userDAO';
import { IdentityContext } from '../types';

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

export { getUser };
