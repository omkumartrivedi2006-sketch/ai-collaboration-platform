import React, { useState } from 'react';
import FileIcon from './FileIcon';
import { MoreVertical, Download, Eye, Share2, FileClock, Trash2, Edit2, Copy, Move } from 'lucide-react';
import fileService from '../services/fileService';

export const FileCard = ({ file, onPreview, onRename, onDelete, onShare, onVersions, onMove, onCopy, canModify }) => {
  const [showMenu, setShowMenu] = useState(false);

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const downloadUrl = fileService.getDownloadUrl(file.id);

  return (
    <div className="group relative border border-slate-200 rounded-xl p-4 bg-white hover:border-slate-350 hover:shadow-xs transition-all flex flex-col justify-between h-40">
      
      <div className="flex items-start justify-between">
        <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg group-hover:bg-white transition-all">
          <FileIcon extension={file.extension} mimeType={file.mimeType} className="h-6 w-6" />
        </div>

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <MoreVertical className="h-4 w-4" />
          </button>

          {showMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 mt-1 z-20 w-36 bg-white border border-slate-150 rounded-lg shadow-md py-1 font-sans text-[11px] font-bold">
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onPreview(file);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-1.5 cursor-pointer"
                >
                  <Eye className="h-3 w-3" />
                  Preview
                </button>
                <a
                  href={downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setShowMenu(false)}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="h-3 w-3" />
                  Download
                </a>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onShare(file);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-1.5 cursor-pointer"
                >
                  <Share2 className="h-3 w-3" />
                  Share & Permissions
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onVersions(file);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-1.5 cursor-pointer"
                >
                  <FileClock className="h-3 w-3" />
                  Versions
                </button>

                {canModify && (
                  <>
                    <div className="h-px bg-slate-100 my-1" />
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onRename(file);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Edit2 className="h-3 w-3" />
                      Rename
                    </button>
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onMove(file);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Move className="h-3 w-3" />
                      Move
                    </button>
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onCopy(file);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Copy className="h-3 w-3" />
                      Copy
                    </button>
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onDelete(file);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-rose-50 text-rose-600 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 className="h-3 w-3" />
                      Delete
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="min-w-0" onClick={() => onPreview(file)}>
        <h4 className="font-bold text-xs text-slate-800 truncate cursor-pointer" title={file.name}>
          {file.name}
        </h4>
        <div className="flex items-center justify-between mt-2.5">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            {formatSize(file.size)}
          </p>
          <p className="text-[9px] text-indigo-600 font-extrabold uppercase bg-indigo-50/60 px-1.5 py-0.5 rounded border border-indigo-100">
            v{file.version}
          </p>
        </div>
      </div>

    </div>
  );
};

export default FileCard;
