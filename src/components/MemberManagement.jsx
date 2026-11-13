import { useState } from 'react';
import { UserPlus, Search, Trash2, Edit3, X, Lock, AlertTriangle } from 'lucide-react';
import { useApp } from '../context/useApp';
import { DOMAINS } from '../data/mockData';
import { AddMemberModal } from './AddMemberModal';

export const MemberManagement = ({ isAddModalOpen, setIsAddModalOpen }) => {
  const { members, updateMember, deleteMember, removeMemberFromDomain, isAdmin, currentOperator } = useApp();
  const [selectedDomainFilter, setSelectedDomainFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingMember, setEditingMember] = useState(null);
  const [deleteConfirmMember, setDeleteConfirmMember] = useState(null);

  const handleUpdateMemberSubmit = (e) => {
    e.preventDefault();
    if (!editingMember) return;
    updateMember(editingMember.id, {
      full_name: editingMember.full_name,
      student_id: editingMember.student_id,
      email: editingMember.email,
      role_title: editingMember.role_title,
      domains: editingMember.domains
    });
    setEditingMember(null);
  };

  const filteredMembers = members.filter((m) => {
    const matchesDomain = selectedDomainFilter === 'All' || (m?.domains || []).includes(selectedDomainFilter);
    const q = searchQuery.toLowerCase();
    const matchesQuery = (m?.full_name || '').toLowerCase().includes(q) ||
      (m?.student_id || '').toLowerCase().includes(q) ||
      (m?.email || '').toLowerCase().includes(q) ||
      (m?.role_title || '').toLowerCase().includes(q);
    return matchesDomain && matchesQuery;
  });

  return (
    <div className="space-y-6">
      {!isAdmin && (
        <div className="beige-chassis p-4 border-2 border-[#1E1F22] bg-[#E29526]/10 hard-shadow-sm flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#E29526] text-[#1E1F22] border-2 border-[#1E1F22] hard-shadow-sm">
              <Lock className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <p className="text-xs font-mono font-bold text-[#1E1F22] tracking-wider uppercase">
                SECURITY LOCKOUT // ROSTER MANIFEST READ-ONLY
              </p>
              <p className="text-xs text-[#525760] font-mono mt-0.5">
                Current Operator <strong className="text-[#1E1F22]">[{currentOperator.full_name}]</strong> has crew-level clearance. Member enlistments, domain reallocations, and discharges are restricted to Flight Directors.
              </p>
            </div>
          </div>
          <span className="hidden sm:inline px-2.5 py-1 text-[10px] font-mono font-bold bg-[#E29526] text-[#1E1F22] border border-[#1E1F22]">
            READ ONLY
          </span>
        </div>
      )}

      {/* Header */}
      <div className="beige-chassis p-6 hard-shadow">
        <div className="flex items-center justify-between text-[10px] font-mono text-[#6E737D] border-b-2 border-[#1E1F22] pb-3 mb-5">
          <span>Members</span>
          <div className="flex items-center gap-3">
            <div className="barcode-strip w-20 hidden sm:block" />
            <span className="font-bold text-[#1E1F22]">SYS-04 // MEMBER LIST</span>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-2xl font-black font-display text-[#1E1F22] tracking-wide">MEMBER LIST</h1>
          {isAdmin && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="mechanical-btn flex items-center gap-2 px-4 py-2.5 bg-[#D95D24] text-white text-xs font-mono font-bold hover:bg-[#BF4D1A] shrink-0 self-start md:self-center"
            >
              <UserPlus className="w-4 h-4 stroke-[2.5]" />
              <span>ADD NEW MEMBER</span>
            </button>
          )}
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-[#E6E1D6] border-2 border-[#1E1F22] hard-shadow-sm">
          <button
            onClick={() => setSelectedDomainFilter('All')}
            className={`px-3 py-1.5 text-xs font-mono font-bold border-2 border-[#1E1F22] transition-all ${
              selectedDomainFilter === 'All' ? 'bg-[#1E1F22] text-white hard-shadow-sm' : 'bg-[#F2EFE9] text-[#1E1F22] hover:bg-white'
            }`}
          >
            ALL DIVISIONS ({members.length})
          </button>
          {Object.values(DOMAINS).map((dom) => (
            <button
              key={dom.id} onClick={() => setSelectedDomainFilter(dom.name)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold border-2 border-[#1E1F22] transition-all ${
                selectedDomainFilter === dom.name ? `${dom.badgeClass} hard-shadow-sm` : 'bg-[#F2EFE9] text-[#1E1F22] hover:bg-white'
              }`}
            >
              <span>{dom.name.toUpperCase()} ({members.filter((m) => (m?.domains || []).includes(dom.name)).length})</span>
            </button>
          ))}
        </div>

        <div className="relative flex-1 sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#6E737D]" />
          <input
            type="text" placeholder="Search manifest..." value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-[#F2EFE9] border-2 border-[#1E1F22] text-xs font-mono text-[#1E1F22] placeholder:text-[#8A8F99] focus:outline-none focus:bg-white"
          />
        </div>
      </div>

      {/* Roster Cards */}
      {filteredMembers.length === 0 ? (
        <div className="beige-chassis p-12 text-center border-2 border-[#1E1F22] hard-shadow-sm font-mono text-xs text-[#525760]">
          <div className="font-bold text-sm text-[#1E1F22]">NO NEW MEMBER</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.map((member) => (
            <div key={member.id} className="beige-chassis p-5 hard-shadow-sm border-2 border-[#1E1F22] flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between border-b-2 border-[#1E1F22] pb-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-[#1E1F22] border-2 border-[#1E1F22] text-[#FFAE19] flex items-center justify-center font-mono font-bold text-sm hard-shadow-sm shrink-0">
                      {member.avatar}
                    </div>
                    <div>
                      <h3 className="font-display font-black text-[#1E1F22] text-sm leading-snug">{member.full_name}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-mono font-bold text-[#D95D24]">[{member.student_id}]</span>
                        <span className={`px-1 py-0.2 text-[8px] font-mono font-bold uppercase border border-[#1E1F22] ${
                          member.role === 'admin' ? 'bg-[#D95D24] text-white' : 'bg-[#3A6B5C] text-white'
                        }`}>
                          {member.role}
                        </span>
                      </div>
                    </div>
                  </div>

                  {isAdmin && (
                    <div className="flex items-center gap-1">
                      <button onClick={() => setEditingMember(member)} className="p-1 hover:bg-[#E6E1D6] border border-[#1E1F22] text-[#1E1F22]" title="Edit Specialist">
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setDeleteConfirmMember(member)} className="p-1 hover:bg-[#D95D24] hover:text-white border border-[#1E1F22] text-[#D95D24]" title="Discharge Specialist">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-1 text-xs font-mono mb-3">
                  <div className="text-[#1E1F22] font-bold">{member.role_title}</div>
                  <div className="text-[#525760] truncate">{member.email}</div>
                  <div className="text-[#6E737D] text-[11px]">{member.phone}</div>
                </div>
              </div>

              <div className="pt-3 border-t-2 border-[#1E1F22]">
                <span className="text-[10px] font-mono text-[#6E737D] uppercase font-bold block mb-1.5">ASSIGNED DIVISIONS:</span>
                <div className="flex flex-wrap gap-1">
                  {(member.domains || []).map((dom) => {
                    const domMeta = DOMAINS[dom] || DOMAINS.Robotics;
                    return (
                      <span key={dom} className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-mono font-bold border border-[#1E1F22] ${domMeta.badgeClass}`}>
                        <span>{domMeta.code}</span>
                        <span>{dom}</span>
                        {isAdmin && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (member.domains.length === 1) {
                                if (confirm(`Removing "${dom}" is their sole division assignment and will decommission ${member.full_name}. Proceed?`)) {
                                  deleteMember(member.id);
                                }
                              } else {
                                removeMemberFromDomain(member.id, dom);
                              }
                            }}
                            className="hover:bg-black/30 px-1 py-0.2 ml-0.5 font-bold"
                          >
                            X
                          </button>
                        )}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AddMemberModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />

      {/* Edit Member Modal */}
      {editingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="beige-chassis w-full max-w-lg p-6 hard-shadow-lg relative border-2 border-[#1E1F22]">
            <button onClick={() => setEditingMember(null)} className="absolute top-5 right-5 p-1 border border-[#1E1F22] hover:bg-[#E6E1D6]">
              <X className="w-4 h-4" />
            </button>
            <h2 className="text-lg font-black font-display text-[#1E1F22] mb-1">REVISE SPECIALIST MANIFEST</h2>
            <p className="text-xs font-mono text-[#525760] mb-5">Update credentials for {editingMember.full_name}.</p>

            <form onSubmit={handleUpdateMemberSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-bold text-[#1E1F22] mb-1">FULL NAME</label>
                <input
                  type="text" required value={editingMember.full_name}
                  onChange={(e) => setEditingMember({ ...editingMember, full_name: e.target.value })}
                  className="w-full bg-[#E6E1D6] border-2 border-[#1E1F22] px-3 py-2 text-xs font-mono text-[#1E1F22] focus:outline-none focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono font-bold text-[#1E1F22] mb-1">STUDENT ID</label>
                  <input
                    type="text" required value={editingMember.student_id}
                    onChange={(e) => setEditingMember({ ...editingMember, student_id: e.target.value })}
                    className="w-full bg-[#E6E1D6] border-2 border-[#1E1F22] px-3 py-2 text-xs font-mono text-[#1E1F22] focus:outline-none focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono font-bold text-[#1E1F22] mb-1">EMAIL</label>
                  <input
                    type="email" required value={editingMember.email}
                    onChange={(e) => setEditingMember({ ...editingMember, email: e.target.value })}
                    className="w-full bg-[#E6E1D6] border-2 border-[#1E1F22] px-3 py-2 text-xs font-mono text-[#1E1F22] focus:outline-none focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-[#1E1F22] mb-1">ROLE TITLE</label>
                <input
                  type="text" value={editingMember.role_title}
                  onChange={(e) => setEditingMember({ ...editingMember, role_title: e.target.value })}
                  className="w-full bg-[#E6E1D6] border-2 border-[#1E1F22] px-3 py-2 text-xs font-mono text-[#1E1F22] focus:outline-none focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t-2 border-[#1E1F22]">
                <button type="button" onClick={() => setEditingMember(null)} className="mechanical-btn px-4 py-2 text-xs font-mono font-bold bg-[#E6E1D6] text-[#1E1F22]">
                  CANCEL
                </button>
                <button type="submit" className="mechanical-btn px-5 py-2 text-xs font-mono font-bold bg-[#D95D24] text-white">
                  SAVE SPECIFICATION
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="beige-chassis w-full max-w-md p-6 hard-shadow-lg border-2 border-[#1E1F22]">
            <div className="flex items-center gap-3 text-[#D95D24] mb-3">
              <div className="p-2.5 bg-[#D95D24] text-white border-2 border-[#1E1F22] hard-shadow-sm">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black font-display text-[#1E1F22]">DECOMMISSION FLIGHT SPECIALIST?</h3>
            </div>
            <p className="text-xs font-mono text-[#525760] leading-relaxed mb-6">
              Confirm discharge of <strong className="text-[#1E1F22]">[{deleteConfirmMember.full_name}]</strong> ({deleteConfirmMember.student_id}) from the Space Club manifest. This will expunge all task assignments and database references.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button type="button" onClick={() => setDeleteConfirmMember(null)} className="mechanical-btn px-4 py-2 text-xs font-mono font-bold bg-[#E6E1D6] text-[#1E1F22]">
                ABORT
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteMember(deleteConfirmMember.id);
                  setDeleteConfirmMember(null);
                }}
                className="mechanical-btn px-4 py-2 text-xs font-mono font-bold bg-[#D95D24] text-white"
              >
                CONFIRM DISCHARGE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
