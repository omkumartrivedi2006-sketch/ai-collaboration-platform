import React, { useState } from 'react';
import FileIcon from './FileIcon';
import Avatar from './Avatar';
import { Eye, Download, Share2, FileClock, Trash2, Edit2, Copy, Move, MoreHorizontal } from 'lucide-react';
import fileService from '../services/fileService';

export const FileTable = ({ files = [], onPreview, onRename, onDelete, onShare, onVersions, onMove, onCopy, canModify }) => {
  const [activeMenuId, setActiveMenuId] = useState(null);

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const toggleMenu = (fileId, e) => {
    e.stopPropagation();
    if (activeMenuId === fileId) {
      setActiveMenuId(null);
    } else {
      setActiveMenuId(fileId);
    }
  };

  return (
    <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white select-none font-sans text-xs">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-extrabold uppercase tracking-wider text-[10px]">
            <th className="py-3.5 px-4">Name</th>
            <th className="py-3.5 px-4">Version</th>
            <th className="py-3.5 px-4">Size</th>
            <th className="py-3.5 px-4">Uploaded By</th>
            <th className="py-3.5 px-4">Date</th>
            <th className="py-3.5 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 font-semibold text-slate-750">
          {files.map((file) => {
            const downloadUrl = fileService.getDownloadUrl(file.id);
            const isMenuOpen = activeMenuId === file.id;

            return (
              <tr
                key={file.id}
                className="hover:bg-slate-50/50 transition-colors group cursor-pointer"
                onClick={() => onPreview(file)}
              >
                <td className="py-3.5 px-4 min-w-[200px]">
                  <div className="flex items-center gap-2.5">
                    <FileIcon extension={file.extension} mimeType={file.mimeType} className="h-5 w-5" />
                    <span className="truncate block max-w-xs font-bold text-slate-800" title={file.name}>
                      {file.name}
                    </span>
                  </div>
                </td>

                <td className="py-3.5 px-4">
                  <span className="bg-slate-100 text-slate-650 px-1.5 py-0.5 rounded font-bold text-[10px]">
                    v{file.version}
                  </span>
                </td>

                <td className="py-3.5 px-4 whitespace-nowrap">
                  {formatSize(file.size)}
                </td>

                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-2">
                    <Avatar src={file.uploader?.avatar} name={file.uploader?.name} size="xs" />
                    <span className="truncate block max-w-[120px]">{file.uploader?.name}</span>
                  </div>
                </td>

                <td className="py-3.5 px-4 whitespace-nowrap">
                  {new Date(file.createdAt).toLocaleDateString()}
                </td>

                <td className="py-3.5 px-4 text-right relative" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={(e) => toggleMenu(file.id, e)}
                    className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>

                  {isMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setActiveMenuId(null)} />
                      <div className="absolute right-4 mt-1 z-20 w-36 bg-white border border-slate-150 rounded-lg shadow-md py-1 text-left font-bold text-slate-700">
                        <button
                          onClick={() => {
                            setActiveMenuId(null);
                            onPreview(file);
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
                        >
                          <Eye className="h-3 w-3" />
                          Preview
                        </button>
                        <a
                          href={downloadUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => setActiveMenuId(null)}
                          className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer text-slate-700 decoration-none"
                        >
                          <Download className="h-3 w-3" />
                          Download
                        </a>
                        <button
                          onClick={() => {
                            setActiveMenuId(null);
                            onShare(file);
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
                        >
                          <Share2 className="h-3 w-3" />
                          Permissions
                        </button>
                        <button
                          onClick={() => {
                            setActiveMenuId(null);
                            onVersions(file);
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
                        >
                          <FileClock className="h-3 w-3" />
                          Versions
                        </button>

                        {canModify && (
                          <>
                            <div className="h-px bg-slate-100 my-1" />
                            <button
                              onClick={() => {
                                setActiveMenuId(null);
                                onRename(file);
                              }}
                              className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
                            >
                              <Edit2 className="h-3 w-3" />
                              Rename
                            </button>
                            <button
                              onClick={() => {
                                setActiveMenuId(null);
                                onMove(file);
                              }}
                              className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
                            >
                              <Move className="h-3 w-3" />
                              Move
                            </button>
                            <button
                              onClick={() => {
                                setActiveMenuId(null);
                                onCopy(file);
                              }}
                              className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
                            >
                              <Copy className="h-3 w-3" />
                              Copy
                            </button>
                            <button
                              onClick={() => {
                                setActiveMenuId(null);
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
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {files.length === 0 && (
        <p className="text-center py-8 text-slate-400 italic">No files in this directory.</p>
      )}
    </div>
  );
};

export default FileTable;
