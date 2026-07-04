import React, { useState } from 'react';
import { Folder, MoreVertical, Edit2, Trash2 } from 'lucide-react';

export const FolderCard = ({ folder, onNavigate, onRename, onDelete, canModify }) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div
      onDoubleClick={() => onNavigate(folder.id, folder.name)}
      className="group relative border border-slate-200 rounded-xl p-4 bg-white hover:border-slate-350 hover:shadow-xs cursor-pointer select-none transition-all flex items-center gap-3.5"
    >
      <div className="p-2.5 bg-indigo-50/50 rounded-lg group-hover:bg-indigo-50 transition-colors">
        <Folder className="h-6 w-6 text-indigo-500 fill-indigo-500/20" />
      </div>

      <div className="min-w-0 flex-1" onClick={() => onNavigate(folder.id, folder.name)}>
        <h4 className="font-bold text-xs text-slate-800 truncate" title={folder.name}>
          {folder.name}
        </h4>
        <p className="text-[9px] text-slate-400 font-semibold uppercase mt-0.5 tracking-wider">
          Folder
        </p>
      </div>

      {canModify && (
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <MoreVertical className="h-4 w-4" />
          </button>

          {showMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 mt-1 z-20 w-28 bg-white border border-slate-150 rounded-lg shadow-md py-1 font-sans text-[11px] font-bold">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(false);
                    onRename(folder);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit2 className="h-3 w-3" />
                  Rename
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(false);
                    onDelete(folder);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-rose-50 text-rose-600 flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="h-3 w-3" />
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default FolderCard;
