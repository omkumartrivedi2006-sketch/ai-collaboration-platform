import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LayoutGrid, List, Plus } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import useProjects from '../context/ProjectContext';
import Button from '../components/Button';
import SearchBox from '../components/SearchBox';
import FilterPanel from '../components/FilterPanel';
import ProjectTable from '../components/ProjectTable';
import ProjectCard from '../components/ProjectCard';
import Pagination from '../components/Pagination';
import Loader from '../components/Loader';
import toast from 'react-hot-toast';

const ProjectsList = () => {
  const { user } = useAuth();
  const {
    projects,
    totalProjects,
    loading,
    filters,
    fetchProjects,
    updateFilters,
    resetFilters,
    archiveProject,
    restoreProject,
    deleteProject
  } = useProjects();

  const [viewMode, setViewMode] = useState('table');

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects, filters.page, filters.status, filters.priority, filters.isArchived, filters.managerId]);

  const handleSearch = (searchTerm) => {
    updateFilters({ search: searchTerm });
  };

  const handleFilterChange = (newFilters) => {
    updateFilters(newFilters);
  };

  const handlePageChange = (newPage) => {
    updateFilters({ page: newPage });
  };

  const handleArchive = async (id) => {
    try {
      await archiveProject(id);
      toast.success('Project archived successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to archive project');
    }
  };

  const handleRestore = async (id) => {
    try {
      await restoreProject(id);
      toast.success('Project restored successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to restore project');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteProject(id);
      toast.success('Project deleted permanently');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete project');
    }
  };

  const canCreate = user?.role === 'Admin' || user?.role === 'Manager';

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Projects</h2>
          <p className="text-xs text-slate-400 font-semibold">Manage and collaborate on workspace projects</p>
        </div>
        {canCreate && (
          <Link to="/projects/create">
            <Button size="sm" className="flex items-center gap-1.5 self-start">
              <Plus className="h-4 w-4" /> Create Project
            </Button>
          </Link>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 border border-slate-100 rounded-xl shadow-xs">
        <SearchBox value={filters.search} onChange={handleSearch} placeholder="Search project by name or code..." />
        
        <div className="flex items-center gap-2 border border-slate-100 rounded-lg p-1 bg-slate-50/50 self-start sm:self-auto">
          <button
            onClick={() => setViewMode('table')}
            className={`p-1.5 rounded-md cursor-pointer transition-colors ${
              viewMode === 'table' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-400 hover:text-slate-650'
            }`}
          >
            <List className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-md cursor-pointer transition-colors ${
              viewMode === 'grid' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-400 hover:text-slate-650'
            }`}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
        </div>
      </div>

      <FilterPanel filters={filters} onChange={handleFilterChange} onReset={resetFilters} />

      {loading ? (
        <Loader size="lg" />
      ) : viewMode === 'table' ? (
        <ProjectTable
          projects={projects}
          onArchive={handleArchive}
          onRestore={handleRestore}
          onDelete={handleDelete}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onArchive={handleArchive}
              onRestore={handleRestore}
              onDelete={handleDelete}
            />
          ))}
          {projects.length === 0 && (
            <div className="col-span-full text-center py-12 text-sm text-slate-400 font-semibold italic">
              No projects found matching the criteria.
            </div>
          )}
        </div>
      )}

      <Pagination
        page={filters.page}
        limit={filters.limit}
        total={totalProjects}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default ProjectsList;
