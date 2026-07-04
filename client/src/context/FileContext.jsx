import React, { createContext, useState, useContext, useCallback } from 'react';
import fileService from '../services/fileService';
import toast from 'react-hot-toast';

const FileContext = createContext(null);

export const FileProvider = ({ children }) => {
  const [files, setFiles] = useState([]);
  const [totalFiles, setTotalFiles] = useState(0);
  const [loading, setLoading] = useState(false);
  const [storageUsage, setStorageUsage] = useState(0);

  const fetchFiles = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const data = await fileService.getFiles(params);
      setFiles(data.files || []);
      setTotalFiles(data.total || 0);
      return data;
    } catch (error) {
      console.error('Failed to fetch files:', error);
      toast.error('Failed to load files');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStorageUsage = useCallback(async () => {
    try {
      const size = await fileService.getStorageUsage();
      setStorageUsage(size);
    } catch (error) {
      console.error('Failed to fetch storage usage:', error);
    }
  }, []);

  const renameFile = async (id, newName) => {
    try {
      const updated = await fileService.renameFile(id, newName);
      setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, ...updated } : f)));
      toast.success('File renamed successfully');
      return updated;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to rename file');
      throw error;
    }
  };

  const deleteFile = async (id) => {
    try {
      await fileService.deleteFile(id);
      setFiles((prev) => prev.filter((f) => f.id !== id));
      toast.success('File moved to trash');
      fetchStorageUsage();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete file');
      throw error;
    }
  };

  const restoreFile = async (id) => {
    try {
      const restored = await fileService.restoreFile(id);
      setFiles((prev) => prev.filter((f) => f.id !== id));
      toast.success('File restored successfully');
      fetchStorageUsage();
      return restored;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to restore file');
      throw error;
    }
  };

  const moveFile = async (id, folderId) => {
    try {
      const moved = await fileService.moveFile(id, folderId);
      setFiles((prev) => prev.filter((f) => f.id !== id));
      toast.success('File moved successfully');
      return moved;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to move file');
      throw error;
    }
  };

  const copyFile = async (id, folderId) => {
    try {
      const copied = await fileService.copyFile(id, folderId);
      toast.success('File copied successfully');
      fetchStorageUsage();
      return copied;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to copy file');
      throw error;
    }
  };

  const getVersions = async (id) => {
    try {
      return await fileService.getVersions(id);
    } catch (error) {
      toast.error('Failed to load version history');
      throw error;
    }
  };

  const revertVersion = async (id, versionId) => {
    try {
      const reverted = await fileService.revertVersion(id, versionId);
      setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, ...reverted } : f)));
      toast.success('File reverted to version');
      return reverted;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to revert version');
      throw error;
    }
  };

  const getPermissions = async (id) => {
    try {
      return await fileService.getPermissions(id);
    } catch (error) {
      toast.error('Failed to load permissions');
      throw error;
    }
  };

  const grantPermission = async (id, targetUserId, permission) => {
    try {
      const result = await fileService.grantPermission(id, targetUserId, permission);
      toast.success('File shared successfully');
      return result;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to share file');
      throw error;
    }
  };

  const revokePermission = async (id, targetUserId) => {
    try {
      await fileService.revokePermission(id, targetUserId);
      toast.success('Access revoked successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to revoke permission');
      throw error;
    }
  };

  return (
    <FileContext.Provider
      value={{
        files,
        totalFiles,
        loading,
        storageUsage,
        fetchFiles,
        fetchStorageUsage,
        renameFile,
        deleteFile,
        restoreFile,
        moveFile,
        copyFile,
        getVersions,
        revertVersion,
        getPermissions,
        grantPermission,
        revokePermission
      }}
    >
      {children}
    </FileContext.Provider>
  );
};

export const useFiles = () => {
  const context = useContext(FileContext);
  if (!context) {
    throw new Error('useFiles must be used within a FileProvider');
  }
  return context;
};

export default FileContext;
