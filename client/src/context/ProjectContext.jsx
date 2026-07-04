import React, { createContext, useState, useContext, useCallback } from 'react';
import projectService from '../services/projectService';

const ProjectContext = createContext(null);

export const ProjectProvider = ({ children }) => {
  const [projects, setProjects] = useState([]);
  const [totalProjects, setTotalProjects] = useState(0);
  const [loading, setLoading] = useState(false);
  const [activeProject, setActiveProject] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    priority: '',
    managerId: '',
    isArchived: false,
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  const fetchProjects = useCallback(async (customParams = {}) => {
    setLoading(true);
    try {
      const mergedParams = { ...filters, ...customParams };
      const response = await projectService.getProjects(mergedParams);
      setProjects(response.projects || []);
      setTotalProjects(response.total || 0);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const updateFilters = (newFilters) => {
    setFilters((prev) => ({ 
      ...prev, 
      ...newFilters, 
      page: newFilters.page !== undefined ? newFilters.page : 1 
    }));
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      status: '',
      priority: '',
      managerId: '',
      isArchived: false,
      page: 1,
      limit: 10,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
  };

  const fetchProjectDetails = async (id) => {
    setLoading(true);
    try {
      const data = await projectService.getProject(id);
      setActiveProject(data.project);
      return data.project;
    } catch (error) {
      console.error('Failed to fetch project details:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (projectData) => {
    setLoading(true);
    try {
      const data = await projectService.createProject(projectData);
      await fetchProjects();
      return data.project;
    } finally {
      setLoading(false);
    }
  };

  const updateProjectDetails = async (id, projectData) => {
    try {
      const data = await projectService.updateProject(id, projectData);
      if (activeProject && activeProject.id === id) {
        setActiveProject(data.project);
      }
      await fetchProjects();
      return data.project;
    } catch (error) {
      console.error('Failed to update project:', error);
      throw error;
    }
  };

  const deleteProject = async (id) => {
    try {
      await projectService.deleteProject(id);
      await fetchProjects();
      if (activeProject && activeProject.id === id) {
        setActiveProject(null);
      }
    } catch (error) {
      console.error('Failed to delete project:', error);
      throw error;
    }
  };

  const archiveProject = async (id) => {
    try {
      const data = await projectService.archiveProject(id);
      await fetchProjects();
      if (activeProject && activeProject.id === id) {
        setActiveProject(data.project);
      }
    } catch (error) {
      console.error('Failed to archive project:', error);
      throw error;
    }
  };

  const restoreProject = async (id) => {
    try {
      const data = await projectService.restoreProject(id);
      await fetchProjects();
      if (activeProject && activeProject.id === id) {
        setActiveProject(data.project);
      }
    } catch (error) {
      console.error('Failed to restore project:', error);
      throw error;
    }
  };

  const addMember = async (projectId, userId) => {
    try {
      const data = await projectService.addMember(projectId, userId);
      await fetchProjectDetails(projectId);
      return data.member;
    } catch (error) {
      console.error('Failed to add member:', error);
      throw error;
    }
  };

  const removeMember = async (projectId, userId) => {
    try {
      await projectService.removeMember(projectId, userId);
      await fetchProjectDetails(projectId);
    } catch (error) {
      console.error('Failed to remove member:', error);
      throw error;
    }
  };

  const changeManager = async (projectId, managerId) => {
    try {
      const data = await projectService.changeManager(projectId, managerId);
      await fetchProjectDetails(projectId);
      await fetchProjects();
      return data.project;
    } catch (error) {
      console.error('Failed to change manager:', error);
      throw error;
    }
  };

  return (
    <ProjectContext.Provider
      value={{
        projects,
        totalProjects,
        loading,
        filters,
        activeProject,
        fetchProjects,
        fetchProjectDetails,
        createProject,
        updateProject: updateProjectDetails,
        deleteProject,
        archiveProject,
        restoreProject,
        addMember,
        removeMember,
        changeManager,
        updateFilters,
        resetFilters
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjects = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
};
export default useProjects;
