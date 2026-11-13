import { useState } from 'react';
import { KeyRound, X, ShieldAlert, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useApp } from '../context/useApp';

export const ChangePasswordModal = ({ isOpen, onClose }) => {
  const { changeAdminPassword, isAdmin } = useApp();
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  if (!isAdmin) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
        <div className="beige-chassis w-full max-w-md p-6 hard-shadow-lg border-2 border-[#1E1F22]">
          <div className="flex items-center gap-3 text-[#D95D24] mb-3">
            <ShieldAlert className="w-6 h-6" />
            <h3 className="font-display font-black text-[#1E1F22]">ACCESS DENIED // 0x403</h3>
          </div>
          <p className="text-xs font-mono text-[#525760] mb-4">
            Security key modification is strictly restricted to Flight Directors (Administrators).
          </p>
          <button onClick={onClose} className="mechanical-btn px-4 py-2 text-xs font-mono font-bold bg-[#E6E1D6] text-[#1E1F22]">
            DISMISS
          </button>
        </div>
      </div>
    );
  }

  const getStrength = (pass) => {
    if (!pass) return { label: 'NONE', color: '#6E737D' };
    if (pass.length < 6) return { label: 'WEAK // INSUFFICIENT', color: '#D95D24' };
    const hasNumOrSym = /[0-9!@#$%^&*(),.?":{}|<>]/.test(pass);
    const hasUpper = /[A-Z]/.test(pass);
    return pass.length >= 8 && hasNumOrSym && hasUpper
      ? { label: 'LEVEL-5 // MIL-SPEC SECURE', color: '#3A6B5C' }
      : { label: 'MODERATE // ACCEPTABLE', color: '#FFAE19' };
  };

  const strength = getStrength(newPass);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (newPass !== confirmPass) return setError('New passwords do not match. Please verify.');
    if (newPass.length < 6) return setError('Password must contain at least 6 characters (8+ recommended).');

    try {
      const res = await changeAdminPassword(currentPass, newPass);
      if (!res.success) return setError(res.error || 'Failed to update administrative password.');
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setCurrentPass('');
        setNewPass('');
        setConfirmPass('');
        onClose();
      }, 1200);
    } catch (err) {
      setError(err.message || 'Transmission fault during key update.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="beige-chassis w-full max-w-md p-6 hard-shadow-lg relative border-2 border-[#1E1F22]">
        <div className="flex items-center justify-between border-b-2 border-[#1E1F22] pb-3 mb-5 text-[10px] font-mono text-[#6E737D]">
          <span className="font-bold text-[#D95D24]">[+] SPEC SEC-99 // ADMIN KEY CONFIG</span>
          <button onClick={onClose} aria-label="Close modal" className="p-1 hover:bg-[#E6E1D6] border border-[#1E1F22] text-[#1E1F22]">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-[#D95D24] text-white border-2 border-[#1E1F22] flex items-center justify-center font-mono font-bold hard-shadow-sm">
            <KeyRound className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-base font-black font-display text-[#1E1F22] tracking-wider uppercase">CHANGE ADMIN SECURITY KEY</h2>
            <p className="text-xs font-mono text-[#525760]">Authorized administrator password modification console.</p>
          </div>
        </div>

        {error && (
          <div className="p-3 mb-4 bg-[#D95D24]/15 border-2 border-[#D95D24] text-xs font-mono text-[#1E1F22] flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#D95D24] shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3 mb-4 bg-[#3A6B5C]/15 border-2 border-[#3A6B5C] text-xs font-mono text-[#3A6B5C] font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#3A6B5C] shrink-0" />
            <span>SECURITY KEY UPDATED SUCCESSFULLY // COMMITTED</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono font-bold text-[#1E1F22] mb-1">CURRENT ADMIN PASSWORD *</label>
            <input
              type="password" required placeholder="Enter current password..."
              value={currentPass} onChange={(e) => setCurrentPass(e.target.value)}
              className="w-full bg-[#E6E1D6] border-2 border-[#1E1F22] px-3 py-2 text-xs font-mono text-[#1E1F22] focus:outline-none focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-bold text-[#1E1F22] mb-1">NEW ADMIN PASSWORD *</label>
            <input
              type="password" required placeholder="Enter new authorization key..."
              value={newPass} onChange={(e) => setNewPass(e.target.value)}
              className="w-full bg-[#E6E1D6] border-2 border-[#1E1F22] px-3 py-2 text-xs font-mono text-[#1E1F22] focus:outline-none focus:bg-white"
            />
            {newPass && (
              <div className="mt-1.5 flex items-center justify-between text-[10px] font-mono">
                <span className="text-[#6E737D]">ENTROPY METRIC:</span>
                <span className="font-bold" style={{ color: strength.color }}>{strength.label}</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-mono font-bold text-[#1E1F22] mb-1">CONFIRM NEW ADMIN PASSWORD *</label>
            <input
              type="password" required placeholder="Re-type new authorization key..."
              value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)}
              className="w-full bg-[#E6E1D6] border-2 border-[#1E1F22] px-3 py-2 text-xs font-mono text-[#1E1F22] focus:outline-none focus:bg-white"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t-2 border-[#1E1F22]">
            <button type="button" onClick={onClose} className="mechanical-btn px-4 py-2 text-xs font-mono font-bold bg-[#E6E1D6] text-[#1E1F22]">
              ABORT
            </button>
            <button type="submit" className="mechanical-btn px-5 py-2 text-xs font-mono font-bold bg-[#D95D24] text-white">
              COMMIT NEW KEY
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
