import mongoose from 'mongoose';
import config from '../config/database';

mongoose.connect(`mongodb://${config.username}:${config.password}@${config.host}:${config.port}/${config.database}?authSource=admin`,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: true,
    useCreateIndex: true
  }
);

export default mongoose;