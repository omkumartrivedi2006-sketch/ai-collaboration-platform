import api from './api';

export const taskService = {
  async getTasks(params) {
    const response = await api.get('/tasks', { params });
    return response.data;
  },

  async getTask(id) {
    const response = await api.get(`/tasks/${id}`);
    return response.data.data;
  },

  async createTask(data) {
    const response = await api.post('/tasks', data);
    return response.data.data;
  },

  async updateTask(id, data) {
    const response = await api.put(`/tasks/${id}`, data);
    return response.data.data;
  },

  async deleteTask(id) {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
  },

  async updateTaskStatus(id, status) {
    const response = await api.patch(`/tasks/${id}/status`, { status });
    return response.data.data;
  },

  async updateTaskPriority(id, priority) {
    const response = await api.patch(`/tasks/${id}/priority`, { priority });
    return response.data.data;
  },

  async archiveTask(id) {
    const response = await api.patch(`/tasks/${id}/archive`);
    return response.data.data;
  },

  async restoreTask(id) {
    const response = await api.patch(`/tasks/${id}/restore`);
    return response.data.data;
  },

  async addComment(taskId, comment) {
    const response = await api.post(`/tasks/${taskId}/comments`, { comment });
    return response.data.data;
  },

  async updateComment(commentId, comment) {
    const response = await api.put(`/tasks/comments/${commentId}`, { comment });
    return response.data.data;
  },

  async deleteComment(commentId) {
    const response = await api.delete(`/tasks/comments/${commentId}`);
    return response.data;
  },

  async addAttachment(taskId, formData) {
    const response = await api.post(`/tasks/${taskId}/attachments`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data.data;
  },

  async deleteAttachment(attachmentId) {
    const response = await api.delete(`/tasks/attachments/${attachmentId}`);
    return response.data;
  },

  async getActivities(taskId) {
    const response = await api.get(`/tasks/${taskId}/activity`);
    return response.data.data;
  }
};

export default taskService;
