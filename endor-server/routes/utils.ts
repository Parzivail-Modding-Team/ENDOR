import moment from 'moment/moment.js';
import { ObjectId } from 'mongodb';
import { Tag } from '../types';

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
