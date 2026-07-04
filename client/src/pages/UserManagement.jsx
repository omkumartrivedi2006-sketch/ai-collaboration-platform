import React, { useEffect, useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import Card from '../components/Card';
import Loader from '../components/Loader';
import InvitationModal from '../components/InvitationModal';
import { UserPlus, Search, RefreshCw, Key, Shield, Trash2, Power, UserCog } from 'lucide-react';
import toast from 'react-hot-toast';

export const UserManagement = () => {
  const {
    users,
    pagination,
    departments,
    loading,
    fetchUsers,
    fetchDepartments,
    createUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
    resetUserPassword
  } = useAdmin();

  // Filter States
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [isActive, setIsActive] = useState('');
  const [page, setPage] = useState(1);

  // Modals States
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [resetPwdUser, setResetPwdUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');

  // Edit User Form State
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState('Employee');
  const [editDeptId, setEditDeptId] = useState('');

  // Direct User Creation Form State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createName, setCreateName] = useState('');
  const [createEmail, setCreateEmail] = useState('');
  const [createPassword, setCreatePassword] = useState('');
  const [createRole, setCreateRole] = useState('Employee');
  const [createDeptId, setCreateDeptId] = useState('');

  useEffect(() => {
    fetchUsers({ search, role, departmentId, isActive: isActive === '' ? undefined : isActive === 'true' }, page);
    fetchDepartments();
  }, [fetchUsers, fetchDepartments, search, role, departmentId, isActive, page]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleFilterChange = (setter, val) => {
    setter(val);
    setPage(1);
  };

  const handleEditClick = (u) => {
    setEditingUser(u);
    setEditName(u.name);
    setEditEmail(u.email);
    setEditRole(u.role);
    setEditDeptId(u.memberDepartment?.id || '');
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateUser(editingUser.id, {
        name: editName,
        email: editEmail,
        role: editRole,
        departmentId: editDeptId || undefined
      });
      setEditingUser(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      await createUser({
        name: createName,
        email: createEmail,
        password: createPassword,
        role: createRole,
        departmentId: createDeptId || undefined
      });
      setCreateName('');
      setCreateEmail('');
      setCreatePassword('');
      setCreateRole('Employee');
      setCreateDeptId('');
      setIsCreateOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    if (window.confirm(`Are you sure you want to ${currentStatus ? 'deactivate' : 'activate'} this user account?`)) {
      try {
        await toggleUserStatus(id, !currentStatus);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm('CRITICAL WARNING: Permanently deleting this user will delete all their records. Are you sure?')) {
      try {
        await deleteUser(id);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleResetPwdSubmit = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    try {
      await resetUserPassword(resetPwdUser.id, newPassword);
      setNewPassword('');
      setResetPwdUser(null);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 font-sans text-xs">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">User Directories & Access Control</h2>
          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide mt-0.5">
            Administer active user credentials, status updates, and email invitations
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setIsCreateOpen(true)}
            className="cursor-pointer bg-slate-100 hover:bg-slate-205 border border-slate-200 text-slate-700 font-bold px-3 py-2 rounded-lg flex items-center gap-1 shadow-sm transition-all"
          >
            <UserPlus className="h-4 w-4" />
            <span>Add User Direct</span>
          </button>
          <button
            onClick={() => setIsInviteOpen(true)}
            className="cursor-pointer bg-indigo-605 hover:bg-indigo-705 text-white font-bold px-3 py-2 rounded-lg flex items-center gap-1 shadow-sm transition-all hover:-translate-y-0.5"
          >
            <UserPlus className="h-4 w-4" />
            <span>Invite by Email</span>
          </button>
        </div>
      </div>

      {/* Filter panel */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={handleSearchChange}
            placeholder="Search name, email directory..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <select
            value={role}
            onChange={(e) => handleFilterChange(setRole, e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold focus:outline-none cursor-pointer"
          >
            <option value="">-- All Roles --</option>
            <option value="Admin">Admin</option>
            <option value="Manager">Manager</option>
            <option value="Employee">Employee</option>
          </select>
        </div>

        <div>
          <select
            value={departmentId}
            onChange={(e) => handleFilterChange(setDepartmentId, e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold focus:outline-none cursor-pointer"
          >
            <option value="">-- All Departments --</option>
            {departments.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={isActive}
            onChange={(e) => handleFilterChange(setIsActive, e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold focus:outline-none cursor-pointer"
          >
            <option value="">-- All Statuses --</option>
            <option value="true">Active Only</option>
            <option value="false">Deactivated Only</option>
          </select>
        </div>
      </div>

      {/* Directory Table */}
      <Card className="border border-slate-200 bg-white p-0 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-400 uppercase tracking-wider text-[8px] py-3 px-4">
                <th className="py-3.5 px-5">Name / Email</th>
                <th className="py-3.5 px-4">Access Role</th>
                <th className="py-3.5 px-4">Department</th>
                <th className="py-3.5 px-4">Active Status</th>
                <th className="py-3.5 px-5 text-right">Quick Control Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3.5 px-5">
                    <div className="font-bold text-slate-800 text-[11px]">{u.name}</div>
                    <div className="text-[10px] text-slate-400 font-medium">{u.email}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-black uppercase border ${
                      u.role === 'Admin' 
                        ? 'bg-rose-50 text-rose-700 border-rose-150' 
                        : u.role === 'Manager' 
                        ? 'bg-indigo-50 text-indigo-700 border-indigo-150' 
                        : 'bg-slate-50 text-slate-700 border-slate-150'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">
                    {u.memberDepartment?.name || <span className="text-slate-350 italic">None Assigned</span>}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-block w-2 h-2 rounded-full mr-1.5 ${u.isActive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                    <span className="text-[10px] font-bold">{u.isActive ? 'Active' : 'Disabled'}</span>
                  </td>
                  <td className="py-3.5 px-5 text-right space-x-1.5">
                    <button
                      onClick={() => handleToggleStatus(u.id, u.isActive)}
                      title={u.isActive ? 'Deactivate User' : 'Activate User'}
                      className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700 cursor-pointer"
                    >
                      <Power className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setResetPwdUser(u)}
                      title="Reset Password Credentials"
                      className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700 cursor-pointer"
                    >
                      <Key className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleEditClick(u)}
                      title="Update Account Settings"
                      className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-750 cursor-pointer"
                    >
                      <UserCog className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteUser(u.id)}
                      title="Permanently Delete User Profile"
                      className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-rose-600 cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}

              {users.length === 0 && !loading && (
                <tr>
                  <td colSpan="5" className="text-center py-12 text-slate-400 italic font-bold">
                    No active user records matched the filters query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 bg-slate-50">
            <span className="text-[10px] text-slate-450 font-bold uppercase">
              Showing page {pagination.page} of {pagination.pages}
            </span>
            <div className="flex gap-1">
              <button
                disabled={pagination.page <= 1}
                onClick={() => setPage(p => p - 1)}
                className="cursor-pointer px-2.5 py-1 bg-white border border-slate-200 hover:bg-slate-100 rounded font-bold text-slate-655 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                disabled={pagination.page >= pagination.pages}
                onClick={() => setPage(p => p + 1)}
                className="cursor-pointer px-2.5 py-1 bg-white border border-slate-200 hover:bg-slate-100 rounded font-bold text-slate-655 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* Invitations Dispatch popup modal */}
      <InvitationModal isOpen={isInviteOpen} onClose={() => setIsInviteOpen(false)} />

      {/* DIRECT USER CREATION POPUP MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-5 py-4 border-b border-slate-100">
              <h3 className="font-black text-slate-805 text-sm uppercase tracking-wider">Create Account Direct</h3>
            </div>
            <form onSubmit={handleCreateSubmit} className="p-5 space-y-3.5">
              <div>
                <label className="block text-slate-400 font-bold mb-1 uppercase tracking-wider text-[8px]">Name</label>
                <input
                  type="text"
                  required
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-bold mb-1 uppercase tracking-wider text-[8px]">Email Address</label>
                <input
                  type="email"
                  required
                  value={createEmail}
                  onChange={(e) => setCreateEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-bold mb-1 uppercase tracking-wider text-[8px]">Password</label>
                <input
                  type="password"
                  required
                  value={createPassword}
                  onChange={(e) => setCreatePassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1 uppercase tracking-wider text-[8px]">Role</label>
                  <select
                    value={createRole}
                    onChange={(e) => setCreateRole(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold focus:outline-none cursor-pointer"
                  >
                    <option value="Employee">Employee</option>
                    <option value="Manager">Manager</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1 uppercase tracking-wider text-[8px]">Department</label>
                  <select
                    value={createDeptId}
                    onChange={(e) => setCreateDeptId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold focus:outline-none cursor-pointer"
                  >
                    <option value="">-- None --</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-2 pt-2 justify-end">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="cursor-pointer px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-655 font-bold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="cursor-pointer px-4 py-2 bg-indigo-605 text-white font-bold rounded-lg shadow-sm"
                >
                  Save Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT USER POPUP MODAL */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-5 py-4 border-b border-slate-100">
              <h3 className="font-black text-slate-805 text-sm uppercase tracking-wider">Update Account Details</h3>
            </div>
            <form onSubmit={handleEditSubmit} className="p-5 space-y-3.5">
              <div>
                <label className="block text-slate-400 font-bold mb-1 uppercase tracking-wider text-[8px]">Full Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-bold mb-1 uppercase tracking-wider text-[8px]">Email Address</label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1 uppercase tracking-wider text-[8px]">Access Role</label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold focus:outline-none cursor-pointer"
                  >
                    <option value="Employee">Employee</option>
                    <option value="Manager">Manager</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1 uppercase tracking-wider text-[8px]">Department</label>
                  <select
                    value={editDeptId}
                    onChange={(e) => setEditDeptId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold focus:outline-none cursor-pointer"
                  >
                    <option value="">-- None --</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-2 pt-2 justify-end">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="cursor-pointer px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-655 font-bold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="cursor-pointer px-4 py-2 bg-indigo-605 text-white font-bold rounded-lg shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESET PASSWORD POPUP MODAL */}
      {resetPwdUser && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-5 py-4 border-b border-slate-100">
              <h3 className="font-black text-slate-805 text-sm uppercase tracking-wider">Reset User Password</h3>
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Account: {resetPwdUser.name} ({resetPwdUser.email})</p>
            </div>
            <form onSubmit={handleResetPwdSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-slate-400 font-bold mb-1 uppercase tracking-wider text-[8px]">New Access Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new 6+ characters password"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold focus:outline-none"
                />
              </div>
              <div className="flex gap-2 pt-2 justify-end">
                <button
                  type="button"
                  onClick={() => setResetPwdUser(null)}
                  className="cursor-pointer px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-655 font-bold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="cursor-pointer px-4 py-2 bg-indigo-605 text-white font-bold rounded-lg shadow-sm animate-pulse"
                >
                  Confirm Reset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default UserManagement;
