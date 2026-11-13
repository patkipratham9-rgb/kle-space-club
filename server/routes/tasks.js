import express from 'express';
import crypto from 'crypto';
import { getDatabase } from '../db.js';
import { authenticateToken, requireAdmin } from '../middleware/security.js';

const router = express.Router();

// GET all tasks (safe read-only)
router.get('/', async (req, res) => {
  try {
    const db = getDatabase();
    const tasks = await db.collection('tasks').find({}).toArray();
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create task (Admin Level-5 required)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const db = getDatabase();
    const { title, description, domain, assignedMemberIds = [], deadline, priority = 'Medium', status = 'Pending' } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Task title is required.' });
    }

    const newTask = {
      id: req.body.id || crypto.randomUUID(),
      task_code: req.body.task_code || `DIR-${Math.floor(1000 + Math.random() * 9000)}`,
      title: title.trim(),
      description: (description || '').trim(),
      domain: domain || 'Robotics',
      assignedMemberIds: Array.isArray(assignedMemberIds) ? assignedMemberIds : [],
      deadline: deadline || new Date().toISOString(),
      priority: priority || 'Medium',
      status: status || 'Pending',
      createdAt: req.body.createdAt || new Date().toISOString(),
      created_at: new Date().toISOString()
    };

    await db.collection('tasks').insertOne(newTask);
    res.status(201).json(newTask);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update full task (Admin Level-5 required)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const db = getDatabase();
    const { id } = req.params;
    const updates = req.body;

    delete updates._id;
    delete updates.id;

    const result = await db.collection('tasks').findOneAndUpdate(
      { id },
      { $set: { ...updates, updated_at: new Date().toISOString() } },
      { returnDocument: 'after' }
    );

    if (!result) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH update task status (Admin OR Assigned Member required)
router.patch('/:id/status', authenticateToken, async (req, res) => {
  try {
    const db = getDatabase();
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required.' });
    }

    const task = await db.collection('tasks').findOne({ id });
    if (!task) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    // Role-level security check: Admin or assigned specialist
    const isAdmin = req.user.role === 'admin';
    const isAssigned = (task.assignedMemberIds || []).includes(req.user.sub) || (task.assignedMemberIds || []).includes(req.user.id);

    if (!isAdmin && !isAssigned) {
      return res.status(403).json({
        error: 'ACCESS_DENIED: You may only advance workpackages assigned to your operator callsign.'
      });
    }

    const result = await db.collection('tasks').findOneAndUpdate(
      { id },
      { $set: { status, updated_at: new Date().toISOString() } },
      { returnDocument: 'after' }
    );

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE task (Admin Level-5 required)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const db = getDatabase();
    const { id } = req.params;

    const result = await db.collection('tasks').deleteOne({ id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    res.json({ success: true, message: 'Task purged from manifest.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
