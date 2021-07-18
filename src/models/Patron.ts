import { Document } from 'mongoose';

import mongoose from '../database';
import { Action, PatronLog } from './PatronLog';

export interface IPatron extends Document {
  email: string;
}

export interface IPatronQuery {
  email?: RegExp;
}

export const PatronView = {
  render(patron: IPatron) {
    return {
      id: patron._id,
      email: patron.email,
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

PatronSchema.pre<IPatron>('save', async function (next) {
  const patronLog = await PatronLog.create({
    email: this.email,
    action: Action.JOIN
  });
  next(null);
});

PatronSchema.pre<IPatron>('deleteOne', async function (next) {
  const patronLog = await PatronLog.create({
    email: this.email,
    action: Action.LEAVE
  });
  next(null);
});

export const Patron = mongoose.model<IPatron>('Patron', PatronSchema);