import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';

const PersonnelRow = ({ id, name, email, role, status, lastLogin, initial, color, onUpdate, onDelete }) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <tr className="hover:bg-surface-container-high/30 transition-colors group font-body relative">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3 min-w-[160px]">
          <div className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center font-black text-[11px] shadow-sm ${color}`}>
            {initial}
          </div>
          <span className="text-sm font-black text-on-surface uppercase tracking-tight">{name}</span>
        </div>
      </td>
      <td className="px-6 py-4 text-xs text-on-surface font-bold lowercase tracking-tight min-w-[200px]">{email}</td>
      <td className="px-6 py-4">
        <select 
          value={role}
          onChange={(e) => onUpdate(id, { role: e.target.value })}
          className="bg-transparent text-[10px] font-black uppercase tracking-widest text-primary border border-on-surface/5 rounded-md px-2 py-1 outline-none hover:border-primary/50 transition-colors focus:ring-1 focus:ring-primary cursor-pointer"
        >
          <option value="Admin">Admin</option>
          <option value="Analyst">Analyst</option>
          <option value="User">User</option>
        </select>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${status === 'Active' ? 'bg-tertiary animate-pulse shadow-[0_0_8px_rgba(112,216,200,0.5)]' : 'bg-slate-600'}`}></div>
          <span className={`text-[10px] font-black uppercase tracking-widest ${status === 'Active' ? 'text-tertiary' : 'text-on-surface'}`}>{status}</span>
        </div>
      </td>
      <td className="px-6 py-4 text-[10px] font-black text-on-surface uppercase tracking-widest">{lastLogin}</td>
      <td className="px-6 py-4 text-right">
        <div className="relative inline-block text-left">
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-on-surface hover:text-on-surface"
          >
            <span className="material-symbols-outlined text-lg leading-none">more_vert</span>
          </button>
          
          {showMenu && (
            <div className="absolute right-0 mt-2 w-32 rounded-lg bg-surface-container border border-on-surface/10 shadow-2xl z-50 overflow-hidden">
              <button 
                onClick={() => { onDelete(id); setShowMenu(false); }}
                className="w-full text-left px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-error hover:bg-error/5 transition-colors flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">person_remove</span>
                Revoke Access
              </button>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
};

const AddUserModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'User' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // Using register endpoint as a proxy for user creation
      await api.post('/auth/register', { 
        name: formData.name, 
        email: formData.email, 
        password: formData.password, 
        role: formData.role 
      });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create user node.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-surface-container-lowest/80 backdrop-blur-md">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-surface-container border border-on-surface/10 rounded-3xl p-8 w-full max-w-md shadow-3xl">
        <h3 className="text-xl font-black text-on-surface uppercase tracking-tighter mb-6">Initialize New Personnel</h3>
        <form onSubmit={handleSubmit} className="space-y-4 font-body">
          <input 
            type="text" placeholder="Full Name" required
            className="w-full bg-on-surface/5 border border-on-surface/10 rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:border-primary transition-colors"
            value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
          />
          <input 
            type="email" placeholder="Email Address" required
            className="w-full bg-on-surface/5 border border-on-surface/10 rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:border-primary transition-colors"
            value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
          />
          <input 
            type="password" placeholder="Temporary Token (Password)" required
            className="w-full bg-on-surface/5 border border-on-surface/10 rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:border-primary transition-colors"
            value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })}
          />
          <select 
            className="w-full bg-on-surface/5 border border-on-surface/10 rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:border-primary transition-colors"
            value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}
          >
            <option value="User" className="bg-surface-container text-on-surface">User</option>
            <option value="Analyst" className="bg-surface-container text-on-surface">Analyst</option>
            <option value="Admin" className="bg-surface-container text-on-surface">Admin</option>
          </select>

          {error && <p className="text-[10px] font-black text-error uppercase tracking-widest">{error}</p>}

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-3 text-[10px] font-black uppercase tracking-widest text-on-surface hover:text-on-surface transition-colors">Abort</button>
            <button type="submit" disabled={loading} className="flex-1 py-3 bg-primary text-on-surface rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 disabled:opacity-50">
              {loading ? 'Propagating...' : 'Confirm Node'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const PersonnelManagement = () => {
  const [personnel, setPersonnel] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await api.get('/admin/users');
      const mapped = res.data.map((user) => ({
        id: user.id || user._id,
        name: user.name || user.email.split('@')[0],
        email: user.email,
        role: user.role || 'User',
        status: 'Active',
        lastLogin: user.last_login ? new Date(user.last_login).toLocaleString() : 'Never',
        initial: (user.name || user.email).substring(0, 2).toUpperCase(),
        color:
          user.role === 'Admin'
            ? 'bg-tertiary-container/30 text-tertiary'
            : user.role === 'Analyst'
              ? 'bg-primary-container/30 text-primary'
              : 'bg-secondary-container/30 text-secondary',
      }));
      setPersonnel(mapped);
      setError(null);
    } catch {
      setError('Unable to load users.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Access suspension requested: Are you sure?')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      fetchUsers();
    } catch {
      setError('Failed to revoke user access.');
    }
  };

  const handleUpdate = async (id, updates) => {
    try {
      await api.put(`/admin/users/${id}`, updates);
      fetchUsers();
    } catch {
      setError('System update rejected: Link failure.');
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchUsers();
  }, []);

  return (
    <div className="bg-surface-container-low rounded-xl p-6 shadow-2xl relative overflow-hidden border border-on-surface/10">
      <div className="absolute top-0 right-0 p-8 opacity-5">
        <span className="material-symbols-outlined text-9xl text-on-surface">group</span>
      </div>
      <div className="flex justify-between items-end mb-8 relative z-10 font-body">
        <div>
          <h3 className="text-xl font-black font-headline text-on-surface mb-1 uppercase tracking-tighter">Personnel Management</h3>
          <p className="text-on-surface text-[10px] font-bold uppercase tracking-widest">Manage active operators and system delegates</p>
        </div>
        <div className="flex gap-3 shrink-0">
          <button 
            onClick={() => setShowAddModal(true)}
            className="px-6 py-2.5 rounded-full bg-primary text-on-primary text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-lg leading-none">person_add</span>
            Add Personnel
          </button>
          <span className="px-5 py-2.5 rounded-full bg-surface-container-highest text-on-surface text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-md whitespace-nowrap">
            <span className="material-symbols-outlined text-lg leading-none">groups</span>
            {personnel.length} users
          </span>
        </div>
      </div>
      {error && (
        <div className="mb-4 rounded-lg border border-error/20 bg-error/10 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-error">
          {error}
        </div>
      )}
      <div className="overflow-x-auto rounded-lg bg-surface-container-lowest border border-on-surface/5 font-body relative min-h-[200px]">
        {loading && (
          <div className="absolute inset-0 bg-surface-container/40 backdrop-blur-[2px] z-10 flex items-center justify-center">
            <span className="material-symbols-outlined animate-spin text-primary text-3xl">sync</span>
          </div>
        )}
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-high/30">
              <th className="px-6 py-4 text-[10px] font-black text-on-surface uppercase tracking-widest">Name</th>
              <th className="px-6 py-4 text-[10px] font-black text-on-surface uppercase tracking-widest">Email</th>
              <th className="px-6 py-4 text-[10px] font-black text-on-surface uppercase tracking-widest">Role</th>
              <th className="px-6 py-4 text-[10px] font-black text-on-surface uppercase tracking-widest">Status</th>
              <th className="px-6 py-4 text-[10px] font-black text-on-surface uppercase tracking-widest">Last Login</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {personnel.length > 0 ? (
              personnel.map((p) => (
                <PersonnelRow 
                  key={p.id} 
                  {...p} 
                  onUpdate={handleUpdate} 
                  onDelete={handleDelete}
                />
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-on-surface uppercase text-[10px] font-black tracking-widest">
                  No active personnel nodes identified
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {showAddModal && <AddUserModal onClose={() => setShowAddModal(false)} onSuccess={() => { setShowAddModal(false); fetchUsers(); }} />}
      </AnimatePresence>
    </div>
  );
};

export default PersonnelManagement;






