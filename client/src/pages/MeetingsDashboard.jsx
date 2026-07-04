import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { useMeetings } from '../context/MeetingContext';
import MeetingCard from '../components/MeetingCard';
import MeetingForm from '../components/MeetingForm';
import Card from '../components/Card';
import Button from '../components/Button';
import Modal from '../components/Modal';
import { Calendar, Video, Plus, SlidersHorizontal, Grid, Search } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

export const MeetingsDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { meetings, fetchMeetings, createMeeting, respondInvitation } = useMeetings();

  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [loadingForm, setLoadingForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchMeetings();
  }, [fetchMeetings]);

  const handleCreateMeeting = async (formData) => {
    setLoadingForm(true);
    try {
      await createMeeting(formData);
      setIsScheduleOpen(false);
      fetchMeetings();
    } catch (e) {
      // toast is dispatched inside context
    } finally {
      setLoadingForm(false);
    }
  };

  const handleRespond = async (meetingId, response) => {
    try {
      await respondInvitation(meetingId, response);
      fetchMeetings();
    } catch (e) {}
  };

  const filteredMeetings = meetings.filter((m) => {
    const matchesStatus = filterStatus ? m.status === filterStatus : true;
    const matchesSearch = searchQuery
      ? m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.description?.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    return matchesStatus && matchesSearch;
  });

  const today = new Date().toDateString();
  const todaysMeetingsList = filteredMeetings.filter(
    (m) => new Date(m.startTime).toDateString() === today && m.status !== 'CANCELLED'
  );
  
  const upcomingMeetingsList = filteredMeetings.filter(
    (m) => new Date(m.startTime) > new Date() && m.status === 'SCHEDULED'
  );

  const pastMeetingsList = filteredMeetings.filter(
    (m) => new Date(m.endTime) < new Date() || m.status === 'COMPLETED'
  );

  const invitationsList = meetings.filter((m) => {
    const part = m.participants?.find((p) => p.userId === user?.id);
    return part && part.attendanceStatus === 'INVITED' && m.status === 'SCHEDULED';
  });

  return (
    <div className="space-y-6 font-sans text-xs">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Meetings Planner</h2>
          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide mt-0.5">
            Schedule and manage video conferences & syncs
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/meetings/calendar"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 hover:border-slate-350 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-lg transition-colors cursor-pointer decoration-none"
          >
            <Calendar className="h-4 w-4 text-indigo-500" />
            Calendar View
          </Link>
          <Button size="sm" onClick={() => setIsScheduleOpen(true)} className="cursor-pointer">
            <Plus className="h-4 w-4" />
            Schedule Meeting
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Drive Area: Today's Syncs & Upcoming */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Filters Bar */}
          <Card>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex-1 max-w-sm relative">
                <input
                  type="text"
                  placeholder="Search meetings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Status:</span>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="">All</option>
                  <option value="SCHEDULED">Scheduled</option>
                  <option value="LIVE">Live</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Today's Meetings */}
          <div className="space-y-3">
            <h3 className="font-extrabold text-slate-800 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
              <Video className="h-4 w-4 text-indigo-500" />
              Today's Schedule ({todaysMeetingsList.length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {todaysMeetingsList.map((meeting) => (
                <MeetingCard key={meeting.id} meeting={meeting} />
              ))}
              {todaysMeetingsList.length === 0 && (
                <div className="text-center py-10 border border-dashed border-slate-200 rounded-xl bg-slate-50/20 col-span-full font-bold text-slate-450 italic">
                  No meetings scheduled for today.
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Meetings */}
          <div className="space-y-3">
            <h3 className="font-extrabold text-slate-800 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-indigo-500" />
              Upcoming Syncs ({upcomingMeetingsList.length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {upcomingMeetingsList.map((meeting) => (
                <MeetingCard key={meeting.id} meeting={meeting} />
              ))}
              {upcomingMeetingsList.length === 0 && (
                <div className="text-center py-10 border border-dashed border-slate-200 rounded-xl bg-slate-50/20 col-span-full font-bold text-slate-450 italic">
                  No upcoming meetings.
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right column: invitations & past meetings */}
        <div className="space-y-6">
          
          {/* Pending Invitations */}
          <Card title="Meeting Invitations" subtitle="Accept or decline sync requests">
            <div className="space-y-3">
              {invitationsList.map((m) => (
                <div key={m.id} className="flex flex-col gap-2 p-3 border border-slate-100 rounded-xl bg-slate-50/30">
                  <div className="min-w-0">
                    <Link to={`/meetings/${m.id}`} className="font-bold text-slate-850 hover:text-indigo-650 truncate block hover:underline">
                      {m.title}
                    </Link>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                      {new Date(m.startTime).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2 justify-end mt-1">
                    <button
                      onClick={() => handleRespond(m.id, 'DECLINE')}
                      className="px-3 py-1 bg-white hover:bg-rose-50 border border-slate-200 text-rose-600 font-bold rounded-lg cursor-pointer transition-colors"
                    >
                      Decline
                    </button>
                    <button
                      onClick={() => handleRespond(m.id, 'ACCEPT')}
                      className="px-3 py-1 bg-indigo-650 hover:bg-indigo-750 text-white font-bold rounded-lg cursor-pointer transition-colors"
                    >
                      Accept
                    </button>
                  </div>
                </div>
              ))}
              {invitationsList.length === 0 && (
                <p className="text-center py-6 text-slate-400 italic font-semibold">No pending invitations.</p>
              )}
            </div>
          </Card>

          {/* Past Meetings List */}
          <Card title="Past Meetings" subtitle="Summary of completed video syncs">
            <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
              {pastMeetingsList.map((m) => (
                <div key={m.id} className="py-2.5 first:pt-0 last:pb-0">
                  <Link to={`/meetings/${m.id}`} className="font-bold text-slate-850 hover:text-indigo-650 truncate block hover:underline">
                    {m.title}
                  </Link>
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5 block">
                    {new Date(m.startTime).toLocaleDateString()} • completed
                  </span>
                </div>
              ))}
              {pastMeetingsList.length === 0 && (
                <p className="text-center py-6 text-slate-450 italic font-semibold">No past meetings recorded.</p>
              )}
            </div>
          </Card>

        </div>
      </div>

      {/* Schedule Meeting Modal */}
      <Modal isOpen={isScheduleOpen} onClose={() => setIsScheduleOpen(false)} title="Schedule Enterprise Meeting">
        <MeetingForm
          onSubmit={handleCreateMeeting}
          onCancel={() => setIsScheduleOpen(false)}
          loading={loadingForm}
        />
      </Modal>

    </div>
  );
};

export default MeetingsDashboard;
