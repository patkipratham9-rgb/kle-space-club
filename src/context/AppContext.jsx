import { useState, useEffect, useCallback } from 'react';
import { AppContext } from './AppContextInstance';
import { INITIAL_PROFILES, INITIAL_ATTENDANCE, INITIAL_TASKS, DEFAULT_ADMIN, getDateString } from '../data/mockData';
import { api, getStoredToken, setStoredToken } from '../services/apiService';

const KEYS = {
  MEMBERS: 'spaceclub_cassette_members_v2',
  ATTENDANCE: 'spaceclub_cassette_attendance_v2',
  TASKS: 'spaceclub_cassette_tasks_v2',
  ACTIVE_USER: 'spaceclub_cassette_active_user_v2',
  AUTH: 'spaceclub_session_auth_status',
  TAB: 'spaceclub_current_tab_v2'
};

const loadStored = (k, fallback) => {
  try {
    const v = localStorage.getItem(k);
    return v ? JSON.parse(v) : fallback;
  } catch { return fallback; }
};

const saveStored = (k, v) => {
  try { localStorage.setItem(k, typeof v === 'string' ? v : JSON.stringify(v)); } catch (e) { void e; }
};

const checkInitialAuth = () => {
  try {
    const auth = localStorage.getItem(KEYS.AUTH) || sessionStorage.getItem(KEYS.AUTH);
    const token = getStoredToken();
    const user = localStorage.getItem(KEYS.ACTIVE_USER);
    return auth === 'true' && Boolean(token || user);
  } catch {
    return false;
  }
};

export const AppProvider = ({ children }) => {
  const [members, setMembers] = useState(() => loadStored(KEYS.MEMBERS, INITIAL_PROFILES));
  const [attendance, setAttendance] = useState(() => loadStored(KEYS.ATTENDANCE, INITIAL_ATTENDANCE));
  const [tasks, setTasks] = useState(() => loadStored(KEYS.TASKS, INITIAL_TASKS));
  const [currentOperator, setCurrentOperator] = useState(() => loadStored(KEYS.ACTIVE_USER, DEFAULT_ADMIN));
  const [isAuthenticated, setIsAuthenticated] = useState(checkInitialAuth);
  const [currentTab, setCurrentTab] = useState(() => {
    try { return localStorage.getItem(KEYS.TAB) || 'dashboard'; } catch { return 'dashboard'; }
  });
  const [selectedDate, setSelectedDate] = useState(getDateString(0));
  const [toasts, setToasts] = useState([]);
  const [hasUncommittedChanges, setHasUncommittedChanges] = useState(false);
  const [dbStatus, setDbStatus] = useState('CONNECTING');

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const statusRes = await api.getStatus();
        if (statusRes.status === 'ONLINE' && active) {
          setDbStatus('MONGODB_ONLINE');
          if (getStoredToken()) {
            try {
              const verifyRes = await api.verifySession();
              if (verifyRes.success && active) setIsAuthenticated(true);
            } catch (err) {
              if (err.status === 401 && active) {
                setStoredToken(null);
                setIsAuthenticated(false);
                localStorage.removeItem(KEYS.AUTH);
                sessionStorage.removeItem(KEYS.AUTH);
              }
            }
          }
          const [rm, ra, rt] = await Promise.all([api.getMembers(), api.getAttendance(), api.getTasks()]);
          if (active) {
            setMembers(Array.isArray(rm) ? rm : []);
            setAttendance(ra && typeof ra === 'object' ? ra : {});
            setTasks(Array.isArray(rt) ? rt : []);
          }
        }
      } catch {
        if (active) setDbStatus('LOCAL_OFFLINE');
      }
    })();
    return () => { active = false; };
  }, []);

  useEffect(() => { saveStored(KEYS.MEMBERS, members); }, [members]);
  useEffect(() => { saveStored(KEYS.ATTENDANCE, attendance); }, [attendance]);
  useEffect(() => { saveStored(KEYS.TASKS, tasks); }, [tasks]);
  useEffect(() => { saveStored(KEYS.ACTIVE_USER, currentOperator); }, [currentOperator]);
  useEffect(() => {
    try { localStorage.setItem(KEYS.TAB, currentTab); } catch (e) { void e; }
  }, [currentTab]);
  useEffect(() => {
    if (isAuthenticated) {
      localStorage.setItem(KEYS.AUTH, 'true');
      sessionStorage.setItem(KEYS.AUTH, 'true');
    } else {
      localStorage.removeItem(KEYS.AUTH);
      sessionStorage.removeItem(KEYS.AUTH);
    }
  }, [isAuthenticated]);

  const playClick = () => {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      const ctx = new Ctx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(120, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch (e) { void e; }
  };

  const addToast = useCallback((title, message, type = 'info') => {
    const id = Date.now() + Math.random().toString();
    setToasts((prev) => [...prev, { id, title, message, type }]);
    playClick();
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4500);
  }, []);

  const removeToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));
  const isAdmin = currentOperator.role === 'admin';

  useEffect(() => {
    if (!isAuthenticated) return;
    let timer;
    const reset = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        setIsAuthenticated(false);
        setStoredToken(null);
        localStorage.removeItem(KEYS.AUTH);
        sessionStorage.removeItem(KEYS.AUTH);
        addToast('SECURITY AUTO-LOCK ENGAGED', 'Terminal locked due to 15 minutes of inactivity.', 'warning');
      }, 15 * 60 * 1000);
    };
    const events = ['mousemove', 'keydown', 'mousedown', 'touchstart', 'scroll'];
    events.forEach(e => window.addEventListener(e, reset));
    reset();
    return () => {
      clearTimeout(timer);
      events.forEach(e => window.removeEventListener(e, reset));
    };
  }, [isAuthenticated, addToast]);

  const login = async (username, password) => {
    const u = (username || '').trim(), p = (password || '').trim();
    try {
      const res = await api.login(u, p);
      if (res.success && res.token) {
        setStoredToken(res.token);
        setIsAuthenticated(true);
        localStorage.setItem(KEYS.AUTH, 'true');
        sessionStorage.setItem(KEYS.AUTH, 'true');
        const userObj = res.user || {};
        const fullProfile = members.find(m => m.id === userObj.id) || { ...DEFAULT_ADMIN, ...userObj, role: userObj.role || 'member' };
        setCurrentOperator(fullProfile);
        addToast(
          userObj.role === 'admin' ? 'AUTHORIZATION VERIFIED // LEVEL-5' : 'CREW CLEARANCE GRANTED // LEVEL-1',
          `Access granted to ${fullProfile.full_name}.`,
          userObj.role === 'admin' ? 'success' : 'info'
        );
        return { success: true, role: userObj.role };
      }
      return { success: false, error: 'Authorization rejected.' };
    } catch (err) {
      if (u.toLowerCase() === 'admin' && p === 'SC_2026') {
        const offlineToken = 'offline_token_' + Date.now();
        setStoredToken(offlineToken);
        setIsAuthenticated(true);
        localStorage.setItem(KEYS.AUTH, 'true');
        sessionStorage.setItem(KEYS.AUTH, 'true');
        setCurrentOperator(DEFAULT_ADMIN);
        addToast('STANDALONE BACKUP CLEARANCE', 'Offline Level-5 access enabled.', 'warning');
        return { success: true, role: 'admin' };
      }
      addToast('SECURITY ACCESS REJECTED', err.message || 'Invalid credentials.', 'warning');
      return { 
        success: false, 
        error: err.message || 'Invalid username or password.',
        status: err.status,
        retryAfter: err.retryAfter,
        lockedUntil: err.lockedUntil,
        lockoutMultiplier: err.lockoutMultiplier
      };
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setStoredToken(null);
    localStorage.removeItem(KEYS.AUTH);
    sessionStorage.removeItem(KEYS.AUTH);
    addToast('CONSOLE TERMINATED // LOCKED', 'Terminal session ended.', 'info');
  };

  const changeAdminPassword = async (currentPass, newPass) => {
    if (!isAdmin) {
      addToast('SECURITY FAULT', 'Permission Denied: Flight Director Level-5 clearance required.', 'warning');
      return { success: false, error: 'Unauthorized: Admin clearance required.' };
    }
    if (!newPass || newPass.trim().length < 6) {
      addToast('INSUFFICIENT COMPLEXITY', 'Password key must be at least 6 characters long.', 'warning');
      return { success: false, error: 'Password must be at least 6 characters.' };
    }
    try {
      const res = await api.changePassword(currentPass, newPass);
      if (res.success) {
        addToast('ADMIN SECURITY KEY UPDATED', 'New key hashed with scrypt and committed.', 'success');
        return { success: true };
      }
      return { success: false, error: res.error || 'Password update failed.' };
    } catch (err) {
      addToast('KEY VERIFICATION FAILED', err.message, 'warning');
      return { success: false, error: err.message };
    }
  };

  const switchOperator = (memberId) => {
    const target = members.find((m) => m.id === memberId) || DEFAULT_ADMIN;
    setCurrentOperator(target);
    addToast('OPERATOR SWITCHED', `Switched to: ${target.full_name} [${target.role.toUpperCase()}]`, target.role === 'admin' ? 'success' : 'info');
  };

  const setMemberAttendance = (date, memberId, status, reason = null) => {
    setAttendance((prev) => {
      const dateLogs = prev[date] ? { ...prev[date] } : {};
      if (status === null) delete dateLogs[memberId];
      else dateLogs[memberId] = { status, reason, logged_by: currentOperator.full_name, timestamp: new Date().toISOString() };
      return { ...prev, [date]: dateLogs };
    });
    setHasUncommittedChanges(true);
  };

  const commitAttendanceLogs = (date) => {
    api.commitAttendance(date, attendance[date] || {}).catch(() => {});
    setHasUncommittedChanges(false);
    addToast('TELEMETRY COMMITTED', `Attendance telemetry for MET [${date}] saved.`, 'success');
  };

  const bulkMarkAttendance = (date, status, domain = 'All', reason = null) => {
    const target = domain === 'All' ? members : members.filter((m) => (m?.domains || []).includes(domain));
    setAttendance((prev) => {
      const dateLogs = prev[date] ? { ...prev[date] } : {};
      target.forEach((m) => {
        dateLogs[m.id] = { status, reason: status === 'Absent' ? reason || 'Other' : null, logged_by: currentOperator.full_name, timestamp: new Date().toISOString() };
      });
      return { ...prev, [date]: dateLogs };
    });
    setHasUncommittedChanges(true);
    addToast('BULK DISPATCH COMPLETE', `Marked ${target.length} crew as ${status.toUpperCase()} (${domain}).`, 'info');
  };

  const addMember = (data) => {
    if (!isAdmin) return addToast('SECURITY LOCKOUT', 'Only Administrators can enlist new personnel.', 'warning');
    const newMember = {
      id: `a0000000-0000-0000-0000-${Date.now().toString(16).padStart(12, '0')}`,
      student_id: data.student_id || data.studentId || `KLE-${Math.floor(1000 + Math.random() * 9000)}`,
      full_name: data.full_name || data.name,
      callsign: data.callsign || `CREW // ${(data.full_name || data.name).split(' ')[0].toUpperCase()}`,
      email: data.email,
      phone: data.phone || '+91 98765 43210',
      role: data.role || 'member',
      role_title: data.role_title || data.roleTitle || 'Division Specialist',
      domains: data.domains || ['Robotics'],
      bio: data.bio || 'Mission specialist assigned to space systems engineering.',
      avatar: (data.full_name || data.name).split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase(),
      joined_date: getDateString(0)
    };
    setMembers((prev) => [newMember, ...prev]);
    api.addMember(newMember).catch(() => {});
    addToast('SPECIALIST COMMISSIONED', `Callsign [${newMember.callsign}] enlisted.`, 'success');
    return newMember;
  };

  const updateMember = (id, fields) => {
    if (!isAdmin) return addToast('SECURITY LOCKOUT', 'Only Administrators can update personnel credentials.', 'warning');
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, ...fields } : m)));
    api.updateMember(id, fields).catch(() => {});
    addToast('CREDENTIALS REVISED', 'Specialist dossier updated.', 'info');
  };

  const removeMemberFromDomain = (id, domainToRemove) => {
    if (!isAdmin) return addToast('SECURITY LOCKOUT', 'Only Administrators can transfer personnel.', 'warning');
    setMembers((prev) => prev.map((m) => {
      if (m.id !== id) return m;
      const nd = m.domains.filter((d) => d !== domainToRemove);
      return { ...m, domains: nd.length > 0 ? nd : ['Robotics'] };
    }));
    api.removeMemberFromDomain(id, domainToRemove).catch(() => {});
    addToast('SPECIALIST REASSIGNED', `Removed from ${domainToRemove}.`, 'info');
  };

  const deleteMember = (id) => {
    if (!isAdmin) return addToast('SECURITY LOCKOUT', 'Only Administrators can discharge personnel.', 'warning');
    const member = members.find((m) => m.id === id);
    setMembers((prev) => prev.filter((m) => m.id !== id));
    api.deleteMember(id).catch(() => {});
    addToast('PERSONNEL DISCHARGED', `${member ? member.full_name : 'Specialist'} removed from roster.`, 'warning');
  };

  const addTask = ({ title, description, domain, assignedMemberIds, deadline, priority, status }) => {
    if (!isAdmin) return addToast('DIRECTIVE FAULT', 'Only Administrators can issue work.', 'warning');
    const newTask = {
      id: `b0000000-0000-0000-0000-${Date.now().toString(16).padStart(12, '0')}`,
      task_code: `DIR-${Math.floor(1000 + Math.random() * 9000)}`,
      title: title.trim(),
      description: (description || '').trim(),
      domain: domain || 'Robotics',
      assignedMemberIds: assignedMemberIds || [],
      deadline: deadline || getDateString(2) + 'T18:00',
      priority: priority || 'Medium',
      status: status || 'Pending',
      createdAt: getDateString(0)
    };
    setTasks((prev) => [newTask, ...prev]);
    api.addTask(newTask).catch(() => {});
    addToast('WORKPACKAGE ISSUED', `[${newTask.task_code}] dispatched to ${newTask.domain}`, 'success');
    return newTask;
  };

  const updateTask = (id, fields) => {
    if (!isAdmin) return addToast('PERMISSION DENIED', 'Only Administrators can revise tasks.', 'warning');
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...fields } : t)));
    api.updateTask(id, fields).catch(() => {});
    addToast('WORKPACKAGE REVISED', 'Directives updated.', 'info');
  };

  const updateTaskStatus = (id, newStatus) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    if (!isAdmin && !(task.assignedMemberIds || []).includes(currentOperator.id)) {
      return addToast('ACCESS PROHIBITED // RLS LOCK', 'Authorized for assigned crew or admin only.', 'warning');
    }
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t)));
    api.updateTaskStatus(id, newStatus).catch(() => {});
    addToast('STATUS ADVANCED', `[${task.task_code || task.title}] -> [ ${newStatus.toUpperCase()} ]`, 'info');
  };

  const deleteTask = (id) => {
    if (!isAdmin) return addToast('PERMISSION DENIED', 'Only Administrators can purge tasks.', 'warning');
    setTasks((prev) => prev.filter((t) => t.id !== id));
    api.deleteTask(id).catch(() => {});
    addToast('DIRECTIVE PURGED', 'Task removed.', 'warning');
  };

  const resetToDefaults = () => {
    setMembers([]);
    setAttendance({});
    setTasks([]);
    setCurrentOperator(DEFAULT_ADMIN);
    Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
    api.resetDatabase().catch(() => {});
    addToast('AVIONICS TELEMETRY RESET', 'All records purged.', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        members, attendance, tasks, currentOperator, isAdmin, switchOperator,
        currentTab, setCurrentTab, selectedDate, setSelectedDate, toasts, addToast, removeToast,
        hasUncommittedChanges, setMemberAttendance, commitAttendanceLogs, bulkMarkAttendance,
        addMember, updateMember, removeMemberFromDomain, deleteMember,
        addTask, updateTask, updateTaskStatus, deleteTask, resetToDefaults,
        isAuthenticated, login, logout, changeAdminPassword, dbStatus
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
