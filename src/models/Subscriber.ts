import { Document } from 'mongoose';

import mongoose from '../database';

export interface ISubscriberParam extends Document {
  name?: string;
  email?: string;
}

export interface ISubscriber extends Document {
  name: string;
  email: string;
  googleId?: string;
  isPatron?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ISubscriberQuery {
  name?: RegExp;
  email?: RegExp;
}

export interface ISubscriberView extends Document {
  name: string;
  email: string;
  googleId: string;
  createdAt?: Date;
}

export const SubscriberView = {
  render(subscriber: ISubscriber) {
    return {
      id: subscriber._id,
      name: subscriber.name,
      email: subscriber.email,
      googleId: subscriber.googleId,
      isPatron: subscriber.isPatron,
      createdAt: subscriber.createdAt,
      updatedAt: subscriber.updatedAt,
    };
  }
}

const SubscriberSchema = new mongoose.Schema<ISubscriber>({
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
  googleId: {
    type: String,
    unique: true,
    required: true,
  },
  isPatron: {
    type: Boolean,
    required: true,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

SubscriberSchema.pre<ISubscriber>('updateOne', async function () {
  this.set({ updatedAt: new Date() });
});


export const Subscriber = mongoose.model<ISubscriber>('Subscriber', SubscriberSchema);