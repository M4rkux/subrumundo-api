import { Document } from 'mongoose';
import mongoose from '..';
import { User } from '../../models/User';
import  * as user from './data-to-seed/user.json';

interface ISeeder extends Document {
  createdAt?: Date;
}

const SeederSchema = new mongoose.Schema<ISeeder>({
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

const Seeder = mongoose.model<ISeeder>('Seeder', SeederSchema);

export function initSeed() {
  return new Promise(async (resolve, reject) => {
    const isSeeded = await Seeder.exists({});
    if (!isSeeded) {
      try {
        await User.create(user);
        const seeder = await Seeder.create({});
        resolve(seeder);
      } catch (error) {
        console.error('init seed', error);
        reject();
      }
    }
  })
}
