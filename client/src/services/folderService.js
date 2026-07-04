import api from './api';

export const folderService = {
  async getFolderContents(id, projectId) {
    const url = id && id !== 'root' ? `/folders/${id}/contents` : '/folders/contents';
    const params = {};
    if (projectId) params.projectId = projectId;
    const response = await api.get(url, { params });
    return response.data.data;
  },

  async getFolderTree(projectId) {
    const params = {};
    if (projectId) params.projectId = projectId;
    const response = await api.get('/folders/tree', { params });
    return response.data.data.folders;
  },

  async createFolder(data) {
    const response = await api.post('/folders', data);
    return response.data.data.folder;
  },

  async renameFolder(id, name) {
    const response = await api.put(`/folders/${id}`, { name });
    return response.data.data.folder;
  },

  async deleteFolder(id) {
    const response = await api.delete(`/folders/${id}`);
    return response.data;
  }
};

export default folderService;
