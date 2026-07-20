import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { AdminDashboardData, User } from '../types';
import { GlassCard } from '../components/GlassCard';
import { SkeletonCard, SkeletonTable } from '../components/SkeletonLoader';
import { toast } from 'react-toastify';
import {
  Users,
  ShieldCheck,
  FolderLock,
  FileText,
  Trash2,
  Activity,
  UserPlus
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';

export const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // User Creator Form State
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState<'Student' | 'Teacher' | 'Admin'>('Student');

  const fetchAdminData = async () => {
    try {
      const dashboardRes = await api.get<AdminDashboardData>('/admin/dashboard');
      const usersRes = await api.get<User[]>('/admin/users');
      setData(dashboardRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      toast.error('Failed to load administrator dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleAddUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim() || !newUserPassword.trim()) {
      toast.warn('Please fill in all user credentials');
      return;
    }

    try {
      await api.post('/admin/users', {
        name: newUserName,
        email: newUserEmail,
        password: newUserPassword,
        role: newUserRole
      });
      
      toast.success(`User '${newUserName}' created!`);
      setShowAddUser(false);
      setNewUserName('');
      setNewUserEmail('');
      setNewUserPassword('');
      fetchAdminData();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Could not create user');
    }
  };

  const handleDeleteUser = async (userId: number, userName: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete user account: ${userName}?`)) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      toast.success('User deleted');
      fetchAdminData();
    } catch (err) {
      toast.error('Could not delete user');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/4" />
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <SkeletonTable />
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left pb-20">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-apple-text-primary-light dark:text-apple-text-primary-dark">
            Admin Management Console
          </h2>
          <p className="text-sm text-apple-text-secondary-light dark:text-apple-text-secondary-dark">
            Oversee application users, system storage sizes, and audit activities.
          </p>
        </div>
        <button
          onClick={() => setShowAddUser(true)}
          className="glass-btn-primary py-2.5 text-sm"
        >
          <UserPlus size={16} /> Create User Account
        </button>
      </div>

      {/* Metrics Cards Grid */}
      {data && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          <GlassCard hoverable className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
              <Users size={20} />
            </div>
            <div>
              <div className="text-xl font-bold">{data.total_users}</div>
              <div className="text-[10px] uppercase tracking-wider font-semibold text-apple-text-secondary-light dark:text-apple-text-secondary-dark">
                Total Users
              </div>
            </div>
          </GlassCard>

          <GlassCard hoverable className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
              <ShieldCheck size={20} />
            </div>
            <div>
              <div className="text-xl font-bold">{data.total_teachers}</div>
              <div className="text-[10px] uppercase tracking-wider font-semibold text-apple-text-secondary-light dark:text-apple-text-secondary-dark">
                Teachers
              </div>
            </div>
          </GlassCard>

          <GlassCard hoverable className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
              <Users size={20} />
            </div>
            <div>
              <div className="text-xl font-bold">{data.total_students}</div>
              <div className="text-[10px] uppercase tracking-wider font-semibold text-apple-text-secondary-light dark:text-apple-text-secondary-dark">
                Students
              </div>
            </div>
          </GlassCard>

          <GlassCard hoverable className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-500">
              <FileText size={20} />
            </div>
            <div>
              <div className="text-xl font-bold">{data.total_notes}</div>
              <div className="text-[10px] uppercase tracking-wider font-semibold text-apple-text-secondary-light dark:text-apple-text-secondary-dark">
                Notes Files
              </div>
            </div>
          </GlassCard>

          <GlassCard hoverable className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
              <FolderLock size={20} />
            </div>
            <div>
              <div className="text-xl font-bold">{data.storage_used_mb} MB</div>
              <div className="text-[10px] uppercase tracking-wider font-semibold text-apple-text-secondary-light dark:text-apple-text-secondary-dark">
                Disk Used
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Analytics Charts & Growth */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <GlassCard className="lg:col-span-8 space-y-4">
          <h3 className="font-bold text-lg">Platform User Registration Growth</h3>
          {data && (
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.user_growth}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(156,163,175,0.15)" />
                  <XAxis dataKey="month" stroke="#888888" fontSize={11} tickLine={false} />
                  <YAxis stroke="#888888" fontSize={11} tickLine={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={3} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </GlassCard>

        {/* Audit / Activity logs */}
        <GlassCard className="lg:col-span-4 space-y-4">
          <div className="flex items-center gap-2">
            <Activity size={18} className="text-pink-500" />
            <h3 className="font-bold text-lg">System Activity Logs</h3>
          </div>
          <div className="space-y-3 max-h-60 overflow-y-auto pr-1 text-xs">
            {data && data.activity_logs.length > 0 ? (
              data.activity_logs.map((log, idx) => (
                <div key={idx} className="p-2 border-b border-apple-border-light dark:border-apple-border-dark flex justify-between gap-2">
                  <div className="text-left font-medium">{log.description}</div>
                  <div className="text-apple-text-secondary-light dark:text-apple-text-secondary-dark shrink-0">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-apple-text-secondary-light dark:text-apple-text-secondary-dark">
                No recent system logs.
              </div>
            )}
          </div>
        </GlassCard>
      </div>

      {/* User Management Directory Grid */}
      <GlassCard className="space-y-4">
        <h3 className="font-bold text-lg">Accounts Directory</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-apple-border-light dark:border-apple-border-dark text-xs uppercase text-apple-text-secondary-light dark:text-apple-text-secondary-dark">
                <th className="py-3 px-2">Account ID</th>
                <th className="py-3 px-2">Full Name</th>
                <th className="py-3 px-2">Email Address</th>
                <th className="py-3 px-2">Role Assigned</th>
                <th className="py-3 px-2">Created At</th>
                <th className="py-3 px-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-apple-border-light dark:divide-apple-border-dark text-sm">
              {users.map((usr) => (
                <tr key={usr.id} className="hover:bg-white/20 dark:hover:bg-white/5 transition-colors">
                  <td className="py-3 px-2 font-mono text-xs">#{usr.id}</td>
                  <td className="py-3 px-2 font-medium">{usr.name}</td>
                  <td className="py-3 px-2 text-apple-text-secondary-light dark:text-apple-text-secondary-dark">
                    {usr.email}
                  </td>
                  <td className="py-3 px-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      usr.role === 'Admin' ? 'bg-red-500/10 text-red-500' :
                      usr.role === 'Teacher' ? 'bg-purple-500/10 text-purple-500' :
                      'bg-indigo-500/10 text-indigo-500'
                    }`}>
                      {usr.role}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-xs">
                    {new Date(usr.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-2 text-right">
                    <button
                      onClick={() => handleDeleteUser(usr.id, usr.name)}
                      className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                      title="Delete User"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* User Creator Modal */}
      {showAddUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="bg-apple-bg-light dark:bg-apple-bg-dark rounded-2xl max-w-md w-full border border-apple-border-light dark:border-apple-border-dark shadow-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold">Register New Account</h3>
              <button
                onClick={() => setShowAddUser(false)}
                className="text-apple-text-secondary-light dark:text-apple-text-secondary-dark hover:text-red-500 font-bold"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleAddUserSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold">User's Full Name</label>
                <input
                  type="text"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="e.g. Charlie Brown"
                  className="w-full glass-input text-sm"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold">Email Address</label>
                <input
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="charlie@school.com"
                  className="w-full glass-input text-sm"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold">Initial Password</label>
                <input
                  type="password"
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full glass-input text-sm"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold">Role Authority</label>
                <select
                  value={newUserRole}
                  onChange={(e: any) => setNewUserRole(e.target.value)}
                  className="w-full glass-input text-sm"
                >
                  <option value="Student">Student</option>
                  <option value="Teacher">Teacher</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full glass-btn-primary py-2.5 rounded-xl font-bold mt-2"
              >
                Register Account
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
