import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MoreVertical, Eye, Edit, Trash2, Archive, RotateCcw } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';
import MemberAvatarGroup from './MemberAvatarGroup';
import Avatar from './Avatar';

const ProjectTable = ({ projects = [], onArchive, onRestore, onDelete }) => {
  const { user } = useAuth();
  const [activeMenu, setActiveMenu] = useState(null);

  const toggleMenu = (id) => {
    setActiveMenu(activeMenu === id ? null : id);
  };

  const getPermission = (project) => {
    const isAdmin = user?.role === 'Admin';
    const isManager = user?.role === 'Manager';
    const isOwner = project.managerId === user?.id || project.createdBy === user?.id;

    return {
      canEdit: isAdmin || (isManager && isOwner),
      canDelete: isAdmin
    };
  };

  return (
    <div className="bg-white border border-slate-100 rounded-xl shadow-xs overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            <th className="px-6 py-4">Project</th>
            <th className="px-6 py-4">Code</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4">Priority</th>
            <th className="px-6 py-4">Manager</th>
            <th className="px-6 py-4">Team</th>
            <th className="px-6 py-4">Deadline</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-650">
          {projects.map((project) => {
            const { canEdit, canDelete } = getPermission(project);
            const isMenuOpen = activeMenu === project.id;

            return (
              <tr key={project.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <Link to={`/projects/${project.id}`} className="font-bold text-slate-800 hover:text-indigo-650 transition-colors">
                    {project.name}
                  </Link>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5 truncate max-w-xs">{project.description}</p>
                </td>
                <td className="px-6 py-4 font-mono font-bold text-slate-500 uppercase">{project.code}</td>
                <td className="px-6 py-4">
                  <StatusBadge status={project.status} />
                </td>
                <td className="px-6 py-4">
                  <PriorityBadge priority={project.priority} />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Avatar src={project.manager?.avatar} name={project.manager?.name} size="sm" />
                    <span>{project.manager?.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <MemberAvatarGroup members={project.members} />
                </td>
                <td className="px-6 py-4 text-slate-550">
                  {project.deadline ? new Date(project.deadline).toLocaleDateString() : 'No deadline'}
                </td>
                <td className="px-6 py-4 text-right relative">
                  <button
                    onClick={() => toggleMenu(project.id)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100 cursor-pointer"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>

                  {isMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setActiveMenu(null)} />
                      <div className="absolute right-6 mt-1 w-44 bg-white border border-slate-100 rounded-lg shadow-lg z-20 py-1.5 divide-y divide-slate-100">
                        <div>
                          <Link
                            to={`/projects/${project.id}`}
                            className="flex items-center gap-2.5 px-4 py-2 hover:bg-slate-50 text-slate-700"
                            onClick={() => setActiveMenu(null)}
                          >
                            <Eye className="h-3.5 w-3.5" /> View Details
                          </Link>
                          {canEdit && (
                            <Link
                              to={`/projects/edit/${project.id}`}
                              className="flex items-center gap-2.5 px-4 py-2 hover:bg-slate-50 text-slate-700"
                              onClick={() => setActiveMenu(null)}
                            >
                              <Edit className="h-3.5 w-3.5" /> Edit Project
                            </Link>
                          )}
                        </div>
                        <div>
                          {canEdit && (
                            <button
                              onClick={() => {
                                project.isArchived ? onRestore(project.id) : onArchive(project.id);
                                setActiveMenu(null);
                              }}
                              className="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-slate-50 text-left text-slate-700 cursor-pointer"
                            >
                              {project.isArchived ? (
                                <>
                                  <RotateCcw className="h-3.5 w-3.5" /> Restore
                                </>
                              ) : (
                                <>
                                  <Archive className="h-3.5 w-3.5" /> Archive
                                </>
                              )}
                            </button>
                          )}
                          {canDelete && (
                            <button
                              onClick={() => {
                                if (window.confirm('Are you sure you want to permanently delete this project?')) {
                                  onDelete(project.id);
                                }
                                setActiveMenu(null);
                              }}
                              className="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-rose-50 text-rose-600 text-left cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" /> Delete
                            </button>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {projects.length === 0 && (
        <div className="text-center py-12 text-sm text-slate-450 italic font-medium">
          No projects found matching the criteria.
        </div>
      )}
    </div>
  );
};

export default ProjectTable;
