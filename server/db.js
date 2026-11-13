import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
const DB_NAME = process.env.DB_NAME || 'kle_space_club';

let client = null;
let db = null;

export async function connectToDatabase() {
  if (db) return { client, db };

  try {
    client = new MongoClient(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    });

    await client.connect();
    db = client.db(DB_NAME);

    // Create unique indexes
    await db.collection('members').createIndex({ id: 1 }, { unique: true });
    await db.collection('members').createIndex({ student_id: 1 }, { unique: true, sparse: true });
    await db.collection('members').createIndex({ email: 1 }, { unique: true });
    await db.collection('attendance').createIndex({ date: 1 }, { unique: true });
    await db.collection('tasks').createIndex({ id: 1 }, { unique: true });
    await db.collection('config').createIndex({ key: 1 }, { unique: true });

    console.log(`[MongoDB] Successfully connected to local database: "${DB_NAME}" at ${MONGODB_URI}`);
    return { client, db };
  } catch (error) {
    console.error('[MongoDB] Connection error:', error.message);
    throw error;
  }
}

export function getDatabase() {
  if (!db) {
    throw new Error('Database not initialized. Call connectToDatabase() first.');
  }
  return db;
}
