import React, { useEffect, useState } from 'react';
import useProjects from '../context/ProjectContext';
import api from '../services/api';
import { SlidersHorizontal, RefreshCw } from 'lucide-react';

export const AnalyticsFilter = ({ filters, onFilterChange, onRefresh }) => {
  const { projects, fetchProjects } = useProjects();
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    if (projects.length === 0) {
      fetchProjects({ limit: 100 });
    }
    
    // Fetch employee list and unique departments
    api.get('/auth/users')
      .then(res => {
        const users = res.data.data.users || [];
        setEmployees(users);
        const uniqueDepts = Array.from(new Set(users.map(u => u.department).filter(d => d)));
        setDepartments(uniqueDepts);
      })
      .catch(e => console.error(e));
  }, [projects.length, fetchProjects]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    onFilterChange({ [name]: value });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs font-sans text-xs">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-3 mb-3">
        <div className="flex items-center gap-1.5 font-bold text-slate-800 uppercase tracking-wider text-[10px]">
          <SlidersHorizontal className="h-4.5 w-4.5 text-indigo-500" />
          <span>Analytics Filter Controls</span>
        </div>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-indigo-650 font-bold uppercase tracking-wider cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh Metrics</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        
        {/* Date Ranges */}
        <div>
          <label className="block text-slate-400 font-bold mb-1 uppercase tracking-wider text-[8px]">Start Date</label>
          <input
            type="date"
            name="startDate"
            value={filters.startDate}
            onChange={handleChange}
            className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-650 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-slate-400 font-bold mb-1 uppercase tracking-wider text-[8px]">End Date</label>
          <input
            type="date"
            name="endDate"
            value={filters.endDate}
            onChange={handleChange}
            className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-650 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Project Workspaces */}
        <div>
          <label className="block text-slate-400 font-bold mb-1 uppercase tracking-wider text-[8px]">Workspace Project</label>
          <select
            name="projectId"
            value={filters.projectId}
            onChange={handleChange}
            className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-650 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="">-- All Projects --</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        {/* Departments */}
        <div>
          <label className="block text-slate-400 font-bold mb-1 uppercase tracking-wider text-[8px]">Department</label>
          <select
            name="department"
            value={filters.department}
            onChange={handleChange}
            className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-650 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="">-- All Departments --</option>
            {departments.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        {/* Employees */}
        <div>
          <label className="block text-slate-400 font-bold mb-1 uppercase tracking-wider text-[8px]">Employee Member</label>
          <select
            name="employeeId"
            value={filters.employeeId}
            onChange={handleChange}
            className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-650 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="">-- All Employees --</option>
            {employees.map(e => (
              <option key={e.id} value={e.id}>{e.name}</option>
            ))}
          </select>
        </div>

        {/* Status / Priority */}
        <div>
          <label className="block text-slate-400 font-bold mb-1 uppercase tracking-wider text-[8px]">Task Priority</label>
          <select
            name="priority"
            value={filters.priority}
            onChange={handleChange}
            className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-650 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="">-- All Priorities --</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>
        </div>

      </div>
    </div>
  );
};

export default AnalyticsFilter;
