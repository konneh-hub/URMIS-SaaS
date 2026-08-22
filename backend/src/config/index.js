import dotenv from 'dotenv';
import path from 'path';

const envPath = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';
const projectRoot = path.resolve(process.cwd());
dotenv.config({ path: path.join(projectRoot, envPath) });

export const PORT = Number(process.env.PORT || 5000);
export const NODE_ENV = process.env.NODE_ENV || 'development';
export const JWT_SECRET = process.env.JWT_SECRET || (NODE_ENV === 'production' ? null : 'development-only-change-me');
export const JWT_ACCESS_EXPIRES = process.env.JWT_ACCESS_EXPIRES || '15m';
export const JWT_REFRESH_EXPIRES = process.env.JWT_REFRESH_EXPIRES || '7d';
export const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@127.0.0.1:5432/urmis_dev?schema=public';
export const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET must be configured in production');
}

export default {
  PORT,
  NODE_ENV,
  JWT_SECRET,
  JWT_ACCESS_EXPIRES,
  JWT_REFRESH_EXPIRES,
  DATABASE_URL,
  FRONTEND_URL,
};
