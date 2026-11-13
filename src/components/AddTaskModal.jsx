import { useState } from 'react';
import { Layers, X } from 'lucide-react';
import { useApp } from '../context/useApp';
import { DOMAINS, getFutureDateTimeString } from '../data/mockData';

const INITIAL_FORM = {
  title: '',
  description: '',
  domain: 'Robotics',
  assignedMemberIds: [],
  deadline: getFutureDateTimeString(2, 18, 0),
  priority: 'Medium',
  status: 'Pending'
};

export const AddTaskModal = ({ isOpen, onClose }) => {
  const { addTask, members } = useApp();
  const [formData, setFormData] = useState(INITIAL_FORM);

  if (!isOpen) return null;

  const eligibleMembers = members.filter((m) => (m?.domains || []).includes(formData.domain));

  const handleMemberToggle = (memberId) => {
    setFormData((prev) => {
      const exists = prev.assignedMemberIds.includes(memberId);
      return {
        ...prev,
        assignedMemberIds: exists ? prev.assignedMemberIds.filter((id) => id !== memberId) : [...prev.assignedMemberIds, memberId]
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    addTask({
      title: formData.title,
      description: formData.description,
      domain: formData.domain,
      assignedMemberIds: formData.assignedMemberIds,
      deadline: formData.deadline,
      priority: formData.priority,
      status: formData.status
    });

    setFormData(INITIAL_FORM);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="beige-chassis w-full max-w-xl p-6 hard-shadow-lg relative border-2 border-[#1E1F22] max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b-2 border-[#1E1F22] pb-3 mb-5 text-[10px] font-mono text-[#6E737D]">
          <span>Assigning Work</span>
          <button onClick={onClose} className="p-1 hover:bg-[#E6E1D6] border border-[#1E1F22] text-[#1E1F22]">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-[#D95D24] text-white border-2 border-[#1E1F22] flex items-center justify-center font-mono font-bold hard-shadow-sm">
            <Layers className="w-5 h-5 stroke-[2.5]" />
          </div>
          <h2 className="text-lg font-black font-display text-[#1E1F22] tracking-wider uppercase">Issue work</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-5">
          <div>
            <label className="block text-xs font-mono font-bold text-[#1E1F22] mb-1">DIRECTIVE TITLE *</label>
            <input
              type="text" required placeholder="e.g. ADCS B-Field Detumbling Validation"
              value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-[#E6E1D6] border-2 border-[#1E1F22] px-3 py-2 text-xs font-mono text-[#1E1F22] focus:outline-none focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-bold text-[#1E1F22] mb-1">TECHNICAL SCOPE &amp; SAFETY SPECIFICATION</label>
            <textarea
              rows={3} placeholder="Provide engineering parameters, CAD coordinates, or testing protocol..."
              value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-[#E6E1D6] border-2 border-[#1E1F22] px-3 py-2 text-xs font-mono text-[#1E1F22] focus:outline-none focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-bold text-[#1E1F22] mb-2">TARGET FLIGHT DIVISION *</label>
            <div className="grid grid-cols-3 gap-2">
              {Object.values(DOMAINS).map((dom) => {
                const isSelected = formData.domain === dom.name;
                return (
                  <button
                    type="button" key={dom.id}
                    onClick={() => {
                      const validIds = members.filter((m) => (m?.domains || []).includes(dom.name)).map((m) => m.id);
                      setFormData({
                        ...formData,
                        domain: dom.name,
                        assignedMemberIds: formData.assignedMemberIds.filter((id) => validIds.includes(id))
                      });
                    }}
                    className={`mechanical-btn p-2.5 text-xs font-mono font-bold border-2 border-[#1E1F22] flex flex-col items-center gap-0.5 ${
                      isSelected ? `${dom.badgeClass} active-depressed` : 'bg-[#E6E1D6] text-[#1E1F22] hover:bg-white'
                    }`}
                  >
                    <span>{dom.name.toUpperCase()}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-bold text-[#1E1F22] mb-1">
              DELEGATE CREW SPECIALISTS ({eligibleMembers.length} in {formData.domain})
            </label>
            <div className="max-h-36 overflow-y-auto bg-[#E6E1D6] border-2 border-[#1E1F22] p-2 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {eligibleMembers.length === 0 ? (
                <span className="text-xs font-mono text-[#6E737D] p-2 col-span-2">No specialists in this division.</span>
              ) : (
                eligibleMembers.map((mem) => {
                  const isAssigned = formData.assignedMemberIds.includes(mem.id);
                  return (
                    <div
                      key={mem.id} onClick={() => handleMemberToggle(mem.id)}
                      className={`flex items-center gap-2 p-1.5 border cursor-pointer text-xs font-mono transition-colors ${
                        isAssigned ? 'bg-[#1E1F22] text-[#FFAE19] border-[#1E1F22] font-bold' : 'bg-[#F2EFE9] text-[#1E1F22] border-[#1E1F22] hover:bg-white'
                      }`}
                    >
                      <span className="w-3.5 h-3.5 border border-current flex items-center justify-center text-[9px] font-bold">
                        {isAssigned && 'X'}
                      </span>
                      <span className="truncate">{mem.full_name}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-mono font-bold text-[#1E1F22] mb-1">DEADLINE MET (LOCAL) *</label>
              <input
                type="datetime-local" required
                value={formData.deadline} onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="w-full bg-[#E6E1D6] border-2 border-[#1E1F22] px-2 py-1.5 text-xs font-mono text-[#1E1F22] focus:outline-none focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-mono font-bold text-[#1E1F22] mb-1">URGENCY PRIORITY</label>
              <select
                value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full bg-[#E6E1D6] border-2 border-[#1E1F22] px-2 py-2 text-xs font-mono font-bold text-[#1E1F22] focus:outline-none"
              >
                <option value="Low">LOW</option>
                <option value="Medium">MEDIUM</option>
                <option value="High">HIGH (URGENT)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-mono font-bold text-[#1E1F22] mb-1">INITIAL STATUS</label>
              <select
                value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-[#E6E1D6] border-2 border-[#1E1F22] px-2 py-2 text-xs font-mono font-bold text-[#1E1F22] focus:outline-none"
              >
                <option value="Pending">PENDING</option>
                <option value="In Progress">IN PROGRESS</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t-2 border-[#1E1F22]">
            <button type="button" onClick={onClose} className="mechanical-btn px-4 py-2 text-xs font-mono font-bold bg-[#E6E1D6] text-[#1E1F22] hover:bg-white">
              CANCEL
            </button>
            <button type="submit" className="mechanical-btn px-5 py-2 text-xs font-mono font-bold bg-[#D95D24] text-white hover:bg-[#BF4D1A]">
              DISPATCH WORK
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
