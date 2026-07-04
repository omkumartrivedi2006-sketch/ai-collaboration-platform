import React, { createContext, useState, useContext, useCallback } from 'react';
import folderService from '../services/folderService';
import toast from 'react-hot-toast';

const FolderContext = createContext(null);

export const FolderProvider = ({ children }) => {
  const [folders, setFolders] = useState([]);
  const [folderTree, setFolderTree] = useState([]);
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [currentFolderName, setCurrentFolderName] = useState('Root');
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchFolderContents = useCallback(async (folderId, projectId) => {
    setLoading(true);
    try {
      const data = await folderService.getFolderContents(folderId, projectId);
      setFolders(data.folders || []);
      
      // Update breadcrumbs and active folder details
      if (!folderId || folderId === 'root') {
        setCurrentFolderId(null);
        setCurrentFolderName('Root');
        setBreadcrumbs([]);
      } else {
        setCurrentFolderId(folderId);
        // Find current folder's name or fetch from backend details, we'll construct it from navigation
      }
      return data;
    } catch (error) {
      console.error('Failed to load folder contents:', error);
      toast.error('Failed to load folders');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchFolderTree = useCallback(async (projectId) => {
    try {
      const tree = await folderService.getFolderTree(projectId);
      setFolderTree(tree || []);
      return tree;
    } catch (error) {
      console.error('Failed to load folder tree:', error);
    }
  }, []);

  const createFolder = async (name, parentId, projectId) => {
    try {
      const newFolder = await folderService.createFolder({ name, parentId, projectId });
      setFolders((prev) => [...prev, newFolder]);
      fetchFolderTree(projectId);
      toast.success('Folder created successfully');
      return newFolder;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create folder');
      throw error;
    }
  };

  const renameFolder = async (id, name, projectId) => {
    try {
      const updated = await folderService.renameFolder(id, name);
      setFolders((prev) => prev.map((f) => (f.id === id ? updated : f)));
      fetchFolderTree(projectId);
      toast.success('Folder renamed successfully');
      return updated;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to rename folder');
      throw error;
    }
  };

  const deleteFolder = async (id, projectId) => {
    try {
      await folderService.deleteFolder(id);
      setFolders((prev) => prev.filter((f) => f.id !== id));
      fetchFolderTree(projectId);
      toast.success('Folder deleted');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete folder');
      throw error;
    }
  };

  const setFolderNavigation = (folderId, folderName, pathArray = []) => {
    setCurrentFolderId(folderId);
    setCurrentFolderName(folderName || 'Root');
    setBreadcrumbs(pathArray);
  };

  return (
    <FolderContext.Provider
      value={{
        folders,
        folderTree,
        currentFolderId,
        currentFolderName,
        breadcrumbs,
        loading,
        fetchFolderContents,
        fetchFolderTree,
        createFolder,
        renameFolder,
        deleteFolder,
        setFolderNavigation
      }}
    >
      {children}
    </FolderContext.Provider>
  );
};

export const useFolders = () => {
  const context = useContext(FolderContext);
  if (!context) {
    throw new Error('useFolders must be used within a FolderProvider');
  }
  return context;
};

export default FolderContext;
