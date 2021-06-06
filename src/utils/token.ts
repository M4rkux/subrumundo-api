import jwt from 'jsonwebtoken';

import authConfig from '../config/authConfig';
import { IUser } from '../models/User';

export function generateToken(params: IUser) {
  return jwt.sign({ id: params._id }, authConfig.secret, {
      expiresIn: authConfig.expiresIn
  });
}