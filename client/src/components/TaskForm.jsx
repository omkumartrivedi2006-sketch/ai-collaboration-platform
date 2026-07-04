import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import projectService from '../services/projectService';
import Input from './Input';
import Select from './Select';
import Textarea from './Textarea';
import Button from './Button';
import toast from 'react-hot-toast';

const TaskForm = ({ onSubmit, defaultValues = {}, isEdit = false }) => {
  const [projects, setProjects] = useState([]);
  const [assignees, setAssignees] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [loadingAssignees, setLoadingAssignees] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues: {
      projectId: defaultValues.projectId || '',
      title: defaultValues.title || '',
      description: defaultValues.description || '',
      status: defaultValues.status || 'TODO',
      priority: defaultValues.priority || 'MEDIUM',
      assignedTo: defaultValues.assignedTo || '',
      estimatedHours: defaultValues.estimatedHours || '',
      actualHours: defaultValues.actualHours || '',
      startDate: defaultValues.startDate ? defaultValues.startDate.split('T')[0] : '',
      deadline: defaultValues.deadline ? defaultValues.deadline.split('T')[0] : ''
    }
  });

  const selectedProjectId = watch('projectId');
  const startDateVal = watch('startDate');

  useEffect(() => {
    const loadProjects = async () => {
      setLoadingProjects(true);
      try {
        const response = await projectService.getProjects({ limit: 100 });
        setProjects(response.projects || []);
      } catch (err) {
        toast.error('Failed to load projects');
      } finally {
        setLoadingProjects(false);
      }
    };
    if (!isEdit) {
      loadProjects();
    }
  }, [isEdit]);

  useEffect(() => {
    const loadAssignees = async () => {
      if (!selectedProjectId) {
        setAssignees([]);
        return;
      }
      setLoadingAssignees(true);
      try {
        const response = await projectService.getProject(selectedProjectId);
        const projectData = response.project;
        const list = [];
        if (projectData.manager) {
          list.push(projectData.manager);
        }
        if (projectData.members) {
          projectData.members.forEach((m) => {
            if (m.user && !list.some((u) => u.id === m.userId)) {
              list.push(m.user);
            }
          });
        }
        setAssignees(list);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingAssignees(false);
      }
    };
    loadAssignees();
  }, [selectedProjectId]);

  const statusOptions = [
    { value: 'TODO', label: 'Todo' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'IN_REVIEW', label: 'In Review' },
    { value: 'BLOCKED', label: 'Blocked' },
    { value: 'COMPLETED', label: 'Completed' }
  ];

  const priorityOptions = [
    { value: 'LOW', label: 'Low' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'HIGH', label: 'High' },
    { value: 'URGENT', label: 'Urgent' }
  ];

  const projectOptions = projects.map((p) => ({
    value: p.id,
    label: `${p.name} (${p.code})`
  }));

  const assigneeOptions = assignees.map((a) => ({
    value: a.id,
    label: a.name
  }));

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {!isEdit ? (
          <Select
            label="Project"
            name="projectId"
            options={projectOptions}
            placeholder={loadingProjects ? 'Loading projects...' : 'Select project'}
            error={errors.projectId?.message}
            {...register('projectId', { required: 'Project selection is required' })}
          />
        ) : (
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Project</label>
            <input
              type="text"
              value={defaultValues.project?.name || 'Project'}
              disabled
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-500 font-bold cursor-not-allowed"
            />
          </div>
        )}

        <Input
          label="Task Title"
          name="title"
          placeholder="Implement task detail timeline"
          error={errors.title?.message}
          {...register('title', { required: 'Task title is required' })}
        />
      </div>

      <Textarea
        label="Description"
        name="description"
        placeholder="Brief description of task deliverables..."
        error={errors.description?.message}
        {...register('description')}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Select
          label="Status"
          name="status"
          options={statusOptions}
          placeholder=""
          error={errors.status?.message}
          {...register('status')}
        />

        <Select
          label="Priority"
          name="priority"
          options={priorityOptions}
          placeholder=""
          error={errors.priority?.message}
          {...register('priority')}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Select
          label="Assignee"
          name="assignedTo"
          options={assigneeOptions}
          placeholder={
            !selectedProjectId
              ? 'Select project first'
              : loadingAssignees
              ? 'Loading team...'
              : 'Select assignee (optional)'
          }
          disabled={!selectedProjectId}
          error={errors.assignedTo?.message}
          {...register('assignedTo')}
        />

        <Input
          label="Estimated Hours"
          name="estimatedHours"
          type="number"
          step="0.5"
          placeholder="e.g. 8"
          error={errors.estimatedHours?.message}
          {...register('estimatedHours', {
            valueAsNumber: true,
            validate: (value) => {
              if (value !== undefined && isNaN(value)) return true;
              if (value < 0) return 'Hours must be positive';
              return true;
            }
          })}
        />
      </div>

      {isEdit && (
        <Input
          label="Actual Hours"
          name="actualHours"
          type="number"
          step="0.5"
          placeholder="e.g. 4.5"
          error={errors.actualHours?.message}
          {...register('actualHours', {
            valueAsNumber: true,
            validate: (value) => {
              if (value !== undefined && isNaN(value)) return true;
              if (value < 0) return 'Hours must be positive';
              return true;
            }
          })}
        />
      )}

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

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
        <Button type="submit" loading={isSubmitting}>
          {isEdit ? 'Save Changes' : 'Create Task'}
        </Button>
      </div>
    </form>
  );
};

export default TaskForm;
