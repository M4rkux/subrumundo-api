import { Document } from 'mongoose';
import bcrypt from 'bcryptjs';

import mongoose from '../database';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUserQuery {
  name?: RegExp;
  email?: RegExp;
}

export interface IUserView extends Document {
  name: string;
  email: string;
  createdAt: Date;
}

export const UserView = {
  render(user: IUser) {
    return {
      id: user._id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    };
  }
}

const UserSchema = new mongoose.Schema<IUser>({
  name: {
    type: String,
    require: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
});

UserSchema.pre<IUser>('save', async function (next) {
  const hash = await bcrypt.hash(this.password, 10);
  this.password = hash;
  next(null);
});

export const User = mongoose.model<IUser>('User', UserSchema);