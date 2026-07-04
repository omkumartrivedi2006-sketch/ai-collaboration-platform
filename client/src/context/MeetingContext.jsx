import React, { createContext, useState, useContext, useCallback } from 'react';
import meetingService from '../services/meetingService';
import toast from 'react-hot-toast';

const MeetingContext = createContext(null);

export const MeetingProvider = ({ children }) => {
  const [meetings, setMeetings] = useState([]);
  const [activeMeeting, setActiveMeeting] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchMeetings = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const data = await meetingService.getMeetings(params);
      setMeetings(data.meetings || []);
      return data.meetings;
    } catch (error) {
      console.error('Failed to load meetings:', error);
      toast.error('Failed to load meetings list');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMeetingDetails = useCallback(async (id) => {
    setLoading(true);
    try {
      const data = await meetingService.getMeeting(id);
      setActiveMeeting(data.meeting);
      return data.meeting;
    } catch (error) {
      console.error('Failed to load meeting details:', error);
      toast.error('Failed to load meeting details');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const createMeeting = async (data) => {
    try {
      const newMeeting = await meetingService.createMeeting(data);
      setMeetings((prev) => [...prev, newMeeting]);
      toast.success('Meeting scheduled successfully');
      return newMeeting;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to schedule meeting';
      toast.error(msg);
      throw error;
    }
  };

  const updateMeeting = async (id, data) => {
    try {
      const updated = await meetingService.updateMeeting(id, data);
      setMeetings((prev) => prev.map((m) => (m.id === id ? updated : m)));
      if (activeMeeting && activeMeeting.id === id) {
        setActiveMeeting(updated);
      }
      toast.success('Meeting updated successfully');
      return updated;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to update meeting';
      toast.error(msg);
      throw error;
    }
  };

  const cancelMeeting = async (id) => {
    try {
      const cancelled = await meetingService.cancelMeeting(id);
      setMeetings((prev) => prev.map((m) => (m.id === id ? cancelled : m)));
      if (activeMeeting && activeMeeting.id === id) {
        setActiveMeeting(cancelled);
      }
      toast.success('Meeting cancelled');
      return cancelled;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel meeting');
      throw error;
    }
  };

  const deleteMeeting = async (id) => {
    try {
      await meetingService.deleteMeeting(id);
      setMeetings((prev) => prev.filter((m) => m.id !== id));
      if (activeMeeting && activeMeeting.id === id) {
        setActiveMeeting(null);
      }
      toast.success('Meeting deleted');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete meeting');
      throw error;
    }
  };

  const duplicateMeeting = async (id) => {
    try {
      const duplicated = await meetingService.duplicateMeeting(id);
      setMeetings((prev) => [...prev, duplicated]);
      toast.success('Meeting duplicated');
      return duplicated;
    } catch (error) {
      toast.error('Failed to duplicate meeting');
      throw error;
    }
  };

  const inviteMembers = async (id, invitedUserIds) => {
    try {
      await meetingService.inviteMembers(id, invitedUserIds);
      toast.success('Invitations dispatched');
      fetchMeetingDetails(id);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to dispatch invitations');
      throw error;
    }
  };

  const respondInvitation = async (id, response) => {
    try {
      const participant = await meetingService.respondInvitation(id, response);
      toast.success(`Invitation ${response === 'ACCEPT' ? 'accepted' : 'declined'}`);
      return participant;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit response');
      throw error;
    }
  };

  const joinMeeting = async (id) => {
    try {
      const participant = await meetingService.joinMeeting(id);
      return participant;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to join video conference');
      throw error;
    }
  };

  const leaveMeeting = async (id) => {
    try {
      const participant = await meetingService.leaveMeeting(id);
      return participant;
    } catch (error) {
      console.error('Failed to record leave status:', error);
    }
  };

  return (
    <MeetingContext.Provider
      value={{
        meetings,
        activeMeeting,
        loading,
        fetchMeetings,
        fetchMeetingDetails,
        createMeeting,
        updateMeeting,
        cancelMeeting,
        deleteMeeting,
        duplicateMeeting,
        inviteMembers,
        respondInvitation,
        joinMeeting,
        leaveMeeting
      }}
    >
      {children}
    </MeetingContext.Provider>
  );
};

export const useMeetings = () => {
  const context = useContext(MeetingContext);
  if (!context) {
    throw new Error('useMeetings must be used within a MeetingProvider');
  }
  return context;
};

export default MeetingContext;
