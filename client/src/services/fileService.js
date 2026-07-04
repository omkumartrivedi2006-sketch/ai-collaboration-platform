import api from './api';

export const fileService = {
  async getFiles(params) {
    const response = await api.get('/files', { params });
    return response.data.data;
  },

  async getFile(id) {
    const response = await api.get(`/files/${id}`);
    return response.data.data.file;
  },

  async uploadFile(formData, onUploadProgress) {
    const response = await api.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress
    });
    return response.data.data.file;
  },

  async replaceFile(id, formData, onUploadProgress) {
    const response = await api.put(`/files/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress
    });
    return response.data.data.file;
  },

  async renameFile(id, name) {
    const response = await api.put(`/files/${id}`, { name });
    return response.data.data.file;
  },

  async moveFile(id, folderId) {
    const response = await api.patch(`/files/${id}/move`, { folderId });
    return response.data.data.file;
  },

  async copyFile(id, folderId) {
    const response = await api.post(`/files/${id}/copy`, { folderId });
    return response.data.data.file;
  },

  async deleteFile(id) {
    const response = await api.delete(`/files/${id}`);
    return response.data;
  },

  async restoreFile(id) {
    const response = await api.patch(`/files/${id}/restore`);
    return response.data.data.file;
  },

  async getVersions(id) {
    const response = await api.get(`/files/${id}/versions`);
    return response.data.data.versions;
  },

  async revertVersion(id, versionId) {
    const response = await api.post(`/files/${id}/versions/${versionId}/revert`);
    return response.data.data.file;
  },

  async getPermissions(id) {
    const response = await api.get(`/files/${id}/permissions`);
    return response.data.data.permissions;
  },

  async grantPermission(id, targetUserId, permission) {
    const response = await api.post(`/files/${id}/permissions`, { targetUserId, permission });
    return response.data.data.permission;
  },

  async revokePermission(id, targetUserId) {
    const response = await api.delete(`/files/${id}/permissions/${targetUserId}`);
    return response.data;
  },

  async getStorageUsage() {
    const response = await api.get('/files/storage-usage');
    return response.data.data.size;
  },

  getDownloadUrl(id) {
    const baseUrl = api.defaults.baseURL || 'http://localhost:5000/api';
    return `${baseUrl}/files/${id}/download`;
  }
};

export default fileService;
