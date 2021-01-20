import jwt from 'jsonwebtoken';

import { IUser } from '../models/User';
import authConfig from '../config/authConfig';

export function generateToken(params: IUser) {
  return jwt.sign({ id: params._id }, authConfig.secret, {
      expiresIn: authConfig.expiresIn
  });
}