import React, { useState, useEffect } from 'react';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';
import SettingsHeader from '../components/SettingsHeader';
import Card from '../components/Card';
import { Save, User } from 'lucide-react';

export const SettingsProfile = () => {
  const { user } = useAuth();
  const { updateProfile, loading } = useSettings();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [avatar, setAvatar] = useState('');
  const [designation, setDesignation] = useState('');
  const [bio, setBio] = useState('');
  const [website, setWebsite] = useState('');
  const [location, setLocation] = useState('');

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setAvatar(user.avatar || '');
      setDesignation(user.designation || '');
      setBio(user.bio || '');
      setWebsite(user.website || '');
      setLocation(user.location || '');
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({
        name,
        phone: phone || null,
        avatar,
        designation,
        bio: bio || null,
        website: website || null,
        location: location || null
      });
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 font-sans text-xs">
      <SettingsHeader
        title="Profile Settings"
        subtitle="Manage your public avatar details, phone listings, and personal website"
      />

      <Card className="border border-slate-200 bg-white p-5 shadow-2xs">
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center border-b border-slate-100 pb-4 mb-2">
            <img
              src={avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${name || 'avatar'}`}
              alt="Avatar preview"
              className="h-16 w-16 rounded-full object-cover border-2 border-indigo-150"
            />
            <div className="flex-1 w-full">
              <label className="block text-slate-400 font-bold mb-1 uppercase tracking-wider text-[8px]">Avatar URL</label>
              <input
                type="text"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                placeholder="https://example.com/avatar.jpg"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 font-bold mb-1 uppercase tracking-wider text-[8px]">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-bold mb-1 uppercase tracking-wider text-[8px]">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 555-0199"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-bold mb-1 uppercase tracking-wider text-[8px]">Designation / Job Title</label>
              <input
                type="text"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                placeholder="Senior Engineer"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-bold mb-1 uppercase tracking-wider text-[8px]">Personal Website</label>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://mywebsite.com"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-bold mb-1 uppercase tracking-wider text-[8px]">Location City</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="San Francisco, CA"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-400 font-bold mb-1 uppercase tracking-wider text-[8px]">Biography Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell something about yourself..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold focus:outline-none h-20 resize-none"
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
              <span>{saving ? 'Saving...' : 'Save Profile Details'}</span>
            </button>
          </div>

        </form>
      </Card>
    </div>
  );
};

export default SettingsProfile;
