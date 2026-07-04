import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import useProjects from '../context/ProjectContext';
import api from '../services/api';
import Button from './Button';

export const MeetingForm = ({ initialData = null, onSubmit, onCancel, loading = false }) => {
  const { projects, fetchProjects } = useProjects();
  const [users, setUsers] = useState([]);
  
  const { register, handleSubmit, formState: { errors }, watch } = useForm({
    defaultValues: initialData ? {
      title: initialData.title,
      description: initialData.description || '',
      projectId: initialData.projectId || '',
      startTime: new Date(initialData.startTime).toISOString().slice(0, 16),
      endTime: new Date(initialData.endTime).toISOString().slice(0, 16),
      timezone: initialData.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
      invitedUserIds: initialData.participants?.map(p => p.userId) || []
    } : {
      title: '',
      description: '',
      projectId: '',
      startTime: '',
      endTime: '',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      invitedUserIds: []
    }
  });

  useEffect(() => {
    if (projects.length === 0) {
      fetchProjects({ limit: 100 });
    }
    // Fetch users for invitation dropdown
    api.get('/auth/users')
      .then(res => setUsers(res.data.data.users || []))
      .catch(err => console.error('Failed to load users:', err));
  }, [projects.length, fetchProjects]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 font-sans text-xs">
      <div>
        <label className="block text-slate-500 font-bold mb-1.5 uppercase tracking-wider">Meeting Title</label>
        <input
          type="text"
          required
          placeholder="Sync Up / Sprint Planning"
          {...register('title', { required: 'Meeting title is required' })}
          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        {errors.title && <p className="text-rose-500 text-[10px] mt-1">{errors.title.message}</p>}
      </div>

      <div>
        <label className="block text-slate-500 font-bold mb-1.5 uppercase tracking-wider">Description</label>
        <textarea
          rows={3}
          placeholder="Brief summary of agenda"
          {...register('description')}
          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-slate-500 font-bold mb-1.5 uppercase tracking-wider">Start Time</label>
          <input
            type="datetime-local"
            required
            {...register('startTime', { required: 'Start time is required' })}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-750 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-slate-500 font-bold mb-1.5 uppercase tracking-wider">End Time</label>
          <input
            type="datetime-local"
            required
            {...register('endTime', { required: 'End time is required' })}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-750 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-slate-500 font-bold mb-1.5 uppercase tracking-wider">Associated Project (Optional)</label>
          <select
            {...register('projectId')}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-750 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Personal / Scopes-free Drive</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-slate-500 font-bold mb-1.5 uppercase tracking-wider">Timezone</label>
          <input
            type="text"
            required
            {...register('timezone', { required: 'Timezone is required' })}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-slate-500 font-bold mb-1.5 uppercase tracking-wider">Invite Participants</label>
        <div className="max-h-32 overflow-y-auto divide-y divide-slate-100 border border-slate-150 rounded-lg p-2.5 bg-slate-50/50 space-y-1">
          {users.map(u => (
            <label key={u.id} className="flex items-center gap-2 py-1 cursor-pointer font-semibold text-slate-700 select-none">
              <input
                type="checkbox"
                value={u.id}
                {...register('invitedUserIds')}
                className="rounded border-slate-350 text-indigo-600 focus:ring-indigo-500"
              />
              <span>{u.name} ({u.email})</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" size="sm" loading={loading}>
          {initialData ? 'Save Changes' : 'Schedule Meeting'}
        </Button>
      </div>
    </form>
  );
};

export default MeetingForm;
