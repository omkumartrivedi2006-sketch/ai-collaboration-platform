import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { useMeetings } from '../context/MeetingContext';
import MeetingHeader from '../components/MeetingHeader';
import ParticipantList from '../components/ParticipantList';
import MeetingTimeline from '../components/MeetingTimeline';
import MeetingForm from '../components/MeetingForm';
import Card from '../components/Card';
import Modal from '../components/Modal';
import Button from '../components/Button';
import Loader from '../components/Loader';
import { FileText, Save, Video, ArrowLeft } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

export const MeetingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    activeMeeting,
    loading,
    fetchMeetingDetails,
    updateMeeting,
    cancelMeeting,
    deleteMeeting,
    duplicateMeeting
  } = useMeetings();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [meetingNotes, setMeetingNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  useEffect(() => {
    fetchMeetingDetails(id).then((m) => {
      setMeetingNotes(m.notes || '');
    });
  }, [id, fetchMeetingDetails]);

  if (loading || !activeMeeting) {
    return <Loader size="lg" fullPage />;
  }

  const isOrganizer = activeMeeting.organizerId === user?.id;
  const isHost = activeMeeting.participants?.some(
    (p) => p.userId === user?.id && p.role === 'HOST'
  );
  const canModify = isOrganizer || isHost || user?.role === 'Admin';

  const handleUpdate = async (formData) => {
    try {
      await updateMeeting(id, formData);
      setIsEditOpen(false);
      fetchMeetingDetails(id);
    } catch (e) {}
  };

  const handleCancel = async () => {
    if (window.confirm('Are you sure you want to cancel this meeting?')) {
      try {
        await cancelMeeting(id);
        fetchMeetingDetails(id);
      } catch (e) {}
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this meeting? This cannot be undone.')) {
      try {
        await deleteMeeting(id);
        navigate('/meetings');
      } catch (e) {}
    }
  };

  const handleDuplicate = async () => {
    try {
      const duplicated = await duplicateMeeting(id);
      navigate(`/meetings/${duplicated.id}`);
    } catch (e) {}
  };

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    try {
      await updateMeeting(id, { notes: meetingNotes });
      toast.success('Meeting notes saved successfully');
    } catch (e) {
      toast.error('Failed to save notes');
    } finally {
      setSavingNotes(false);
    }
  };

  return (
    <div className="space-y-6 font-sans text-xs">
      
      {/* Back link */}
      <div>
        <button
          onClick={() => navigate('/meetings')}
          className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase tracking-wider hover:text-indigo-600 cursor-pointer"
        >
          <ArrowLeft className="h-4.5 w-4.5" />
          <span>Back to Planner</span>
        </button>
      </div>

      {/* Header Actions */}
      <MeetingHeader
        meeting={activeMeeting}
        onEdit={() => setIsEditOpen(true)}
        onDuplicate={handleDuplicate}
        onCancel={handleCancel}
        onDelete={handleDelete}
        canModify={canModify}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column: Overview, notes, Jitsi Join banner */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Quick conference join Card */}
          <Card className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-none text-white p-5">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1.5 text-center sm:text-left">
                <h3 className="font-extrabold text-sm tracking-tight text-white flex items-center gap-1.5 justify-center sm:justify-start">
                  <Video className="h-5 w-5 text-indigo-400" />
                  <span>Jitsi Meet External Room</span>
                </h3>
                <p className="text-[10px] text-slate-300 font-semibold uppercase tracking-wider">
                  Secure HD enterprise room encrypted with Jitsi externe SDK
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => navigate(`/meetings/${activeMeeting.id}/join`)}
                className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-750 text-white font-bold cursor-pointer inline-flex items-center justify-center gap-1.5"
              >
                <Video className="h-4 w-4" />
                <span>Join Conference Now</span>
              </Button>
            </div>
          </Card>

          {/* Description details */}
          <Card title="Meeting Agenda" subtitle="Description of issues under sync">
            <p className="text-slate-600 font-semibold leading-relaxed whitespace-pre-wrap">
              {activeMeeting.description || 'No agenda details provided.'}
            </p>
          </Card>

          {/* Notes Editor */}
          <Card
            title="Meeting Notes"
            subtitle="Minutes and key decisions"
            headerActions={
              canModify && (
                <Button size="xs" onClick={handleSaveNotes} loading={savingNotes} className="cursor-pointer">
                  <Save className="h-3.5 w-3.5" /> Save Notes
                </Button>
              )
            }
          >
            <div className="space-y-2">
              {canModify ? (
                <textarea
                  rows={8}
                  value={meetingNotes}
                  onChange={(e) => setMeetingNotes(e.target.value)}
                  placeholder="Summarize minutes, action items, or assignees..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              ) : (
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 min-h-[150px] whitespace-pre-wrap text-slate-650 font-medium">
                  {activeMeeting.notes || 'No meeting notes taken yet.'}
                </div>
              )}
            </div>
          </Card>

        </div>

        {/* Right column: attendees & timelines */}
        <div className="space-y-6">
          <ParticipantList participants={activeMeeting.participants} />
          
          <MeetingTimeline meeting={activeMeeting} />
        </div>

      </div>

      {/* Edit Meeting modal */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Modify Meeting Settings">
        <MeetingForm
          initialData={activeMeeting}
          onSubmit={handleUpdate}
          onCancel={() => setIsEditOpen(false)}
        />
      </Modal>

    </div>
  );
};

export default MeetingDetails;
