import moment from 'moment';
import { ObjectId } from 'mongodb';
import { Role, Tag, User } from '../types';
import { GraphQLError } from 'graphql';

export function tagChecker(newT: Tag[], addT: Tag[]): any {
  // TODO: tags are all kinds of weird, clean it up
  if (newT && newT.length && newT.length > 0) {
    return newT
      .map((tag: Tag) => tag._id)
      .concat(addT.map((tag: Tag) => new ObjectId(tag.value)));
  } else {
    return addT.map((tag: Tag) => new ObjectId(tag.value));
  }
}

export function getTime(): number {
  return moment().unix();
}

export function requireRole(user: User, role: Role) {
  if (user.role < role) {
    throw new GraphQLError('Unauthorized');
  }
}
