import { join } from 'path';
import dotenv from 'dotenv';
import express from 'express';

import {authenticationRouter, patronLogRouter, patronRouter, subscriberRouter, userRouter} from './routes';

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
app.use('/patron-log', patronLogRouter);

export default app;