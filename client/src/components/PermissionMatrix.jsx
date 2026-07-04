import React, { useEffect, useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import Card from './Card';
import Loader from './Loader';
import { ShieldCheck, ShieldAlert, Sparkles, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export const PermissionMatrix = () => {
  const {
    permissions,
    mappings,
    loading,
    fetchPermissionMatrix,
    updateRolePermissions,
    seedPermissions
  } = useAdmin();

  const [activeRole, setActiveRole] = useState('Manager');
  const [selectedIds, setSelectedIds] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPermissionMatrix();
  }, [fetchPermissionMatrix]);

  // Load initial selections when role or mappings change
  useEffect(() => {
    const roleMappings = mappings.filter(m => m.role === activeRole);
    setSelectedIds(roleMappings.map(m => m.permissionId));
  }, [activeRole, mappings]);

  const handleToggle = (permissionId) => {
    setSelectedIds(prev =>
      prev.includes(permissionId)
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateRolePermissions(activeRole, selectedIds);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  if (loading && permissions.length === 0) {
    return <Loader size="sm" message="Loading permissions matrix..." />;
  }

  // Group permissions by Module for structured representation
  const modules = Array.from(new Set(permissions.map(p => p.module)));

  return (
    <Card
      title="Role & Access Permission Matrix"
      subtitle="Configure module-level action permissions mapping for non-admin accounts"
      className="border border-slate-200 bg-white shadow-2xs font-sans text-xs"
    >
      <div className="space-y-5">
        
        {/* Actions & Seed button */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 border border-slate-100 rounded-xl p-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-500 uppercase tracking-wider text-[8px]">Modify Role Matrix:</span>
            <div className="flex gap-1">
              {['Manager', 'Employee'].map(r => (
                <button
                  key={r}
                  onClick={() => setActiveRole(r)}
                  className={`cursor-pointer px-2.5 py-1 rounded text-[10px] font-bold transition-all ${
                    activeRole === r 
                      ? 'bg-indigo-605 text-white shadow-xs' 
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {permissions.length === 0 && (
            <button
              onClick={seedPermissions}
              className="cursor-pointer bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-750 hover:to-indigo-750 text-white font-bold px-3 py-1.5 rounded flex items-center gap-1 transition-all"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Seed Default Permissions</span>
            </button>
          )}
        </div>

        {/* Matrix Grid */}
        {permissions.length > 0 ? (
          <div className="border border-slate-150 rounded-xl overflow-hidden">
            <div className="grid grid-cols-12 bg-slate-50/80 border-b border-slate-200 py-2.5 px-4 font-bold text-slate-400 uppercase tracking-wider text-[8px]">
              <div className="col-span-4">Module / Capability</div>
              <div className="col-span-6">Permission Description</div>
              <div className="col-span-2 text-center">Allow Access</div>
            </div>

            <div className="divide-y divide-slate-100 max-h-[350px] overflow-y-auto">
              {modules.map(moduleName => {
                const modulePerms = permissions.filter(p => p.module === moduleName);
                return (
                  <div key={moduleName} className="bg-white">
                    {/* Module Title separator */}
                    <div className="bg-slate-50/30 px-4 py-1.5 font-black text-indigo-750 uppercase tracking-wider text-[8px] border-b border-slate-100">
                      {moduleName} Module
                    </div>
                    {modulePerms.map(perm => {
                      const isChecked = selectedIds.includes(perm.id);
                      // Extract name from "Read_Project" to human-readable "Read"
                      const displayName = perm.name.split('_')[0];
                      return (
                        <div key={perm.id} className="grid grid-cols-12 items-center py-3 px-4 hover:bg-slate-50/50 transition-colors">
                          <div className="col-span-4 font-bold text-slate-700">{displayName}</div>
                          <div className="col-span-6 text-slate-400 font-semibold">{perm.description || 'No description provided.'}</div>
                          <div className="col-span-2 text-center">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleToggle(perm.id)}
                              className="h-4 w-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-12 border border-dashed border-slate-200 rounded-xl bg-slate-50/20 text-slate-400 font-bold italic">
            No permissions database loaded. Click "Seed Default Permissions" above to build capabilities.
          </div>
        )}

        {/* Save button */}
        {permissions.length > 0 && (
          <div className="flex justify-between items-center pt-2">
            <div className="flex items-center gap-1.5 text-slate-400 font-semibold">
              <ShieldCheck className="h-4.5 w-4.5 text-emerald-500" />
              <span>Admins automatically bypass all permission restrictions.</span>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="cursor-pointer bg-indigo-605 hover:bg-indigo-705 text-white font-bold px-4 py-2 rounded-lg shadow-sm hover:shadow flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              <span>{saving ? 'Saving config...' : 'Save Matrix Configuration'}</span>
            </button>
          </div>
        )}

      </div>
    </Card>
  );
};

export default PermissionMatrix;
