// Client-side API Service for MongoDB Backend with Cryptographic Token Support
const API_BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api';

const TOKEN_KEY = 'spaceclub_session_token';

export const getStoredToken = () => {
  try {
    return sessionStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

export const setStoredToken = (token) => {
  try {
    if (token) {
      sessionStorage.setItem(TOKEN_KEY, token);
    } else {
      sessionStorage.removeItem(TOKEN_KEY);
    }
  } catch {
    // SessionStorage fallback
  }
};

const req = async (path, method = 'GET', body) => {
  const token = getStoredToken();
  const headers = {};
  if (body) headers['Content-Type'] = 'application/json';
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const errorObj = new Error(err.error || `Request failed: ${res.statusText}`);
    errorObj.status = res.status;
    errorObj.retryAfter = err.retryAfter;
    errorObj.lockedUntil = err.lockedUntil;
    errorObj.lockoutMultiplier = err.lockoutMultiplier;
    throw errorObj;
  }
  return res.json();
};

export const api = {
  getStatus: () => req('/status'),
  getMembers: () => req('/members'),
  addMember: (m) => req('/members', 'POST', m),
  updateMember: (id, updates) => req(`/members/${id}`, 'PUT', updates),
  removeMemberFromDomain: (id, domain) => req(`/members/${id}/domain/${encodeURIComponent(domain)}`, 'DELETE'),
  deleteMember: (id) => req(`/members/${id}`, 'DELETE'),
  getAttendance: () => req('/attendance'),
  commitAttendance: (date, records) => req('/attendance/commit', 'POST', { date, records }),
  getTasks: () => req('/tasks'),
  addTask: (t) => req('/tasks', 'POST', t),
  updateTask: (id, updates) => req(`/tasks/${id}`, 'PUT', updates),
  updateTaskStatus: (id, status) => req(`/tasks/${id}/status`, 'PATCH', { status }),
  deleteTask: (id) => req(`/tasks/${id}`, 'DELETE'),
  getAuthConfig: () => req('/auth/config'),
  verifySession: () => req('/auth/verify'),
  login: (username, password) => req('/auth/login', 'POST', { username, password }),
  changePassword: (currentPassword, newPassword) => req('/auth/change-password', 'POST', { currentPassword, newPassword }),
  resetDatabase: () => req('/reset', 'POST')
};
