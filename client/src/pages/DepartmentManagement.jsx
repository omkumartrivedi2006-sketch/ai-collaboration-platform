import React, { useEffect, useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import Card from '../components/Card';
import Loader from '../components/Loader';
import api from '../services/api';
import { Briefcase, User, Calendar, Plus, Edit2, Trash2, Users } from 'lucide-react';
import toast from 'react-hot-toast';

export const DepartmentManagement = () => {
  const {
    departments,
    loading,
    fetchDepartments,
    createDepartment,
    updateDepartment,
    deleteDepartment
  } = useAdmin();

  const [allUsers, setAllUsers] = useState([]);
  
  // Modals / forms states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [managerId, setManagerId] = useState('');

  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [targetDept, setTargetDept] = useState(null);
  const [selectedUserIds, setSelectedUserIds] = useState([]);

  useEffect(() => {
    fetchDepartments();
    api.get('/auth/users')
      .then(res => setAllUsers(res.data.data.users || []))
      .catch(e => console.error(e));
  }, [fetchDepartments]);

  const handleEditClick = (d) => {
    setEditingDept(d);
    setName(d.name);
    setDescription(d.description || '');
    setManagerId(d.managerId || '');
    setIsFormOpen(true);
  };

  const handleCreateClick = () => {
    setEditingDept(null);
    setName('');
    setDescription('');
    setManagerId('');
    setIsFormOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingDept) {
        await updateDepartment(editingDept.id, { name, description, managerId: managerId || undefined });
      } else {
        await createDepartment({ name, description, managerId: managerId || undefined });
      }
      setIsFormOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this department? Members will remain but lose their department assignment.')) {
      try {
        await deleteDepartment(id);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleAssignClick = (d) => {
    setTargetDept(d);
    // Find users currently in this department
    const currentMembers = allUsers.filter(u => u.departmentId === d.id).map(u => u.id);
    setSelectedUserIds(currentMembers);
    setIsAssignOpen(true);
  };

  const handleAssignToggle = (userId) => {
    setSelectedUserIds(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/admin/departments/${targetDept.id}/assign-members`, { userIds: selectedUserIds });
      toast.success('Department members list updated');
      
      // Refresh local users list and departments
      const res = await api.get('/auth/users');
      setAllUsers(res.data.data.users || []);
      fetchDepartments();
      setIsAssignOpen(false);
    } catch (err) {
      toast.error('Failed to update department members');
    }
  };

  if (loading && departments.length === 0) {
    return <Loader size="lg" message="Loading department workspaces..." fullPage />;
  }

  return (
    <div className="space-y-6 font-sans text-xs">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Organization Departments Management</h2>
          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide mt-0.5">
            Organize departments, assign manager roles, and manage team members
          </p>
        </div>

        <button
          onClick={handleCreateClick}
          className="cursor-pointer bg-indigo-605 hover:bg-indigo-755 text-white font-bold px-3 py-2 rounded-lg flex items-center gap-1 shadow-sm transition-all hover:-translate-y-0.5"
        >
          <Plus className="h-4.5 w-4.5" />
          <span>Create Department</span>
        </button>
      </div>

      {/* Departments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.map((d) => {
          const stats = d.statistics || { memberCount: 0, totalTasks: 0, completedTasks: 0, avgTaskProgress: 0 };
          return (
            <Card
              key={d.id}
              title={d.name}
              subtitle={d.description || 'No department description defined.'}
              className="border border-slate-200 bg-white hover:border-slate-350 transition-colors p-5 relative"
            >
              <div className="mt-4 space-y-4">
                
                {/* Manager */}
                <div className="flex gap-2 items-center text-slate-550 border-b border-slate-100 pb-2">
                  <User className="h-4 w-4 text-indigo-500 flex-shrink-0" />
                  <span className="font-bold">Manager:</span>
                  <span className="font-semibold text-slate-700">
                    {d.manager ? d.manager.name : <span className="text-slate-350 italic">Unassigned</span>}
                  </span>
                </div>

                {/* Statistics Grid */}
                <div className="grid grid-cols-3 gap-2.5 bg-slate-50 border border-slate-100 p-2.5 rounded-lg text-center">
                  <div>
                    <p className="text-[8px] text-slate-400 font-bold uppercase">Members</p>
                    <p className="font-bold text-slate-750 mt-0.5">{stats.memberCount}</p>
                  </div>
                  <div>
                    <p className="text-[8px] text-slate-400 font-bold uppercase">Tasks Progress</p>
                    <p className="font-bold text-indigo-650 mt-0.5">{stats.avgTaskProgress}%</p>
                  </div>
                  <div>
                    <p className="text-[8px] text-slate-400 font-bold uppercase">Done / Total</p>
                    <p className="font-bold text-slate-750 mt-0.5">{stats.completedTasks}/{stats.totalTasks}</p>
                  </div>
                </div>

                {/* Quick actions panel inside card */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <button
                    onClick={() => handleAssignClick(d)}
                    className="cursor-pointer bg-slate-50 border border-slate-200 hover:border-slate-350 hover:bg-slate-100 text-slate-700 font-bold px-2.5 py-1 rounded inline-flex items-center gap-1"
                  >
                    <Users className="h-3.5 w-3.5" />
                    <span>Members</span>
                  </button>

                  <div className="flex gap-1.5">
                    <button
                      onClick={() => handleEditClick(d)}
                      className="p-1 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded cursor-pointer"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(d.id)}
                      className="p-1 hover:bg-slate-100 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

              </div>
            </Card>
          );
        })}

        {departments.length === 0 && (
          <div className="col-span-full text-center py-16 border border-dashed border-slate-200 rounded-xl bg-slate-50/20 font-bold text-slate-400 italic">
            No departments workspace configured yet.
          </div>
        )}
      </div>

      {/* CREATE / EDIT POPUP MODAL */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-5 py-4 border-b border-slate-100">
              <h3 className="font-black text-slate-805 text-sm uppercase tracking-wider">
                {editingDept ? 'Update Department Settings' : 'Create Department'}
              </h3>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-slate-400 font-bold mb-1 uppercase tracking-wider text-[8px]">Department Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1 uppercase tracking-wider text-[8px]">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold focus:outline-none h-20 resize-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1 uppercase tracking-wider text-[8px]">Department Manager</label>
                <select
                  value={managerId}
                  onChange={(e) => setManagerId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold focus:outline-none cursor-pointer"
                >
                  <option value="">-- Choose Manager --</option>
                  {allUsers.map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 pt-2 justify-end">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="cursor-pointer px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-655 font-bold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="cursor-pointer px-4 py-2 bg-indigo-605 text-white font-bold rounded-lg shadow-sm"
                >
                  Save Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ASSIGN MEMBERS POPUP MODAL */}
      {isAssignOpen && targetDept && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-5 py-4 border-b border-slate-100">
              <h3 className="font-black text-slate-805 text-sm uppercase tracking-wider">Manage Department Members</h3>
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Department: {targetDept.name}</p>
            </div>
            <form onSubmit={handleAssignSubmit} className="p-5 space-y-4">
              
              <div className="space-y-2 max-h-60 overflow-y-auto border border-slate-150 rounded-xl p-3">
                {allUsers.map(u => {
                  const isChecked = selectedUserIds.includes(u.id);
                  return (
                    <label key={u.id} className="flex items-center gap-2.5 p-1.5 hover:bg-slate-50 rounded-lg cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleAssignToggle(u.id)}
                        className="h-4 w-4 text-indigo-600 border-slate-350 rounded focus:ring-indigo-500 cursor-pointer"
                      />
                      <div>
                        <p className="font-bold text-slate-750">{u.name}</p>
                        <p className="text-[9px] text-slate-400 font-semibold">{u.email}</p>
                      </div>
                    </label>
                  );
                })}
              </div>

              <div className="flex gap-2 pt-2 justify-end">
                <button
                  type="button"
                  onClick={() => setIsAssignOpen(false)}
                  className="cursor-pointer px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-655 font-bold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="cursor-pointer px-4 py-2 bg-indigo-605 text-white font-bold rounded-lg shadow-sm"
                >
                  Save Members List
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default DepartmentManagement;
