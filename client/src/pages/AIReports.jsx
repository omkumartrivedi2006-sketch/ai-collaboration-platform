import React, { useEffect, useState } from 'react';
import { useAI } from '../context/AIContext';
import useProjects from '../context/ProjectContext';
import ReportCard from '../components/ReportCard';
import Card from '../components/Card';
import Button from '../components/Button';
import Loader from '../components/Loader';
import { Brain, Sparkles, FolderGit2 } from 'lucide-react';

export const AIReports = () => {
  const { reports, loading, fetchReports, generateReportAI } = useAI();
  const { projects, fetchProjects } = useProjects();

  const [selectedProject, setSelectedProject] = useState('');
  const [reportType, setReportType] = useState('PROJECT');
  const [compiling, setCompiling] = useState(false);

  useEffect(() => {
    fetchReports();
    if (projects.length === 0) {
      fetchProjects({ limit: 100 });
    }
  }, [fetchReports, projects.length, fetchProjects]);

  const handleCompile = async (e) => {
    e.preventDefault();
    if (!selectedProject) return;

    setCompiling(true);
    try {
      await generateReportAI(selectedProject, reportType);
      fetchReports();
      setSelectedProject('');
    } catch (e) {
      console.error(e);
    } finally {
      setCompiling(false);
    }
  };

  return (
    <div className="space-y-6 font-sans text-xs">
      
      {/* Header section */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">AI Reports Dashboard</h2>
        <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide mt-0.5">
          Generate and review project status, health analysis, and sprint reports
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column: reports compiler form */}
        <div className="lg:col-span-1">
          <Card title="Compile AI Report" subtitle="Analyze sprint data and workspace metrics">
            <form onSubmit={handleCompile} className="space-y-4">
              
              <div>
                <label className="block text-slate-500 font-bold mb-1.5 uppercase tracking-wider">Select Project Workspace</label>
                <select
                  required
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="">-- Choose Project Workspace --</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-500 font-bold mb-1.5 uppercase tracking-wider">Report Format / Focus</label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="PROJECT">Project Health Summary</option>
                  <option value="SPRINT">Sprint Progress & Estimation</option>
                  <option value="TASK">Task Audit Roadblock Checklist</option>
                </select>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={compiling || !selectedProject}
                  loading={compiling}
                  className="w-full cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Brain className="h-4 w-4" />
                  <span>Compile AI Report</span>
                </Button>
              </div>

            </form>
          </Card>
        </div>

        {/* Right column: Generated reports list */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-extrabold text-slate-805 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-indigo-500" />
            Historical Compiled Reports ({reports.length})
          </h3>

          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
            {reports.map((report) => (
              <ReportCard key={report.id} report={report} />
            ))}
            {reports.length === 0 && !loading && (
              <div className="text-center py-12 border border-dashed border-slate-200 rounded-xl bg-slate-50/20 font-bold text-slate-400 italic">
                No reports compiled yet.
              </div>
            )}
            {loading && (
              <Loader size="sm" message="Loading reports..." />
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default AIReports;
