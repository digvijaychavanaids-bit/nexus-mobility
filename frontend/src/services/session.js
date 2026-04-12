
const ROLE_ALIASES= {
  Admin: 'Admin',
  Analyst: 'Analyst',
  User: 'User',
  Public: 'User',
  'Lead Analyst': 'Analyst',
  'Traffic Flow Engineer': 'Analyst',
  'City Planning Division': 'User',
  'System Administrator': 'Admin',
};

export const normalizeRole = (role) => {
  if (!role) return 'User';
  return ROLE_ALIASES[role] ?? 'User';
};

const isLocal = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ?? 
  (isLocal ? 'http://127.0.0.1:8001/api' : 'https://nexus-mobility-backend.onrender.com/api');

export const getToken = () => sessionStorage.getItem('nexus_token') || localStorage.getItem('nexus_token');

export const getCurrentRole = () => {
  const role = sessionStorage.getItem('role') || localStorage.getItem('role');
  const normalized = normalizeRole(role);
  // Ensure we sync it to session for this tab's isolation
  if (role && !sessionStorage.getItem('role')) {
    sessionStorage.setItem('role', normalized);
  }
  return normalized;
};

export const getCurrentUserId = () => sessionStorage.getItem('user_id') || localStorage.getItem('user_id') || 'guest';
export const getCurrentUserName = () => sessionStorage.getItem('name') || localStorage.getItem('name') || 'System User';
export const getCurrentUserEmail = () => sessionStorage.getItem('email') || localStorage.getItem('email') || '';

export const logout = () => {
  sessionStorage.removeItem('nexus_token');
  sessionStorage.removeItem('role');
  sessionStorage.removeItem('user_id');
  sessionStorage.removeItem('name');
  sessionStorage.removeItem('email');
  
  localStorage.removeItem('nexus_token');
  localStorage.removeItem('role');
  localStorage.removeItem('user_id');
  localStorage.removeItem('name');
};

export const setSession = (payload) => {
  // Save to sessionStorage for CURRENT tab isolation
  sessionStorage.setItem('nexus_token', payload.access_token);
  sessionStorage.setItem('role', normalizeRole(payload.role));
  if (payload.user_id) sessionStorage.setItem('user_id', payload.user_id);
  if (payload.name) sessionStorage.setItem('name', payload.name);
  if ((payload).email) sessionStorage.setItem('email', (payload).email);

  // Save to localStorage so NEW tabs can inherit this login
  localStorage.setItem('nexus_token', payload.access_token);
  localStorage.setItem('role', normalizeRole(payload.role));
  if (payload.user_id) localStorage.setItem('user_id', payload.user_id);
  if (payload.name) localStorage.setItem('name', payload.name);
  if ((payload).email) localStorage.setItem('email', (payload).email);
};

export const getDefaultRouteForRole = (_role) => {
  return '/dashboard';
};

export const hasRoleAccess = (role, allowedRoles) => {
  if (!allowedRoles || allowedRoles.length === 0) return true;
  return allowedRoles.includes(role);
};






