import React from 'react';
import Avatar from './Avatar';
import AttendanceBadge from './AttendanceBadge';
import { UserCheck, Clock } from 'lucide-react';

export const ParticipantList = ({ participants = [] }) => {
  return (
    <div className="space-y-3 font-sans text-xs">
      <h3 className="font-extrabold text-slate-800 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
        <UserCheck className="h-4 w-4 text-indigo-500" />
        <span>Attendees ({participants.length})</span>
      </h3>

      <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl bg-white p-3 space-y-2 max-h-60 overflow-y-auto">
        {participants.map((p) => {
          const roleLabel = {
            HOST: 'Host',
            CO_HOST: 'Co-Host',
            PARTICIPANT: 'Participant'
          }[p.role] || p.role;

          return (
            <div key={p.id} className="flex items-center justify-between py-2 first:pt-0 last:pb-0 gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <Avatar src={p.user?.avatar} name={p.user?.name} size="sm" />
                <div className="min-w-0">
                  <p className="font-bold text-slate-800 truncate">{p.user?.name}</p>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5 flex items-center gap-1.5">
                    <span>{roleLabel}</span>
                    {p.joinedAt && (
                      <span className="flex items-center gap-0.5 text-slate-400">
                        <Clock className="h-3 w-3" />
                        Joined: {new Date(p.joinedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <AttendanceBadge status={p.attendanceStatus} />
            </div>
          );
        })}
        {participants.length === 0 && (
          <p className="text-center py-4 text-slate-400 italic font-semibold">No invitees found.</p>
        )}
      </div>
    </div>
  );
};

export default ParticipantList;
