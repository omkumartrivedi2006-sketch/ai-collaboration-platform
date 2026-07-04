import React from 'react';
import Card from '../components/Card';
import { ShieldAlert } from 'lucide-react';

const AdminPanel = () => {
  return (
    <div className="space-y-6 font-sans">
      <h2 className="text-xl font-bold text-slate-800 tracking-tight">Admin Control Panel</h2>
      <Card title="System Administration" subtitle="Workspace-wide settings and controls">
        <div className="text-center py-10">
          <ShieldAlert className="h-10 w-10 text-indigo-400 mx-auto mb-4" />
          <p className="text-sm font-semibold text-slate-700">Administration Controls</p>
          <p className="text-xs text-slate-400 mt-2 max-w-sm mx-auto leading-relaxed">
            In future modules, you will be able to manage global security keys, customize API integrations, and review system logs from this dashboard.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default AdminPanel;
