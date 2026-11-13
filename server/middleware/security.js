import { verifySessionToken } from '../security.js';

// In-memory rate-limiter store for brute-force protection
const loginAttempts = new Map();
const MAX_ATTEMPTS = 5;
const LOCKOUT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes lockout

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
 * Rate limiter middleware targeting auth endpoints to thwart brute-force password cracking.
 */
export function loginRateLimiter(req, res, next) {
  const ip = req.ip || req.connection?.remoteAddress || '127.0.0.1';
  const now = Date.now();
  const record = loginAttempts.get(ip);

  if (record) {
    // If lockout window has expired, reset counter
    if (now - record.firstAttemptTime > LOCKOUT_WINDOW_MS) {
      loginAttempts.delete(ip);
    } else if (record.count >= MAX_ATTEMPTS) {
      const waitMinutes = Math.ceil((LOCKOUT_WINDOW_MS - (now - record.firstAttemptTime)) / 60000);
      res.setHeader('Retry-After', Math.ceil((LOCKOUT_WINDOW_MS - (now - record.firstAttemptTime)) / 1000));
      return res.status(429).json({
        error: `SECURITY LOCKOUT ENGAGED: Excessive failed authentication attempts. Access suspended for ${waitMinutes} minute(s).`
      });
    }
  }

  // Hook to record failed attempts
  res.on('finish', () => {
    if (res.statusCode === 401) {
      const current = loginAttempts.get(ip) || { count: 0, firstAttemptTime: now };
      current.count += 1;
      loginAttempts.set(ip, current);
      console.warn(`[Security Alert] Failed login attempt from ${ip} (${current.count}/${MAX_ATTEMPTS})`);
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
