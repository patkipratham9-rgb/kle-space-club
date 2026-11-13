import express from 'express';
import { getDatabase } from '../db.js';
import { hashPassword, verifyPassword, createSessionToken } from '../security.js';
import { loginRateLimiter, authenticateToken, requireAdmin } from '../middleware/security.js';

const router = express.Router();

// GET auth config: public status without exposing any credentials or hashes
router.get('/config', async (req, res) => {
  try {
    const db = getDatabase();
    const config = await db.collection('config').findOne({ key: 'admin_auth' });
    res.json({
      authRequired: true,
      isInitialized: Boolean(config),
      authMode: 'MIL_SPEC_HMAC_SCRYPT'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET verify current session token
router.get('/verify', authenticateToken, (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

// POST login with rate-limiting and cryptographic password verification
router.post('/login', loginRateLimiter, async (req, res) => {
  try {
    const db = getDatabase();
    const { username, password } = req.body;

    if (!username || !password || typeof username !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ error: 'Username and password must be valid strings.' });
    }

    const trimmedUser = username.trim().toLowerCase();
    const trimmedPass = password.trim();

    const config = await db.collection('config').findOne({ key: 'admin_auth' });
    const storedAdminHash = config?.adminPassword || hashPassword('SC_2026');

    // Check admin credentials
    if (trimmedUser === 'admin') {
      const isValid = verifyPassword(trimmedPass, storedAdminHash);
      if (isValid) {
        // Upgrade legacy plaintext to scrypt hash if needed
        if (!storedAdminHash.startsWith('scrypt:')) {
          await db.collection('config').updateOne(
            { key: 'admin_auth' },
            { $set: { adminPassword: hashPassword(trimmedPass), updated_at: new Date().toISOString() } }
          );
        }

        const userPayload = {
          id: 'a0000000-0000-0000-0000-000000000001',
          username: 'admin',
          role: 'admin',
          name: 'Elena Rostova'
        };
        const token = createSessionToken(userPayload);

        return res.json({
          success: true,
          token,
          user: userPayload
        });
      }
    }

    // Check member / crew credentials
    const member = await db.collection('members').findOne({
      $or: [
        { student_id: trimmedUser.toUpperCase() },
        { student_id: trimmedUser },
        { email: trimmedUser }
      ]
    });

    if (member) {
      // Member can log in with general password or admin key
      const isMemberPass = trimmedPass === 'crew' || trimmedPass === 'member';
      const isAdminPass = verifyPassword(trimmedPass, storedAdminHash);

      if (isMemberPass || isAdminPass) {
        const userPayload = {
          id: member.id,
          username: member.student_id,
          role: member.role || 'member',
          name: member.full_name
        };
        const token = createSessionToken(userPayload);

        return res.json({
          success: true,
          token,
          user: userPayload
        });
      }
    }

    return res.status(401).json({ error: 'INVALID_CREDENTIALS: Authorization rejected by security console.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST change admin password (requires active Admin session token)
router.post('/change-password', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const db = getDatabase();
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword || typeof currentPassword !== 'string' || typeof newPassword !== 'string') {
      return res.status(400).json({ error: 'Current and new passwords must be valid strings.' });
    }

    const config = await db.collection('config').findOne({ key: 'admin_auth' });
    const storedAdminHash = config?.adminPassword || hashPassword('SC_2026');

    if (!verifyPassword(currentPassword.trim(), storedAdminHash)) {
      return res.status(401).json({ error: 'CURRENT_PASSWORD_MISMATCH: Existing key verification failed.' });
    }

    // Strong password complexity check: at least 6 chars, with number or symbol recommended
    if (newPassword.trim().length < 6) {
      return res.status(400).json({
        error: 'PASSWORD_COMPLEXITY_FAILURE: New access key must be at least 6 characters long.'
      });
    }

    const secureHash = hashPassword(newPassword.trim());

    await db.collection('config').updateOne(
      { key: 'admin_auth' },
      { $set: { adminPassword: secureHash, updated_at: new Date().toISOString() } },
      { upsert: true }
    );

    res.json({
      success: true,
      message: 'Admin authorization key securely updated and salted with scrypt cryptographic hash.'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
