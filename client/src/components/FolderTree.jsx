import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Folder } from 'lucide-react';

export const FolderTree = ({ folders = [], currentFolderId, onNavigate }) => {
  const [expandedFolders, setExpandedFolders] = useState({});

  const toggleExpand = (folderId, e) => {
    e.stopPropagation();
    setExpandedFolders((prev) => ({
      ...prev,
      [folderId]: !prev[folderId]
    }));
  };

  const buildTree = (list) => {
    const map = {};
    const roots = [];

    list.forEach((f) => {
      map[f.id] = { ...f, children: [] };
    });

    list.forEach((f) => {
      if (f.parentId && map[f.parentId]) {
        map[f.parentId].children.push(map[f.id]);
      } else {
        roots.push(map[f.id]);
      }
    });

    return roots;
  };

  const treeData = buildTree(folders);

  const renderNode = (node, depth = 0) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedFolders[node.id];
    const isSelected = currentFolderId === node.id;

    return (
      <div key={node.id} className="space-y-1">
        <div
          onClick={() => onNavigate(node.id, node.name)}
          className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            isSelected
              ? 'bg-indigo-50 text-indigo-700'
              : 'hover:bg-slate-100 text-slate-700'
          }`}
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
        >
          {hasChildren ? (
            <button
              onClick={(e) => toggleExpand(node.id, e)}
              className="p-0.5 hover:bg-slate-200/50 rounded text-slate-455 hover:text-slate-600 transition-colors"
            >
              {isExpanded ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </button>
          ) : (
            <div className="w-4" />
          )}

          <Folder className={`h-4 w-4 flex-shrink-0 ${isSelected ? 'text-indigo-650 fill-indigo-100' : 'text-slate-450'}`} />
          <span className="truncate flex-1">{node.name}</span>
        </div>

        {hasChildren && isExpanded && (
          <div className="space-y-1">
            {node.children.map((child) => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-1.5 py-1">
      <div
        onClick={() => onNavigate(null, 'Root')}
        className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
          !currentFolderId ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-slate-100 text-slate-700'
        }`}
      >
        <div className="w-4" />
        <Folder className={`h-4 w-4 ${!currentFolderId ? 'text-indigo-650 fill-indigo-100' : 'text-slate-450'}`} />
        <span>Drive Root</span>
      </div>
      <div className="space-y-1">
        {treeData.map((node) => renderNode(node, 0))}
      </div>
    </div>
  );
};

export default FolderTree;
