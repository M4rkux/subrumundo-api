import { Document } from 'mongoose';

import mongoose from '../database';

export interface IPatron extends Document {
  email: string;
}

export interface IPatronQuery {
  email?: RegExp;
}

export const PatronView = {
  render(subscriber: IPatron) {
    return {
      id: subscriber._id,
      email: subscriber.email,
    };
  }
}

const PatronSchema = new mongoose.Schema<IPatron>({
  email: {
    type: String,
    unique: true,
    required: true,
    lowercase: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Patron = mongoose.model<IPatron>('Patron', PatronSchema);