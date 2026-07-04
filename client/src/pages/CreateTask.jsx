import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import useTasks from '../context/TaskContext';
import Card from '../components/Card';
import TaskForm from '../components/TaskForm';
import toast from 'react-hot-toast';

const CreateTask = () => {
  const { createTask } = useTasks();
  const navigate = useNavigate();

  const handleFormSubmit = async (data) => {
    try {
      await createTask(data);
      toast.success('Task created successfully!');
      navigate('/tasks');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to create task');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-sans">
      <div className="flex items-center gap-3">
        <Link to="/tasks" className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-700 transition-colors cursor-pointer">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Create New Task</h2>
          <p className="text-xs text-slate-400 font-semibold">Define task milestones and assign them to members</p>
        </div>
      </div>

      <Card>
        <TaskForm onSubmit={handleFormSubmit} />
      </Card>
    </div>
  );
};

export default CreateTask;
