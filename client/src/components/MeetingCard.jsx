import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock } from 'lucide-react';
import Avatar from './Avatar';
import QuickJoinButton from './QuickJoinButton';

export const MeetingCard = ({ meeting }) => {
  const navigate = useNavigate();

  const statusStyles = {
    SCHEDULED: 'bg-blue-50 text-blue-700 border-blue-200',
    LIVE: 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse',
    COMPLETED: 'bg-slate-50 text-slate-500 border-slate-200',
    CANCELLED: 'bg-gray-50 text-gray-400 border-gray-200'
  };

  return (
    <div
      onDoubleClick={() => navigate(`/meetings/${meeting.id}`)}
      className="group relative border border-slate-200 rounded-xl p-4 bg-white hover:border-slate-350 hover:shadow-xs transition-all flex flex-col justify-between h-44 cursor-pointer select-none font-sans"
    >
      <div className="space-y-2" onClick={() => navigate(`/meetings/${meeting.id}`)}>
        <div className="flex items-start justify-between gap-2">
          <span className={`px-2 py-0.5 rounded border text-[9px] font-bold uppercase tracking-wider ${statusStyles[meeting.status]}`}>
            {meeting.status}
          </span>
          {meeting.project && (
            <span className="bg-indigo-50 text-indigo-750 px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wide border border-indigo-100">
              {meeting.project.code}
            </span>
          )}
        </div>

        <h4 className="font-bold text-xs text-slate-800 group-hover:text-indigo-650 transition-colors line-clamp-2" title={meeting.title}>
          {meeting.title}
        </h4>

        <div className="space-y-1 text-slate-400 font-semibold text-[10px] uppercase tracking-wider">
          <p className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5 text-indigo-500" />
            {new Date(meeting.startTime).toLocaleDateString()}
          </p>
          <p className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-indigo-500" />
            {new Date(meeting.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-slate-50 pt-2.5 mt-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <Avatar src={meeting.organizer?.avatar} name={meeting.organizer?.name} size="xs" />
          <span className="text-[10px] text-slate-500 font-bold truncate max-w-[80px]">{meeting.organizer?.name}</span>
        </div>

        <QuickJoinButton meetingId={meeting.id} status={meeting.status} size="xs" />
      </div>
    </div>
  );
};

export default MeetingCard;
