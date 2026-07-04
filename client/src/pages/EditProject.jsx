import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import useProjects from '../context/ProjectContext';
import Card from '../components/Card';
import ProjectForm from '../components/ProjectForm';
import Loader from '../components/Loader';
import toast from 'react-hot-toast';

const EditProject = () => {
  const { id } = useParams();
  const { fetchProjectDetails, updateProject } = useProjects();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProject = async () => {
      try {
        const details = await fetchProjectDetails(id);
        setProject(details);
      } catch (err) {
        toast.error('Failed to load project details');
        navigate('/projects');
      } finally {
        setLoading(false);
      }
    };
    loadProject();
  }, [id, fetchProjectDetails, navigate]);

  const handleFormSubmit = async (data) => {
    try {
      await updateProject(id, {
        name: data.name,
        description: data.description,
        status: data.status,
        priority: data.priority,
        startDate: data.startDate,
        deadline: data.deadline
      });
      toast.success('Project details saved!');
      navigate(`/projects/${id}`);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to update project');
    }
  };

  if (loading) {
    return <Loader size="lg" fullPage />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-sans">
      <div className="flex items-center gap-3">
        <Link to={`/projects/${id}`} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-700 transition-colors cursor-pointer">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Edit Project</h2>
          <p className="text-xs text-slate-400 font-semibold">Update parameters for {project?.name}</p>
        </div>
      </div>

      <Card>
        <ProjectForm onSubmit={handleFormSubmit} defaultValues={project} isEdit />
      </Card>
    </div>
  );
};

export default EditProject;
