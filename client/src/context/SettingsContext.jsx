import React, { createContext, useContext, useState, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const SettingsContext = createContext(null);

export const SettingsProvider = ({ children }) => {
  const { refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [preferences, setPreferences] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [devices, setDevices] = useState([]);

  const fetchPreferences = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/settings/preferences');
      setPreferences(res.data.data.preferences);
    } catch (e) {
      toast.error('Failed to load user preferences');
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePreferences = async (payload) => {
    setLoading(true);
    try {
      const res = await api.put('/settings/preferences', payload);
      toast.success('Preferences updated successfully');
      setPreferences(res.data.data.preferences);
      return res.data.data.preferences;
    } catch (e) {
      const errMsg = e.response?.data?.message || 'Failed to update preferences';
      toast.error(errMsg);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (payload) => {
    setLoading(true);
    try {
      const res = await api.put('/settings/profile', payload);
      toast.success('Profile settings updated');
      await refreshUser(); // sync globally
      return res.data.data.user;
    } catch (e) {
      const errMsg = e.response?.data?.message || 'Failed to update profile settings';
      toast.error(errMsg);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (payload) => {
    setLoading(true);
    try {
      await api.put('/settings/password', payload);
      toast.success('Password changed successfully');
    } catch (e) {
      const errMsg = e.response?.data?.message || 'Password update failed';
      toast.error(errMsg);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/settings/sessions');
      setSessions(res.data.data.sessions || []);
    } catch (e) {
      toast.error('Failed to load session logs');
    } finally {
      setLoading(false);
    }
  }, []);

  const revokeSession = async (id) => {
    setLoading(true);
    try {
      await api.delete(`/settings/sessions/${id}`);
      toast.success('Session terminated');
      setSessions(prev => prev.filter(s => s.id !== id));
    } catch (e) {
      toast.error('Failed to terminate session');
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const revokeOtherSessions = async (activeSessionId) => {
    setLoading(true);
    try {
      await api.delete('/settings/sessions/other', { data: { activeSessionId } });
      toast.success('Other sessions successfully revoked');
      setSessions(prev => prev.filter(s => s.id === activeSessionId));
    } catch (e) {
      toast.error('Failed to terminate other sessions');
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const fetchDevices = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/settings/devices');
      setDevices(res.data.data.devices || []);
    } catch (e) {
      toast.error('Failed to load trusted devices');
    } finally {
      setLoading(false);
    }
  }, []);

  const trustDevice = async (deviceName, fingerprint) => {
    setLoading(true);
    try {
      const res = await api.post('/settings/devices', { deviceName, fingerprint });
      toast.success('Device registered as trusted');
      setDevices(prev => [res.data.data.device, ...prev]);
      return res.data.data.device;
    } catch (e) {
      toast.error('Failed to trust device');
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const renameDevice = async (id, deviceName) => {
    setLoading(true);
    try {
      const res = await api.put(`/settings/devices/${id}`, { deviceName });
      toast.success('Trusted device renamed');
      setDevices(prev => prev.map(d => d.id === id ? res.data.data.device : d));
      return res.data.data.device;
    } catch (e) {
      toast.error('Failed to rename device');
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const removeDevice = async (id) => {
    setLoading(true);
    try {
      await api.delete(`/settings/devices/${id}`);
      toast.success('Trusted device removed');
      setDevices(prev => prev.filter(d => d.id !== id));
    } catch (e) {
      toast.error('Failed to remove trusted device');
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return (
    <SettingsContext.Provider
      value={{
        loading,
        preferences,
        sessions,
        devices,
        fetchPreferences,
        updatePreferences,
        updateProfile,
        changePassword,
        fetchSessions,
        revokeSession,
        revokeOtherSessions,
        fetchDevices,
        trustDevice,
        renameDevice,
        removeDevice
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export default SettingsContext;
