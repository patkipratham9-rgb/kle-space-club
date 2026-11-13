import { useState } from 'react';
import { Rocket, AlertTriangle, ArrowRight } from 'lucide-react';
import { useApp } from '../context/useApp';

export const LoginGateway = () => {
  const { login } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsAuthenticating(true);
    try {
      const res = await login(username, password);
      if (!res.success) setError(res.error || 'INVALID AUTHORIZATION CREDENTIALS');
    } catch (err) {
      setError(err.message || 'COMMUNICATION / SECURITY FAULT');
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#141517] nasa-rack-bg flex items-center justify-center p-4 selection:bg-[#D95D24] selection:text-white">
      <div className="w-full max-w-md">
        <div className="beige-chassis p-7 hard-shadow-lg relative border-2 border-[#1E1F22]">
          <div className="flex items-center gap-3.5 mb-5">
            <div className="w-12 h-12 bg-[#D95D24] border-2 border-[#1E1F22] hard-shadow-sm flex items-center justify-center text-white shrink-0">
              <Rocket className="w-7 h-7 stroke-[2.2]" />
            </div>
            <span className="font-display font-black text-lg text-[#1E1F22] tracking-wider">
              KLE <span className="text-[#D95D24]">SPACE CLUB</span>
            </span>
          </div>

          {error && (
            <div className="p-3 mb-5 bg-[#D95D24]/15 border-2 border-[#D95D24] hard-shadow-sm text-xs font-mono text-[#1E1F22] flex items-start gap-2.5 animate-in fade-in duration-100">
              <AlertTriangle className="w-4 h-4 text-[#D95D24] shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-bold block text-[#D95D24]">ACCESS REJECTED // 0x401</span>
                <span className="text-[11px] text-[#525760]">{error}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono font-bold text-[#1E1F22] mb-1.5">OPERATOR USERNAME *</label>
              <input
                type="text" required autoFocus value={username} onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-[#E6E1D6] border-2 border-[#1E1F22] px-3.5 py-2.5 text-xs font-mono font-bold text-[#1E1F22] focus:outline-none focus:bg-white hard-shadow-sm transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-[#1E1F22] mb-1.5">AUTHORIZATION KEY / PASSWORD *</label>
              <input
                type="password" required placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#E6E1D6] border-2 border-[#1E1F22] px-3.5 py-2.5 text-xs font-mono font-bold text-[#1E1F22] focus:outline-none focus:bg-white hard-shadow-sm transition-colors"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit" disabled={isAuthenticating}
                className="mechanical-btn w-full py-3 bg-[#D95D24] text-white text-xs font-mono font-black tracking-wider flex items-center justify-center gap-2 hover:bg-[#BF4D1A] transition-all"
              >
                {isAuthenticating ? <span>AUTHENTICATING TELEMETRY...</span> : <><span>LOGIN</span><ArrowRight className="w-4 h-4 stroke-[2.5]" /></>}
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
