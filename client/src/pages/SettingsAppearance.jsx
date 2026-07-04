import React, { useEffect, useState } from 'react';
import { useSettings } from '../context/SettingsContext';
import SettingsHeader from '../components/SettingsHeader';
import Card from '../components/Card';
import Loader from '../components/Loader';
import { Palette, Globe, Calendar, Clock, Save, Monitor, Moon, Sun } from 'lucide-react';

export const SettingsAppearance = () => {
  const { preferences, fetchPreferences, updatePreferences } = useSettings();

  const [theme, setTheme] = useState('SYSTEM');
  const [language, setLanguage] = useState('ENGLISH');
  const [timezone, setTimezone] = useState('UTC');
  const [dateFormat, setDateFormat] = useState('YYYY-MM-DD');
  const [timeFormat, setTimeFormat] = useState('24h');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [compactMode, setCompactMode] = useState(false);

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  useEffect(() => {
    if (preferences) {
      setTheme(preferences.theme);
      setLanguage(preferences.language);
      setTimezone(preferences.timezone);
      setDateFormat(preferences.dateFormat);
      setTimeFormat(preferences.timeFormat);
      setSidebarCollapsed(preferences.sidebarCollapsed);
      setCompactMode(preferences.compactMode);
    }
  }, [preferences]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updatePreferences({
        theme,
        language,
        timezone,
        dateFormat,
        timeFormat,
        sidebarCollapsed,
        compactMode
      });
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (!preferences) {
    return <Loader size="lg" message="Reading canvas theme matrices..." fullPage />;
  }

  return (
    <div className="space-y-6 font-sans text-xs">
      <SettingsHeader
        title="Theme & Personalization"
        subtitle="Configure standard system languages, time zone offsets, dates, and light/dark theme overrides"
      />

      <Card className="border border-slate-200 bg-white p-5 shadow-2xs max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Theme Selection Grid */}
          <div>
            <label className="block text-slate-400 font-bold mb-2.5 uppercase tracking-wider text-[8px]">Select Interface Theme</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { name: 'LIGHT', label: 'Light Mode', desc: 'Clean, high-brightness layout', icon: Sun },
                { name: 'DARK', label: 'Dark Mode', desc: 'Vibrant contrast, low-light workspace', icon: Moon },
                { name: 'SYSTEM', label: 'System Prefs', desc: 'Syncs theme with operating system settings', icon: Monitor }
              ].map(t => {
                const Icon = t.icon;
                const isSelected = theme === t.name;
                return (
                  <button
                    key={t.name}
                    type="button"
                    onClick={() => setTheme(t.name)}
                    className={`cursor-pointer p-4 border rounded-xl text-left transition-all ${
                      isSelected
                        ? 'border-indigo-605 bg-indigo-50/30 ring-1 ring-indigo-500'
                        : 'border-slate-200 hover:border-slate-350 bg-slate-50/20'
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${isSelected ? 'text-indigo-600' : 'text-slate-450'}`} />
                    <p className="font-bold text-slate-750 mt-2">{t.label}</p>
                    <p className="text-[8px] text-slate-400 font-semibold mt-0.5 leading-relaxed">{t.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-100 pt-4">
            
            {/* Language */}
            <div>
              <label className="block text-slate-400 font-bold mb-1 uppercase tracking-wider text-[8px]">System Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold focus:outline-none cursor-pointer"
              >
                <option value="ENGLISH">English</option>
                <option value="HINDI">Hindi (हिन्दी)</option>
                <option value="SPANISH">Español</option>
                <option value="FRENCH">Français</option>
                <option value="GERMAN">Deutsch</option>
              </select>
            </div>

            {/* Timezone */}
            <div>
              <label className="block text-slate-400 font-bold mb-1 uppercase tracking-wider text-[8px]">Personal Timezone</label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold focus:outline-none cursor-pointer"
              >
                <option value="UTC">UTC (Coordinated Universal Time)</option>
                <option value="America/New_York">America/New_York (EST)</option>
                <option value="Europe/London">Europe/London (GMT)</option>
                <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
              </select>
            </div>

            {/* Date format */}
            <div>
              <label className="block text-slate-400 font-bold mb-1 uppercase tracking-wider text-[8px]">Date Display Format</label>
              <select
                value={dateFormat}
                onChange={(e) => setDateFormat(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold focus:outline-none cursor-pointer"
              >
                <option value="YYYY-MM-DD">YYYY-MM-DD (2026-07-05)</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY (05/07/2026)</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY (07/05/2026)</option>
              </select>
            </div>

            {/* Time format */}
            <div>
              <label className="block text-slate-400 font-bold mb-1 uppercase tracking-wider text-[8px]">Time Display Format</label>
              <select
                value={timeFormat}
                onChange={(e) => setTimeFormat(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold focus:outline-none cursor-pointer"
              >
                <option value="12h">12-hour (01:19 PM)</option>
                <option value="24h">24-hour (13:19)</option>
              </select>
            </div>

            {/* Sidebar Collapsed Toggle */}
            <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl sm:col-span-2">
              <div>
                <p className="font-bold text-slate-750">Collapse Navigation Sidebar</p>
                <p className="text-[9px] text-slate-400 font-semibold mt-0.5">Compress the sidebar by default to leave more screen canvas</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={sidebarCollapsed}
                  onChange={(e) => setSidebarCollapsed(e.target.checked)}
                  className="sr-only peer cursor-pointer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-605" />
              </label>
            </div>

            {/* Compact Mode Toggle */}
            <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl sm:col-span-2">
              <div>
                <p className="font-bold text-slate-750">Compact Information Grid Mode</p>
                <p className="text-[9px] text-slate-400 font-semibold mt-0.5">Display components with tighter margins and spacing</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={compactMode}
                  onChange={(e) => setCompactMode(e.target.checked)}
                  className="sr-only peer cursor-pointer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-605" />
              </label>
            </div>

          </div>

          <div className="flex justify-end pt-2 border-t border-slate-100">
            <button
              type="submit"
              disabled={saving}
              className="cursor-pointer bg-indigo-605 hover:bg-indigo-755 text-white font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              <span>{saving ? 'Saving...' : 'Save Themes settings'}</span>
            </button>
          </div>

        </form>
      </Card>
    </div>
  );
};

export default SettingsAppearance;
