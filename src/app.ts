import { join } from 'path';
import dotenv from 'dotenv';
import express from 'express';

import authenticationRouter from './routes/authentication.router';
import userRouter from './routes/user.router';
import subscriberRouter from './routes/subscriber.router';
import patronRouter from './routes/patron.router';

const env = process.env.NODE_ENV;
const configPath = join(__dirname, '../', `.env.${env}`);

dotenv.config({
  path: configPath
});

const app = express();
app.use(express.json());

app.use('/authentication', authenticationRouter);
app.use('/user', userRouter);
app.use('/subscriber', subscriberRouter);
app.use('/patron', patronRouter);

export default app;