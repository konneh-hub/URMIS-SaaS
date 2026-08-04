import crypto from 'crypto';

export function generateToken(size = 48) {
  return crypto.randomBytes(size).toString('hex');
}

export function tokenExpiresIn(days = 7) {
  const now = new Date();
  now.setDate(now.getDate() + days);
  return now;
}
