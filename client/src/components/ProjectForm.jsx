import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../services/api';
import Input from './Input';
import Select from './Select';
import Textarea from './Textarea';
import Button from './Button';
import toast from 'react-hot-toast';

const ProjectForm = ({ onSubmit, defaultValues = {}, isEdit = false }) => {
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues: {
      name: defaultValues.name || '',
      code: defaultValues.code || '',
      description: defaultValues.description || '',
      status: defaultValues.status || 'PLANNING',
      priority: defaultValues.priority || 'MEDIUM',
      startDate: defaultValues.startDate ? defaultValues.startDate.split('T')[0] : '',
      deadline: defaultValues.deadline ? defaultValues.deadline.split('T')[0] : '',
      managerId: defaultValues.managerId || '',
      members: defaultValues.members ? defaultValues.members.map(m => m.userId) : []
    }
  });

  const startDateVal = watch('startDate');

  useEffect(() => {
    const fetchUsersList = async () => {
      setLoadingUsers(true);
      try {
        const response = await api.get('/auth/users');
        setUsers(response.data.data.users || []);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load users directory');
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchUsersList();
  }, []);

  const managers = users.filter((u) => u.role === 'Admin' || u.role === 'Manager');

  const statusOptions = [
    { value: 'PLANNING', label: 'Planning' },
    { value: 'ACTIVE', label: 'Active' },
    { value: 'ON_HOLD', label: 'On Hold' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'CANCELLED', label: 'Cancelled' }
  ];

  const priorityOptions = [
    { value: 'LOW', label: 'Low' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'HIGH', label: 'High' },
    { value: 'CRITICAL', label: 'Critical' }
  ];

  const managerOptions = managers.map((m) => ({
    value: m.id,
    label: `${m.name} (${m.role} - ${m.department || 'General'})`
  }));

  const handleMemberCheckbox = (userId, checked) => {
    const currentMembers = watch('members') || [];
    if (checked) {
      setValue('members', [...currentMembers, userId]);
    } else {
      setValue('members', currentMembers.filter(id => id !== userId));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Input
          label="Project Name"
          name="name"
          placeholder="New Core Upgrade"
          error={errors.name?.message}
          {...register('name', { required: 'Project name is required' })}
        />

        <Input
          label="Project Code"
          name="code"
          placeholder="PROJECT-101"
          disabled={isEdit}
          error={errors.code?.message}
          {...register('code', {
            required: 'Project code is required',
            pattern: {
              value: /^[A-Z0-9_-]{2,20}$/,
              message: 'Uppercase alphanumeric, hyphens or underscores only (2-20 chars)'
            }
          })}
        />
      </div>

      <Textarea
        label="Description"
        name="description"
        placeholder="Brief summary of project parameters and deadlines..."
        error={errors.description?.message}
        {...register('description', {
          maxLength: { value: 500, message: 'Description must not exceed 500 characters' }
        })}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Select
          label="Status"
          name="status"
          options={statusOptions}
          error={errors.status?.message}
          placeholder=""
          {...register('status')}
        />

        <Select
          label="Priority"
          name="priority"
          options={priorityOptions}
          error={errors.priority?.message}
          placeholder=""
          {...register('priority')}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Input
          label="Start Date"
          name="startDate"
          type="date"
          error={errors.startDate?.message}
          {...register('startDate')}
        />

        <Input
          label="Deadline"
          name="deadline"
          type="date"
          error={errors.deadline?.message}
          {...register('deadline', {
            validate: (value) => {
              if (startDateVal && value && new Date(value) < new Date(startDateVal)) {
                return 'Deadline cannot be prior to start date';
              }
              return true;
            }
          })}
        />
      </div>

      {!isEdit && (
        <Select
          label="Project Manager"
          name="managerId"
          options={managerOptions}
          error={errors.managerId?.message}
          placeholder={loadingUsers ? 'Loading directory...' : 'Select project manager'}
          {...register('managerId', { required: 'Project manager assignment is required' })}
        />
      )}

      {!isEdit && (
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-slate-700 tracking-wide uppercase">
            Add Team Members
          </label>
          <div className="border border-slate-200 rounded-lg p-4 max-h-48 overflow-y-auto bg-slate-50/50 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {users.map((u) => (
              <label
                key={u.id}
                className="flex items-center gap-3 bg-white p-2.5 rounded-lg border border-slate-100 shadow-xs cursor-pointer select-none text-xs font-bold text-slate-705 hover:bg-slate-50"
              >
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded-sm border-slate-300 text-indigo-650 focus:ring-indigo-500 cursor-pointer"
                  checked={(watch('members') || []).includes(u.id)}
                  onChange={(e) => handleMemberCheckbox(u.id, e.target.checked)}
                />
                <div className="min-w-0">
                  <p className="font-bold text-slate-800 truncate">{u.name}</p>
                  <p className="text-[10px] text-slate-400 capitalize truncate mt-0.5">
                    {u.role} • {u.department || 'General'}
                  </p>
                </div>
              </label>
            ))}
            {users.length === 0 && (
              <span className="col-span-2 text-center text-xs text-slate-400 italic">
                No users found in directory
              </span>
            )}
          </div>
        </div>
      )}

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
        <Button type="submit" loading={isSubmitting}>
          {isEdit ? 'Save Changes' : 'Create Project'}
        </Button>
      </div>
    </form>
  );
};

export default ProjectForm;
