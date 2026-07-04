import api from './api';

export const meetingService = {
  async getMeetings(params) {
    const response = await api.get('/meetings', { params });
    return response.data.data;
  },

  async getMeeting(id) {
    const response = await api.get(`/meetings/${id}`);
    return response.data.data;
  },

  async createMeeting(data) {
    const response = await api.post('/meetings', data);
    return response.data.data;
  },

  async updateMeeting(id, data) {
    const response = await api.put(`/meetings/${id}`, data);
    return response.data.data;
  },

  async deleteMeeting(id) {
    const response = await api.delete(`/meetings/${id}`);
    return response.data;
  },

  async cancelMeeting(id) {
    const response = await api.patch(`/meetings/${id}/cancel`);
    return response.data.data;
  },

  async inviteMembers(id, invitedUserIds) {
    const response = await api.post(`/meetings/${id}/invite`, { invitedUserIds });
    return response.data;
  },

  async respondInvitation(id, response) {
    const responseData = await api.patch(`/meetings/${id}/respond`, { response });
    return responseData.data.data;
  },

  async joinMeeting(id) {
    const response = await api.patch(`/meetings/${id}/join`);
    return response.data.data;
  },

  async leaveMeeting(id) {
    const response = await api.patch(`/meetings/${id}/leave`);
    return response.data.data;
  },

  async duplicateMeeting(id) {
    const response = await api.post(`/meetings/${id}/duplicate`);
    return response.data.data;
  }
};

export default meetingService;
