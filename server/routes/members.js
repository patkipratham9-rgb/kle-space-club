import express from 'express';
import crypto from 'crypto';
import { getDatabase } from '../db.js';
import { authenticateToken, requireAdmin } from '../middleware/security.js';

const router = express.Router();

// GET all members (safe read-only)
router.get('/', async (req, res) => {
  try {
    const db = getDatabase();
    const members = await db.collection('members').find({}).toArray();
    res.json(members);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create new member (Admin Level-5 required)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const db = getDatabase();
    const { full_name, student_id, email, role_title, domains, role = 'member' } = req.body;

    if (!full_name || !email) {
      return res.status(400).json({ error: 'Name and email are required.' });
    }

    const initials = full_name
      .split(' ')
      .map(p => p[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();

    const newMember = {
      id: req.body.id || crypto.randomUUID(),
      full_name: full_name.trim(),
      student_id: (student_id || `KLE-${Math.floor(1000 + Math.random() * 9000)}`).trim(),
      email: email.trim().toLowerCase(),
      role: role || 'member',
      role_title: (role_title || 'Specialist Technician').trim(),
      domains: Array.isArray(domains) && domains.length > 0 ? domains : ['Robotics'],
      callsign: req.body.callsign || `CREW // ${full_name.split(' ')[0].toUpperCase()}`,
      avatar: req.body.avatar || initials,
      created_at: new Date().toISOString()
    };

    await db.collection('members').insertOne(newMember);
    res.status(201).json(newMember);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update member (Admin Level-5 required)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const db = getDatabase();
    const { id } = req.params;
    const updates = req.body;

    delete updates._id;
    delete updates.id;

    const result = await db.collection('members').findOneAndUpdate(
      { id },
      { $set: { ...updates, updated_at: new Date().toISOString() } },
      { returnDocument: 'after' }
    );

    if (!result) {
      return res.status(404).json({ error: 'Member not found.' });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE remove member from single domain (Admin Level-5 required)
router.delete('/:id/domain/:domain', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const db = getDatabase();
    const { id, domain } = req.params;

    const member = await db.collection('members').findOne({ id });
    if (!member) {
      return res.status(404).json({ error: 'Member not found.' });
    }

    const updatedDomains = (member.domains || []).filter(d => d !== domain);

    const result = await db.collection('members').findOneAndUpdate(
      { id },
      { $set: { domains: updatedDomains, updated_at: new Date().toISOString() } },
      { returnDocument: 'after' }
    );

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE member completely (Admin Level-5 required)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const db = getDatabase();
    const { id } = req.params;

    const result = await db.collection('members').deleteOne({ id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Member not found.' });
    }

    res.json({ success: true, message: 'Member expunged from roster.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
