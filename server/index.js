import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectToDatabase, getDatabase } from './db.js';
import { seedDatabase } from './seedData.js';
import { securityHeaders, sanitizeInputs, authenticateToken, requireAdmin } from './middleware/security.js';
import membersRouter from './routes/members.js';
import attendanceRouter from './routes/attendance.js';
import tasksRouter from './routes/tasks.js';
import authRouter from './routes/auth.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Allowed CORS origins
const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:4173',
  'http://127.0.0.1:4173'
];

// High-security middleware pipeline
app.use(securityHeaders);
app.use(cors({
  origin: (origin, callback) => {
    // Allow local development and headless tools with no origin
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS_RESTRICTED: Origin not authorized by Flight Security Console.'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '1mb' }));
app.use(sanitizeInputs);

// Routes
app.use('/api/members', membersRouter);
app.use('/api/attendance', attendanceRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/auth', authRouter);

// Health & Status check (Safe diagnostic metrics)
app.get('/api/status', async (req, res) => {
  try {
    const db = getDatabase();
    const [membersCount, tasksCount, attendanceCount] = await Promise.all([
      db.collection('members').countDocuments(),
      db.collection('tasks').countDocuments(),
      db.collection('attendance').countDocuments()
    ]);

    res.json({
      status: 'ONLINE',
      database: 'MongoDB',
      dbName: db.databaseName,
      securityLevel: 'MIL_SPEC_ACTIVE',
      metrics: {
        membersCount,
        tasksCount,
        attendanceCount
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ status: 'ERROR', error: error.message });
  }
});

// Reset database (Protected: Admin Level-5 required)
app.post('/api/reset', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const db = getDatabase();
    await seedDatabase(db, true);
    res.json({ success: true, message: 'Database successfully reset to pristine baseline under Admin authorization.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
async function startServer() {
  try {
    const { db } = await connectToDatabase();
    await seedDatabase(db, false);

    app.listen(PORT, () => {
      console.log(`[Express] KLE Space Club API Server listening on http://localhost:${PORT}`);
      console.log(`[Express] Security Layer: MIL-SPEC Active (Scrypt Hashes, HMAC Tokens, CSP, Rate-Limiting)`);
      console.log(`[Express] Health check: http://localhost:${PORT}/api/status`);
    });
  } catch (error) {
    console.error('[Express] Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
