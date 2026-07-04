import React from 'react';
import { Calendar, Video, CheckCircle, AlertTriangle, Layers } from 'lucide-react';

export const MeetingTimeline = ({ meeting }) => {
  const isLive = meeting.status === 'LIVE';
  const isCompleted = meeting.status === 'COMPLETED';
  const isCancelled = meeting.status === 'CANCELLED';

  const steps = [
    {
      title: 'Meeting Scheduled',
      time: meeting.createdAt,
      desc: `Scheduled by ${meeting.organizer?.name || 'Organizer'}`,
      active: true,
      icon: Calendar
    },
    {
      title: 'Meeting Live',
      time: isLive || isCompleted ? meeting.startTime : null,
      desc: 'Video conference room opened',
      active: isLive || isCompleted,
      icon: Video
    },
    {
      title: 'Meeting Completed',
      time: isCompleted ? meeting.endTime : null,
      desc: 'Video session closed',
      active: isCompleted,
      icon: CheckCircle
    }
  ];

  return (
    <div className="space-y-4 font-sans text-xs">
      <h3 className="font-extrabold text-slate-800 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
        <Layers className="h-4 w-4 text-indigo-500" />
        <span>Meeting Lifecycle Timeline</span>
      </h3>

      <div className="relative border-l-2 border-slate-100 pl-4 ml-2.5 space-y-5">
        {steps.map((step, idx) => {
          const StepIcon = step.icon;
          return (
            <div key={idx} className="relative">
              <div className={`absolute -left-[23px] top-0.5 p-1 rounded-full border-2 ${
                step.active ? 'bg-indigo-600 border-indigo-200 text-white' : 'bg-white border-slate-200 text-slate-400'
              }`}>
                <StepIcon className="h-3 w-3" />
              </div>

              <div>
                <h4 className={`font-bold ${step.active ? 'text-slate-800' : 'text-slate-400'}`}>{step.title}</h4>
                <p className="text-[10px] text-slate-450 mt-0.5 font-semibold">{step.desc}</p>
                {step.time && step.active && (
                  <span className="text-[9px] text-indigo-650 bg-indigo-50 border border-indigo-100 font-bold px-1.5 py-0.5 rounded mt-1 inline-block">
                    {new Date(step.time).toLocaleString()}
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {isCancelled && (
          <div className="relative">
            <div className="absolute -left-[23px] top-0.5 p-1 rounded-full border-2 bg-rose-50 border-rose-200 text-rose-600">
              <AlertTriangle className="h-3 w-3" />
            </div>
            <div>
              <h4 className="font-bold text-rose-600">Meeting Cancelled</h4>
              <p className="text-[10px] text-slate-450 mt-0.5 font-semibold">The host has cancelled the scheduled event.</p>
              <span className="text-[9px] text-rose-700 bg-rose-50 border border-rose-100 font-bold px-1.5 py-0.5 rounded mt-1 inline-block">
                {new Date(meeting.updatedAt).toLocaleString()}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MeetingTimeline;
