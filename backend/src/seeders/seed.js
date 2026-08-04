import { Client } from 'pg';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';
import cuid from 'cuid';

const scrypt = promisify(_scrypt);

async function seed() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@local.dev';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'password123';
  const DATABASE_URL = process.env.DATABASE_URL;
  if (!DATABASE_URL) {
    console.error('DATABASE_URL is required for seeding');
    process.exit(1);
  }
  const client = new Client({ connectionString: DATABASE_URL });
  await client.connect();
  try {
    const res = await client.query('SELECT id FROM "User" WHERE email = $1', [adminEmail]);
    if (res.rows.length > 0) {
      console.log('Admin user exists, skipping seed');
      await client.end();
      process.exit(0);
    }
    const salt = randomBytes(16).toString('hex');
    const derived = await scrypt(adminPassword, salt, 64);
    const stored = `${salt}:${derived.toString('hex')}`;
    const id = cuid();
    const now = new Date().toISOString();
    await client.query(
      'INSERT INTO "User" (id, email, name, password, role, "createdAt", "updatedAt") VALUES ($1,$2,$3,$4,$5,$6,$7)',
      [id, adminEmail, 'Administrator', stored, 'SYSTEM_ADMIN', now, now]
    );
    console.log('Seeded admin user');
    await client.end();
    process.exit(0);
  } catch (err) {
    console.error(err);
    await client.end();
    process.exit(1);
  }
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
