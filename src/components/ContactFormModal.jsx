import { useState } from 'react';
import { Mail, X, Send, CheckCircle2, Phone } from 'lucide-react';
import { useApp } from '../context/useApp';

const INITIAL_FORM = {
  name: '',
  email: '',
  department: 'General Operations',
  priority: 'Routine',
  message: ''
};

export const ContactFormModal = ({ isOpen, onClose }) => {
  const { addToast } = useApp();
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedReceipt, setSubmittedReceipt] = useState(null);

  if (!isOpen) return null;

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Full name is required.';
    if (!formData.email.trim()) {
      errs.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = 'Valid institutional email format required.';
    }
    if (!formData.message.trim()) {
      errs.message = 'Operational message cannot be empty.';
    } else if (formData.message.trim().length < 10) {
      errs.message = 'Message must provide at least 10 characters of technical context.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const receiptId = `DISP-${Math.floor(100000 + Math.random() * 900000)}`;
      setSubmittedReceipt({
        id: receiptId,
        timestamp: new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: false }) + ' IST',
        department: formData.department
      });
      addToast('DISPATCH TRANSMISSION CONFIRMED', `Transmission #${receiptId} logged into operations dispatch queue.`, 'success');
    }, 400);
  };

  const handleReset = () => {
    setSubmittedReceipt(null);
    setFormData(INITIAL_FORM);
    setErrors({});
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="beige-chassis w-full max-w-xl p-6 hard-shadow-lg relative border-2 border-[#1E1F22] max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b-2 border-[#1E1F22] pb-3 mb-4 text-[10px] font-mono text-[#6E737D]">
          <span>CONNECT TO CLUB HEAD</span>
          <button onClick={onClose} aria-label="Close modal" className="p-1 hover:bg-[#E6E1D6] border border-[#1E1F22] text-[#1E1F22]">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {submittedReceipt ? (
          <div className="space-y-4 py-4 animate-in fade-in duration-150">
            <div className="p-4 bg-[#3A6B5C]/15 border-2 border-[#3A6B5C] text-xs font-mono">
              <div className="flex items-center gap-2 text-[#3A6B5C] font-bold text-sm mb-2">
                <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                <span>DISPATCH TRANSMISSION ACKNOWLEDGED</span>
              </div>
              <p className="text-[#1E1F22]">
                Your transmission has been logged into the KLE Space Lab flight ledger. A duty officer will reply to your registered email address.
              </p>
              <div className="mt-3 pt-3 border-t border-[#3A6B5C]/30 space-y-1 text-[#525760]">
                <p>RECEIPT REF: <strong className="text-[#1E1F22]">{submittedReceipt.id}</strong></p>
                <p>LOGGED AT: <strong className="text-[#1E1F22]">{submittedReceipt.timestamp}</strong></p>
                <p>TARGET: <strong className="text-[#1E1F22]">{submittedReceipt.department}</strong></p>
              </div>
            </div>
            <div className="flex items-center justify-end pt-2">
              <button onClick={handleReset} className="mechanical-btn px-5 py-2 text-xs font-mono font-bold bg-[#1E1F22] text-white">
                RETURN TO CONSOLE
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-[#D95D24] text-white border-2 border-[#1E1F22] flex items-center justify-center font-mono font-bold hard-shadow-sm">
                <Mail className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <h2 className="text-base font-black font-display text-[#1E1F22] tracking-wider uppercase">CONTACT HEAD</h2>
                <p className="text-xs font-mono text-[#525760]">Connect with the club to submit range safety requests or inquire about technical details.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2.5 bg-[#E6E1D6] border-2 border-[#1E1F22] text-xs font-mono mb-4">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#D95D24]" />
                <span className="text-[#6E737D]">PHONE:</span>
                <a href="tel:+918971068665" className="font-bold text-[#1E1F22] hover:text-[#D95D24] underline">+91 8971068665</a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#D95D24]" />
                <span className="text-[#6E737D]">EMAIL:</span>
                <a href="mailto:operations@spaceclub.org" className="font-bold text-[#1E1F22] hover:text-[#D95D24] underline">operations@spaceclub.org</a>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-mono font-bold text-[#1E1F22] mb-1">FULL NAME *</label>
                <input
                  type="text" placeholder="e.g. Flight Specialist Jordan"
                  value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-[#E6E1D6] border-2 border-[#1E1F22] px-3 py-2 text-xs font-mono text-[#1E1F22] focus:outline-none focus:bg-white"
                />
                {errors.name && <p className="text-[10px] font-mono text-[#D95D24] font-bold mt-0.5">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-[#1E1F22] mb-1">EMAIL ADDRESS *</label>
                <input
                  type="email" placeholder="jordan@university.edu"
                  value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-[#E6E1D6] border-2 border-[#1E1F22] px-3 py-2 text-xs font-mono text-[#1E1F22] focus:outline-none focus:bg-white"
                />
                {errors.email && <p className="text-[10px] font-mono text-[#D95D24] font-bold mt-0.5">{errors.email}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono font-bold text-[#1E1F22] mb-1">DEPARTMENT / DESK *</label>
                  <select
                    value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full bg-[#E6E1D6] border-2 border-[#1E1F22] px-3 py-2 text-xs font-mono font-bold text-[#1E1F22] focus:outline-none"
                  >
                    <option value="General Operations">General Operations</option>
                    <option value="Flight Safety Desk">Flight Safety Desk</option>
                    <option value="Robotics & ADCS Engineering">Robotics &amp; ADCS Engineering</option>
                    <option value="Rocketry Propulsion Unit">Rocketry Propulsion Unit</option>
                    <option value="Astronautics Payload Operations">Astronautics Payload Operations</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-mono font-bold text-[#1E1F22] mb-1">PRIORITY TIER</label>
                  <select
                    value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full bg-[#E6E1D6] border-2 border-[#1E1F22] px-3 py-2 text-xs font-mono font-bold text-[#1E1F22] focus:outline-none"
                  >
                    <option value="Routine">Routine (24-48h Response)</option>
                    <option value="Operational">Operational (12h Response)</option>
                    <option value="Priority">Priority / Safety Pre-Launch (Immediate)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-[#1E1F22] mb-1">DIRECTIVE / INQUIRY MESSAGE *</label>
                <textarea
                  rows={4} placeholder="Describe technical scope, range clearance requirements, or equipment requests..."
                  value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-[#E6E1D6] border-2 border-[#1E1F22] px-3 py-2 text-xs font-mono text-[#1E1F22] focus:outline-none focus:bg-white"
                />
                {errors.message && <p className="text-[10px] font-mono text-[#D95D24] font-bold mt-0.5">{errors.message}</p>}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t-2 border-[#1E1F22]">
                <button type="button" onClick={onClose} className="mechanical-btn px-4 py-2 text-xs font-mono font-bold bg-[#E6E1D6] text-[#1E1F22] hover:bg-white">
                  CANCEL
                </button>
                <button
                  type="submit" disabled={isSubmitting}
                  className="mechanical-btn flex items-center gap-1.5 px-5 py-2 text-xs font-mono font-bold bg-[#D95D24] text-white hover:bg-[#BF4D1A] disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'DISPATCHING...' : 'DISPATCH MESSAGE'}</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
