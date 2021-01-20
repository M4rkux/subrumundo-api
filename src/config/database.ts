import { join } from 'path';
import dotenv from 'dotenv';

const env = process.env.NODE_ENV;
const configPath = join(__dirname, '../../', `.env.${env}`);

dotenv.config({
  path: configPath
});


export default {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
}