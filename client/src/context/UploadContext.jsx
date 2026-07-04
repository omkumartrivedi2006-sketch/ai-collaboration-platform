import React, { createContext, useState, useContext } from 'react';
import fileService from '../services/fileService';
import toast from 'react-hot-toast';

const UploadContext = createContext(null);

export const UploadProvider = ({ children }) => {
  const [uploadQueue, setUploadQueue] = useState([]);

  const addQueueItem = (id, name) => {
    setUploadQueue((prev) => [
      ...prev,
      { id, name, progress: 0, status: 'uploading', errorMsg: '' }
    ]);
  };

  const updateQueueProgress = (id, progress) => {
    setUploadQueue((prev) =>
      prev.map((item) => (item.id === id ? { ...item, progress } : item))
    );
  };

  const completeQueueItem = (id) => {
    setUploadQueue((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, progress: 100, status: 'completed' } : item
      )
    );
  };

  const failQueueItem = (id, errorMsg) => {
    setUploadQueue((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: 'error', errorMsg } : item
      )
    );
  };

  const uploadFile = async (file, folderId, projectId, taskId) => {
    const queueId = Math.random().toString(36).substring(7);
    addQueueItem(queueId, file.name);

    const formData = new FormData();
    formData.append('file', file);
    if (folderId) formData.append('folderId', folderId);
    if (projectId) formData.append('projectId', projectId);
    if (taskId) formData.append('taskId', taskId);

    try {
      const uploadedFile = await fileService.uploadFile(formData, (progressEvent) => {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        updateQueueProgress(queueId, percent);
      });
      completeQueueItem(queueId);
      return uploadedFile;
    } catch (error) {
      const msg = error.response?.data?.message || 'Upload failed';
      failQueueItem(queueId, msg);
      toast.error(`Failed to upload ${file.name}: ${msg}`);
      throw error;
    }
  };

  const replaceFile = async (fileId, file) => {
    const queueId = Math.random().toString(36).substring(7);
    addQueueItem(queueId, `Replacing: ${file.name}`);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const updatedFile = await fileService.replaceFile(fileId, formData, (progressEvent) => {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        updateQueueProgress(queueId, percent);
      });
      completeQueueItem(queueId);
      return updatedFile;
    } catch (error) {
      const msg = error.response?.data?.message || 'Replacement failed';
      failQueueItem(queueId, msg);
      toast.error(`Failed to replace file: ${msg}`);
      throw error;
    }
  };

  const clearQueue = () => {
    setUploadQueue((prev) => prev.filter((item) => item.status === 'uploading'));
  };

  const isUploading = uploadQueue.some((item) => item.status === 'uploading');

  return (
    <UploadContext.Provider
      value={{
        uploadQueue,
        isUploading,
        uploadFile,
        replaceFile,
        clearQueue
      }}
    >
      {children}
    </UploadContext.Provider>
  );
};

export const useUploads = () => {
  const context = useContext(UploadContext);
  if (!context) {
    throw new Error('useUploads must be used within an UploadProvider');
  }
  return context;
};

export default UploadContext;
