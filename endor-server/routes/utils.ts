import moment from 'moment/moment.js';
import { ObjectId, Document } from 'mongodb';
import { Tag } from '../types';

export function tagChecker(newT: any, addT: any): any {
  // TODO: tags are all kinds of weird, clean it up
  if (newT && newT.length && newT.length > 0) {
    return sanitizeArray(newT.map((tag: Tag) => tag._id)).concat(
      sanitizeArray(addT.map((tag: Tag) => new ObjectId(tag.value)))
    );
  } else {
    return sanitizeArray(addT.map((tag: Tag) => new ObjectId(tag.value)));
  }
}

export function sanitizeArray(arr: (ObjectId | string)[]) {
  if (!arr || arr.length === 0) return [];
  return [...arr];
}

export function sortAlphabetically(arr: any): any {
  if (arr.length === 1) {
    return arr;
  }
  return arr.sort((a: Tag, b: Tag) => {
    if (a.label < b.label) {
      return -1;
    } else if (a.label > b.label) {
      return 1;
    } else {
      return 0;
    }
  });
}

export function getTime(): number {
  return moment().unix();
}
