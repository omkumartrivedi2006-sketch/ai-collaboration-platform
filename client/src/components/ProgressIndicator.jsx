import React from 'react';
import { useUploads } from '../context/UploadContext';
import { X, CheckCircle, AlertCircle, Loader } from 'lucide-react';

export const ProgressIndicator = () => {
  const { uploadQueue, clearQueue, isUploading } = useUploads();

  if (uploadQueue.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 bg-slate-900 border border-slate-800 rounded-xl shadow-xl overflow-hidden font-sans">
      <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
        <h4 className="text-xs font-bold text-white flex items-center gap-2">
          {isUploading ? (
            <Loader className="h-3.5 w-3.5 text-indigo-400 animate-spin" />
          ) : (
            <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
          )}
          <span>{isUploading ? 'Uploading files...' : 'Uploads complete'}</span>
        </h4>
        {!isUploading && (
          <button
            onClick={clearQueue}
            className="text-slate-400 hover:text-white p-1 rounded transition-colors cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <div className="max-h-60 overflow-y-auto p-3 space-y-3">
        {uploadQueue.map((item) => (
          <div key={item.id} className="space-y-1.5">
            <div className="flex items-center justify-between gap-2 text-[10px] font-bold text-slate-350">
              <span className="truncate flex-1">{item.name}</span>
              <span className="text-right whitespace-nowrap">
                {item.status === 'uploading' && `${item.progress}%`}
                {item.status === 'completed' && <span className="text-emerald-400">Done</span>}
                {item.status === 'error' && <span className="text-rose-400 font-extrabold">Failed</span>}
              </span>
            </div>

            {item.status === 'uploading' && (
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${item.progress}%` }}
                />
              </div>
            )}

            {item.status === 'error' && (
              <p className="text-[9px] text-rose-400 font-semibold italic flex items-center gap-1">
                <AlertCircle className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{item.errorMsg}</span>
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressIndicator;
