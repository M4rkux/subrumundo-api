import { Document } from 'mongoose';

import mongoose from '../database';

export interface IEpisode extends Document {
  guid?: string;
  title: string;
  description?: string;
  imageUrl: string;
  audioUrl: string;
  isExclusive: boolean;
  pubDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IEpisodeQuery {
  title?: RegExp;
}

export interface IEpisodeView extends Document {
  guid?: string;
  title: string;
  description: string;
  imageUrl: string;
  audioUrl: string;
  pubDate: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export const EpisodeView = {
  render(episode: IEpisode) {
    return {
      id: episode._id,
      guid: episode.guid,
      title: episode.title,
      description: episode.description,
      imageUrl: episode.imageUrl,
      audioUrl: episode.audioUrl,
      pubDate: episode.pubDate,
      createdAt: episode.createdAt,
      updatedAt: episode.updatedAt,
    };
  }
}

const EpisodeSchema = new mongoose.Schema<IEpisode>({
  title: {
    type: String,
    require: true,
  },
  description: {
    type: String,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  audioUrl: {
    type: String,
    required: true
  },
  isExclusive: {
    type: Number,
    required: true,
    default: false
  },
  pubDate: {
    type: Date,
    required: true
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

EpisodeSchema.pre<IEpisode>('updateOne', async function () {
  this.set({ updatedAt: new Date() });
});

export const Episode = mongoose.model<IEpisode>('Episode', EpisodeSchema);