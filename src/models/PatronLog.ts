import { Document } from 'mongoose';

import mongoose from '../database';

export enum Action {
  JOIN = 'Join',
  LEAVE = 'Leave',
}

export interface IPatronLog extends Document {
  email: string;
  action: Action; 
}

export interface IPatronLogQuery {
  email?: RegExp;
}

export const PatronLogView = {
  render(patronLog: IPatronLog) {
    return {
      id: patronLog._id,
      email: patronLog.email,
      action: patronLog.action
    };
  }
}

const PatronLogSchema = new mongoose.Schema<IPatronLog>({
  email: {
    type: String,
    unique: true,
    required: true,
    lowercase: true
  },
  action: {
    type: Action,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const PatronLog = mongoose.model<IPatronLog>('PatronLog', PatronLogSchema);