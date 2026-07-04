import React, { createContext, useContext, useState, useCallback } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const AnalyticsContext = createContext(null);

export const AnalyticsProvider = ({ children }) => {
  const [kpi, setKpi] = useState(null);
  const [activities, setActivities] = useState([]);
  const [projectStats, setProjectStats] = useState([]);
  const [teamStats, setTeamStats] = useState([]);
  const [employeeStats, setEmployeeStats] = useState([]);
  const [meetingStats, setMeetingStats] = useState(null);
  const [aiStats, setAiStats] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Dynamic filter state (last 30 days by default)
  const [filters, setFilters] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    endDate: new Date().toISOString().slice(0, 10),
    projectId: '',
    department: '',
    employeeId: '',
    status: '',
    priority: ''
  });

  const updateFilters = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const getQueryString = useCallback((overrides = {}) => {
    const activeFilters = { ...filters, ...overrides };
    const params = new URLSearchParams();
    
    Object.keys(activeFilters).forEach(key => {
      if (activeFilters[key]) {
        params.append(key, activeFilters[key]);
      }
    });
    
    return params.toString() ? `?${params.toString()}` : '';
  }, [filters]);

  const fetchDashboardOverview = useCallback(async (overrides = {}) => {
    setLoading(true);
    try {
      const q = getQueryString(overrides);
      const res = await api.get(`/analytics/dashboard${q}`);
      setKpi(res.data.data.kpi);
      setActivities(res.data.data.activities || []);
    } catch (e) {
      toast.error('Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  }, [getQueryString]);

  const fetchProjectAnalytics = useCallback(async (overrides = {}) => {
    setLoading(true);
    try {
      const q = getQueryString(overrides);
      const res = await api.get(`/analytics/projects${q}`);
      setProjectStats(res.data.data || []);
    } catch (e) {
      toast.error('Failed to load project analytics');
    } finally {
      setLoading(false);
    }
  }, [getQueryString]);

  const fetchTeamAnalytics = useCallback(async (overrides = {}) => {
    setLoading(true);
    try {
      const q = getQueryString(overrides);
      const res = await api.get(`/analytics/team${q}`);
      setTeamStats(res.data.data || []);
    } catch (e) {
      toast.error('Failed to load team analytics');
    } finally {
      setLoading(false);
    }
  }, [getQueryString]);

  const fetchEmployeeAnalytics = useCallback(async (overrides = {}) => {
    setLoading(true);
    try {
      const q = getQueryString(overrides);
      const res = await api.get(`/analytics/employees${q}`);
      setEmployeeStats(res.data.data || []);
    } catch (e) {
      toast.error('Failed to load employee metrics');
    } finally {
      setLoading(false);
    }
  }, [getQueryString]);

  const fetchMeetingAnalytics = useCallback(async (overrides = {}) => {
    setLoading(true);
    try {
      const q = getQueryString(overrides);
      const res = await api.get(`/analytics/meetings${q}`);
      setMeetingStats(res.data.data);
    } catch (e) {
      toast.error('Failed to load meeting analytics');
    } finally {
      setLoading(false);
    }
  }, [getQueryString]);

  const fetchAIAnalytics = useCallback(async (overrides = {}) => {
    setLoading(true);
    try {
      const q = getQueryString(overrides);
      const res = await api.get(`/analytics/ai${q}`);
      setAiStats(res.data.data);
    } catch (e) {
      toast.error('Failed to load AI usage analytics');
    } finally {
      setLoading(false);
    }
  }, [getQueryString]);

  return (
    <AnalyticsContext.Provider
      value={{
        kpi,
        activities,
        projectStats,
        teamStats,
        employeeStats,
        meetingStats,
        aiStats,
        loading,
        filters,
        updateFilters,
        fetchDashboardOverview,
        fetchProjectAnalytics,
        fetchTeamAnalytics,
        fetchEmployeeAnalytics,
        fetchMeetingAnalytics,
        fetchAIAnalytics
      }}
    >
      {children}
    </AnalyticsContext.Provider>
  );
};

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
};

export default AnalyticsContext;
