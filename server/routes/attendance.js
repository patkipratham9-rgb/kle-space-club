import express from 'express';
import { getDatabase } from '../db.js';
import { authenticateToken } from '../middleware/security.js';

const router = express.Router();

// GET all attendance records (safe read-only)
router.get('/', async (req, res) => {
  try {
    const db = getDatabase();
    const docs = await db.collection('attendance').find({}).toArray();

    // Transform array of { date, records } into a dictionary: { [date]: records }
    const attendanceMap = {};
    docs.forEach(doc => {
      attendanceMap[doc.date] = doc.records || {};
    });

    res.json(attendanceMap);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET attendance for a specific date
router.get('/:date', async (req, res) => {
  try {
    const db = getDatabase();
    const { date } = req.params;
    const doc = await db.collection('attendance').findOne({ date });
    res.json(doc ? doc.records : {});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST commit / save attendance for a date (Authenticated Operator required)
router.post('/commit', authenticateToken, async (req, res) => {
  try {
    const db = getDatabase();
    const { date, records } = req.body;

    if (!date || !records || typeof date !== 'string' || typeof records !== 'object') {
      return res.status(400).json({ error: 'Valid date and records payload required.' });
    }

    const result = await db.collection('attendance').findOneAndUpdate(
      { date },
      {
        $set: {
          date,
          records,
          committed_by: req.user.username,
          updated_at: new Date().toISOString()
        }
      },
      { upsert: true, returnDocument: 'after' }
    );

    res.json({ success: true, date, records: result?.records || records });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
