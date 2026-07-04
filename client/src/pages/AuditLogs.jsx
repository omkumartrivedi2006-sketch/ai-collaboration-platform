import React, { useEffect, useState, useCallback } from 'react';
import { useAdmin } from '../context/AdminContext';
import Card from '../components/Card';
import Loader from '../components/Loader';
import { Search, Calendar, SlidersHorizontal, User } from 'lucide-react';
import api from '../services/api';

export const AuditLogs = () => {
  const { fetchAuditLogs, loading } = useAdmin();

  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, pages: 1 });
  const [usersList, setUsersList] = useState([]);

  // Filter states
  const [search, setSearch] = useState('');
  const [userId, setUserId] = useState('');
  const [entity, setEntity] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);

  const loadLogs = useCallback(async () => {
    const filters = {
      search: search || undefined,
      userId: userId || undefined,
      entity: entity || undefined,
      startDate: startDate ? new Date(startDate).toISOString() : undefined,
      endDate: endDate ? new Date(endDate).toISOString() : undefined
    };

    const data = await fetchAuditLogs(filters, page, 20);
    setLogs(data.logs || []);
    setPagination(data.pagination || { total: 0, page: 1, limit: 20, pages: 1 });
  }, [fetchAuditLogs, search, userId, entity, startDate, endDate, page]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  useEffect(() => {
    api.get('/auth/users')
      .then(res => setUsersList(res.data.data.users || []))
      .catch(e => console.error(e));
  }, []);

  const handleFilterChange = (setter, val) => {
    setter(val);
    setPage(1);
  };

  return (
    <div className="space-y-6 font-sans text-xs">
      
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">System Audit & Compliance Logs</h2>
        <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide mt-0.5">
          Real-time activity logs, permission alterations, and workspace management history
        </p>
      </div>

      {/* Filter panel */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => handleFilterChange(setSearch, e.target.value)}
            placeholder="Search action keyword..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold focus:outline-none"
          />
        </div>

        {/* User filter */}
        <div>
          <select
            value={userId}
            onChange={(e) => handleFilterChange(setUserId, e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold focus:outline-none cursor-pointer"
          >
            <option value="">-- All Users --</option>
            {usersList.map(u => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
        </div>

        {/* Entity type filter */}
        <div>
          <select
            value={entity}
            onChange={(e) => handleFilterChange(setEntity, e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold focus:outline-none cursor-pointer"
          >
            <option value="">-- All Entity Types --</option>
            <option value="User">User Account</option>
            <option value="Department">Department</option>
            <option value="Organization">Organization</option>
            <option value="RolePermission">Permissions Matrix</option>
            <option value="Project">Project Board</option>
            <option value="Task">Task card</option>
            <option value="Invitation">Invitation link</option>
          </select>
        </div>

        {/* Start Date */}
        <div>
          <input
            type="date"
            value={startDate}
            onChange={(e) => handleFilterChange(setStartDate, e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold focus:outline-none"
          />
        </div>

        {/* End Date */}
        <div>
          <input
            type="date"
            value={endDate}
            onChange={(e) => handleFilterChange(setEndDate, e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold focus:outline-none"
          />
        </div>

      </div>

      {/* Timeline listing */}
      {loading && logs.length === 0 ? (
        <Loader size="lg" message="Loading audit trails..." fullPage />
      ) : (
        <Card className="border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="relative border-l border-slate-150 pl-5 ml-2.5 space-y-6">
            
            {logs.map((log) => (
              <div key={log.id} className="relative">
                {/* Timeline node icon indicator */}
                <span className="absolute -left-[30px] top-0 bg-indigo-50 border border-indigo-250 text-indigo-650 p-1.5 rounded-full flex-shrink-0">
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                </span>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-slate-805 text-xs">{log.action}</span>
                    <span className="bg-indigo-50 border border-indigo-150 text-indigo-750 text-[8px] font-black uppercase px-1.5 py-0.5 rounded">
                      {log.entity}
                    </span>
                  </div>

                  <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">
                    {log.user ? (
                      <>
                        Executed by <span className="text-slate-700">{log.user.name}</span> ({log.user.email})
                      </>
                    ) : (
                      'System Automated Service'
                    )}
                  </p>

                  {/* Old/New value changes summary if available */}
                  {(log.oldValue || log.newValue) && (
                    <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-lg text-[9px] text-slate-500 font-mono space-y-1 max-w-xl">
                      {log.oldValue && (
                        <p className="truncate"><span className="font-bold text-rose-650">Old:</span> {JSON.stringify(log.oldValue)}</p>
                      )}
                      {log.newValue && (
                        <p className="truncate"><span className="font-bold text-emerald-655">New:</span> {JSON.stringify(log.newValue)}</p>
                      )}
                    </div>
                  )}

                  {/* IP address and metadata */}
                  <div className="flex gap-3 text-[9px] text-slate-400 font-bold items-center">
                    <span>{new Date(log.createdAt).toLocaleDateString()} {new Date(log.createdAt).toLocaleTimeString()}</span>
                    {log.ipAddress && <span>• IP: {log.ipAddress}</span>}
                    {log.userAgent && <span className="truncate max-w-xs">• Browser: {log.userAgent}</span>}
                  </div>

                </div>
              </div>
            ))}

            {logs.length === 0 && (
              <p className="text-center text-slate-400 italic font-bold py-16">
                No system activity matched the search criteria.
              </p>
            )}

          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-6">
              <span className="text-[10px] text-slate-450 font-bold uppercase">
                Page {pagination.page} of {pagination.pages}
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
      )}

    </div>
  );
};

export default AuditLogs;
