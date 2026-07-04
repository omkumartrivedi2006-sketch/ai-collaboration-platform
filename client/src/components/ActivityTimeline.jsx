import React from 'react';
import Avatar from './Avatar';
import { Clock } from 'lucide-react';

const ActivityTimeline = ({ activities = [] }) => {
  if (activities.length === 0) {
    return (
      <div className="text-center py-6 text-xs text-slate-400 font-medium italic">
        No project activities recorded yet.
      </div>
    );
  }

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {activities.map((activity, activityIdx) => (
          <li key={activity.id || activityIdx}>
            <div className="relative pb-8">
              {activityIdx !== activities.length - 1 ? (
                <span
                  className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-100"
                  aria-hidden="true"
                />
              ) : null}
              <div className="relative flex space-x-3">
                <div>
                  <Avatar src={activity.user?.avatar} name={activity.user?.name} size="sm" />
                </div>
                <div className="flex-1 min-w-0 pt-1.5 flex justify-between gap-4">
                  <p className="text-xs text-slate-600">
                    <strong className="font-semibold text-slate-900">{activity.user?.name}</strong>{' '}
                    <span className="bg-slate-50 text-indigo-700 border border-indigo-100/50 px-1.5 py-0.5 rounded text-[10px] font-semibold inline-block">
                      {activity.action}
                    </span>
                  </p>
                  <div className="text-right text-[10px] whitespace-nowrap text-slate-400 font-semibold flex items-center gap-1">
                    <Clock className="h-3 w-3 text-slate-400" />
                    {new Date(activity.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ActivityTimeline;
