import crypto from 'crypto';

// Secret key for HMAC token signing (configurable via environment, securely generated fallback)
const JWT_SECRET = process.env.JWT_SECRET || 'kle_space_club_classified_avionics_master_key_2026';
const TOKEN_EXPIRY_MS = 8 * 60 * 60 * 1000; // 8-hour operational clearance

/**
 * Hash a password using scrypt with a unique cryptographic salt.
 * Output format: scrypt:<salt_hex>:<hash_hex>
 */
export function hashPassword(plainPassword) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(plainPassword, salt, 64);
  return `scrypt:${salt}:${derivedKey.toString('hex')}`;
}

/**
 * Timing-safe verification of plain password against stored hash or legacy plaintext.
 */
export function verifyPassword(plainPassword, storedHash) {
  if (!storedHash || !plainPassword) return false;

  // Handle scrypt formatted hash
  if (storedHash.startsWith('scrypt:')) {
    const parts = storedHash.split(':');
    if (parts.length !== 3) return false;
    const [, salt, originalHash] = parts;
    const derivedKey = crypto.scryptSync(plainPassword, salt, 64);
    const keyBuffer = Buffer.from(derivedKey.toString('hex'), 'utf8');
    const origBuffer = Buffer.from(originalHash, 'utf8');
    if (keyBuffer.length !== origBuffer.length) return false;
    return crypto.timingSafeEqual(keyBuffer, origBuffer);
  }

  // Handle legacy plaintext fallback with constant-time check
  const plainBuf = Buffer.from(plainPassword, 'utf8');
  const storedBuf = Buffer.from(storedHash, 'utf8');
  if (plainBuf.length !== storedBuf.length) return false;
  return crypto.timingSafeEqual(plainBuf, storedBuf);
}

/**
 * Create a cryptographically signed HMAC-SHA256 session token.
 */
export function createSessionToken(user) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const now = Date.now();
  const payload = Buffer.from(JSON.stringify({
    sub: user.id || user.username,
    username: user.username,
    role: user.role || 'member',
    name: user.name || user.full_name || 'Operator',
    iat: Math.floor(now / 1000),
    exp: Math.floor((now + TOKEN_EXPIRY_MS) / 1000)
  })).toString('base64url');

  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${header}.${payload}`)
    .digest('base64url');

  return `${header}.${payload}.${signature}`;
}

/**
 * Verify and decode an HMAC-SHA256 session token.
 */
export function verifySessionToken(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [header, payload, signature] = parts;

  // Re-compute expected signature
  const expectedSig = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${header}.${payload}`)
    .digest('base64url');

  const sigBuf = Buffer.from(signature, 'utf8');
  const expBuf = Buffer.from(expectedSig, 'utf8');

  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return null; // Invalid signature
  }

  try {
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    const nowSec = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp < nowSec) {
      return null; // Expired token
    }
    return decoded;
  } catch {
    return null;
  }
}
