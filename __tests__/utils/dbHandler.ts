import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { initSeed } from '../../src/database/seeder';
import { User } from '../../src/models/User';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 600000;
let mongoServer: MongoMemoryServer;

export default {
  /**
   * Connect to the in-memory database.
   */
  connect: async () => {
    mongoServer = new MongoMemoryServer();
    const uri = await mongoServer.getUri();

    const mongooseOpts = {
      useCreateIndex: true,
      useFindAndModify: false,
      useNewUrlParser: true,
      useUnifiedTopology: true
    };

    await mongoose.disconnect();
    await mongoose.connect(uri, mongooseOpts);
    await User.ensureIndexes();
    await initSeed();
  },

  /**
   * Drop database, close the connection and stop mongod.
   */
  closeDatabase: async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
  },

  /**
   * Remove all the data for all db collections.
   */
  clearDatabase: async () => {
    const collections = mongoose.connection.collections;

    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
  }
}