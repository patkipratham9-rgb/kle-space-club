import { useState } from 'react';
import { UserPlus, X } from 'lucide-react';
import { useApp } from '../context/useApp';
import { DOMAINS } from '../data/mockData';

const INITIAL_FORM = {
  name: '',
  studentId: '',
  email: '',
  roleTitle: '',
  role: 'member',
  domains: ['Robotics']
};

export const AddMemberModal = ({ isOpen, onClose }) => {
  const { addMember, members } = useApp();
  const [error, setError] = useState('');
  const [formData, setFormData] = useState(INITIAL_FORM);

  if (!isOpen) return null;

  const handleDomainToggle = (domainName) => {
    setError('');
    setFormData((prev) => {
      const exists = prev.domains.includes(domainName);
      if (exists && prev.domains.length === 1) return prev;
      return {
        ...prev,
        domains: exists ? prev.domains.filter((d) => d !== domainName) : [...prev.domains, domainName]
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    const trimmedId = formData.studentId.trim();
    const trimmedEmail = formData.email.trim();
    const trimmedName = formData.name.trim();

    if (!trimmedName || !trimmedId || !trimmedEmail) {
      return setError('ALL MANDATORY FIELDS (*) MUST BE COMPLETED');
    }
    if (members.some((m) => (m.student_id || '').toLowerCase() === trimmedId.toLowerCase())) {
      return setError(`STUDENT ID [${trimmedId}] IS ALREADY REGISTERED IN MANIFEST`);
    }
    if (members.some((m) => (m.email || '').toLowerCase() === trimmedEmail.toLowerCase())) {
      return setError(`EMAIL [${trimmedEmail}] IS ALREADY REGISTERED`);
    }

    addMember({
      name: trimmedName,
      studentId: trimmedId,
      email: trimmedEmail,
      role: formData.role,
      roleTitle: formData.roleTitle || (formData.role === 'admin' ? 'Club Director' : 'Crew Member'),
      domains: formData.domains
    });

    setFormData(INITIAL_FORM);
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="beige-chassis w-full max-w-lg p-6 hard-shadow-lg relative border-2 border-[#1E1F22]">
        <div className="flex items-center justify-between border-b-2 border-[#1E1F22] pb-3 mb-5 text-[10px] font-mono text-[#6E737D]">
          <span>ENROLLMENT</span>
          <button onClick={onClose} className="p-1 hover:bg-[#E6E1D6] border border-[#1E1F22] text-[#1E1F22]">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-[#D95D24] text-white border-2 border-[#1E1F22] flex items-center justify-center font-mono font-bold hard-shadow-sm">
            <UserPlus className="w-5 h-5 stroke-[2.5]" />
          </div>
          <h2 className="text-lg font-black font-display text-[#1E1F22] tracking-wider uppercase">New Member form</h2>
        </div>

        {error && (
          <div className="mt-4 p-2.5 bg-[#D95D24]/15 border-2 border-[#D95D24] text-[#D95D24] text-xs font-mono font-bold flex items-center gap-2">
            <span className="w-2 h-2 bg-[#D95D24] shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mt-5">
          <div>
            <label className="block text-xs font-mono font-bold text-[#1E1F22] mb-1">FULL NAME *</label>
            <input
              type="text" required placeholder="e.g. Maya Lin"
              value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-[#E6E1D6] border-2 border-[#1E1F22] px-3 py-2 text-xs font-mono text-[#1E1F22] focus:outline-none focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono font-bold text-[#1E1F22] mb-1">STUDENT ID *</label>
              <input
                type="text" required placeholder="NAS-2024-015"
                value={formData.studentId} onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                className="w-full bg-[#E6E1D6] border-2 border-[#1E1F22] px-3 py-2 text-xs font-mono text-[#1E1F22] focus:outline-none focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-mono font-bold text-[#1E1F22] mb-1">EMAIL *</label>
              <input
                type="email" required placeholder="maya.lin@spaceclub.org"
                value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-[#E6E1D6] border-2 border-[#1E1F22] px-3 py-2 text-xs font-mono text-[#1E1F22] focus:outline-none focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono font-bold text-[#1E1F22] mb-1">SPECIALIZATION TITLE</label>
              <input
                type="text" placeholder="e.g. Telemetry Analyst"
                value={formData.roleTitle} onChange={(e) => setFormData({ ...formData, roleTitle: e.target.value })}
                className="w-full bg-[#E6E1D6] border-2 border-[#1E1F22] px-3 py-2 text-xs font-mono text-[#1E1F22] focus:outline-none focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-mono font-bold text-[#1E1F22] mb-1">SECURITY ROLE *</label>
              <select
                value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full bg-[#E6E1D6] border-2 border-[#1E1F22] px-3 py-2 text-xs font-mono font-bold text-[#1E1F22] focus:outline-none"
              >
                <option value="member">MEMBER (CREW)</option>
                <option value="admin">ADMIN (DIRECTOR)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-bold text-[#1E1F22] mb-2">ASSIGN TECHNICAL DIVISIONS (SELECT ONE OR MORE) *</label>
            <div className="grid grid-cols-3 gap-2">
              {Object.values(DOMAINS).map((dom) => {
                const isSelected = formData.domains.includes(dom.name);
                return (
                  <button
                    type="button" key={dom.id} onClick={() => handleDomainToggle(dom.name)}
                    className={`mechanical-btn p-2.5 text-xs font-mono font-bold flex flex-col items-center gap-1 border-2 border-[#1E1F22] ${
                      isSelected ? `${dom.badgeClass} active-depressed` : 'bg-[#E6E1D6] text-[#1E1F22] hover:bg-white'
                    }`}
                  >
                    <span>{dom.name.toUpperCase()}</span>
                    <span className="text-[9px] opacity-80">{isSelected ? '[ALLOCATED]' : '[+ ASSIGN]'}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t-2 border-[#1E1F22]">
            <button type="button" onClick={onClose} className="mechanical-btn px-4 py-2 text-xs font-mono font-bold bg-[#E6E1D6] text-[#1E1F22] hover:bg-white">
              CANCEL
            </button>
            <button type="submit" className="mechanical-btn px-5 py-2 text-xs font-mono font-bold bg-[#D95D24] text-white hover:bg-[#BF4D1A]">
              ADD MEMBER
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
