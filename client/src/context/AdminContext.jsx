import React, { createContext, useContext, useState, useCallback } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const AdminContext = createContext(null);

export const AdminProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [recentLogs, setRecentLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, pages: 1 });
  const [departments, setDepartments] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [settings, setSettings] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [mappings, setMappings] = useState([]);

  // Dashboard overview
  const fetchDashboardOverview = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/dashboard');
      setStats(res.data.data.stats || null);
      setRecentLogs(res.data.data.recentLogs || []);
    } catch (e) {
      toast.error('Failed to load admin telemetry stats');
    } finally {
      setLoading(false);
    }
  }, []);

  // User list
  const fetchUsers = useCallback(async (filters = {}, page = 1, limit = 10) => {
    setLoading(true);
    try {
      const params = { ...filters, page, limit };
      const res = await api.get('/admin/users', { params });
      setUsers(res.data.data.users || []);
      setPagination(res.data.data.pagination || { total: 0, page: 1, limit: 10, pages: 1 });
    } catch (e) {
      toast.error('Failed to retrieve user directory');
    } finally {
      setLoading(false);
    }
  }, []);

  const createUser = async (payload) => {
    setLoading(true);
    try {
      const res = await api.post('/admin/users', payload);
      toast.success('User account created successfully');
      setUsers(prev => [res.data.data.user, ...prev]);
      return res.data.data.user;
    } catch (e) {
      const errMsg = e.response?.data?.message || 'Failed to create user account';
      toast.error(errMsg);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (id, payload) => {
    setLoading(true);
    try {
      const res = await api.put(`/admin/users/${id}`, payload);
      toast.success('User details updated successfully');
      setUsers(prev => prev.map(u => u.id === id ? res.data.data.user : u));
      return res.data.data.user;
    } catch (e) {
      const errMsg = e.response?.data?.message || 'Failed to update user details';
      toast.error(errMsg);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id) => {
    setLoading(true);
    try {
      await api.delete(`/admin/users/${id}`);
      toast.success('User account permanently deleted');
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch (e) {
      toast.error('Failed to delete user account');
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (id, isActive) => {
    try {
      const res = await api.patch(`/admin/users/${id}/status`, { isActive });
      toast.success(isActive ? 'User account activated' : 'User account deactivated');
      setUsers(prev => prev.map(u => u.id === id ? { ...u, isActive } : u));
      return res.data.data;
    } catch (e) {
      toast.error('Failed to update user active status');
      throw e;
    }
  };

  const resetUserPassword = async (id, password) => {
    try {
      await api.patch(`/admin/users/${id}/reset-password`, { password });
      toast.success('User password reset successfully');
    } catch (e) {
      const errMsg = e.response?.data?.message || 'Failed to reset user password';
      toast.error(errMsg);
      throw e;
    }
  };

  // Departments CRUD
  const fetchDepartments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/departments');
      setDepartments(res.data.data.departments || []);
    } catch (e) {
      toast.error('Failed to load departments');
    } finally {
      setLoading(false);
    }
  }, []);

  const createDepartment = async (payload) => {
    setLoading(true);
    try {
      const res = await api.post('/admin/departments', payload);
      toast.success('Department created successfully');
      setDepartments(prev => [...prev, res.data.data.department]);
      return res.data.data.department;
    } catch (e) {
      const errMsg = e.response?.data?.message || 'Failed to create department';
      toast.error(errMsg);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const updateDepartment = async (id, payload) => {
    setLoading(true);
    try {
      const res = await api.put(`/admin/departments/${id}`, payload);
      toast.success('Department updated successfully');
      setDepartments(prev => prev.map(d => d.id === id ? res.data.data.department : d));
      return res.data.data.department;
    } catch (e) {
      const errMsg = e.response?.data?.message || 'Failed to update department';
      toast.error(errMsg);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const deleteDepartment = async (id) => {
    setLoading(true);
    try {
      await api.delete(`/admin/departments/${id}`);
      toast.success('Department successfully deleted');
      setDepartments(prev => prev.filter(d => d.id !== id));
    } catch (e) {
      toast.error('Failed to delete department');
      throw e;
    } finally {
      setLoading(false);
    }
  };

  // Invitations
  const fetchInvitations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/invitations');
      setInvitations(res.data.data.invitations || []);
    } catch (e) {
      toast.error('Failed to load pending invitations');
    } finally {
      setLoading(false);
    }
  }, []);

  const createInvitation = async (payload) => {
    setLoading(true);
    try {
      const res = await api.post('/admin/invitations', payload);
      toast.success('Email invitation dispatched successfully');
      setInvitations(prev => [res.data.data.invitation, ...prev]);
      return res.data.data.invitation;
    } catch (e) {
      const errMsg = e.response?.data?.message || 'Failed to generate invitation';
      toast.error(errMsg);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const revokeInvitation = async (id) => {
    setLoading(true);
    try {
      await api.delete(`/admin/invitations/${id}`);
      toast.success('Invitation link successfully revoked');
      setInvitations(prev => prev.map(i => i.id === id ? { ...i, status: 'REVOKED' } : i));
    } catch (e) {
      toast.error('Failed to revoke invitation');
      throw e;
    } finally {
      setLoading(false);
    }
  };

  // Settings
  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/settings');
      setSettings(res.data.data.settings || null);
    } catch (e) {
      toast.error('Failed to load organization settings');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSettings = async (payload) => {
    setLoading(true);
    try {
      const res = await api.put('/admin/settings', payload);
      toast.success('Organization profile updated');
      setSettings(res.data.data.settings || null);
      return res.data.data.settings;
    } catch (e) {
      const errMsg = e.response?.data?.message || 'Failed to update settings';
      toast.error(errMsg);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  // Permissions Matrix
  const fetchPermissionMatrix = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/permissions');
      setPermissions(res.data.data.permissions || []);
      setMappings(res.data.data.mappings || []);
    } catch (e) {
      toast.error('Failed to retrieve permissions matrix');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateRolePermissions = async (role, permissionIds) => {
    setLoading(true);
    try {
      await api.put(`/admin/permissions/${role}`, { permissionIds });
      toast.success(`Matrix updated for role: ${role}`);
      await fetchPermissionMatrix();
    } catch (e) {
      const errMsg = e.response?.data?.message || 'Failed to update permissions mapping';
      toast.error(errMsg);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const seedPermissions = async () => {
    setLoading(true);
    try {
      await api.post('/admin/permissions/seed');
      toast.success('Default permissions database seeded');
      await fetchPermissionMatrix();
    } catch (e) {
      toast.error('Seeding permissions database failed');
    } finally {
      setLoading(false);
    }
  };

  // Timeline audit log fetcher
  const fetchAuditLogs = async (filters = {}, page = 1, limit = 20) => {
    setLoading(true);
    try {
      const params = { ...filters, page, limit };
      const res = await api.get('/admin/audit-logs', { params });
      return res.data.data;
    } catch (e) {
      toast.error('Failed to retrieve audit log listings');
      return { logs: [], pagination: { total: 0, page: 1, limit: 20, pages: 1 } };
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminContext.Provider
      value={{
        loading,
        stats,
        recentLogs,
        users,
        pagination,
        departments,
        invitations,
        settings,
        permissions,
        mappings,
        fetchDashboardOverview,
        fetchUsers,
        createUser,
        updateUser,
        deleteUser,
        toggleUserStatus,
        resetUserPassword,
        fetchDepartments,
        createDepartment,
        updateDepartment,
        deleteDepartment,
        fetchInvitations,
        createInvitation,
        revokeInvitation,
        fetchSettings,
        updateSettings,
        fetchPermissionMatrix,
        updateRolePermissions,
        seedPermissions,
        fetchAuditLogs
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

export default AdminContext;
