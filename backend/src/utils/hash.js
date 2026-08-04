import { randomBytes, scrypt as _scrypt, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

const scrypt = promisify(_scrypt);

export async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const derived = await scrypt(password, salt, 64);
  return `${salt}:${derived.toString('hex')}`;
}

export async function comparePassword(password, stored) {
  const [salt, key] = stored.split(':');
  const derived = await scrypt(password, salt, 64);
  const keyBuf = Buffer.from(key, 'hex');
  return timingSafeEqual(keyBuf, derived);
}
