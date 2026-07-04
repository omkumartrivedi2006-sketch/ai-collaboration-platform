import React from 'react';
import { Video, Calendar, Clock, Copy, Trash2, Edit2, AlertCircle } from 'lucide-react';
import QuickJoinButton from './QuickJoinButton';
import Button from './Button';

export const MeetingHeader = ({ meeting, onEdit, onDuplicate, onCancel, onDelete, canModify }) => {
  const isScheduled = meeting.status === 'SCHEDULED';
  const isLive = meeting.status === 'LIVE';

  const statusStyles = {
    SCHEDULED: 'bg-blue-50 text-blue-700 border-blue-200',
    LIVE: 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse',
    COMPLETED: 'bg-slate-50 text-slate-500 border-slate-200',
    CANCELLED: 'bg-gray-50 text-gray-400 border-gray-200'
  };

  return (
    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-slate-100 pb-5 font-sans">
      <div className="space-y-1.5">
        <div className="flex items-center gap-3 flex-wrap">
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">{meeting.title}</h2>
          <span className={`px-2 py-0.5 rounded border text-[9px] font-bold uppercase tracking-wider ${statusStyles[meeting.status]}`}>
            {meeting.status}
          </span>
          {meeting.project && (
            <span className="bg-indigo-50 text-indigo-750 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border border-indigo-100">
              Proj: {meeting.project.name} ({meeting.project.code})
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-4 text-slate-400 font-semibold text-[10px] uppercase tracking-wider">
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5 text-indigo-500" />
            {new Date(meeting.startTime).toLocaleDateString()}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-indigo-500" />
            {new Date(meeting.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(meeting.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          <span>Timezone: {meeting.timezone}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <QuickJoinButton meetingId={meeting.id} status={meeting.status} />

        {canModify && (
          <>
            {isScheduled && (
              <Button size="xs" variant="ghost" onClick={onEdit} className="cursor-pointer">
                <Edit2 className="h-3.5 w-3.5" /> Edit
              </Button>
            )}
            <Button size="xs" variant="ghost" onClick={onDuplicate} className="cursor-pointer">
              <Copy className="h-3.5 w-3.5" /> Duplicate
            </Button>
            {(isScheduled || isLive) && (
              <Button size="xs" variant="ghost" className="text-amber-600 hover:text-amber-700 cursor-pointer" onClick={onCancel}>
                <AlertCircle className="h-3.5 w-3.5" /> Cancel
              </Button>
            )}
            <Button size="xs" variant="ghost" className="text-rose-600 hover:text-rose-700 cursor-pointer" onClick={onDelete}>
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default MeetingHeader;
