import api from './api';

export const aiService = {
  async chat(conversationId, message) {
    const response = await api.post('/ai/chat', { conversationId, message });
    return response.data.data;
  },

  async summarizeMeeting(meetingId) {
    const response = await api.post('/ai/summarize-meeting', { meetingId });
    return response.data.data;
  },

  async generateTasks(summaryOrText) {
    const response = await api.post('/ai/generate-tasks', { summaryOrText });
    return response.data.data;
  },

  async projectReport(projectId, reportType) {
    const response = await api.post('/ai/project-report', { projectId, reportType });
    return response.data.data;
  },

  async translate(text, targetLanguage) {
    const response = await api.post('/ai/translate', { text, targetLanguage });
    return response.data.data;
  },

  async documentSummary(content, filename) {
    const response = await api.post('/ai/document-summary', { content, filename });
    return response.data.data;
  },

  async getConversations() {
    const response = await api.get('/ai/conversations');
    return response.data.data;
  },

  async getConversationMessages(conversationId) {
    const response = await api.get(`/ai/conversations/${conversationId}/messages`);
    return response.data.data;
  },

  async getReports() {
    const response = await api.get('/ai/reports');
    return response.data.data;
  }
};

export default aiService;
