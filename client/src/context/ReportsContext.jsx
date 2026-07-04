import React, { createContext, useContext, useState, useCallback } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const ReportsContext = createContext(null);

export const ReportsProvider = ({ children }) => {
  const [reportsList, setReportsList] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchReportsList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/reports');
      setReportsList(res.data.data.reports || []);
    } catch (e) {
      toast.error('Failed to load compiled reports catalog');
    } finally {
      setLoading(false);
    }
  }, []);

  const generateNewReport = async (payload) => {
    setLoading(true);
    try {
      const res = await api.post('/reports/generate', payload);
      toast.success('Report compiled successfully');
      setReportsList(prev => [res.data.data.report, ...prev]);
      return res.data.data.report;
    } catch (e) {
      const errMsg = e.response?.data?.message || 'Report compilation failed';
      toast.error(errMsg);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const downloadReportFile = async (reportId, format) => {
    try {
      const url = `${import.meta.env.VITE_API_URL}/reports/download/${reportId}?format=${format}`;
      
      // If PDF, open in a new tab so browser print can take care of it
      if (format === 'pdf') {
        window.open(url, '_blank');
        return;
      }

      // Otherwise, download attachment
      const response = await api.get(`/reports/download/${reportId}?format=${format}`, {
        responseType: 'blob'
      });

      const blob = new Blob([response.data], {
        type: format === 'csv' ? 'text/csv' : 'application/vnd.ms-excel'
      });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `report_${reportId}.${format === 'csv' ? 'csv' : 'xls'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`Exported as ${format.toUpperCase()}`);
    } catch (e) {
      toast.error('Export download failed');
    }
  };

  return (
    <ReportsContext.Provider
      value={{
        reportsList,
        loading,
        fetchReportsList,
        generateNewReport,
        downloadReportFile
      }}
    >
      {children}
    </ReportsContext.Provider>
  );
};

export const useReports = () => {
  const context = useContext(ReportsContext);
  if (!context) {
    throw new Error('useReports must be used within a ReportsProvider');
  }
  return context;
};

export default ReportsContext;
