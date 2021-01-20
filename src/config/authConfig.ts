import { join } from 'path';
import dotenv from 'dotenv';

const env = process.env.NODE_ENV;
const configPath = join(__dirname, '../../', `.env.${env}`);

dotenv.config({
  path: configPath
});

export default {
  secret: process.env.SECRET || '',
  expiresIn: process.env.EXPIRES_IN,
}