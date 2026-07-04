import React, { useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import { useFiles } from '../context/FileContext';
import { useFolders } from '../context/FolderContext';
import { useUploads } from '../context/UploadContext';
import FolderTree from '../components/FolderTree';
import Breadcrumb from '../components/Breadcrumb';
import FolderCard from '../components/FolderCard';
import FileCard from '../components/FileCard';
import FileTable from '../components/FileTable';
import UploadModal from '../components/UploadModal';
import PreviewModal from '../components/PreviewModal';
import ProgressIndicator from '../components/ProgressIndicator';
import Card from '../components/Card';
import Button from '../components/Button';
import Modal from '../components/Modal';
import api from '../services/api';
import {
  FolderPlus,
  Upload,
  Grid,
  List,
  Search,
  SlidersHorizontal,
  Folder,
  FileClock,
  Trash2,
  Undo2,
  Share2,
  Calendar,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';
import toast from 'react-hot-toast';

export const FilesDashboard = () => {
  const { user } = useAuth();
  const {
    files,
    fetchFiles,
    renameFile,
    deleteFile,
    moveFile,
    copyFile,
    getVersions,
    revertVersion,
    getPermissions,
    grantPermission,
    revokePermission,
    storageUsage,
    fetchStorageUsage
  } = useFiles();

  const {
    folders,
    folderTree,
    currentFolderId,
    currentFolderName,
    breadcrumbs,
    fetchFolderContents,
    fetchFolderTree,
    createFolder,
    renameFolder,
    deleteFolder,
    setFolderNavigation
  } = useFolders();

  // Component UI State
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMimeType, setSelectedMimeType] = useState('');
  const [isLargeFiles, setIsLargeFiles] = useState(false);
  const [isRecent, setIsRecent] = useState(false);

  // Modals state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [folderModalMode, setFolderModalMode] = useState('create'); // create or rename
  const [activeFolder, setActiveFolder] = useState(null);
  const [folderNameInput, setFolderNameInput] = useState('');

  const [isFileRenameOpen, setIsFileRenameOpen] = useState(false);
  const [fileNameInput, setFileNameInput] = useState('');
  const [activeFile, setActiveFile] = useState(null);

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [activePreviewFile, setActivePreviewFile] = useState(null);

  const [isShareOpen, setIsShareOpen] = useState(false);
  const [sharedUsersList, setSharedUsersList] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [shareUserId, setShareUserId] = useState('');
  const [sharePermission, setSharePermission] = useState('VIEW');

  const [isVersionsOpen, setIsVersionsOpen] = useState(false);
  const [versionsList, setVersionsList] = useState([]);

  const [isMoveCopyOpen, setIsMoveCopyOpen] = useState(false);
  const [moveCopyAction, setMoveCopyAction] = useState('move'); // move or copy
  const [moveCopyDestFolderId, setMoveCopyDestFolderId] = useState('');

  useEffect(() => {
    fetchFolderContents(null);
    fetchFolderTree();
    fetchFiles({ folderId: 'root' });
    fetchStorageUsage();
    
    // Fetch users for share modal
    api.get('/auth/users')
      .then((res) => setAllUsers(res.data.data.users || []))
      .catch((e) => console.error(e));
  }, [fetchFolderContents, fetchFolderTree, fetchFiles, fetchStorageUsage]);

  const loadContents = (folderId, folderName) => {
    // Determine new breadcrumb array
    let newPath = [];
    if (folderId) {
      // If expanding a subfolder, add current folder to breadcrumbs path
      const currentIdx = breadcrumbs.findIndex((b) => b.id === folderId);
      if (currentIdx !== -1) {
        newPath = breadcrumbs.slice(0, currentIdx + 1);
      } else {
        newPath = [...breadcrumbs, { id: folderId, name: folderName }];
      }
    } else {
      newPath = [];
    }

    setFolderNavigation(folderId, folderName, newPath);
    fetchFolderContents(folderId);
    
    const params = { folderId: folderId || 'root' };
    if (selectedMimeType) params.mimeTypeGroup = selectedMimeType;
    if (isLargeFiles) params.largeFiles = true;
    if (isRecent) params.recentlyUploaded = true;
    if (searchQuery) params.search = searchQuery;
    fetchFiles(params);
  };

  const handleRefresh = () => {
    loadContents(currentFolderId, currentFolderName);
    fetchStorageUsage();
  };

  // Search and Filter updates
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = { folderId: currentFolderId || 'root', search: searchQuery };
    if (selectedMimeType) params.mimeTypeGroup = selectedMimeType;
    if (isLargeFiles) params.largeFiles = true;
    if (isRecent) params.recentlyUploaded = true;
    fetchFiles(params);
  };

  const applyMimeFilter = (mimeGroup) => {
    setSelectedMimeType(mimeGroup);
    const params = { folderId: currentFolderId || 'root' };
    if (mimeGroup) params.mimeTypeGroup = mimeGroup;
    if (isLargeFiles) params.largeFiles = true;
    if (isRecent) params.recentlyUploaded = true;
    if (searchQuery) params.search = searchQuery;
    fetchFiles(params);
  };

  const toggleLargeFiles = () => {
    const nextVal = !isLargeFiles;
    setIsLargeFiles(nextVal);
    const params = { folderId: currentFolderId || 'root' };
    if (selectedMimeType) params.mimeTypeGroup = selectedMimeType;
    if (nextVal) params.largeFiles = true;
    if (isRecent) params.recentlyUploaded = true;
    if (searchQuery) params.search = searchQuery;
    fetchFiles(params);
  };

  const toggleRecent = () => {
    const nextVal = !isRecent;
    setIsRecent(nextVal);
    const params = { folderId: currentFolderId || 'root' };
    if (selectedMimeType) params.mimeTypeGroup = selectedMimeType;
    if (isLargeFiles) params.largeFiles = true;
    if (nextVal) params.recentlyUploaded = true;
    if (searchQuery) params.search = searchQuery;
    fetchFiles(params);
  };

  // Folder actions
  const handleFolderCreateClick = () => {
    setFolderModalMode('create');
    setFolderNameInput('');
    setIsFolderModalOpen(true);
  };

  const handleFolderRenameClick = (folder) => {
    setFolderModalMode('rename');
    setActiveFolder(folder);
    setFolderNameInput(folder.name);
    setIsFolderModalOpen(true);
  };

  const handleFolderSubmit = async (e) => {
    e.preventDefault();
    if (!folderNameInput.trim()) return;

    try {
      if (folderModalMode === 'create') {
        await createFolder(folderNameInput, currentFolderId, null);
      } else {
        await renameFolder(activeFolder.id, folderNameInput, null);
      }
      setIsFolderModalOpen(false);
      handleRefresh();
    } catch (e) {}
  };

  const handleFolderDelete = async (folder) => {
    if (window.confirm(`Delete folder "${folder.name}" and all of its contents?`)) {
      try {
        await deleteFolder(folder.id, null);
        handleRefresh();
      } catch (e) {}
    }
  };

  // File Actions
  const handleFileRenameClick = (file) => {
    setActiveFile(file);
    setFileNameInput(file.name.replace(`.${file.extension}`, ''));
    setIsFileRenameOpen(true);
  };

  const handleFileRenameSubmit = async (e) => {
    e.preventDefault();
    if (!fileNameInput.trim()) return;
    try {
      await renameFile(activeFile.id, fileNameInput);
      setIsFileRenameOpen(false);
      handleRefresh();
    } catch (e) {}
  };

  const handleFileDelete = async (file) => {
    if (window.confirm(`Move "${file.name}" to trash?`)) {
      try {
        await deleteFile(file.id);
        handleRefresh();
      } catch (e) {}
    }
  };

  // Sharing Actions
  const handleShareClick = async (file) => {
    setActiveFile(file);
    setIsShareOpen(true);
    setShareUserId('');
    setSharePermission('VIEW');
    try {
      const list = await getPermissions(file.id);
      setSharedUsersList(list || []);
    } catch (e) {}
  };

  const handleAddShare = async (e) => {
    e.preventDefault();
    if (!shareUserId) return;
    try {
      await grantPermission(activeFile.id, shareUserId, sharePermission);
      const list = await getPermissions(activeFile.id);
      setSharedUsersList(list || []);
      setShareUserId('');
    } catch (e) {}
  };

  const handleRemoveShare = async (targetUserId) => {
    try {
      await revokePermission(activeFile.id, targetUserId);
      const list = await getPermissions(activeFile.id);
      setSharedUsersList(list || []);
    } catch (e) {}
  };

  // Versioning Actions
  const handleVersionsClick = async (file) => {
    setActiveFile(file);
    setIsVersionsOpen(true);
    try {
      const history = await getVersions(file.id);
      setVersionsList(history || []);
    } catch (e) {}
  };

  const handleRevertVersion = async (versionId) => {
    if (window.confirm('Promote this version to active?')) {
      try {
        await revertVersion(activeFile.id, versionId);
        setIsVersionsOpen(false);
        handleRefresh();
      } catch (e) {}
    }
  };

  // Move / Copy Actions
  const handleMoveCopyClick = (file, action) => {
    setActiveFile(file);
    setMoveCopyAction(action);
    setMoveCopyDestFolderId('');
    setIsMoveCopyOpen(true);
  };

  const handleMoveCopySubmit = async (e) => {
    e.preventDefault();
    try {
      if (moveCopyAction === 'move') {
        await moveFile(activeFile.id, moveCopyDestFolderId || null);
      } else {
        await copyFile(activeFile.id, moveCopyDestFolderId || null);
      }
      setIsMoveCopyOpen(false);
      handleRefresh();
    } catch (e) {}
  };

  // Preview Actions
  const handleFilePreview = (file) => {
    setActivePreviewFile(file);
    setIsPreviewOpen(true);
  };

  const canModifyFolder = (f) => user?.role === 'Admin' || user?.role === 'Manager' || f.createdBy === user?.id;
  const canModifyFile = (f) => user?.role === 'Admin' || user?.role === 'Manager' || f.uploadedBy === user?.id;

  const formatStorage = (bytes) => {
    const gbLimit = 10; // 10 GB limit for SASS
    const usedGb = bytes / (1024 * 1024 * 1024);
    const percent = Math.min(Math.round((usedGb / gbLimit) * 100), 100);
    return {
      used: usedGb.toFixed(2),
      limit: gbLimit,
      percent
    };
  };

  const storageStats = formatStorage(storageUsage);

  return (
    <div className="flex gap-6 font-sans text-xs min-h-[80vh]">
      
      {/* Sidebar Folders Tree */}
      <aside className="w-56 bg-slate-900/5 border border-slate-200/60 rounded-xl p-4 hidden md:block space-y-4">
        <h3 className="font-extrabold text-slate-800 uppercase tracking-wider text-[10px]">Folder Hierarchy</h3>
        <FolderTree
          folders={folderTree}
          currentFolderId={currentFolderId}
          onNavigate={loadContents}
        />

        <div className="h-px bg-slate-200" />
        
        {/* Storage usage ring */}
        <div className="space-y-2">
          <div className="flex justify-between font-bold text-slate-700">
            <span>Storage Usage</span>
            <span>{storageStats.percent}%</span>
          </div>
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
            <div
              className="bg-indigo-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${storageStats.percent}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-450 font-bold">
            {storageStats.used} GB of {storageStats.limit} GB used
          </p>
        </div>
      </aside>

      {/* Main Files Area */}
      <main className="flex-1 space-y-6">
        
        {/* Search bar & filter pill buttons */}
        <Card>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md relative">
              <input
                type="text"
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            </form>

            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" className="cursor-pointer" onClick={handleFolderCreateClick}>
                <FolderPlus className="h-4 w-4 text-slate-500" />
                New Folder
              </Button>
              <Button size="sm" className="cursor-pointer" onClick={() => setIsUploadOpen(true)}>
                <Upload className="h-4 w-4" />
                Upload
              </Button>
            </div>
          </div>

          <div className="h-px bg-slate-100 my-4" />

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-1.5">
              {[
                { name: 'All Files', group: '' },
                { name: 'Images', group: 'images' },
                { name: 'Documents', group: 'documents' },
                { name: 'Videos', group: 'videos' },
                { name: 'Audio', group: 'audio' },
                { name: 'Archives', group: 'archives' }
              ].map((filter) => (
                <button
                  key={filter.name}
                  onClick={() => applyMimeFilter(filter.group)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    selectedMimeType === filter.group
                      ? 'bg-indigo-650 text-white shadow-sm'
                      : 'bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700 border border-slate-200/40'
                  }`}
                >
                  {filter.name}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-slate-500 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isRecent}
                  onChange={toggleRecent}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                Recent
              </label>

              <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-slate-500 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isLargeFiles}
                  onChange={toggleLargeFiles}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                Large Files
              </label>

              <div className="flex border border-slate-200 rounded-lg p-0.5 bg-slate-50/50">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1 rounded cursor-pointer ${viewMode === 'grid' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-400'}`}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1 rounded cursor-pointer ${viewMode === 'list' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-400'}`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </Card>

        {/* Directory Breadcrumbs */}
        <div className="flex items-center justify-between">
          <Breadcrumb breadcrumbs={breadcrumbs} onNavigate={loadContents} />
          <h2 className="text-slate-800 font-bold text-xs uppercase tracking-wider">
            Directory: {currentFolderName}
          </h2>
        </div>

        {/* Folders & Files Render Grid */}
        <div className="space-y-6">
          
          {/* Folders Section */}
          {folders.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-extrabold text-slate-800 uppercase tracking-wider text-[10px]">Folders</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {folders.map((folder) => (
                  <FolderCard
                    key={folder.id}
                    folder={folder}
                    onNavigate={loadContents}
                    onRename={handleFolderRenameClick}
                    onDelete={handleFolderDelete}
                    canModify={canModifyFolder(folder)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Files Section */}
          <div className="space-y-3">
            <h3 className="font-extrabold text-slate-800 uppercase tracking-wider text-[10px]">Files</h3>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {files.map((file) => (
                  <FileCard
                    key={file.id}
                    file={file}
                    onPreview={handleFilePreview}
                    onRename={handleFileRenameClick}
                    onDelete={handleFileDelete}
                    onShare={handleShareClick}
                    onVersions={handleVersionsClick}
                    onMove={(f) => handleMoveCopyClick(f, 'move')}
                    onCopy={(f) => handleMoveCopyClick(f, 'copy')}
                    canModify={canModifyFile(file)}
                  />
                ))}
                {files.length === 0 && folders.length === 0 && (
                  <div className="text-center py-16 border border-dashed border-slate-200 rounded-xl bg-slate-50/20">
                    <Folder className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                    <p className="font-bold text-slate-500">This folder is empty</p>
                    <p className="text-[10px] text-slate-400 mt-1">Upload files or create subfolders to get started.</p>
                  </div>
                )}
              </div>
            ) : (
              <FileTable
                files={files}
                onPreview={handleFilePreview}
                onRename={handleFileRenameClick}
                onDelete={handleFileDelete}
                onShare={handleShareClick}
                onVersions={handleVersionsClick}
                onMove={(f) => handleMoveCopyClick(f, 'move')}
                onCopy={(f) => handleMoveCopyClick(f, 'copy')}
                canModify={canModifyFile}
              />
            )}
          </div>
        </div>

      </main>

      {/* Floating progress indicator */}
      <ProgressIndicator />

      {/* MODALS */}

      {/* Folder creation / renaming */}
      <Modal
        isOpen={isFolderModalOpen}
        onClose={() => setIsFolderModalOpen(false)}
        title={folderModalMode === 'create' ? 'Create New Folder' : 'Rename Folder'}
      >
        <form onSubmit={handleFolderSubmit} className="space-y-4">
          <div>
            <label className="block text-slate-500 font-bold mb-1.5 uppercase tracking-wider">Folder Name</label>
            <input
              type="text"
              required
              value={folderNameInput}
              onChange={(e) => setFolderNameInput(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="ghost" size="sm" onClick={() => setIsFolderModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm">
              Save
            </Button>
          </div>
        </form>
      </Modal>

      {/* File Renaming */}
      <Modal
        isOpen={isFileRenameOpen}
        onClose={() => setIsFileRenameOpen(false)}
        title="Rename File"
      >
        <form onSubmit={handleFileRenameSubmit} className="space-y-4">
          <div>
            <label className="block text-slate-500 font-bold mb-1.5 uppercase tracking-wider">New File Name</label>
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg overflow-hidden pr-3">
              <input
                type="text"
                required
                value={fileNameInput}
                onChange={(e) => setFileNameInput(e.target.value)}
                className="flex-1 px-3 py-2 bg-transparent text-slate-700 font-semibold focus:outline-none border-none"
              />
              <span className="text-slate-400 font-bold font-sans">.{activeFile?.extension}</span>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="ghost" size="sm" onClick={() => setIsFileRenameOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm">
              Save
            </Button>
          </div>
        </form>
      </Modal>

      {/* File Upload Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        projectId={null}
        folderId={currentFolderId}
        onUploadSuccess={handleRefresh}
      />

      {/* File Preview Modal */}
      <PreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        file={activePreviewFile}
      />

      {/* Sharing Permissions Modal */}
      <Modal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        title={`File Sharing & Permissions: ${activeFile?.name}`}
      >
        <div className="space-y-4">
          
          {/* Grant form */}
          <form onSubmit={handleAddShare} className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="block text-slate-500 font-bold mb-1 uppercase tracking-wider">Share with User</label>
              <select
                value={shareUserId}
                required
                onChange={(e) => setShareUserId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-750 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select colleague</option>
                {allUsers
                  .filter((u) => u.id !== user?.id)
                  .map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.email})
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-500 font-bold mb-1 uppercase tracking-wider">Access level</label>
              <select
                value={sharePermission}
                onChange={(e) => setSharePermission(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-750 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="VIEW">View</option>
                <option value="DOWNLOAD">Download</option>
                <option value="EDIT">Edit</option>
                <option value="OWNER">Owner</option>
              </select>
            </div>
            <Button type="submit" size="sm">
              Add
            </Button>
          </form>

          {/* Shared list */}
          <div className="space-y-2">
            <h4 className="font-extrabold text-slate-800 uppercase tracking-wider">Who has access</h4>
            <div className="divide-y divide-slate-100 border border-slate-100 rounded-lg max-h-48 overflow-y-auto p-2">
              {sharedUsersList.map((perm) => (
                <div key={perm.id} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    <Avatar src={perm.user?.avatar} name={perm.user?.name} size="xs" />
                    <div>
                      <p className="font-bold text-slate-800">{perm.user?.name}</p>
                      <p className="text-[9px] text-slate-450 uppercase font-bold">{perm.permission}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveShare(perm.userId)}
                    className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-650 rounded cursor-pointer transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              {sharedUsersList.length === 0 && (
                <p className="text-center py-4 text-slate-450 italic font-semibold">Only you have access to this file.</p>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-100">
            <Button variant="ghost" size="sm" onClick={() => setIsShareOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>

      {/* File Version History Modal */}
      <Modal
        isOpen={isVersionsOpen}
        onClose={() => setIsVersionsOpen(false)}
        title={`Version History: ${activeFile?.name}`}
      >
        <div className="space-y-4">
          <div className="divide-y divide-slate-100 border border-slate-100 rounded-lg max-h-[300px] overflow-y-auto p-2.5">
            {versionsList.map((ver) => (
              <div key={ver.id} className="flex items-center justify-between py-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="bg-indigo-50 text-indigo-700 border border-indigo-100 font-extrabold px-1.5 py-0.5 rounded text-[9px] uppercase">
                      Version {ver.version}
                    </span>
                    {ver.version === activeFile?.version && (
                      <span className="text-[9px] text-emerald-650 font-bold bg-emerald-50 border border-emerald-100 px-1.5 rounded">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 font-semibold">
                    Uploaded by {ver.uploader?.name} on {new Date(ver.createdAt).toLocaleString()}
                  </p>
                </div>

                {ver.version !== activeFile?.version && (
                  <button
                    onClick={() => handleRevertVersion(ver.id)}
                    className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-700 rounded-lg font-bold text-[10px] uppercase transition-colors cursor-pointer"
                  >
                    <Undo2 className="h-3 w-3" />
                    Revert
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-100">
            <Button variant="ghost" size="sm" onClick={() => setIsVersionsOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>

      {/* Move & Copy Destination Modal */}
      <Modal
        isOpen={isMoveCopyOpen}
        onClose={() => setIsMoveCopyOpen(false)}
        title={`${moveCopyAction === 'move' ? 'Move File' : 'Copy File'} Destination`}
      >
        <form onSubmit={handleMoveCopySubmit} className="space-y-4">
          <div>
            <label className="block text-slate-500 font-bold mb-1.5 uppercase tracking-wider">Choose Destination Folder</label>
            <select
              value={moveCopyDestFolderId}
              onChange={(e) => setMoveCopyDestFolderId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-750 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Drive Root</option>
              {folderTree
                .filter((f) => f.id !== activeFolder?.id) // exclude moving folders to themselves
                .map((f) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="ghost" size="sm" onClick={() => setIsMoveCopyOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm">
              Confirm {moveCopyAction === 'move' ? 'Move' : 'Copy'}
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

export default FilesDashboard;
