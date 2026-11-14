import { useState, useEffect } from 'react';
import { Rocket, AlertTriangle, ArrowRight, Lock, ShieldAlert } from 'lucide-react';
import { useApp } from '../context/useApp';

const STORAGE_LOCK_KEY = 'spaceclub_login_lockout_v2';
const MAX_ATTEMPTS = 3;
const BASE_COOLDOWN_MS = 3 * 60 * 1000; // 3 minutes

const getStoredLockout = () => {
  try {
    const raw = localStorage.getItem(STORAGE_LOCK_KEY);
    return raw ? JSON.parse(raw) : { failedAttempts: 0, lockoutMultiplier: 0, lockedUntil: 0 };
  } catch {
    return { failedAttempts: 0, lockoutMultiplier: 0, lockedUntil: 0 };
  }
};

const saveStoredLockout = (state) => {
  try {
    localStorage.setItem(STORAGE_LOCK_KEY, JSON.stringify(state));
  } catch (e) {
    void e;
  }
};

export const LoginGateway = () => {
  const { login } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [lockout, setLockout] = useState(getStoredLockout);
  const [now, setNow] = useState(() => Date.now());

  // Real-time second-by-second countdown timer
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const remainingMs = Math.max(0, (lockout.lockedUntil || 0) - now);
  const isLocked = remainingMs > 0;

  // Format mm:ss
  const formatTimer = (ms) => {
    const totalSec = Math.ceil(ms / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLocked || isAuthenticating) return;

    setError('');
    setIsAuthenticating(true);

    try {
      const res = await login(username, password);

      if (res.success) {
        // Reset lockout records completely on successful verification
        localStorage.removeItem(STORAGE_LOCK_KEY);
        setLockout({ failedAttempts: 0, lockoutMultiplier: 0, lockedUntil: 0 });
        return;
      }

      // Check if backend rejected with 429 lockout
      if (res.status === 429) {
        const nextMultiplier = res.lockoutMultiplier || (lockout.lockoutMultiplier || 0) + 1;
        const lockedUntil = res.lockedUntil || (Date.now() + (res.retryAfter || (nextMultiplier * 180)) * 1000);
        const nextState = { failedAttempts: 0, lockoutMultiplier: nextMultiplier, lockedUntil };
        setLockout(nextState);
        saveStoredLockout(nextState);
        setError(res.error || `SECURITY LOCKOUT ENGAGED: Excessive failed attempts. Cooldown: ${nextMultiplier * 3} minutes.`);
        return;
      }

      // Local attempt increment
      const newAttempts = (lockout.failedAttempts || 0) + 1;
      if (newAttempts >= MAX_ATTEMPTS) {
        const nextMultiplier = (lockout.lockoutMultiplier || 0) + 1;
        const cooldownMs = nextMultiplier * BASE_COOLDOWN_MS;
        const lockedUntil = Date.now() + cooldownMs;
        const nextState = { failedAttempts: 0, lockoutMultiplier: nextMultiplier, lockedUntil };
        setLockout(nextState);
        saveStoredLockout(nextState);
        setError(`BOT MITIGATION ACTIVATED: Limit of ${MAX_ATTEMPTS} attempts reached. Terminal locked for ${nextMultiplier * 3} minutes.`);
      } else {
        const nextState = { ...lockout, failedAttempts: newAttempts };
        setLockout(nextState);
        saveStoredLockout(nextState);
        const remaining = MAX_ATTEMPTS - newAttempts;
        const nextTimerMins = ((lockout.lockoutMultiplier || 0) + 1) * 3;
        setError(`${res.error || 'INVALID CREDENTIALS'} (${newAttempts}/${MAX_ATTEMPTS} attempts. ${remaining} left before ${nextTimerMins}-min cooldown).`);
      }
    } catch (err) {
      if (err.status === 429) {
        const nextMultiplier = err.lockoutMultiplier || (lockout.lockoutMultiplier || 0) + 1;
        const lockedUntil = err.lockedUntil || (Date.now() + (err.retryAfter || (nextMultiplier * 180)) * 1000);
        const nextState = { failedAttempts: 0, lockoutMultiplier: nextMultiplier, lockedUntil };
        setLockout(nextState);
        saveStoredLockout(nextState);
        setError(err.message || `SECURITY LOCKOUT ENGAGED. Cooldown in progress.`);
      } else {
        setError(err.message || 'COMMUNICATION / SECURITY FAULT');
      }
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#141517] nasa-rack-bg flex items-center justify-center p-4 selection:bg-[#D95D24] selection:text-white">
      <div className="w-full max-w-md">
        <div className="beige-chassis p-7 hard-shadow-lg relative border-2 border-[#1E1F22]">
          
          {/* Header */}
          <div className="flex items-center gap-3.5 mb-5">
            <div className="w-12 h-12 bg-[#D95D24] border-2 border-[#1E1F22] hard-shadow-sm flex items-center justify-center text-white shrink-0">
              <Rocket className="w-7 h-7 stroke-[2.2]" />
            </div>
            <div>
              <span className="font-display font-black text-lg text-[#1E1F22] tracking-wider">
                KLE <span className="text-[#D95D24]">SPACE CLUB</span>
              </span>
              <span className="block text-[10px] font-mono text-[#6E737D] uppercase">
                FLIGHT OPERATIONS ACCESS GATEWAY
              </span>
            </div>
          </div>

          {/* ACTIVE COOLDOWN / BOT DEFENSE BANNER */}
          {isLocked && (
            <div className="p-3.5 mb-5 bg-[#D95D24]/15 border-2 border-[#D95D24] hard-shadow-sm text-xs font-mono text-[#1E1F22] animate-in fade-in duration-100">
              <div className="flex items-start gap-2.5">
                <ShieldAlert className="w-5 h-5 text-[#D95D24] shrink-0 mt-0.5 animate-pulse" />
                <div className="flex-1">
                  <div className="flex items-center justify-between border-b border-[#D95D24]/30 pb-1 mb-1.5">
                    <span className="font-black text-[#D95D24] uppercase tracking-wider text-[11px]">
                      ANTI-BOT LOCKOUT // COOLDOWN
                    </span>
                    <span className="font-black text-xs text-[#D95D24] px-1.5 py-0.2 bg-[#D95D24] text-white">
                      {formatTimer(remainingMs)}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#525760] leading-snug">
                    Limit of {MAX_ATTEMPTS} attempts reached. Terminal inputs suspended to prevent automated intrusions.
                  </p>
                  <div className="mt-2 pt-1.5 border-t border-[#D95D24]/20 flex items-center justify-between text-[10px] text-[#6E737D]">
                    <span>COOLDOWN MULTIPLIER: {lockout.lockoutMultiplier}x</span>
                    <span>DURATION: {lockout.lockoutMultiplier * 3} MINS</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Standard Error Message when not locked */}
          {!isLocked && error && (
            <div className="p-3 mb-5 bg-[#D95D24]/15 border-2 border-[#D95D24] hard-shadow-sm text-xs font-mono text-[#1E1F22] flex items-start gap-2.5 animate-in fade-in duration-100">
              <AlertTriangle className="w-4 h-4 text-[#D95D24] shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-bold block text-[#D95D24]">ACCESS REJECTED // 0x401</span>
                <span className="text-[11px] text-[#525760]">{error}</span>
              </div>
            </div>
          )}

          {/* Attempts Pre-Lockout Warning */}
          {!isLocked && (lockout.failedAttempts || 0) > 0 && (
            <div className="p-2 mb-4 bg-[#E29526]/15 border border-[#E29526] text-[10px] font-mono text-[#1E1F22] flex items-center justify-between">
              <span className="font-bold text-[#D95D24]">
                ATTEMPTS RECORDED: {lockout.failedAttempts}/{MAX_ATTEMPTS}
              </span>
              <span className="text-[#6E737D]">
                {MAX_ATTEMPTS - lockout.failedAttempts} LEFT BEFORE {((lockout.lockoutMultiplier || 0) + 1) * 3}M LOCKOUT
              </span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono font-bold text-[#1E1F22] mb-1.5">
                OPERATOR USERNAME *
              </label>
              <input
                type="text"
                required
                autoFocus
                disabled={isLocked || isAuthenticating}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={isLocked ? "INPUTS LOCKED // WAIT FOR COOLDOWN" : ""}
                className={`w-full border-2 border-[#1E1F22] px-3.5 py-2.5 text-xs font-mono font-bold text-[#1E1F22] focus:outline-none hard-shadow-sm transition-colors ${
                  isLocked
                    ? 'bg-[#DCD8CF] text-[#6E737D] cursor-not-allowed border-dashed'
                    : 'bg-[#E6E1D6] focus:bg-white'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-[#1E1F22] mb-1.5">
                AUTHORIZATION KEY / PASSWORD *
              </label>
              <input
                type="password"
                required
                disabled={isLocked || isAuthenticating}
                placeholder={isLocked ? "••••••••••••" : "••••••••"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full border-2 border-[#1E1F22] px-3.5 py-2.5 text-xs font-mono font-bold text-[#1E1F22] focus:outline-none hard-shadow-sm transition-colors ${
                  isLocked
                    ? 'bg-[#DCD8CF] text-[#6E737D] cursor-not-allowed border-dashed'
                    : 'bg-[#E6E1D6] focus:bg-white'
                }`}
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLocked || isAuthenticating}
                className={`mechanical-btn w-full py-3 text-xs font-mono font-black tracking-wider flex items-center justify-center gap-2 transition-all ${
                  isLocked
                    ? 'bg-[#2A2B30] text-[#6E737D] border-2 border-[#1E1F22] cursor-not-allowed'
                    : 'bg-[#D95D24] text-white hover:bg-[#BF4D1A]'
                }`}
              >
                {isLocked ? (
                  <>
                    <Lock className="w-4 h-4 text-[#D95D24]" />
                    <span>COOLDOWN ACTIVE ({formatTimer(remainingMs)})</span>
                  </>
                ) : isAuthenticating ? (
                  <span>AUTHENTICATING TELEMETRY...</span>
                ) : (
                  <>
                    <span>LOGIN</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        <p className="text-center text-[11px] font-mono text-[#6E737D] mt-3">
          KLE SPACE CLUB • RESTRICTED UNIVERSITY PERSONNEL ONLY
        </p>
      </div>
    </div>
  );
};
