import api from './api';

export const projectService = {
  async getProjects(params) {
    const response = await api.get('/projects', { params });
    return response.data;
  },

  async getProject(id) {
    const response = await api.get(`/projects/${id}`);
    return response.data.data;
  },

  async createProject(data) {
    const response = await api.post('/projects', data);
    return response.data.data;
  },

  async updateProject(id, data) {
    const response = await api.put(`/projects/${id}`, data);
    return response.data.data;
  },

  async deleteProject(id) {
    const response = await api.delete(`/projects/${id}`);
    return response.data;
  },

  async archiveProject(id) {
    const response = await api.patch(`/projects/archive/${id}`);
    return response.data.data;
  },

  async restoreProject(id) {
    const response = await api.patch(`/projects/restore/${id}`);
    return response.data.data;
  },

  async addMember(projectId, userId) {
    const response = await api.post(`/projects/${projectId}/members`, { userId });
    return response.data.data;
  },

  async removeMember(projectId, userId) {
    const response = await api.delete(`/projects/${projectId}/members/${userId}`);
    return response.data;
  },

  async changeManager(projectId, managerId) {
    const response = await api.patch(`/projects/${projectId}/manager`, { managerId });
    return response.data.data;
  },

  async getMembers(projectId) {
    const response = await api.get(`/projects/${projectId}/members`);
    return response.data.data;
  },

  async getActivities(projectId) {
    const response = await api.get(`/projects/${projectId}/activity`);
    return response.data.data;
  }
};
export default projectService;
