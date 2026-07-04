import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MoreVertical, Eye, Edit, Trash2, Archive, RotateCcw, Calendar } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';
import MemberAvatarGroup from './MemberAvatarGroup';
import Avatar from './Avatar';

const ProjectCard = ({ project, onArchive, onRestore, onDelete }) => {
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const isAdmin = user?.role === 'Admin';
  const isManager = user?.role === 'Manager';
  const isOwner = project.managerId === user?.id || project.createdBy === user?.id;

  const canEdit = isAdmin || (isManager && isOwner);
  const canDelete = isAdmin;

  return (
    <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-xs flex flex-col gap-4 relative hover:shadow-md hover:border-slate-200 transition-all duration-200">
      <div className="flex justify-between items-start">
        <div className="min-w-0">
          <Link
            to={`/projects/${project.id}`}
            className="font-bold text-sm text-slate-800 hover:text-indigo-655 transition-colors block truncate"
          >
            {project.name}
          </Link>
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase mt-0.5 inline-block">
            {project.code}
          </span>
        </div>

        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-50 cursor-pointer"
          >
            <MoreVertical className="h-4 w-4" />
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 mt-1 w-40 bg-white border border-slate-100 rounded-lg shadow-lg z-20 py-1 divide-y divide-slate-100">
                <div>
                  <Link
                    to={`/projects/${project.id}`}
                    className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-50 text-xs font-semibold text-slate-700"
                    onClick={() => setMenuOpen(false)}
                  >
                    <Eye className="h-3.5 w-3.5" /> View Details
                  </Link>
                  {canEdit && (
                    <Link
                      to={`/projects/edit/${project.id}`}
                      className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-50 text-xs font-semibold text-slate-700"
                      onClick={() => setMenuOpen(false)}
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
                        setMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-slate-50 text-left text-xs font-semibold text-slate-700 cursor-pointer"
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
                        setMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-rose-50 text-rose-600 text-left text-xs font-semibold cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <p className="text-xs text-slate-500 font-semibold line-clamp-2 h-8 leading-relaxed">
        {project.description || 'No description provided.'}
      </p>

      <div className="flex gap-2">
        <StatusBadge status={project.status} />
        <PriorityBadge priority={project.priority} />
      </div>

      <div className="h-px bg-slate-100 my-1" />

      <div className="flex justify-between items-center text-[10px] font-semibold text-slate-500">
        <div className="flex items-center gap-1.5">
          <Avatar src={project.manager?.avatar} name={project.manager?.name} size="sm" />
          <span className="truncate max-w-[80px]">{project.manager?.name}</span>
        </div>
        <div className="flex items-center gap-1 font-bold">
          <Calendar className="h-3.5 w-3.5 text-slate-400" />
          <span>
            {project.deadline ? new Date(project.deadline).toLocaleDateString() : 'No deadline'}
          </span>
        </div>
      </div>

      <div className="flex justify-between items-center mt-1">
        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Team Size</span>
        <MemberAvatarGroup members={project.members} />
      </div>
    </div>
  );
};

export default ProjectCard;
