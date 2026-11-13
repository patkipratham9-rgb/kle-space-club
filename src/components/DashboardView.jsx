import { useState } from 'react';
import { 
  Users, XCircle, Layers, AlertTriangle, TrendingUp, Clock, ChevronRight, Check, Terminal 
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, Legend 
} from 'recharts';
import { useApp } from '../context/useApp';
import { DOMAINS, getDateString } from '../data/mockData';
import { getUrgencyInfo, formatDateTime } from '../utils/helpers';

const CRTTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-[#0E0F12] border-2 border-[#FFAE19] p-3 text-xs font-mono text-[#E6E1D6] hard-shadow-sm">
      <div className="flex items-center justify-between gap-4 border-b border-[#3A3D45] pb-1 mb-1.5 text-[#FFAE19] font-bold">
        <span>MET_LOG // {d.fullDate}</span>
        <span>RATE: {d.rate}%</span>
      </div>
      <div className="space-y-0.5 text-[11px]">
        <p className="text-[#4ADE80]">PRSNT ON DECK: {d.present}</p>
        <p className="text-[#D95D24]">ABSNT TOTAL: {d.absent}</p>
        {d.absent > 0 && (
          <p className="text-[#8A8F99] pt-1">
            JUSTIFICATIONS: {d.exams > 0 && `[${d.exams} EXAM] `}{d.emergency > 0 && `[${d.emergency} EMRG] `}{d.holiday > 0 && `[${d.holiday} HLDY] `}{d.other > 0 && `[${d.other} OTHR]`}
          </p>
        )}
      </div>
    </div>
  );
};

export const DashboardView = ({ onNavigateToAttendance, onNavigateToTasks, onNavigateToMembers }) => {
  const { members, attendance, tasks, updateTaskStatus, isAdmin, currentOperator } = useApp();
  const [chartDomainFilter, setChartDomainFilter] = useState('All');
  const [chartMetricType, setChartMetricType] = useState('percentage');

  const todayStr = getDateString(0);
  const todayLogs = attendance[todayStr] || {};
  let todayPresent = 0, todayAbsent = 0;
  const todayReasons = { Holiday: 0, Exams: 0, Emergency: 0, Other: 0 };

  members.forEach((m) => {
    const rec = todayLogs[m.id];
    if (rec?.status === 'Present') todayPresent++;
    else if (rec?.status === 'Absent') {
      todayAbsent++;
      const r = rec.reason || 'Other';
      if (todayReasons[r] !== undefined) todayReasons[r]++;
      else todayReasons.Other++;
    }
  });

  const todayRecorded = todayPresent + todayAbsent;
  const todayRate = todayRecorded > 0 ? Math.round((todayPresent / todayRecorded) * 100) : 0;
  const activeTasks = tasks.filter((t) => t.status !== 'Completed');
  const criticalOrOverdue = activeTasks.filter((t) => getUrgencyInfo(t.deadline, t.status).isUrgent);

  const pastDays = [-13, -11, -9, -7, -5, -3, -2, -1, 0];
  const chartData = pastDays.map((offset) => {
    const dStr = getDateString(offset);
    const dayLabel = new Date(dStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });
    const logs = attendance[dStr] || {};
    const eligible = chartDomainFilter === 'All' ? members : members.filter((m) => (m?.domains || []).includes(chartDomainFilter));

    let present = 0, absent = 0, exams = 0, emergency = 0, holiday = 0, other = 0;
    eligible.forEach((m) => {
      const rec = logs[m.id];
      if (rec?.status === 'Present') present++;
      else if (rec?.status === 'Absent') {
        absent++;
        if (rec.reason === 'Exams') exams++;
        else if (rec.reason === 'Emergency') emergency++;
        else if (rec.reason === 'Holiday') holiday++;
        else other++;
      }
    });

    const totalLogged = present + absent;
    return {
      date: dayLabel, fullDate: dStr, present, absent, exams, emergency, holiday, other,
      rate: totalLogged > 0 ? Math.round((present / totalLogged) * 100) : 0,
      total: eligible.length
    };
  });

  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.status === 'Completed' && b.status !== 'Completed') return 1;
    if (b.status === 'Completed' && a.status !== 'Completed') return -1;
    return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
  });

  const cards = [
    {
      title: 'TOTAL ATTENDANCE', icon: Users, onClick: onNavigateToMembers,
      main: members.length, sub: 'MEMBERS', subColor: 'text-[#3A6B5C]',
      footer: (
        <div className="flex items-center gap-1.5 mt-3 pt-2 border-t border-[#E6E1D6] text-[10px] font-mono">
          <span className="text-[#3A6B5C] font-bold">ROB: {members.filter(m => (m?.domains||[]).includes('Robotics')).length}</span>
          <span>•</span>
          <span className="text-[#D95D24] font-bold">RCK: {members.filter(m => (m?.domains||[]).includes('Rocketry')).length}</span>
          <span>•</span>
          <span className="text-[#E29526] font-bold">AST: {members.filter(m => (m?.domains||[]).includes('Astronautics')).length}</span>
        </div>
      )
    },
    {
      title: "TODAY'S ATTENDANCE RATE", icon: TrendingUp, onClick: onNavigateToAttendance,
      main: `${todayRate}%`, sub: `(${todayPresent}/${todayRecorded} logged)`, subColor: 'text-[#6E737D]',
      mainColor: todayRate >= 80 ? 'text-[#3A6B5C]' : todayRate >= 60 ? 'text-[#E29526]' : 'text-[#D95D24]',
      footer: (
        <div className="flex items-center gap-3 mt-3 pt-2 border-t border-[#E6E1D6] text-[10px] font-mono font-bold">
          <span className="text-[#3A6B5C] flex items-center gap-1"><Check className="w-3 h-3 stroke-[3]" /> {todayPresent} PRESENT</span>
          <span className="text-[#D95D24] flex items-center gap-1"><XCircle className="w-3 h-3" /> {todayAbsent} ABSENT</span>
        </div>
      )
    },
    {
      title: 'ACTIVE WORKPACKAGES', icon: Layers, onClick: onNavigateToTasks,
      main: activeTasks.length, sub: `of ${tasks.length} total`, subColor: 'text-[#6E737D]',
      footer: (
        <div className="mt-3 pt-2 border-t border-[#E6E1D6] text-[10px] font-mono">
          {criticalOrOverdue.length > 0 ? (
            <span className="text-[#D95D24] font-bold flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" /> {criticalOrOverdue.length} CRITICAL / OVERDUE
            </span>
          ) : (
            <span className="text-[#3A6B5C] font-bold">[OK] ALL DIRECTIVES NOMINAL</span>
          )}
        </div>
      )
    },
    {
      title: 'EXCUSED REASON BREAKDOWN', icon: Clock, onClick: onNavigateToAttendance,
      main: todayAbsent, sub: 'Absences Today', subColor: 'text-[#6E737D]',
      footer: (
        <div className="flex flex-wrap gap-1 mt-3 pt-2 border-t border-[#E6E1D6] text-[9px] font-mono font-bold">
          <span className="px-1.5 py-0.2 bg-[#E29526] text-[#1E1F22] border border-[#1E1F22]">{todayReasons.Exams} EXAM</span>
          <span className="px-1.5 py-0.2 bg-[#D95D24] text-white border border-[#1E1F22]">{todayReasons.Emergency} EMRG</span>
          <span className="px-1.5 py-0.2 bg-[#3A6B5C] text-white border border-[#1E1F22]">{todayReasons.Holiday} HLDY</span>
          <span className="px-1.5 py-0.2 bg-[#1E1F22] text-white border border-[#1E1F22]">{todayReasons.Other} OTHR</span>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* 4 KPI Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.title} onClick={c.onClick} className="beige-chassis p-5 hard-shadow-sm hover:translate-y-[-2px] transition-all cursor-pointer group">
              <div className="flex items-center justify-between border-b border-[#1E1F22] pb-2 mb-3">
                <span className="text-[10px] font-mono font-bold text-[#6E737D] uppercase">{c.title}</span>
                <Icon className="w-4 h-4 text-[#1E1F22]" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className={`text-4xl font-black font-mono ${c.mainColor || 'text-[#1E1F22]'}`}>{c.main}</span>
                <span className={`text-xs font-mono font-bold ${c.subColor}`}>{c.sub}</span>
              </div>
              {c.footer}
            </div>
          );
        })}
      </div>

      {/* CRT Progress Telemetry */}
      <div className="crt-screen p-6 hard-shadow border-2 border-[#1E1F22]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-[#2A2B30] pb-4">
          <div>
            <div className="flex items-center gap-2 font-mono text-[10px] text-[#FFAE19] tracking-widest uppercase mb-1">
              <Terminal className="w-3.5 h-3.5" />
              <span>ATTENDANCE</span>
            </div>
            <h1 className="text-lg font-black font-display text-white tracking-wider">DAILY ATTENDANCE PROGRESS TELEMETRY</h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center bg-[#141517] p-1 border border-[#3A3D45]">
              <button
                onClick={() => setChartDomainFilter('All')}
                className={`px-2.5 py-1 text-[11px] font-mono font-bold ${chartDomainFilter === 'All' ? 'bg-[#FFAE19] text-[#141517]' : 'text-[#8A8F99] hover:text-white'}`}
              >
                ALL CLUB
              </button>
              {Object.values(DOMAINS).map((d) => (
                <button
                  key={d.id} onClick={() => setChartDomainFilter(d.name)}
                  className={`px-2 py-1 text-[11px] font-mono font-bold ${chartDomainFilter === d.name ? 'bg-[#FFAE19] text-[#141517]' : 'text-[#8A8F99] hover:text-white'}`}
                >
                  {d.name.toUpperCase()}
                </button>
              ))}
            </div>

            <div className="flex items-center bg-[#141517] p-1 border border-[#3A3D45]">
              <button
                onClick={() => setChartMetricType('percentage')}
                className={`px-2 py-1 text-[11px] font-mono font-bold ${chartMetricType === 'percentage' ? 'bg-[#4ADE80] text-[#141517]' : 'text-[#8A8F99] hover:text-white'}`}
              >
                RATE %
              </button>
              <button
                onClick={() => setChartMetricType('counts')}
                className={`px-2 py-1 text-[11px] font-mono font-bold ${chartMetricType === 'counts' ? 'bg-[#4ADE80] text-[#141517]' : 'text-[#8A8F99] hover:text-white'}`}
              >
                HEADCOUNT
              </button>
            </div>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {chartMetricType === 'percentage' ? (
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="crtPhosphorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FFAE19" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#FFAE19" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 2" stroke="#252830" />
                <XAxis dataKey="date" stroke="#5A5F6B" tick={{ fill: '#A0A5AD', fontSize: 10, fontFamily: 'JetBrains Mono' }} />
                <YAxis domain={[0, 100]} stroke="#5A5F6B" unit="%" tick={{ fill: '#A0A5AD', fontSize: 10, fontFamily: 'JetBrains Mono' }} />
                <Tooltip content={<CRTTooltip />} />
                <Area
                  type="stepAfter" dataKey="rate" stroke="#FFAE19" strokeWidth={2.5} fillOpacity={1}
                  fill="url(#crtPhosphorGradient)" dot={{ r: 3, fill: '#FFAE19', stroke: '#0E0F12', strokeWidth: 2 }}
                />
              </AreaChart>
            ) : (
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 2" stroke="#252830" />
                <XAxis dataKey="date" stroke="#5A5F6B" tick={{ fill: '#A0A5AD', fontSize: 10, fontFamily: 'JetBrains Mono' }} />
                <YAxis stroke="#5A5F6B" tick={{ fill: '#A0A5AD', fontSize: 10, fontFamily: 'JetBrains Mono' }} />
                <Tooltip content={<CRTTooltip />} />
                <Legend wrapperStyle={{ paddingTop: '8px', fontSize: '11px', fontFamily: 'JetBrains Mono' }} />
                <Bar dataKey="present" name="Present Personnel" fill="#4ADE80" radius={[2, 2, 0, 0]} />
                <Bar dataKey="absent" name="Absent Personnel" fill="#D95D24" radius={[2, 2, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Active Work Table */}
      <div className="beige-chassis p-6 hard-shadow">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-[#1E1F22] pb-4 mb-5">
          <h2 className="text-xl font-black font-display text-[#1E1F22]">ACTIVE WORK &amp; DEADLINES</h2>
          <button
            onClick={onNavigateToTasks}
            className="mechanical-btn flex items-center gap-1.5 px-3 py-1.5 bg-[#E6E1D6] text-[#1E1F22] text-xs font-mono font-bold hover:bg-white self-start sm:self-auto"
          >
            <span>VIEW ALL TASKS</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono border-2 border-[#1E1F22]">
            <thead>
              <tr className="border-b-2 border-[#1E1F22] text-[#1E1F22] uppercase tracking-wider bg-[#E6E1D6]">
                <th className="py-2.5 px-3 border-r-2 border-[#1E1F22]">DIVISION</th>
                <th className="py-2.5 px-3 border-r-2 border-[#1E1F22]">DIRECTIVE &amp; SCOPE</th>
                <th className="py-2.5 px-3 border-r-2 border-[#1E1F22]">ASSIGNED CREW</th>
                <th className="py-2.5 px-3 border-r-2 border-[#1E1F22]">DEADLINE / COUNTDOWN</th>
                <th className="py-2.5 px-3">STATUS &amp; RBAC CONTROL</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-[#1E1F22] bg-[#F2EFE9]">
              {sortedTasks.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 px-4 text-center text-[#525760] font-mono text-xs">
                    NO WORK DIRECTIVES ACTIVE // TASK QUEUE IS EMPTY
                  </td>
                </tr>
              ) : (
                sortedTasks.slice(0, 6).map((task) => {
                  const domMeta = DOMAINS[task.domain] || DOMAINS.Robotics;
                  const urgency = getUrgencyInfo(task.deadline, task.status);
                  const assigned = members.filter((m) => task.assignedMemberIds.includes(m.id));
                  const canModify = isAdmin || task.assignedMemberIds.includes(currentOperator.id);

                  return (
                    <tr key={task.id} className="hover:bg-white transition-colors">
                      <td className="py-3 px-3 align-top border-r-2 border-[#1E1F22] whitespace-nowrap">
                        <span className={`px-2 py-0.5 text-[10px] font-mono font-bold ${domMeta.badgeClass}`}>{domMeta.code}</span>
                      </td>
                      <td className="py-3 px-3 align-top border-r-2 border-[#1E1F22] max-w-sm">
                        <div className="font-display font-black text-[#1E1F22] text-sm">
                          {task.task_code && <span className="text-[#D95D24] mr-1.5">[{task.task_code}]</span>}
                          {task.title}
                        </div>
                        <div className="text-[#525760] text-xs font-mono line-clamp-2 mt-1">{task.description}</div>
                      </td>
                      <td className="py-3 px-3 align-top border-r-2 border-[#1E1F22]">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {assigned.length === 0 ? (
                            <span className="text-[10px] font-mono text-[#8A8F99]">UNASSIGNED</span>
                          ) : (
                            assigned.map((m) => (
                              <span
                                key={m.id}
                                className={`px-1.5 py-0.5 text-[10px] font-mono font-bold border border-[#1E1F22] ${
                                  m.id === currentOperator.id ? 'bg-[#D95D24] text-white' : 'bg-[#E6E1D6] text-[#1E1F22]'
                                }`}
                              >
                                {m.callsign ? m.callsign.split('//')[1]?.trim() : m.full_name.split(' ')[0]}
                              </span>
                            ))
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3 align-top border-r-2 border-[#1E1F22] whitespace-nowrap">
                        <div className="font-bold text-[#1E1F22]">{formatDateTime(task.deadline)}</div>
                        <div className="mt-1">
                          {urgency.level === 'overdue' ? (
                            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 border border-[#1E1F22] hazard-stripes text-white font-black text-[10px]">
                              <span>OVERDUE // {urgency.diffText}</span>
                            </div>
                          ) : (
                            <span className={`inline-flex items-center gap-1 px-1.5 py-0.2 text-[10px] font-mono font-bold border border-[#1E1F22] ${
                              urgency.isUrgent ? 'bg-[#D95D24] text-white' : 'bg-[#E6E1D6] text-[#1E1F22]'
                            }`}>
                              {urgency.label} ({urgency.diffText || 'NOMINAL'})
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3 align-top whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <select
                            disabled={!canModify} value={task.status}
                            onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                            className={`text-xs font-mono font-bold px-2 py-1 border-2 border-[#1E1F22] focus:outline-none ${
                              !canModify ? 'opacity-60 cursor-not-allowed bg-[#E6E1D6]' : 'bg-[#F2EFE9]'
                            } ${
                              task.status === 'Completed' ? 'text-[#3A6B5C]' : task.status === 'In Progress' ? 'text-[#D95D24]' : 'text-[#E29526]'
                            }`}
                          >
                            <option value="Pending">Pending</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                          </select>
                          {!canModify && <span className="text-[9px] font-mono text-[#6E737D]">[RLS LOCK]</span>}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
