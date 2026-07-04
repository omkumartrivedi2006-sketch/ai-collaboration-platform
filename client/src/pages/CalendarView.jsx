import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import { useMeetings } from '../context/MeetingContext';
import Card from '../components/Card';
import Button from '../components/Button';
import Loader from '../components/Loader';
import Modal from '../components/Modal';
import MeetingForm from '../components/MeetingForm';
import { ArrowLeft, Plus } from 'lucide-react';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export const CalendarView = () => {
  const navigate = useNavigate();
  const { meetings, fetchMeetings, createMeeting } = useMeetings();

  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [loadingForm, setLoadingForm] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);

  useEffect(() => {
    fetchMeetings();
  }, [fetchMeetings]);

  const events = meetings.map((m) => ({
    id: m.id,
    title: m.title,
    start: new Date(m.startTime),
    end: new Date(m.endTime),
    resource: m
  }));

  const handleSelectSlot = ({ start, end }) => {
    setSelectedSlot({
      startTime: start.toISOString().slice(0, 16),
      endTime: end.toISOString().slice(0, 16)
    });
    setIsScheduleOpen(true);
  };

  const handleCreateMeeting = async (formData) => {
    setLoadingForm(true);
    try {
      await createMeeting(formData);
      setIsScheduleOpen(false);
      setSelectedSlot(null);
      fetchMeetings();
    } catch (e) {
      // Handled in context
    } finally {
      setLoadingForm(false);
    }
  };

  const eventStyleGetter = (event) => {
    const status = event.resource?.status;
    let backgroundColor = '#4f46e5'; // Default indigo-600
    
    if (status === 'LIVE') {
      backgroundColor = '#e11d48'; // Rose-600
    } else if (status === 'CANCELLED') {
      backgroundColor = '#94a3b8'; // Slate-400
    } else if (status === 'COMPLETED') {
      backgroundColor = '#64748b'; // Slate-500
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '6px',
        opacity: 0.9,
        color: 'white',
        border: '0px',
        display: 'block',
        fontSize: '11px',
        fontWeight: 'bold',
        padding: '2px 6px'
      }
    };
  };

  return (
    <div className="space-y-6 font-sans text-xs">
      
      {/* Header action panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/meetings')}
            className="p-1 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4.5 w-4.5 text-slate-500" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">Calendar</h2>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide mt-0.5">
              Visual scheduling & calendar tracking
            </p>
          </div>
        </div>

        <Button size="sm" onClick={() => setIsScheduleOpen(true)} className="cursor-pointer">
          <Plus className="h-4 w-4" />
          Schedule Meeting
        </Button>
      </div>

      {/* Main Calendar Viewport */}
      <Card className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
        <div className="h-[600px] text-slate-700">
          <BigCalendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            selectable
            onSelectSlot={handleSelectSlot}
            onDoubleClickEvent={(e) => navigate(`/meetings/${e.id}`)}
            onSelectEvent={(e) => navigate(`/meetings/${e.id}`)}
            eventPropGetter={eventStyleGetter}
            views={['month', 'week', 'day', 'agenda']}
            defaultView="month"
            popup
            style={{ fontFamily: 'inherit' }}
          />
        </div>
      </Card>

      {/* Schedule Modal */}
      <Modal
        isOpen={isScheduleOpen}
        onClose={() => {
          setIsScheduleOpen(false);
          setSelectedSlot(null);
        }}
        title="Schedule Calendar Meeting"
      >
        <MeetingForm
          initialData={selectedSlot}
          onSubmit={handleCreateMeeting}
          onCancel={() => {
            setIsScheduleOpen(false);
            setSelectedSlot(null);
          }}
          loading={loadingForm}
        />
      </Modal>

    </div>
  );
};

export default CalendarView;
