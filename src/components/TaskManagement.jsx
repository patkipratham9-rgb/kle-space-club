import { useState } from 'react';
import { Plus, Clock, Search, Trash2, Edit3, X } from 'lucide-react';
import { useApp } from '../context/useApp';
import { DOMAINS } from '../data/mockData';
import { getUrgencyInfo, formatDateTime } from '../utils/helpers';
import { AddTaskModal } from './AddTaskModal';

export const TaskManagement = ({ isCreateModalOpen, setIsCreateModalOpen }) => {
  const { tasks, members, updateTask, updateTaskStatus, deleteTask, isAdmin, currentOperator } = useApp();
  const [domainFilter, setDomainFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingTask, setEditingTask] = useState(null);

  const handleUpdateTaskSubmit = (e) => {
    e.preventDefault();
    if (!editingTask) return;
    updateTask(editingTask.id, {
      title: editingTask.title,
      description: editingTask.description,
      domain: editingTask.domain,
      assignedMemberIds: editingTask.assignedMemberIds,
      deadline: editingTask.deadline,
      priority: editingTask.priority,
      status: editingTask.status
    });
    setEditingTask(null);
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesDomain = domainFilter === 'All' || task?.domain === domainFilter;
    const matchesStatus = statusFilter === 'All' || task?.status === statusFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch = (task?.title || '').toLowerCase().includes(q) ||
      (task?.description || '').toLowerCase().includes(q) ||
      (task?.task_code || '').toLowerCase().includes(q);
    return matchesDomain && matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="beige-chassis p-6 hard-shadow">
        <div className="flex items-center justify-between text-[10px] font-mono text-[#6E737D] border-b-2 border-[#1E1F22] pb-3 mb-5">
          <span>Assign Work</span>
          <div className="flex items-center gap-3">
            <div className="barcode-strip w-20 hidden sm:block" />
            <span className="font-bold text-[#1E1F22]">SYS-03 // WORK</span>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-2xl font-black font-display text-[#1E1F22] tracking-wide">WORK</h1>
          {isAdmin && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="mechanical-btn flex items-center gap-2 px-4 py-2.5 bg-[#D95D24] text-white text-xs font-mono font-bold hover:bg-[#BF4D1A] shrink-0 self-start md:self-center"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>ISSUE WORK</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and View Controls */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-[#E6E1D6] border-2 border-[#1E1F22] hard-shadow-sm">
          <button
            onClick={() => setDomainFilter('All')}
            className={`px-3 py-1.5 text-xs font-mono font-bold border-2 border-[#1E1F22] transition-all ${
              domainFilter === 'All' ? 'bg-[#1E1F22] text-white hard-shadow-sm' : 'bg-[#F2EFE9] text-[#1E1F22] hover:bg-white'
            }`}
          >
            ALL DIVISIONS ({tasks.length})
          </button>
          {Object.values(DOMAINS).map((dom) => (
            <button
              key={dom.id} onClick={() => setDomainFilter(dom.name)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold border-2 border-[#1E1F22] transition-all ${
                domainFilter === dom.name ? `${dom.badgeClass} hard-shadow-sm` : 'bg-[#F2EFE9] text-[#1E1F22] hover:bg-white'
              }`}
            >
              <span>{dom.name.toUpperCase()} ({tasks.filter((t) => t.domain === dom.name).length})</span>
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#6E737D]" />
            <input
              type="text" placeholder="Search directives..." value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-[#F2EFE9] border-2 border-[#1E1F22] text-xs font-mono text-[#1E1F22] placeholder:text-[#8A8F99] focus:outline-none focus:bg-white"
            />
          </div>

          <div className="flex items-center bg-[#E6E1D6] p-1 border-2 border-[#1E1F22]">
            {['All', 'Pending', 'In Progress', 'Completed'].map((st) => (
              <button
                key={st} onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 text-xs font-mono font-bold transition-all ${
                  statusFilter === st ? 'bg-[#1E1F22] text-[#FFAE19]' : 'text-[#525760] hover:text-[#1E1F22]'
                }`}
              >
                {st.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Task Grid Cards */}
      {filteredTasks.length === 0 ? (
        <div className="beige-chassis p-12 text-center border-2 border-[#1E1F22] hard-shadow-sm font-mono text-xs text-[#525760]">
          <div className="font-bold text-sm text-[#1E1F22]">NO WORK ASSIGNMENT</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTasks.map((task) => {
            const domMeta = DOMAINS[task.domain] || DOMAINS.Robotics;
            const urgency = getUrgencyInfo(task.deadline, task.status);
            const assigned = members.filter((m) => (task.assignedMemberIds || []).includes(m.id));
            const isAssigned = (task.assignedMemberIds || []).includes(currentOperator.id);
            const canModify = isAdmin || isAssigned;

            return (
              <div key={task.id} className="beige-chassis p-5 hard-shadow-sm border-2 border-[#1E1F22] flex flex-col justify-between relative overflow-hidden">
                {urgency.level === 'overdue' && <div className="absolute top-0 right-0 left-0 h-1.5 hazard-stripes" />}
                <div>
                  <div className="flex items-center justify-between gap-2 border-b-2 border-[#1E1F22] pb-2.5 mb-3">
                    <span className={`px-2 py-0.5 text-[10px] font-mono font-bold ${domMeta.badgeClass}`}>
                      {domMeta.code} // {task.domain.toUpperCase()}
                    </span>
                    {urgency.level === 'overdue' ? (
                      <span className="px-2 py-0.5 bg-[#D95D24] text-white font-mono font-black text-[9px] border border-[#1E1F22] animate-pulse">
                        OVERDUE // {urgency.diffText}
                      </span>
                    ) : (
                      <span className={`px-2 py-0.5 text-[9px] font-mono font-bold border border-[#1E1F22] ${urgency.isUrgent ? 'bg-[#E29526] text-[#1E1F22]' : 'bg-[#E6E1D6] text-[#1E1F22]'}`}>
                        {urgency.label}
                      </span>
                    )}
                  </div>

                  <h3 className="font-display font-black text-[#1E1F22] text-sm leading-snug mb-1">
                    {task.task_code && <span className="text-[#D95D24] mr-1.5">[{task.task_code}]</span>}
                    {task.title}
                  </h3>
                  <p className="text-xs font-mono text-[#525760] leading-relaxed mb-4 line-clamp-3">{task.description}</p>
                </div>

                <div>
                  <div className="mb-3 pt-3 border-t-2 border-[#1E1F22]">
                    <span className="text-[10px] font-mono text-[#6E737D] uppercase font-bold block mb-1">
                      ASSIGNED CREW ({assigned.length}):
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {assigned.length > 0 ? (
                        assigned.map((m) => (
                          <span
                            key={m.id}
                            className={`px-1.5 py-0.5 text-[10px] font-mono font-bold border border-[#1E1F22] ${m.id === currentOperator.id ? 'bg-[#D95D24] text-white' : 'bg-[#E6E1D6] text-[#1E1F22]'}`}
                          >
                            {m.full_name}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs font-mono text-[#6E737D] italic">Unassigned</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs font-mono text-[#1E1F22] py-1.5 px-2 bg-[#E6E1D6] border-2 border-[#1E1F22] mb-3">
                    <div className="flex items-center gap-1 font-bold">
                      <Clock className="w-3.5 h-3.5 text-[#D95D24]" />
                      <span>{formatDateTime(task.deadline)}</span>
                    </div>
                    {urgency.diffText && (
                      <span className={`text-[10px] font-bold ${urgency.isUrgent ? 'text-[#D95D24]' : 'text-[#525760]'}`}>
                        {urgency.diffText}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2 border-t-2 border-[#1E1F22]">
                    <div className="flex items-center gap-1">
                      {['Pending', 'In Progress', 'Completed'].map((st) => (
                        <button
                          key={st} disabled={!canModify} onClick={() => updateTaskStatus(task.id, st)}
                          className={`text-[9px] font-mono font-bold px-2 py-1 border transition-all ${
                            task.status === st
                              ? st === 'Completed' ? 'bg-[#3A6B5C] text-white border-[#1E1F22]' : st === 'In Progress' ? 'bg-[#D95D24] text-white border-[#1E1F22]' : 'bg-[#E29526] text-[#1E1F22] border-[#1E1F22]'
                              : 'bg-[#E6E1D6] text-[#525760] border-transparent hover:border-[#1E1F22]'
                          } ${!canModify ? 'opacity-60 cursor-not-allowed' : ''}`}
                        >
                          {st.toUpperCase()}
                        </button>
                      ))}
                    </div>

                    {isAdmin && (
                      <div className="flex items-center gap-1">
                        <button onClick={() => setEditingTask(task)} className="p-1 hover:bg-[#E6E1D6] border border-[#1E1F22] text-[#1E1F22]" title="Edit Directive">
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => deleteTask(task.id)} className="p-1 hover:bg-[#D95D24] hover:text-white border border-[#1E1F22] text-[#D95D24]" title="Purge Directive">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <AddTaskModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />

      {/* Edit Task Modal */}
      {editingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="beige-chassis w-full max-w-xl p-6 hard-shadow-lg relative border-2 border-[#1E1F22] max-h-[90vh] overflow-y-auto">
            <button onClick={() => setEditingTask(null)} className="absolute top-5 right-5 p-1 border border-[#1E1F22] hover:bg-[#E6E1D6]">
              <X className="w-4 h-4" />
            </button>
            <h2 className="text-lg font-black font-display text-[#1E1F22] mb-1">REVISE DIRECTIVE // {editingTask.title}</h2>
            <p className="text-xs font-mono text-[#525760] mb-5">Update task assignments, deadline, priority, or execution status.</p>

            <form onSubmit={handleUpdateTaskSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-bold text-[#1E1F22] mb-1">TITLE</label>
                <input
                  type="text" required value={editingTask.title}
                  onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                  className="w-full bg-[#E6E1D6] border-2 border-[#1E1F22] px-3 py-2 text-xs font-mono text-[#1E1F22] focus:outline-none focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-[#1E1F22] mb-1">TECHNICAL SCOPE</label>
                <textarea
                  rows={3} value={editingTask.description}
                  onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                  className="w-full bg-[#E6E1D6] border-2 border-[#1E1F22] px-3 py-2 text-xs font-mono text-[#1E1F22] focus:outline-none focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono font-bold text-[#1E1F22] mb-1">DEADLINE (MET)</label>
                  <input
                    type="datetime-local" value={editingTask.deadline}
                    onChange={(e) => setEditingTask({ ...editingTask, deadline: e.target.value })}
                    className="w-full bg-[#E6E1D6] border-2 border-[#1E1F22] px-3 py-2 text-xs font-mono text-[#1E1F22] focus:outline-none focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono font-bold text-[#1E1F22] mb-1">STATUS</label>
                  <select
                    value={editingTask.status} onChange={(e) => setEditingTask({ ...editingTask, status: e.target.value })}
                    className="w-full bg-[#E6E1D6] border-2 border-[#1E1F22] px-3 py-2 text-xs font-mono font-bold text-[#1E1F22] focus:outline-none"
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t-2 border-[#1E1F22]">
                <button type="button" onClick={() => setEditingTask(null)} className="mechanical-btn px-4 py-2 text-xs font-mono font-bold bg-[#E6E1D6] text-[#1E1F22]">
                  CANCEL
                </button>
                <button type="submit" className="mechanical-btn px-5 py-2 text-xs font-mono font-bold bg-[#D95D24] text-white">
                  SAVE DIRECTIVE
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
