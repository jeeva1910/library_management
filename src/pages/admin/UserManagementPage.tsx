import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.ts';
import { User } from '../../types/index.ts';
import { Users, UserCheck, Shield, GraduationCap, CheckCircle2, UserX } from 'lucide-react';

export const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const list = await api.getUsers();
      setUsers(list);
    } catch (e) {
      console.error('Failed to load users', e);
    } finally {
      setLoading(false);
    }
  };

  const toggleUserActive = async (user: User) => {
    try {
      await api.updateUser(user.id, { isActive: !user.isActive });
      loadUsers();
    } catch (e) {
      console.error('Failed toggling status', e);
    }
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Library User & Student Management
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          View registered student accounts, librarian staff roles, and manage active system privileges.
        </p>
      </div>

      {loading ? (
        <div className="h-64 bg-slate-200 rounded-xl animate-pulse" />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="p-4">User Name & Email</th>
                <th className="p-4">Role</th>
                <th className="p-4">Student ID / Dept</th>
                <th className="p-4">Phone</th>
                <th className="p-4">Account Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="p-4">
                    <span className="font-bold text-slate-900 block">{u.name}</span>
                    <span className="text-[11px] text-slate-500 font-mono">{u.email}</span>
                  </td>
                  <td className="p-4">
                    {u.role === 'admin' ? (
                      <span className="bg-indigo-100 text-indigo-800 font-semibold px-2.5 py-0.5 rounded text-[10px] inline-flex items-center gap-1">
                        <Shield className="w-3 h-3" /> Librarian Admin
                      </span>
                    ) : (
                      <span className="bg-blue-100 text-blue-800 font-semibold px-2.5 py-0.5 rounded text-[10px] inline-flex items-center gap-1">
                        <GraduationCap className="w-3 h-3" /> Student
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <span className="font-mono text-slate-900 font-bold block">{u.studentId || 'STAFF'}</span>
                    <span className="text-[11px] text-slate-500">{u.department || '-'}</span>
                  </td>
                  <td className="p-4 font-mono text-slate-600">{u.phone || '-'}</td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                        u.isActive
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {u.isActive ? 'Active' : 'Suspended'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => toggleUserActive(u)}
                      className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
                        u.isActive
                          ? 'bg-slate-100 text-slate-700 hover:bg-rose-100 hover:text-rose-800'
                          : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                      }`}
                    >
                      {u.isActive ? 'Suspend' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
