import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import Button from './Button';
import FileIcon from './FileIcon';
import axios from 'axios';
import { Download, FileClock, Users, AlertCircle } from 'lucide-react';
import fileService from '../services/fileService';

export const PreviewModal = ({ isOpen, onClose, file }) => {
  const [textContent, setTextContent] = useState('');
  const [loadingText, setLoadingText] = useState(false);

  useEffect(() => {
    if (isOpen && file && (file.mimeType.startsWith('text/') || ['txt', 'csv', 'log', 'json'].includes(file.extension))) {
      setLoadingText(true);
      setTextContent('');
      axios
        .get(file.url)
        .then((res) => {
          if (typeof res.data === 'object') {
            setTextContent(JSON.stringify(res.data, null, 2));
          } else {
            setTextContent(res.data);
          }
        })
        .catch(() => {
          setTextContent('Failed to load text content preview.');
        })
        .finally(() => {
          setLoadingText(false);
        });
    }
  }, [isOpen, file]);

  if (!isOpen || !file) return null;

  const isImage = file.mimeType.startsWith('image/');
  const isPdf = file.mimeType === 'application/pdf' || file.extension === 'pdf';
  const isVideo = file.mimeType.startsWith('video/');
  const isAudio = file.mimeType.startsWith('audio/');
  const isText = file.mimeType.startsWith('text/') || ['txt', 'csv', 'log', 'json'].includes(file.extension);

  const downloadUrl = fileService.getDownloadUrl(file.id);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Preview: ${file.name}`} size="lg">
      <div className="space-y-4 font-sans text-xs flex flex-col items-stretch">
        
        {/* Preview Container */}
        <div className="bg-slate-950 border border-slate-900 rounded-xl overflow-hidden flex items-center justify-center min-h-[300px] max-h-[500px]">
          {isImage && (
            <img
              src={file.url}
              alt={file.name}
              className="max-w-full max-h-[480px] object-contain"
            />
          )}

          {isPdf && (
            <iframe
              src={`${file.url}#toolbar=0`}
              title={file.name}
              className="w-full h-[450px] border-none"
            />
          )}

          {isVideo && (
            <video
              src={file.url}
              controls
              className="max-w-full max-h-[450px] rounded-lg"
            />
          )}

          {isAudio && (
            <div className="p-6 text-center w-full max-w-sm">
              <div className="flex justify-center mb-4">
                <FileIcon extension={file.extension} className="h-16 w-16" />
              </div>
              <audio src={file.url} controls className="w-full" />
            </div>
          )}

          {isText && (
            <div className="w-full h-[400px] p-4 overflow-auto text-slate-300 font-mono text-[10px] text-left">
              {loadingText ? (
                <div className="text-center py-10">Loading text content...</div>
              ) : (
                <pre className="whitespace-pre-wrap">{textContent}</pre>
              )}
            </div>
          )}

          {!isImage && !isPdf && !isVideo && !isAudio && !isText && (
            <div className="p-8 text-center text-slate-400 space-y-4">
              <div className="flex justify-center">
                <FileIcon extension={file.extension} className="h-16 w-16" />
              </div>
              <div>
                <p className="font-extrabold text-white text-sm">{file.name}</p>
                <p className="text-[10px] text-slate-450 mt-1 uppercase font-bold tracking-wider">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB • {file.extension.toUpperCase()} File
                </p>
              </div>
              <p className="text-[10px] text-indigo-400 font-semibold bg-indigo-950/40 px-3.5 py-1.5 rounded-lg border border-indigo-900/40 inline-flex items-center gap-1.5">
                <AlertCircle className="h-3.5 w-3.5" />
                No embedded web preview available. Please download to view.
              </p>
            </div>
          )}
        </div>

        {/* File Metadata Details */}
        <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="font-extrabold text-slate-800 text-sm truncate max-w-xs sm:max-w-md">{file.name}</h4>
            <div className="flex items-center gap-3 text-slate-400 font-semibold text-[10px] uppercase tracking-wider">
              <span>Version {file.version}</span>
              <span>•</span>
              <span>{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
              <span>•</span>
              <span>Uploaded {new Date(file.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-750 text-white rounded-lg font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              Download
            </a>
          </div>
        </div>

      </div>
    </Modal>
  );
};

export default PreviewModal;
