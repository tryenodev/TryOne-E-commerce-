'use client';

import { useEffect, useState } from 'react';
import { UserRole, FILTER_ALL, STATUS_FILTER_ALL } from '@/lib/enums';
import { PageHeader } from '@/components/customer/PageHeader';
import { LoadingScreen } from '@/components/customer/LoadingScreen';
import { EmptyState } from '@/components/customer/EmptyState';
import { AlertBanner } from '@/components/customer/AlertBanner';
import { formatDate } from '@/lib/format';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>(FILTER_ALL);
  const [statusFilter, setStatusFilter] = useState<typeof STATUS_FILTER_ALL | 'active' | 'inactive'>(STATUS_FILTER_ALL);
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/users');
      const data = await response.json();
      if (response.ok) {
        setUsers(data.users);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to fetch users' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to fetch users' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const updateUserRole = async (userId: string, newRole: string) => {
    if (!confirm(`Change this user's role to ${newRole}?`)) return;

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      if (response.ok) {
        setMessage({ type: 'success', text: 'Role updated' });
        fetchUsers();
      } else {
        const data = await response.json();
        setMessage({ type: 'error', text: data.error || 'Failed to update role' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to update role' });
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    const action = currentStatus ? 'deactivate' : 'activate';
    if (!confirm(`${action.charAt(0).toUpperCase() + action.slice(1)} this user?`)) return;

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      if (response.ok) {
        setMessage({ type: 'success', text: `User ${action}d` });
        fetchUsers();
      } else {
        const data = await response.json();
        setMessage({ type: 'error', text: data.error || `Failed to ${action}` });
      }
    } catch {
      setMessage({ type: 'error', text: `Failed to ${action}` });
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Delete this user permanently?')) return;

    try {
      const response = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
      if (response.ok) {
        setMessage({ type: 'success', text: 'User deleted' });
        fetchUsers();
      } else {
        const data = await response.json();
        setMessage({ type: 'error', text: data.error || 'Failed to delete user' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to delete user' });
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesFilter = filter === FILTER_ALL || user.role === filter;
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === STATUS_FILTER_ALL ||
      (statusFilter === 'active' && user.isActive) ||
      (statusFilter === 'inactive' && !user.isActive);
    return matchesFilter && matchesSearch && matchesStatus;
  });

  if (loading) return <LoadingScreen message="Loading users..." />;

  return (
    <>
      <PageHeader
        title="User management"
        description={`${users.length} registered accounts`}
      />

      {message && (
        <AlertBanner variant={message.type} message={message.text} onDismiss={() => setMessage(null)} />
      )}

      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <input
            type="search"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
          />
          <div className="flex flex-wrap gap-2">
            {[FILTER_ALL, UserRole.ADMIN, UserRole.STAFF, UserRole.CUSTOMER].map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => setFilter(role)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  filter === role
                    ? 'bg-rose-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {role}
              </button>
            ))}
          </div>
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as typeof STATUS_FILTER_ALL | 'active' | 'inactive')
            }
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="all">All status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <p className="mt-3 text-xs text-slate-500">
          Showing {filteredUsers.length} of {users.length}
        </p>
      </div>

      {filteredUsers.length === 0 ? (
        <EmptyState title="No users found" />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50">
              <tr>
                {['User', 'Role', 'Status', 'Joined', 'Actions'].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/80">
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-slate-900">{user.name}</p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={user.role}
                      onChange={(e) => updateUserRole(user.id, e.target.value)}
                      className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-medium"
                    >
                      <option value="ADMIN">ADMIN</option>
                      <option value="STAFF">STAFF</option>
                      <option value="CUSTOMER">CUSTOMER</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        user.isActive
                          ? 'bg-emerald-50 text-emerald-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-500">{formatDate(user.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => toggleUserStatus(user.id, user.isActive)}
                        className="text-xs font-semibold text-amber-700 hover:text-amber-900"
                      >
                        {user.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteUser(user.id)}
                        className="text-xs font-semibold text-rose-600 hover:text-rose-800"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
