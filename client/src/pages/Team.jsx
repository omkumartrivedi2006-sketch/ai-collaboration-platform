import React from 'react';
import Card from '../components/Card';
import { Users } from 'lucide-react';

const Team = () => {
  return (
    <div className="space-y-6 font-sans">
      <h2 className="text-xl font-bold text-slate-800 tracking-tight">Team Directory</h2>
      <Card title="Workspace Members" subtitle="Managed in future modules">
        <div className="text-center py-10">
          <Users className="h-10 w-10 text-slate-300 mx-auto mb-4" />
          <p className="text-sm font-semibold text-slate-700">Team Directory Placeholder</p>
          <p className="text-xs text-slate-400 mt-2 max-w-sm mx-auto leading-relaxed">
            In future modules, this directory will display real-time team statuses, roles, and quick chat/call triggers.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Team;
