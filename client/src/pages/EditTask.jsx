import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import useTasks from '../context/TaskContext';
import Card from '../components/Card';
import TaskForm from '../components/TaskForm';
import Loader from '../components/Loader';
import toast from 'react-hot-toast';

const EditTask = () => {
  const { id } = useParams();
  const { fetchTaskDetails, updateTask } = useTasks();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTask = async () => {
      try {
        const details = await fetchTaskDetails(id);
        setTask(details);
      } catch (err) {
        toast.error('Failed to load task details');
        navigate('/tasks');
      } finally {
        setLoading(false);
      }
    };
    loadTask();
  }, [id, fetchTaskDetails, navigate]);

  const handleFormSubmit = async (data) => {
    try {
      await updateTask(id, {
        title: data.title,
        description: data.description || null,
        status: data.status,
        priority: data.priority,
        assignedTo: data.assignedTo || null,
        estimatedHours: data.estimatedHours || null,
        actualHours: data.actualHours || null,
        startDate: data.startDate || null,
        deadline: data.deadline || null
      });
      toast.success('Task details saved!');
      navigate(`/tasks/${id}`);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to update task');
    }
  };

  if (loading) {
    return <Loader size="lg" fullPage />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-sans">
      <div className="flex items-center gap-3">
        <Link to={`/tasks/${id}`} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-700 transition-colors cursor-pointer">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Edit Task</h2>
          <p className="text-xs text-slate-400 font-semibold">Update parameters for {task?.title}</p>
        </div>
      </div>

      <Card>
        <TaskForm onSubmit={handleFormSubmit} defaultValues={task} isEdit />
      </Card>
    </div>
  );
};

export default EditTask;
