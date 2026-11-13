import { hashPassword } from './security.js';

export async function seedDatabase(db, force = false) {
  if (force) {
    await db.collection('members').deleteMany({});
    await db.collection('tasks').deleteMany({});
    await db.collection('attendance').deleteMany({});
    console.log('[MongoDB] Purged all members, tasks, and attendance records.');
  }

  const configDoc = await db.collection('config').findOne({ key: 'admin_auth' });
  if (!configDoc || force) {
    const defaultSecureHash = hashPassword('SC_2026');
    await db.collection('config').updateOne(
      { key: 'admin_auth' },
      {
        $set: {
          key: 'admin_auth',
          adminPassword: defaultSecureHash,
          updated_at: new Date().toISOString()
        }
      },
      { upsert: true }
    );
    console.log('[MongoDB] Initialized default admin credentials (admin / SC_2026) with salted scrypt hash in "config" collection.');
  }
}
