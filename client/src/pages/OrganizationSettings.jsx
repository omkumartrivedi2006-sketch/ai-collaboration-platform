import React, { useEffect, useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import Card from '../components/Card';
import Loader from '../components/Loader';
import PermissionMatrix from '../components/PermissionMatrix';
import { Settings, ShieldCheck, Calendar, Save, Building } from 'lucide-react';

export const OrganizationSettings = () => {
  const { settings, loading, fetchSettings, updateSettings } = useAdmin();

  // Tab State
  const [activeTab, setActiveTab] = useState('profile');

  // Form Fields State
  const [name, setName] = useState('');
  const [logo, setLogo] = useState('');
  const [website, setWebsite] = useState('');
  const [industry, setIndustry] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [timezone, setTimezone] = useState('UTC');
  const [language, setLanguage] = useState('en');
  const [brandColors, setBrandColors] = useState('#4f46e5');
  const [workingDays, setWorkingDays] = useState('');
  const [workingHours, setWorkingHours] = useState('');

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    if (settings) {
      setName(settings.name || '');
      setLogo(settings.logo || '');
      setWebsite(settings.website || '');
      setIndustry(settings.industry || '');
      setAddress(settings.address || '');
      setPhone(settings.phone || '');
      setEmail(settings.email || '');
      setTimezone(settings.timezone || 'UTC');
      setLanguage(settings.language || 'en');
      setBrandColors(settings.brandColors || '#4f46e5');
      setWorkingDays(settings.workingDays || 'Monday,Tuesday,Wednesday,Thursday,Friday');
      setWorkingHours(settings.workingHours || '09:00-17:00');
    }
  }, [settings]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateSettings({
        name,
        logo,
        website,
        industry,
        address,
        phone,
        email,
        timezone,
        language,
        brandColors,
        workingDays,
        workingHours
      });
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading && !settings) {
    return <Loader size="lg" message="Loading organization telemetry..." fullPage />;
  }

  return (
    <div className="space-y-6 font-sans text-xs">
      
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">Organization Profile & Settings</h2>
        <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide mt-0.5">
          Configure branding, working days schedule, and customize role permission matrices
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('profile')}
          className={`cursor-pointer px-4 py-2 font-bold text-xs border-b-2 transition-all ${
            activeTab === 'profile'
              ? 'border-indigo-600 text-indigo-650'
              : 'border-transparent text-slate-450 hover:text-slate-700'
          }`}
        >
          Company Profile
        </button>
        <button
          onClick={() => setActiveTab('working')}
          className={`cursor-pointer px-4 py-2 font-bold text-xs border-b-2 transition-all ${
            activeTab === 'working'
              ? 'border-indigo-600 text-indigo-655'
              : 'border-transparent text-slate-450 hover:text-slate-700'
          }`}
        >
          Working Schedule & Brand
        </button>
        <button
          onClick={() => setActiveTab('matrix')}
          className={`cursor-pointer px-4 py-2 font-bold text-xs border-b-2 transition-all ${
            activeTab === 'matrix'
              ? 'border-indigo-600 text-indigo-655'
              : 'border-transparent text-slate-450 hover:text-slate-700'
          }`}
        >
          Roles & Permissions Matrix
        </button>
      </div>

      {/* Conditional layouts based on Tab selection */}
      {activeTab === 'profile' && (
        <Card
          title="Company Identity Settings"
          subtitle="Configure default brand name, website links, and contact options"
          className="border border-slate-200 bg-white p-5 shadow-2xs"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 font-bold mb-1 uppercase tracking-wider text-[8px]">Company Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1 uppercase tracking-wider text-[8px]">Website URL</label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://company.com"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1 uppercase tracking-wider text-[8px]">Industry Sector</label>
                <input
                  type="text"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  placeholder="Software / Engineering"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1 uppercase tracking-wider text-[8px]">Contact Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1 uppercase tracking-wider text-[8px]">Contact Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1 uppercase tracking-wider text-[8px]">Corporate Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={saving}
                className="cursor-pointer bg-indigo-605 hover:bg-indigo-705 text-white font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                <span>{saving ? 'Saving...' : 'Save Profile Details'}</span>
              </button>
            </div>
          </form>
        </Card>
      )}

      {activeTab === 'working' && (
        <Card
          title="Branding & Working Hours"
          subtitle="Configure default timezone settings and shift windows for analytics capacity metrics"
          className="border border-slate-200 bg-white p-5 shadow-2xs"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 font-bold mb-1 uppercase tracking-wider text-[8px]">Standard Timezone</label>
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

              <div>
                <label className="block text-slate-400 font-bold mb-1 uppercase tracking-wider text-[8px]">Language Locales</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold focus:outline-none cursor-pointer"
                >
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1 uppercase tracking-wider text-[8px]">Brand Primary Color (HEX)</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={brandColors}
                    onChange={(e) => setBrandColors(e.target.value)}
                    className="h-9 w-9 bg-transparent border-0 cursor-pointer"
                  />
                  <input
                    type="text"
                    required
                    value={brandColors}
                    onChange={(e) => setBrandColors(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1 uppercase tracking-wider text-[8px]">Working Shifts Hours</label>
                <input
                  type="text"
                  value={workingHours}
                  onChange={(e) => setWorkingHours(e.target.value)}
                  placeholder="09:00-17:00"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-400 font-bold mb-1 uppercase tracking-wider text-[8px]">Working Days (comma separated)</label>
                <input
                  type="text"
                  value={workingDays}
                  onChange={(e) => setWorkingDays(e.target.value)}
                  placeholder="Monday,Tuesday,Wednesday,Thursday,Friday"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={saving}
                className="cursor-pointer bg-indigo-605 hover:bg-indigo-755 text-white font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                <span>{saving ? 'Saving...' : 'Save Shifts Configurations'}</span>
              </button>
            </div>
          </form>
        </Card>
      )}

      {activeTab === 'matrix' && (
        <PermissionMatrix />
      )}

    </div>
  );
};

export default OrganizationSettings;
