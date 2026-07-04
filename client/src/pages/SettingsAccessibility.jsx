import React, { useEffect, useState } from 'react';
import { useSettings } from '../context/SettingsContext';
import SettingsHeader from '../components/SettingsHeader';
import Card from '../components/Card';
import Loader from '../components/Loader';
import { Eye, ShieldAlert, Sparkles, Save } from 'lucide-react';

export const SettingsAccessibility = () => {
  const { preferences, fetchPreferences, updatePreferences } = useSettings();

  const [fontSize, setFontSize] = useState('medium');
  const [highContrast, setHighContrast] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [profileVisibility, setProfileVisibility] = useState('public');
  const [activityVisibility, setActivityVisibility] = useState('public');
  const [onlineStatusVisibility, setOnlineStatusVisibility] = useState('public');
  const [aiDataSharing, setAiDataSharing] = useState(true);

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  useEffect(() => {
    if (preferences) {
      setFontSize(preferences.fontSize);
      setHighContrast(preferences.highContrast);
      setReducedMotion(preferences.reducedMotion);
      setProfileVisibility(preferences.profileVisibility || 'public');
      setActivityVisibility(preferences.activityVisibility || 'public');
      setOnlineStatusVisibility(preferences.onlineStatusVisibility || 'public');
      setAiDataSharing(preferences.aiDataSharing);
    }
  }, [preferences]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updatePreferences({
        fontSize,
        highContrast,
        reducedMotion,
        profileVisibility,
        activityVisibility,
        onlineStatusVisibility,
        aiDataSharing
      });
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (!preferences) {
    return <Loader size="lg" message="Reading compliance parameters..." fullPage />;
  }

  return (
    <div className="space-y-6 font-sans text-xs">
      <SettingsHeader
        title="Accessibility & Privacy Options"
        subtitle="Manage contrast layouts, readable fonts, animations speed, and telemetry data sharing limits"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Accessibility Card */}
        <Card
          title="Accessibility Features"
          subtitle="Customize visual rendering rules for standard reading compatibility"
          className="border border-slate-200 bg-white p-5 shadow-2xs"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Font Size Selection */}
            <div>
              <label className="block text-slate-400 font-bold mb-1.5 uppercase tracking-wider text-[8px]">Standard Readable Font Size</label>
              <div className="grid grid-cols-3 gap-2">
                {['small', 'medium', 'large'].map(sz => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => setFontSize(sz)}
                    className={`cursor-pointer px-3 py-2 border rounded-lg font-bold text-center capitalize transition-all ${
                      fontSize === sz
                        ? 'border-indigo-605 bg-indigo-55/20 text-indigo-700'
                        : 'border-slate-200 hover:border-slate-350 bg-slate-50/20 text-slate-600'
                    }`}
                  >
                    <span className={sz === 'small' ? 'text-[10px]' : sz === 'medium' ? 'text-xs' : 'text-sm'}>
                      {sz}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* High Contrast */}
            <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
              <div>
                <p className="font-bold text-slate-750">High Contrast Layout Colors</p>
                <p className="text-[8px] text-slate-400 font-semibold mt-0.5">Increases background contrast for text clarity</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={highContrast}
                  onChange={(e) => setHighContrast(e.target.checked)}
                  className="sr-only peer cursor-pointer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-605" />
              </label>
            </div>

            {/* Reduced Motion */}
            <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
              <div>
                <p className="font-bold text-slate-750">Reduced Animation Motion</p>
                <p className="text-[8px] text-slate-400 font-semibold mt-0.5">Disables system transition animations to limit dizziness</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={reducedMotion}
                  onChange={(e) => setReducedMotion(e.target.checked)}
                  className="sr-only peer cursor-pointer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-605" />
              </label>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={saving}
                className="cursor-pointer bg-indigo-605 hover:bg-indigo-755 text-white font-bold px-4 py-1.5 rounded-lg flex items-center gap-1 shadow-sm disabled:opacity-50"
              >
                <Save className="h-3.5 w-3.5" />
                <span>Save Accessibility</span>
              </button>
            </div>

          </form>
        </Card>

        {/* Privacy Card */}
        <Card
          title="Privacy Settings"
          subtitle="Configure profile searchability and diagnostic telemetry data sharing"
          className="border border-slate-200 bg-white p-5 shadow-2xs"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Profile Visibility */}
            <div>
              <label className="block text-slate-400 font-bold mb-1.5 uppercase tracking-wider text-[8px]">Profile Directory Visibility</label>
              <select
                value={profileVisibility}
                onChange={(e) => setProfileVisibility(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold focus:outline-none cursor-pointer"
              >
                <option value="public">Public (Visible to all employees)</option>
                <option value="private">Private (Only visible to managers/admins)</option>
              </select>
            </div>

            {/* Online Status */}
            <div>
              <label className="block text-slate-400 font-bold mb-1.5 uppercase tracking-wider text-[8px]">Real-time Presence Online Indicator</label>
              <select
                value={onlineStatusVisibility}
                onChange={(e) => setOnlineStatusVisibility(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold focus:outline-none cursor-pointer"
              >
                <option value="public">Visible (Show online/offline dot)</option>
                <option value="private">Hidden (Always appear offline)</option>
              </select>
            </div>

            {/* AI Data Sharing */}
            <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
              <div>
                <p className="font-bold text-slate-750">AI Diagnostic Data Sharing</p>
                <p className="text-[8px] text-slate-400 font-semibold mt-0.5">Allow anonymized task logs to train personal assistants</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={aiDataSharing}
                  onChange={(e) => setAiDataSharing(e.target.checked)}
                  className="sr-only peer cursor-pointer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-605" />
              </label>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={saving}
                className="cursor-pointer bg-indigo-605 hover:bg-indigo-755 text-white font-bold px-4 py-1.5 rounded-lg flex items-center gap-1 shadow-sm disabled:opacity-50"
              >
                <Save className="h-3.5 w-3.5" />
                <span>Save Privacy settings</span>
              </button>
            </div>

          </form>
        </Card>

      </div>

    </div>
  );
};

export default SettingsAccessibility;
