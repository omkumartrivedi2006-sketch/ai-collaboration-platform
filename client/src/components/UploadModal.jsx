import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import Button from './Button';
import { useUploads } from '../context/UploadContext';
import { useFolders } from '../context/FolderContext';
import useProjects from '../context/ProjectContext';
import { UploadCloud, File, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export const UploadModal = ({ isOpen, onClose, projectId: propProjectId, folderId: propFolderId, onUploadSuccess }) => {
  const { uploadFile } = useUploads();
  const { folders, fetchFolderContents } = useFolders();
  const { projects, fetchProjects } = useProjects();

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [projectId, setProjectId] = useState(propProjectId || '');
  const [folderId, setFolderId] = useState(propFolderId || '');
  const [isDragActive, setIsDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setProjectId(propProjectId || '');
      setFolderId(propFolderId || '');
      setSelectedFiles([]);
      if (!propProjectId && projects.length === 0) {
        fetchProjects({ limit: 100 });
      }
    }
  }, [isOpen, propProjectId, propFolderId, projects.length, fetchProjects]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const filesArray = Array.from(e.dataTransfer.files);
      setSelectedFiles((prev) => [...prev, ...filesArray]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...filesArray]);
    }
  };

  const removeFile = (idx) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    setUploading(true);

    try {
      const uploadPromises = selectedFiles.map((file) =>
        uploadFile(file, folderId || null, projectId || null, null)
      );
      await Promise.all(uploadPromises);
      toast.success('All files uploaded successfully!');
      if (onUploadSuccess) onUploadSuccess();
      onClose();
    } catch (err) {
      // errors handled by context/progress indicator
    } finally {
      setUploading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Upload Enterprise Files">
      <div className="space-y-4 font-sans text-xs">
        {!propProjectId && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-500 font-bold mb-1 uppercase tracking-wide">Project Context</label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-750 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Personal Drive</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-500 font-bold mb-1 uppercase tracking-wide">Folder Destination</label>
              <select
                value={folderId}
                onChange={(e) => setFolderId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-750 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Root / Drive</option>
                {folders.map((f) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
            isDragActive
              ? 'border-indigo-500 bg-indigo-50/20'
              : 'border-slate-200 hover:border-slate-350 bg-slate-50/30'
          }`}
        >
          <input
            type="file"
            id="file-upload-input"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />
          <label htmlFor="file-upload-input" className="cursor-pointer space-y-3 block">
            <div className="flex justify-center">
              <UploadCloud className="h-10 w-10 text-slate-400" />
            </div>
            <p className="font-bold text-slate-700">Drag and drop your files here, or <span className="text-indigo-650 hover:underline">browse</span></p>
            <p className="text-[10px] text-slate-450 font-bold uppercase tracking-wider">Supports files up to 100 MB</p>
          </label>
        </div>

        {selectedFiles.length > 0 && (
          <div className="space-y-2.5">
            <h4 className="font-extrabold text-slate-800 uppercase tracking-wider">Selected Files ({selectedFiles.length})</h4>
            <div className="max-h-40 overflow-y-auto divide-y divide-slate-100 border border-slate-100 rounded-lg bg-slate-50/40 p-2.5 space-y-1.5">
              {selectedFiles.map((file, idx) => (
                <div key={idx} className="flex items-center justify-between py-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <File className="h-4 w-4 text-slate-450 flex-shrink-0" />
                    <span className="truncate font-bold text-slate-750">{file.name}</span>
                    <span className="text-[9px] text-slate-400 whitespace-nowrap">({(file.size / (1024 * 1024)).toFixed(2)} MB)</span>
                  </div>
                  <button
                    onClick={() => removeFile(idx)}
                    className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={uploading}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleUpload}
            disabled={selectedFiles.length === 0 || uploading}
            loading={uploading}
          >
            Upload Files
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default UploadModal;
