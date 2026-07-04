import React, { useEffect, useState } from 'react';
import { useSettings } from '../context/SettingsContext';
import SettingsHeader from '../components/SettingsHeader';
import Card from '../components/Card';
import Loader from '../components/Loader';
import { ShieldCheck, Trash2, Edit2, Plus, Smartphone, Monitor } from 'lucide-react';
import toast from 'react-hot-toast';

export const SettingsDevices = () => {
  const { devices, fetchDevices, trustDevice, renameDevice, removeDevice, loading } = useSettings();

  const [isRenaming, setIsRenaming] = useState(null);
  const [newName, setNewName] = useState('');

  const [isAdding, setIsAdding] = useState(false);
  const [deviceLabel, setDeviceLabel] = useState('');

  // Find or create local fingerprint
  const getLocalFingerprint = () => {
    let fp = localStorage.getItem('device_fingerprint');
    if (!fp) {
      fp = 'fp_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('device_fingerprint', fp);
    }
    return fp;
  };

  const fingerprint = getLocalFingerprint();

  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  const handleTrust = async (e) => {
    e.preventDefault();
    if (!deviceLabel) return;
    try {
      await trustDevice(deviceLabel, fingerprint);
      setDeviceLabel('');
      setIsAdding(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRename = async (id) => {
    if (!newName) return;
    try {
      await renameDevice(id, newName);
      setIsRenaming(null);
      setNewName('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemove = async (id) => {
    if (window.confirm('Are you sure you want to remove this trusted device?')) {
      try {
        await removeDevice(id);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const isCurrentDeviceTrusted = devices.some(d => d.fingerprint === fingerprint);

  if (loading && devices.length === 0) {
    return <Loader size="lg" message="Reading trusted certificates..." fullPage />;
  }

  return (
    <div className="space-y-6 font-sans text-xs">
      <SettingsHeader
        title="Trusted Workspace Devices"
        subtitle="Manage secure fingerprints, label devices, and register authentication exceptions"
      />

      {/* Trust current device banner */}
      {!isCurrentDeviceTrusted && (
        <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h4 className="font-black text-slate-805 text-sm">Trust this device?</h4>
            <p className="text-[9px] text-slate-500 font-semibold mt-0.5 leading-relaxed">
              Registering this browser as a trusted fingerprint allows you to bypass secondary alerts.
            </p>
          </div>

          {!isAdding ? (
            <button
              onClick={() => setIsAdding(true)}
              className="cursor-pointer bg-indigo-605 text-white font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-sm"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Trust Current Device</span>
            </button>
          ) : (
            <form onSubmit={handleTrust} className="flex gap-2 w-full sm:w-auto">
              <input
                type="text"
                required
                value={deviceLabel}
                onChange={(e) => setDeviceLabel(e.target.value)}
                placeholder="Name (e.g. My Laptop)"
                className="w-full sm:w-44 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 font-semibold focus:outline-none"
              />
              <button
                type="submit"
                className="cursor-pointer bg-indigo-605 text-white font-bold px-3 py-1.5 rounded-lg"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="cursor-pointer bg-white border border-slate-200 text-slate-655 font-bold px-3 py-1.5 rounded-lg"
              >
                Cancel
              </button>
            </form>
          )}
        </div>
      )}

      {/* Trusted Devices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {devices.map((dev) => {
          const isThisDevice = dev.fingerprint === fingerprint;
          return (
            <Card
              key={dev.id}
              className={`p-5 bg-white border rounded-2xl relative flex gap-4 ${
                isThisDevice ? 'border-indigo-305 shadow-xs ring-1 ring-indigo-200' : 'border-slate-200'
              }`}
            >
              <div className="p-3 bg-indigo-50 border border-indigo-150 text-indigo-650 rounded-xl flex-shrink-0 self-start">
                <ShieldCheck className="h-5 w-5" />
              </div>

              <div className="flex-1 space-y-1.5">
                <div className="flex justify-between items-start">
                  <div>
                    {isRenaming === dev.id ? (
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          className="px-2 py-1 border border-slate-350 rounded focus:outline-none text-[10px] font-bold"
                        />
                        <button
                          onClick={() => handleRename(dev.id)}
                          className="bg-indigo-600 text-white font-bold px-2 py-0.5 rounded text-[8px] cursor-pointer"
                        >
                          OK
                        </button>
                        <button
                          onClick={() => setIsRenaming(null)}
                          className="bg-white border border-slate-200 font-bold px-2 py-0.5 rounded text-[8px] cursor-pointer"
                        >
                          X
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="font-black text-slate-805 text-sm uppercase tracking-wide">
                          {dev.deviceName}
                        </span>
                        {isThisDevice && (
                          <span className="ml-2 bg-indigo-50 border border-indigo-150 text-indigo-750 text-[8px] font-black uppercase px-1.5 py-0.5 rounded">
                            This Device
                          </span>
                        )}
                      </>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {isRenaming !== dev.id && (
                      <button
                        onClick={() => {
                          setIsRenaming(dev.id);
                          setNewName(dev.deviceName);
                        }}
                        className="p-1 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded cursor-pointer"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => handleRemove(dev.id)}
                      className="p-1 hover:bg-slate-100 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="text-[10px] text-slate-500 font-semibold space-y-0.5">
                  <p>
                    <span className="font-bold text-slate-400">Fingerprint SHA:</span>{' '}
                    <span className="font-mono text-[9px]">{dev.fingerprint.substring(0, 20)}...</span>
                  </p>
                  <p>
                    <span className="font-bold text-slate-400">Registered Used:</span>{' '}
                    {new Date(dev.lastUsed).toLocaleDateString()} {new Date(dev.lastUsed).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </Card>
          );
        })}

        {devices.length === 0 && (
          <div className="col-span-full text-center py-16 border border-dashed border-slate-200 rounded-xl bg-slate-50/20 font-bold text-slate-400 italic">
            No trusted devices registered yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsDevices;
