import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
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
  Folder,
  ArrowLeft,
  Trash2,
  Undo2,
  Share2,
  FileClock
} from 'lucide-react';
import Avatar from '../components/Avatar';
import toast from 'react-hot-toast';

export const ProjectFiles = () => {
  const { id: projectId } = useParams();
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
    revokePermission
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

  const [project, setProject] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  
  // Modals state
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [folderModalMode, setFolderModalMode] = useState('create');
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

  useEffect(() => {
    // Load Project Details
    api.get(`/projects/${projectId}`)
      .then((res) => setProject(res.data.data.project))
      .catch((e) => console.error(e));

    fetchFolderContents(null, projectId);
    fetchFolderTree(projectId);
    fetchFiles({ folderId: 'root', projectId });
    
    // Fetch users for share modal
    api.get('/auth/users')
      .then((res) => setAllUsers(res.data.data.users || []))
      .catch((e) => console.error(e));
  }, [projectId, fetchFolderContents, fetchFolderTree, fetchFiles]);

  const loadContents = (folderId, folderName) => {
    let newPath = [];
    if (folderId) {
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
    fetchFolderContents(folderId, projectId);
    
    const params = { folderId: folderId || 'root', projectId };
    if (searchQuery) params.search = searchQuery;
    fetchFiles(params);
  };

  const handleRefresh = () => {
    loadContents(currentFolderId, currentFolderName);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchFiles({ folderId: currentFolderId || 'root', projectId, search: searchQuery });
  };

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
        await createFolder(folderNameInput, currentFolderId, projectId);
      } else {
        await renameFolder(activeFolder.id, folderNameInput, projectId);
      }
      setIsFolderModalOpen(false);
      handleRefresh();
    } catch (e) {}
  };

  const handleFolderDelete = async (folder) => {
    if (window.confirm(`Delete folder "${folder.name}"?`)) {
      try {
        await deleteFolder(folder.id, projectId);
        handleRefresh();
      } catch (e) {}
    }
  };

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

  const handleFilePreview = (file) => {
    setActivePreviewFile(file);
    setIsPreviewOpen(true);
  };

  const canModifyFolder = (f) => user?.role === 'Admin' || user?.role === 'Manager' || f.createdBy === user?.id;
  const canModifyFile = (f) => user?.role === 'Admin' || user?.role === 'Manager' || f.uploadedBy === user?.id;

  return (
    <div className="space-y-6 font-sans text-xs">
      <div className="flex items-center gap-3">
        <Link to={`/projects/${projectId}`} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-700 transition-colors cursor-pointer">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">
            Project Files: {project?.name || 'Loading...'}
          </h2>
          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide mt-0.5">
            Manage project workspace documents and assets
          </p>
        </div>
      </div>

      <div className="flex gap-6 min-h-[70vh]">
        <aside className="w-52 bg-slate-900/5 border border-slate-200/60 rounded-xl p-4 hidden md:block space-y-4">
          <h3 className="font-extrabold text-slate-800 uppercase tracking-wider text-[10px]">Project Folders</h3>
          <FolderTree
            folders={folderTree}
            currentFolderId={currentFolderId}
            onNavigate={loadContents}
          />
        </aside>

        <main className="flex-1 space-y-6">
          <Card>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md relative">
                <input
                  type="text"
                  placeholder="Search project files..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-750 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                <div className="flex border border-slate-200 rounded-lg p-0.5 bg-slate-50/50 ml-2">
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

          <div className="flex items-center justify-between">
            <Breadcrumb breadcrumbs={breadcrumbs} onNavigate={loadContents} />
            <h2 className="text-slate-800 font-bold text-xs uppercase tracking-wider">
              Folder: {currentFolderName}
            </h2>
          </div>

          <div className="space-y-6">
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
                    <div className="text-center py-16 border border-dashed border-slate-200 rounded-xl bg-slate-50/20 w-full col-span-full">
                      <Folder className="h-10 w-10 text-slate-355 mx-auto mb-3" />
                      <p className="font-bold text-slate-500">No project files found in this directory</p>
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
                  canModify={canModifyFile(file)}
                />
              )}
            </div>
          </div>
        </main>
      </div>

      <ProgressIndicator />

      {/* Modals */}
      <Modal isOpen={isFolderModalOpen} onClose={() => setIsFolderModalOpen(false)} title={folderModalMode === 'create' ? 'Create Project Folder' : 'Rename Project Folder'}>
        <form onSubmit={handleFolderSubmit} className="space-y-4">
          <div>
            <label className="block text-slate-500 font-bold mb-1.5 uppercase tracking-wider">Folder Name</label>
            <input
              type="text"
              required
              value={folderNameInput}
              onChange={(e) => setFolderNameInput(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-750 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="ghost" size="sm" onClick={() => setIsFolderModalOpen(false)}>Cancel</Button>
            <Button type="submit" size="sm">Save</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isFileRenameOpen} onClose={() => setIsFileRenameOpen(false)} title="Rename File">
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
            <Button variant="ghost" size="sm" onClick={() => setIsFileRenameOpen(false)}>Cancel</Button>
            <Button type="submit" size="sm">Save</Button>
          </div>
        </form>
      </Modal>

      <UploadModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} projectId={projectId} folderId={currentFolderId} onUploadSuccess={handleRefresh} />
      <PreviewModal isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} file={activePreviewFile} />

      <Modal isOpen={isShareOpen} onClose={() => setIsShareOpen(false)} title={`File Sharing & Permissions: ${activeFile?.name}`}>
        <div className="space-y-4">
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
            <Button type="submit" size="sm">Add</Button>
          </form>

          <div className="space-y-2">
            <h4 className="font-extrabold text-slate-800 uppercase tracking-wider">Who has access</h4>
            <div className="divide-y divide-slate-100 border border-slate-100 rounded-lg max-h-48 overflow-y-auto p-2">
              {sharedUsersList.map((perm) => (
                <div key={perm.id} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    <Avatar src={perm.user?.avatar} name={perm.user?.name} size="xs" />
                    <div>
                      <p className="font-bold text-slate-800">{perm.user?.name}</p>
                      <p className="text-[9px] text-slate-455 uppercase font-bold">{perm.permission}</p>
                    </div>
                  </div>
                  <button onClick={() => handleRemoveShare(perm.userId)} className="p-1 hover:bg-rose-50 text-slate-455 hover:text-rose-600 rounded cursor-pointer transition-colors">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              {sharedUsersList.length === 0 && (
                <p className="text-center py-4 text-slate-455 italic font-semibold">Only you have access to this file.</p>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-100">
            <Button variant="ghost" size="sm" onClick={() => setIsShareOpen(false)}>Close</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={isVersionsOpen} onClose={() => setIsVersionsOpen(false)} title={`Version History: ${activeFile?.name}`}>
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
                      <span className="text-[9px] text-emerald-650 font-bold bg-emerald-50 border border-emerald-100 px-1.5 rounded">Active</span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 font-semibold">
                    Uploaded by {ver.uploader?.name} on {new Date(ver.createdAt).toLocaleString()}
                  </p>
                </div>
                {ver.version !== activeFile?.version && (
                  <button onClick={() => handleRevertVersion(ver.id)} className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-700 rounded-lg font-bold text-[10px] uppercase transition-colors cursor-pointer font-sans">
                    <Undo2 className="h-3 w-3" /> Revert
                  </button>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-end pt-3 border-t border-slate-100">
            <Button variant="ghost" size="sm" onClick={() => setIsVersionsOpen(false)}>Close</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={isMoveCopyOpen} onClose={() => setIsMoveCopyOpen(false)} title={`${moveCopyAction === 'move' ? 'Move File' : 'Copy File'} Destination`}>
        <form onSubmit={handleMoveCopySubmit} className="space-y-4">
          <div>
            <label className="block text-slate-500 font-bold mb-1.5 uppercase tracking-wider">Choose Destination Folder</label>
            <select
              value={moveCopyDestFolderId}
              onChange={(e) => setMoveCopyDestFolderId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-750 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Drive Root</option>
              {folderTree.map((f) => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="ghost" size="sm" onClick={() => setIsMoveCopyOpen(false)}>Cancel</Button>
            <Button type="submit" size="sm">Confirm {moveCopyAction === 'move' ? 'Move' : 'Copy'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProjectFiles;
