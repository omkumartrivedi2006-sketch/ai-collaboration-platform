import React, { useEffect, useState } from 'react';
import { useReports } from '../context/ReportsContext';
import useProjects from '../context/ProjectContext';
import api from '../services/api';
import Card from '../components/Card';
import Button from '../components/Button';
import Loader from '../components/Loader';
import MarkdownRenderer from '../components/MarkdownRenderer';
import { Sparkles, Download, FileText, ChevronDown, ChevronUp, Plus, Calendar, Users, Briefcase } from 'lucide-react';
import toast from 'react-hot-toast';

export const Reports = () => {
  const { reportsList, loading, fetchReportsList, generateNewReport, downloadReportFile } = useReports();
  const { projects, fetchProjects } = useProjects();
  const [employees, setEmployees] = useState([]);
  
  // Compiler state
  const [reportType, setReportType] = useState('WEEKLY');
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [startDate, setStartDate] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));
  
  const [expandedReportId, setExpandedReportId] = useState(null);
  const [compiling, setCompiling] = useState(false);

  useEffect(() => {
    fetchReportsList();
    if (projects.length === 0) {
      fetchProjects({ limit: 100 });
    }
    
    // Fetch users for selector
    api.get('/auth/users')
      .then(res => setEmployees(res.data.data.users || []))
      .catch(e => console.error(e));
  }, [fetchReportsList, projects.length, fetchProjects]);

  const handleCompile = async (e) => {
    e.preventDefault();
    setCompiling(true);
    try {
      const payload = {
        type: reportType,
        projectId: reportType === 'PROJECT' ? selectedProject : undefined,
        employeeId: reportType === 'EMPLOYEE' ? selectedEmployee : undefined,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString()
      };

      const newReport = await generateNewReport(payload);
      setExpandedReportId(newReport.id);
      
      // Clear form inputs
      setSelectedProject('');
      setSelectedEmployee('');
    } catch (e) {
      console.error(e);
    } finally {
      setCompiling(false);
    }
  };

  const handleExport = (reportId, format) => {
    downloadReportFile(reportId, format);
  };

  return (
    <div className="space-y-6 font-sans text-xs">
      
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">Enterprise Reporting Catalog</h2>
        <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide mt-0.5">
          Compile custom workspace, sprint portfolio, and team workload audit reports
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Report compiler form */}
        <div className="lg:col-span-1">
          <Card title="Compile Custom Report" subtitle="Select filters to compile analytical metrics">
            <form onSubmit={handleCompile} className="space-y-4">
              
              <div>
                <label className="block text-slate-400 font-bold mb-1 uppercase tracking-wider text-[8px]">Report Type</label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-650 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="WEEKLY">Weekly Workspace Summary</option>
                  <option value="MONTHLY">Monthly Workspace Summary</option>
                  <option value="ORGANIZATION">Organization Performance</option>
                  <option value="PROJECT">Project Health Report</option>
                  <option value="TEAM">Team Capacity Load Report</option>
                  <option value="EMPLOYEE">Employee Performance Audit</option>
                </select>
              </div>

              {/* Conditional project input */}
              {reportType === 'PROJECT' && (
                <div>
                  <label className="block text-slate-400 font-bold mb-1 uppercase tracking-wider text-[8px]">Select Project board</label>
                  <select
                    required
                    value={selectedProject}
                    onChange={(e) => setSelectedProject(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-650 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    <option value="">-- Choose Workspace Project --</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Conditional employee input */}
              {reportType === 'EMPLOYEE' && (
                <div>
                  <label className="block text-slate-400 font-bold mb-1 uppercase tracking-wider text-[8px]">Select Employee member</label>
                  <select
                    required
                    value={selectedEmployee}
                    onChange={(e) => setSelectedEmployee(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-650 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    <option value="">-- Choose Member --</option>
                    {employees.map(e => (
                      <option key={e.id} value={e.id}>{e.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Date pickers */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 font-bold mb-1 uppercase tracking-wider text-[8px]">Start date</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-655 font-semibold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1 uppercase tracking-wider text-[8px]">End date</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-655 font-semibold focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={compiling}
                  loading={compiling}
                  className="w-full cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Plus className="h-4 w-4" />
                  <span>{compiling ? 'Compiling statistics...' : 'Compile New Report'}</span>
                </Button>
              </div>

            </form>
          </Card>
        </div>

        {/* Right Column: Historical reports catalog */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-extrabold text-slate-805 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
            <FileText className="h-4.5 w-4.5 text-indigo-500" />
            Historical Compiled Reports Catalog ({reportsList.length})
          </h3>

          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
            {reportsList.map((report) => {
              const isExpanded = report.id === expandedReportId;
              return (
                <div key={report.id} className="bg-white border border-slate-200 rounded-xl p-4 space-y-2 hover:border-slate-350 transition-colors">
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1 cursor-pointer flex-1 min-w-0" onClick={() => setExpandedReportId(isExpanded ? null : report.id)}>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="bg-indigo-50 border border-indigo-150 text-indigo-650 text-[8px] font-bold uppercase px-1.5 py-0.5 rounded">
                          {report.type}
                        </span>
                        {report.project && (
                          <span className="bg-slate-100 border border-slate-200 text-slate-550 text-[8px] font-bold uppercase px-1.5 py-0.5 rounded">
                            {report.project.code}
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-slate-800 text-xs truncate hover:text-indigo-650 transition-colors">{report.title}</h4>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                        Compiled on {new Date(report.createdAt).toLocaleString()} {report.creator && `by ${report.creator.name}`}
                      </p>
                    </div>

                    <button
                      onClick={() => setExpandedReportId(isExpanded ? null : report.id)}
                      className="p-1 text-slate-400 hover:text-slate-650 cursor-pointer"
                    >
                      {isExpanded ? <ChevronUp className="h-4.5 w-4.5" /> : <ChevronDown className="h-4.5 w-4.5" />}
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-slate-100 mt-3 pt-3 space-y-4">
                      {/* Exports buttons */}
                      <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-2 flex-wrap">
                        <span className="text-[10px] text-slate-405 font-bold uppercase tracking-wider mr-1">Download Export:</span>
                        <button
                          onClick={() => handleExport(report.id, 'csv')}
                          className="cursor-pointer bg-slate-50 border border-slate-200 hover:border-slate-350 px-2.5 py-1 rounded text-[9px] font-bold text-slate-700 inline-flex items-center gap-1 hover:bg-slate-100"
                        >
                          <Download className="h-3 w-3" />
                          CSV Data
                        </button>
                        <button
                          onClick={() => handleExport(report.id, 'excel')}
                          className="cursor-pointer bg-slate-50 border border-slate-200 hover:border-slate-350 px-2.5 py-1 rounded text-[9px] font-bold text-slate-700 inline-flex items-center gap-1 hover:bg-slate-100"
                        >
                          <Download className="h-3 w-3" />
                          Excel Tabular
                        </button>
                        <button
                          onClick={() => handleExport(report.id, 'pdf')}
                          className="cursor-pointer bg-slate-50 border border-slate-200 hover:border-slate-350 px-2.5 py-1 rounded text-[9px] font-bold text-slate-700 inline-flex items-center gap-1 hover:bg-slate-100"
                        >
                          <Download className="h-3 w-3" />
                          PDF/Print
                        </button>
                      </div>

                      {/* Display Markdown */}
                      <MarkdownRenderer content={report.content} />
                    </div>
                  )}
                </div>
              );
            })}

            {reportsList.length === 0 && !loading && (
              <div className="text-center py-16 border border-dashed border-slate-200 rounded-xl bg-slate-50/20 font-bold text-slate-400 italic">
                No reports compiled in this workspace yet.
              </div>
            )}

            {loading && <Loader size="sm" message="Fetching reports..." />}
          </div>
        </div>

      </div>

    </div>
  );
};

export default Reports;
