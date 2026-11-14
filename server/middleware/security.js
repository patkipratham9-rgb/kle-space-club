import { verifySessionToken } from '../security.js';

// In-memory rate-limiter store for brute-force protection
const loginAttempts = new Map();
const MAX_ATTEMPTS = 3;
const BASE_COOLDOWN_MS = 3 * 60 * 1000; // 3 minutes base cooldown

/**
 * Helmet-equivalent standard security headers middleware.
 */
export function securityHeaders(req, res, next) {
  res.removeHeader('X-Powered-By');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; font-src 'self' data:; connect-src 'self' http://localhost:* ws://localhost:* http://127.0.0.1:* ws://127.0.0.1:*; img-src 'self' data: blob:;"
  );
  next();
}

/**
 * Rate limiter middleware targeting auth endpoints to thwart brute-force password cracking and bots.
 * Limits login to 3 attempts, with an escalating cooldown timer starting at 3 minutes.
 */
export function loginRateLimiter(req, res, next) {
  const ip = req.ip || req.connection?.remoteAddress || '127.0.0.1';
  const now = Date.now();
  const record = loginAttempts.get(ip);

  // If in active cooldown, reject immediately with 429
  if (record && record.lockedUntil && now < record.lockedUntil) {
    const remainingSeconds = Math.ceil((record.lockedUntil - now) / 1000);
    const remainingMinutes = Math.ceil(remainingSeconds / 60);
    const multiplier = record.lockoutMultiplier || 1;
    res.setHeader('Retry-After', remainingSeconds);
    return res.status(429).json({
      error: `SECURITY LOCKOUT ENGAGED: Excessive failed attempts (limit: ${MAX_ATTEMPTS}). Bot defense active. Cooldown in progress: ${remainingMinutes}m (${remainingSeconds}s remaining). Tier ${multiplier}x.`,
      retryAfter: remainingSeconds,
      lockedUntil: record.lockedUntil,
      lockoutMultiplier: multiplier
    });
  }

  // Hook to record failed attempts
  res.on('finish', () => {
    if (res.statusCode === 401) {
      const current = loginAttempts.get(ip) || { count: 0, lockoutMultiplier: 0, lockedUntil: 0 };
      current.count += 1;

      if (current.count >= MAX_ATTEMPTS) {
        current.lockoutMultiplier = (current.lockoutMultiplier || 0) + 1;
        // Escalating cooldown: 3 min (1st lockout), 6 min (2nd lockout), 9 min (3rd lockout), etc.
        const cooldownDuration = current.lockoutMultiplier * BASE_COOLDOWN_MS;
        current.lockedUntil = Date.now() + cooldownDuration;
        current.count = 0; // reset attempts for after cooldown
        console.warn(`[Security Alert] IP ${ip} reached ${MAX_ATTEMPTS} failed attempts. Cooldown locked for ${cooldownDuration / 60000} mins (Multiplier: ${current.lockoutMultiplier}x).`);
      }

      loginAttempts.set(ip, current);
    } else if (res.statusCode === 200) {
      // Clear on successful login
      loginAttempts.delete(ip);
    }
  });

  next();
}

/**
 * Sanitize incoming JSON payload to mitigate NoSQL injection risks.
 */
export function sanitizeInputs(req, res, next) {
  const sanitize = (obj) => {
    if (!obj || typeof obj !== 'object') return obj;
    for (const key of Object.keys(obj)) {
      if (key.startsWith('$') || key.includes('.')) {
        delete obj[key];
      } else if (typeof obj[key] === 'object') {
        sanitize(obj[key]);
      }
    }
    return obj;
  };

  if (req.body) sanitize(req.body);
  if (req.query) sanitize(req.query);
  if (req.params) sanitize(req.params);

  next();
}

/**
 * Authenticate session bearer token.
 * Allows anonymous requests to continue, but attaches req.user if a valid token is provided.
 */
export function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.substring(7)
    : null;

  if (!token) {
    return res.status(401).json({
      error: 'AUTHENTICATION_REQUIRED: Valid cryptographic session token must be provided in Authorization header.'
    });
  }

  const user = verifySessionToken(token);
  if (!user) {
    return res.status(401).json({
      error: 'INVALID_OR_EXPIRED_TOKEN: Session clearance has expired or signature is invalid.'
    });
  }

  req.user = user;
  next();
}

/**
 * Optional authentication: verifies token if present, but doesn't reject if omitted.
 */
export function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    req.user = verifySessionToken(token);
  }
  next();
}

/**
 * Role-Based Access Control (RBAC): Requires admin role.
 */
export function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      error: 'INSUFFICIENT_SECURITY_CLEARANCE: Flight Director (Admin Level-5) privileges required.'
    });
  }
  next();
}
