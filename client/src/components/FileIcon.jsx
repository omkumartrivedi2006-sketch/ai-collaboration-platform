import React from 'react';
import {
  FileText,
  Image,
  FileArchive,
  FileSpreadsheet,
  Presentation,
  FileCode,
  Video,
  Music,
  File
} from 'lucide-react';

export const FileIcon = ({ extension = '', mimeType = '', className = 'h-6 w-6' }) => {
  const ext = extension.toLowerCase();

  if (mimeType.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) {
    return <Image className={`${className} text-indigo-500`} />;
  }
  if (mimeType === 'application/pdf' || ext === 'pdf') {
    return <FileText className={`${className} text-rose-500`} />;
  }
  if (
    ['doc', 'docx', 'rtf'].includes(ext) ||
    mimeType === 'application/msword' ||
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    return <FileText className={`${className} text-blue-500`} />;
  }
  if (
    ['xls', 'xlsx'].includes(ext) ||
    mimeType === 'application/vnd.ms-excel' ||
    mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ) {
    return <FileSpreadsheet className={`${className} text-emerald-500`} />;
  }
  if (
    ['ppt', 'pptx'].includes(ext) ||
    mimeType === 'application/vnd.ms-powerpoint' ||
    mimeType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ) {
    return <Presentation className={`${className} text-amber-500`} />;
  }
  if (['zip', 'rar', 'tar', 'gz', '7z'].includes(ext) || mimeType === 'application/zip') {
    return <FileArchive className={`${className} text-yellow-500`} />;
  }
  if (['txt', 'log'].includes(ext) || mimeType.startsWith('text/plain')) {
    return <FileText className={`${className} text-slate-400`} />;
  }
  if (ext === 'csv' || mimeType === 'text/csv') {
    return <FileSpreadsheet className={`${className} text-teal-500`} />;
  }
  if (mimeType.startsWith('video/') || ['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(ext)) {
    return <Video className={`${className} text-violet-500`} />;
  }
  if (mimeType.startsWith('audio/') || ['mp3', 'wav', 'ogg', 'aac'].includes(ext)) {
    return <Music className={`${className} text-pink-500`} />;
  }

  return <File className={`${className} text-slate-400`} />;
};

export default FileIcon;
