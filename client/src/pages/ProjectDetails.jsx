import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, UserPlus, Trash2, ShieldAlert, Award, Calendar, Layers, Clock, AlertCircle } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import useProjects from '../context/ProjectContext';
import api from '../services/api';
import Card from '../components/Card';
import Button from '../components/Button';
import Avatar from '../components/Avatar';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import ActivityTimeline from '../components/ActivityTimeline';
import Loader from '../components/Loader';
import toast from 'react-hot-toast';

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    activeProject: project,
    loading,
    fetchProjectDetails,
    addMember,
    removeMember,
    changeManager
  } = useProjects();

  const [activities, setActivities] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedNewMember, setSelectedNewMember] = useState('');
  const [selectedNewManager, setSelectedNewManager] = useState('');
  const [addingMember, setAddingMember] = useState(false);
  const [transferringManager, setTransferringManager] = useState(false);

  useEffect(() => {
    const loadDetails = async () => {
      try {
        await fetchProjectDetails(id);
      } catch (err) {
        toast.error('Failed to load project details');
        navigate('/projects');
      }
    };
    loadDetails();
  }, [id, fetchProjectDetails, navigate]);

  useEffect(() => {
    const loadActivities = async () => {
      setLoadingActivities(true);
      try {
        const response = await api.get(`/projects/${id}/activity`);
        setActivities(response.data.data.activities || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingActivities(false);
      }
    };

    const loadUsers = async () => {
      try {
        const response = await api.get('/auth/users');
        setUsers(response.data.data.users || []);
      } catch (err) {
        console.error(err);
      }
    };

    if (project) {
      loadActivities();
      loadUsers();
    }
  }, [id, project]);

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!selectedNewMember) return;
    setAddingMember(true);
    try {
      await addMember(id, selectedNewMember);
      toast.success('Team member added!');
      setSelectedNewMember('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add member');
    } finally {
      setAddingMember(false);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Remove this user from the project?')) return;
    try {
      await removeMember(id, userId);
      toast.success('Member removed!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove member');
    }
  };

  const handleTransferManager = async (e) => {
    e.preventDefault();
    if (!selectedNewManager) return;
    setTransferringManager(true);
    try {
      await changeManager(id, selectedNewManager);
      toast.success('Project manager transferred successfully!');
      setSelectedNewManager('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to transfer manager');
    } finally {
      setTransferringManager(false);
    }
  };

  if (loading || !project) {
    return <Loader size="lg" fullPage />;
  }

  const isAdmin = user?.role === 'Admin';
  const isManager = user?.role === 'Manager';
  const isOwner = project.managerId === user?.id || project.createdBy === user?.id;
  const canManageMembers = isAdmin || (isManager && isOwner);

  // Filter lists
  const availableUsersToAdd = users.filter(
    (u) => !project.members?.some((m) => m.userId === u.id)
  );

  const eligibleManagers = users.filter(
    (u) => (u.role === 'Admin' || u.role === 'Manager') && project.managerId !== u.id
  );

  return (
    <div className="space-y-6 font-sans">
      <div className="flex items-center gap-3">
        <Link to="/projects" className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-700 transition-colors cursor-pointer">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">{project.name}</h2>
            <StatusBadge status={project.status} />
            {project.isArchived && (
              <span className="bg-amber-100 text-amber-800 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded">
                Archived
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide mt-0.5">Project Code: {project.code}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card title="Overview">
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold text-slate-450 uppercase tracking-wider">Description</h4>
                <p className="text-xs text-slate-600 leading-relaxed mt-1">{project.description || 'No description provided.'}</p>
              </div>

              <div className="h-px bg-slate-100 my-4" />

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <Layers className="h-5 w-5 text-indigo-500" />
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Priority</p>
                    <div className="mt-0.5"><PriorityBadge priority={project.priority} /></div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-indigo-500" />
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Start Date</p>
                    <p className="text-xs text-slate-750 font-bold mt-0.5">
                      {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'TBD'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-indigo-500" />
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Deadline</p>
                    <p className="text-xs text-slate-755 font-bold mt-0.5">
                      {project.deadline ? new Date(project.deadline).toLocaleDateString() : 'No deadline'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-indigo-500" />
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Project Manager</p>
                    <p className="text-xs text-slate-750 font-bold mt-0.5">{project.manager?.name}</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card title="Activity Feed">
            {loadingActivities ? (
              <Loader size="sm" />
            ) : (
              <ActivityTimeline activities={activities} />
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Project Team">
            <div className="space-y-4">
              <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 p-3 rounded-lg">
                <Avatar src={project.manager?.avatar} name={project.manager?.name} size="md" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-900 truncate">{project.manager?.name}</p>
                  <p className="text-[10px] text-indigo-600 font-extrabold uppercase mt-0.5">Project Manager</p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Members ({project.members?.length || 0})</h4>
                <div className="divide-y divide-slate-100 max-h-56 overflow-y-auto">
                  {project.members?.map((member) => (
                    <div key={member.id} className="flex items-center justify-between py-2.5">
                      <div className="flex items-center gap-2">
                        <Avatar src={member.user?.avatar} name={member.user?.name} size="sm" />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate">{member.user?.name}</p>
                          <p className="text-[9px] text-slate-400 font-semibold truncate capitalize">
                            {member.user?.role} • {member.user?.department || 'General'}
                          </p>
                        </div>
                      </div>
                      {canManageMembers && member.userId !== project.managerId && (
                        <button
                          onClick={() => handleRemoveMember(member.userId)}
                          className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded cursor-pointer transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Add Member Interface */}
              {canManageMembers && availableUsersToAdd.length > 0 && (
                <form onSubmit={handleAddMember} className="pt-4 border-t border-slate-100 flex gap-2">
                  <select
                    value={selectedNewMember}
                    onChange={(e) => setSelectedNewMember(e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    <option value="">Select team member</option>
                    {availableUsersToAdd.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.role})
                      </option>
                    ))}
                  </select>
                  <Button type="submit" size="sm" loading={addingMember} disabled={!selectedNewMember}>
                    <UserPlus className="h-3.5 w-3.5" />
                  </Button>
                </form>
              )}
            </div>
          </Card>

          {/* Transfer Manager Card (Admin only) */}
          {isAdmin && eligibleManagers.length > 0 && (
            <Card title="Transfer Project Manager">
              <form onSubmit={handleTransferManager} className="space-y-3">
                <div className="flex gap-2">
                  <select
                    value={selectedNewManager}
                    onChange={(e) => setSelectedNewManager(e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    <option value="">Select new manager</option>
                    {eligibleManagers.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                  <Button type="submit" size="sm" loading={transferringManager} disabled={!selectedNewManager}>
                    Transfer
                  </Button>
                </div>
                <div className="flex items-start gap-1 text-[10px] text-amber-600 font-semibold bg-amber-50 p-2 rounded border border-amber-100">
                  <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                  <span>Transferring will add the new manager to the project team.</span>
                </div>
              </form>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;
