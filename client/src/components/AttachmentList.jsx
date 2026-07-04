import React, { useState } from 'react';
import useAuth from '../hooks/useAuth';
import Button from './Button';
import { Paperclip, FileText, Image, FileArchive, Trash2, UploadCloud } from 'lucide-react';
import toast from 'react-hot-toast';

const AttachmentList = ({ attachments = [], onAddAttachment, onDeleteAttachment }) => {
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const getFileIcon = (fileType = '') => {
    if (fileType.includes('image')) return <Image className="h-5 w-5 text-indigo-500" />;
    if (fileType.includes('pdf')) return <FileText className="h-5 w-5 text-rose-500" />;
    if (fileType.includes('zip') || fileType.includes('rar') || fileType.includes('tar')) {
      return <FileArchive className="h-5 w-5 text-amber-500" />;
    }
    return <Paperclip className="h-5 w-5 text-slate-400" />;
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size exceeds 10MB limit');
      return;
    }
    setSelectedFile(file);
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      await onAddAttachment(formData);
      setSelectedFile(null);
      toast.success('File uploaded successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload attachment');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleUploadSubmit} className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <label className="flex-1 flex items-center justify-center gap-2 border border-dashed border-slate-200 hover:border-slate-350 bg-slate-50/50 hover:bg-slate-50/100 p-3 rounded-lg text-xs font-bold text-slate-505 cursor-pointer transition-all">
          <UploadCloud className="h-4 w-4 text-slate-400" />
          <span>{selectedFile ? selectedFile.name : 'Choose a file to attach (max 10MB)'}</span>
          <input type="file" className="hidden" onChange={handleFileChange} />
        </label>
        <Button type="submit" size="sm" loading={uploading} disabled={!selectedFile}>
          Upload
        </Button>
      </form>

      <div className="space-y-3">
        {attachments.map((a) => {
          const isUploader = user?.id === a.uploadedBy || user?.role === 'Admin';
          const apiBase = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
          const downloadUrl = a.fileUrl.startsWith('http') ? a.fileUrl : `${apiBase}${a.fileUrl}`;

          return (
            <div key={a.id} className="flex items-center justify-between p-3 border border-slate-100 rounded-lg bg-white shadow-xs hover:border-slate-200 transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 bg-slate-50 rounded-lg">
                  {getFileIcon(a.fileType)}
                </div>
                <div className="min-w-0">
                  <a
                    href={downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-slate-800 hover:text-indigo-650 block truncate hover:underline"
                  >
                    {a.fileName}
                  </a>
                  <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-450 font-bold capitalize">
                    <span>Uploaded by {a.uploader?.name}</span>
                    <span>•</span>
                    <span>{new Date(a.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {isUploader && (
                <button
                  onClick={() => {
                    if (window.confirm('Delete attachment?')) onDeleteAttachment(a.id);
                  }}
                  className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded cursor-pointer transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          );
        })}
        {attachments.length === 0 && (
          <p className="text-center py-4 text-xs text-slate-400 italic font-bold">No attachments uploaded.</p>
        )}
      </div>
    </div>
  );
};

export default AttachmentList;
