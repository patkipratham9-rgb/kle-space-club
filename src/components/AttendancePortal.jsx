import { useState } from 'react';
import { 
  ChevronLeft, ChevronRight, Search, Check, X, AlertTriangle, Save, Lock 
} from 'lucide-react';
import { useApp } from '../context/useApp';
import { DOMAINS, getDateString } from '../data/mockData';
import { formatDateOnly } from '../utils/helpers';

export const AttendancePortal = () => {
  const { 
    members, attendance, selectedDate, setSelectedDate, setMemberAttendance, 
    bulkMarkAttendance, commitAttendanceLogs, hasUncommittedChanges, isAdmin, currentOperator 
  } = useApp();

  const [domainFilter, setDomainFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const handleDateDelta = (delta) => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const dt = new Date(y, m - 1, d + delta);
    const pad = (n) => String(n).padStart(2, '0');
    setSelectedDate(`${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`);
  };

  const filteredMembers = members.filter((m) => {
    const matchDom = domainFilter === 'All' || (m?.domains || []).includes(domainFilter);
    const q = searchQuery.toLowerCase();
    const matchQuery = (m?.full_name || '').toLowerCase().includes(q) ||
      (m?.student_id || '').toLowerCase().includes(q) ||
      (m?.role_title || '').toLowerCase().includes(q);
    return matchDom && matchQuery;
  });

  const dateLogs = attendance[selectedDate] || {};
  let presentCount = 0, absentCount = 0;
  const reasonCounts = { Holiday: 0, Exams: 0, Emergency: 0, Other: 0 };

  filteredMembers.forEach((m) => {
    const rec = dateLogs[m.id];
    if (rec?.status === 'Present') presentCount++;
    else if (rec?.status === 'Absent') {
      absentCount++;
      const r = rec.reason || 'Other';
      if (reasonCounts[r] !== undefined) reasonCounts[r]++;
      else reasonCounts.Other++;
    }
  });

  const recordedTotal = presentCount + absentCount;
  const attendanceRate = recordedTotal > 0 ? Math.round((presentCount / recordedTotal) * 100) : 0;

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
                SECURITY LOCKOUT // ATTENDANCE CONSOLE READ-ONLY
              </p>
              <p className="text-xs text-[#525760] font-mono mt-0.5">
                Current Operator <strong className="text-[#1E1F22]">[{currentOperator.full_name}]</strong> has crew-level clearance. Attendance modifications and commits are restricted to Flight Directors.
              </p>
            </div>
          </div>
          <span className="hidden sm:inline px-2.5 py-1 text-[10px] font-mono font-bold bg-[#E29526] text-[#1E1F22] border border-[#1E1F22]">
            READ ONLY
          </span>
        </div>
      )}

      {/* Main Console Header Panel */}
      <div className="beige-chassis p-6 hard-shadow">
        <div className="flex items-center justify-between text-[10px] font-mono text-[#6E737D] border-b-2 border-[#1E1F22] pb-3 mb-5">
          <span>ATTENDANCE DESK</span>
          <div className="flex items-center gap-3">
            <div className="barcode-strip w-20 hidden sm:block" />
            <span className="font-bold text-[#1E1F22]">SYS-02 // ATTENDANCE</span>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <h1 className="text-2xl font-black font-display text-[#1E1F22] tracking-wide">ATTENDANCE LOG</h1>

          <div className="flex flex-wrap items-center gap-2 bg-[#E6E1D6] p-2 border-2 border-[#1E1F22] hard-shadow-sm">
            <button onClick={() => handleDateDelta(-1)} className="mechanical-btn px-2.5 py-1.5 bg-[#F2EFE9] text-[#1E1F22] text-xs font-mono font-bold hover:bg-white" title="Step Previous Day">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2">
              <input
                type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-[#0E0F12] text-[#4ADE80] font-mono font-bold text-xs px-3 py-1.5 border-2 border-[#1E1F22] focus:outline-none focus:border-[#D95D24]"
              />
              <button onClick={() => setSelectedDate(getDateString(0))} className="mechanical-btn px-2.5 py-1.5 bg-[#D95D24] text-white text-xs font-mono font-bold hover:bg-[#BF4D1A]">
                TODAY
              </button>
            </div>
            <button onClick={() => handleDateDelta(1)} className="mechanical-btn px-2.5 py-1.5 bg-[#F2EFE9] text-[#1E1F22] text-xs font-mono font-bold hover:bg-white" title="Step Next Day">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Selected Date Telemetry Readout */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-5 border-t-2 border-[#1E1F22]">
          <div className="bg-[#E6E1D6] p-3 border-2 border-[#1E1F22] hard-shadow-sm">
            <span className="text-[10px] font-mono font-bold text-[#6E737D] uppercase block">LOG DATE</span>
            <span className="text-xs font-mono font-black text-[#1E1F22] mt-0.5 block truncate">{formatDateOnly(selectedDate)}</span>
          </div>

          <div className="bg-[#E6E1D6] p-3 border-2 border-[#1E1F22] hard-shadow-sm">
            <span className="text-[10px] font-mono font-bold text-[#6E737D] uppercase block">ATTENDANCE RATE</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className={`text-base font-black font-mono ${attendanceRate >= 80 ? 'text-[#3A6B5C]' : attendanceRate >= 60 ? 'text-[#E29526]' : 'text-[#D95D24]'}`}>
                {recordedTotal > 0 ? `${attendanceRate}%` : '0%'}
              </span>
              <span className="text-[10px] font-mono text-[#6E737D]">({presentCount}/{filteredMembers.length} on deck)</span>
            </div>
          </div>

          <div className="bg-[#E6E1D6] p-3 border-2 border-[#1E1F22] hard-shadow-sm">
            <span className="text-[10px] font-mono font-bold text-[#6E737D] uppercase block">TELEMETRY RATIO</span>
            <div className="flex items-center gap-3 mt-1 text-xs font-mono font-bold">
              <span className="text-[#3A6B5C] flex items-center gap-1"><Check className="w-3.5 h-3.5 stroke-[3]" /> {presentCount} PRSNT</span>
              <span className="text-[#D95D24] flex items-center gap-1"><X className="w-3.5 h-3.5 stroke-[3]" /> {absentCount} ABSNT</span>
            </div>
          </div>

          <div className="bg-[#E6E1D6] p-3 border-2 border-[#1E1F22] hard-shadow-sm">
            <span className="text-[10px] font-mono font-bold text-[#6E737D] uppercase block">ABSENCE JUSTIFICATIONS</span>
            <div className="flex flex-wrap gap-1 mt-1 text-[10px] font-mono font-bold">
              {reasonCounts.Exams > 0 && <span className="px-1.5 py-0.2 bg-[#E29526] text-[#1E1F22] border border-[#1E1F22]">{reasonCounts.Exams} EXAM</span>}
              {reasonCounts.Emergency > 0 && <span className="px-1.5 py-0.2 bg-[#D95D24] text-white border border-[#1E1F22]">{reasonCounts.Emergency} EMRG</span>}
              {reasonCounts.Holiday > 0 && <span className="px-1.5 py-0.2 bg-[#3A6B5C] text-white border border-[#1E1F22]">{reasonCounts.Holiday} HLDY</span>}
              {reasonCounts.Other > 0 && <span className="px-1.5 py-0.2 bg-[#1E1F22] text-white border border-[#1E1F22]">{reasonCounts.Other} OTHR</span>}
              {absentCount === 0 && <span className="text-[#6E737D]">NONE LOGGED</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Division Switchbank & Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-[#E6E1D6] border-2 border-[#1E1F22] hard-shadow-sm">
          <button
            onClick={() => setDomainFilter('All')}
            className={`px-3 py-1.5 text-xs font-mono font-bold border-2 border-[#1E1F22] transition-all ${
              domainFilter === 'All' ? 'bg-[#1E1F22] text-white hard-shadow-sm' : 'bg-[#F2EFE9] text-[#1E1F22] hover:bg-white'
            }`}
          >
            ALL DIVISIONS ({members.length})
          </button>
          {Object.values(DOMAINS).map((dom) => (
            <button
              key={dom.id} onClick={() => setDomainFilter(dom.name)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold border-2 border-[#1E1F22] transition-all ${
                domainFilter === dom.name ? `${dom.badgeClass} hard-shadow-sm` : 'bg-[#F2EFE9] text-[#1E1F22] hover:bg-white'
              }`}
            >
              <span>{dom.name.toUpperCase()} ({members.filter((m) => (m?.domains || []).includes(dom.name)).length})</span>
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative flex-1 sm:w-60">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#6E737D]" />
            <input
              type="text" placeholder="Filter by name / ID..."
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-[#F2EFE9] border-2 border-[#1E1F22] text-xs font-mono text-[#1E1F22] placeholder:text-[#8A8F99] focus:outline-none focus:bg-white"
            />
          </div>

          {isAdmin && (
            <>
              <button
                onClick={() => bulkMarkAttendance(selectedDate, 'Present', domainFilter)}
                className="mechanical-btn px-3 py-1.5 text-xs font-mono font-bold bg-[#E6E1D6] text-[#1E1F22] hover:bg-[#F2EFE9]"
              >
                MARK ALL PRESENT
              </button>
              <button
                onClick={() => commitAttendanceLogs(selectedDate)}
                className={`mechanical-btn flex items-center gap-1.5 px-4 py-1.5 text-xs font-mono font-bold border-2 border-[#1E1F22] ${
                  hasUncommittedChanges ? 'bg-[#D95D24] text-white hover:bg-[#BF4D1A] animate-pulse' : 'bg-[#3A6B5C] text-white hover:bg-[#2F564A]'
                }`}
              >
                <Save className="w-3.5 h-3.5" />
                <span>COMMIT LOGS</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Member Attendance Racks */}
      {filteredMembers.length === 0 ? (
        <div className="beige-chassis p-12 text-center border-2 border-[#1E1F22] hard-shadow-sm font-mono text-xs text-[#525760]">
          <div className="font-bold text-sm text-[#1E1F22]">NO CANDIDATES AVAILABLE</div>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredMembers.map((member) => {
            const rec = dateLogs[member.id] || { status: '', reason: '', note: '' };
            const isPresent = rec.status === 'Present';
            const isAbsent = rec.status === 'Absent';

            return (
              <div
                key={member.id}
                className={`beige-chassis p-4 border-2 border-[#1E1F22] hard-shadow-sm transition-all ${
                  isPresent ? 'border-l-[6px] border-l-[#3A6B5C]' : isAbsent ? 'border-l-[6px] border-l-[#D95D24]' : 'border-l-[6px] border-l-[#6E737D]'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="w-10 h-10 bg-[#1E1F22] border-2 border-[#1E1F22] text-[#FFAE19] flex items-center justify-center font-mono font-bold text-sm shrink-0">
                      {member.avatar}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-display font-black text-sm text-[#1E1F22]">{member.full_name}</span>
                        <span className="px-1.5 py-0.2 bg-[#E6E1D6] border border-[#1E1F22] text-[10px] font-mono font-bold text-[#1E1F22]">{member.student_id}</span>
                        {(member.domains || []).map((d) => {
                          const domMeta = DOMAINS[d] || DOMAINS.Robotics;
                          return (
                            <span key={d} className={`px-1.5 py-0.2 text-[9px] font-mono font-bold ${domMeta.badgeClass}`}>
                              {domMeta.code}
                            </span>
                          );
                        })}
                      </div>
                      <div className="flex items-center gap-2 text-xs font-mono text-[#525760] mt-0.5">
                        <span>{member.role_title}</span>
                        <span>•</span>
                        <span className="text-[#6E737D]">{member.email}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      disabled={!isAdmin}
                      onClick={() => setMemberAttendance(selectedDate, member.id, 'Present', '')}
                      className={`mechanical-btn px-4 py-2 text-xs font-mono font-bold border-2 border-[#1E1F22] ${
                        isPresent ? 'bg-[#3A6B5C] text-white active-depressed' : 'bg-[#E6E1D6] text-[#1E1F22] hover:bg-white'
                      } ${!isAdmin ? 'cursor-not-allowed opacity-80' : ''}`}
                    >
                      [ PRESENT ]
                    </button>
                    <button
                      disabled={!isAdmin}
                      onClick={() => setMemberAttendance(selectedDate, member.id, 'Absent', rec.reason || 'Exams')}
                      className={`mechanical-btn px-4 py-2 text-xs font-mono font-bold border-2 border-[#1E1F22] ${
                        isAbsent ? 'bg-[#D95D24] text-white active-depressed' : 'bg-[#E6E1D6] text-[#1E1F22] hover:bg-white'
                      } ${!isAdmin ? 'cursor-not-allowed opacity-80' : ''}`}
                    >
                      [ ABSENT ]
                    </button>
                    {!isPresent && !isAbsent && (
                      <span className="text-[10px] font-mono text-[#6E737D] italic pl-1 hidden sm:inline">STANDBY</span>
                    )}
                  </div>
                </div>

                {isAbsent && (
                  <div className="mt-3.5 pt-3 border-t-2 border-[#1E1F22] bg-[#E6E1D6] -mx-4 -mb-4 p-3.5 animate-in fade-in duration-100">
                    <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-mono font-bold text-[#D95D24] flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>ABSENCE CATEGORY:</span>
                        </span>
                        <select
                          disabled={!isAdmin} value={rec.reason || 'Exams'}
                          onChange={(e) => setMemberAttendance(selectedDate, member.id, 'Absent', e.target.value)}
                          className="bg-[#F2EFE9] text-[#1E1F22] text-xs font-mono font-bold px-3 py-1.5 border-2 border-[#1E1F22] focus:outline-none"
                        >
                          <option value="Holiday">HOLIDAY / AUTHORIZED LEAVE</option>
                          <option value="Exams">EXAMS / ACADEMIC CONFLICT</option>
                          <option value="Emergency">EMERGENCY / MEDICAL</option>
                          <option value="Other">OTHER OPERATIONAL DUTY</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
