import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import useProjects from '../context/ProjectContext';
import Card from '../components/Card';
import ProjectForm from '../components/ProjectForm';
import toast from 'react-hot-toast';

const CreateProject = () => {
  const { createProject } = useProjects();
  const navigate = useNavigate();

  const handleFormSubmit = async (data) => {
    try {
      await createProject(data);
      toast.success('Project created successfully!');
      navigate('/projects');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to create project');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-sans">
      <div className="flex items-center gap-3">
        <Link to="/projects" className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-700 transition-colors cursor-pointer">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Create New Project</h2>
          <p className="text-xs text-slate-400 font-semibold">Initialize a new project and assign a core team</p>
        </div>
      </div>

      <Card>
        <ProjectForm onSubmit={handleFormSubmit} />
      </Card>
    </div>
  );
};

export default CreateProject;
