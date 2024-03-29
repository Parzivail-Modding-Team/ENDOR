import moment from 'moment';
import { Role, User } from '../types';
import { GraphQLError } from 'graphql';
import { Profile } from '@oauth-everything/passport-discord';
import { NextFunction, Request, Response } from 'express';

export function getTime(): number {
  return moment().unix();
}

export function requireRole(user: User, role: Role) {
  if (user.role < role) {
    throw new GraphQLError('User is not authorized to access this function');
  }
}

export function isAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (req.user) {
    next();
  } else {
    res.redirect('/login');
  }
}

export function getAvatar(profile: Profile): string {
  if (profile.photos) {
    for (const { primary, type, value } of profile.photos) {
      if (primary && type === 'avatar') return value;
    }
  }
  return '/unknown_avatar.png';
}
