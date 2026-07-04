import React, { useState } from 'react';
import { useSettings } from '../context/SettingsContext';
import SettingsHeader from '../components/SettingsHeader';
import Card from '../components/Card';
import { KeyRound, ShieldAlert, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export const SettingsSecurity = () => {
  const { changePassword } = useSettings();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [saving, setSaving] = useState(false);

  // Compute password strength score
  const getPasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, label: 'None', color: 'bg-slate-200' };
    if (pwd.length < 6) return { score: 1, label: 'Too Short (Weak)', color: 'bg-rose-500' };
    
    let strength = 2;
    const hasSpecial = /[^A-Za-z0-9]/.test(pwd);
    const hasNum = /[0-9]/.test(pwd);
    const hasUpper = /[A-Z]/.test(pwd);

    if (pwd.length >= 8 && hasSpecial && hasNum && hasUpper) {
      return { score: 3, label: 'Strong & Secure', color: 'bg-emerald-500' };
    }
    return { score: 2, label: 'Medium Security', color: 'bg-amber-500' };
  };

  const strength = getPasswordStrength(newPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    setSaving(true);
    try {
      await changePassword({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 font-sans text-xs">
      <SettingsHeader
        title="Security Settings"
        subtitle="Manage user authentication passwords, verify current parameters, and inspect strength meters"
      />

      <Card className="border border-slate-200 bg-white p-5 shadow-2xs max-w-lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div>
            <label className="block text-slate-400 font-bold mb-1 uppercase tracking-wider text-[8px]">Current Password</label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-bold mb-1 uppercase tracking-wider text-[8px]">New Password</label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold focus:outline-none"
            />
          </div>

          {/* Strength Meter */}
          {newPassword && (
            <div className="space-y-1 bg-slate-50 border border-slate-100 p-2.5 rounded-lg">
              <div className="flex justify-between items-center text-[9px] font-bold text-slate-450 uppercase">
                <span>Strength: {strength.label}</span>
                <span>{strength.score}/3</span>
              </div>
              <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${strength.color} transition-all duration-300`}
                  style={{ width: `${(strength.score / 3) * 100}%` }}
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-slate-400 font-bold mb-1 uppercase tracking-wider text-[8px]">Confirm New Password</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold focus:outline-none"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="cursor-pointer bg-indigo-605 hover:bg-indigo-755 text-white font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              <KeyRound className="h-4 w-4" />
              <span>{saving ? 'Updating...' : 'Change Password'}</span>
            </button>
          </div>

        </form>
      </Card>
    </div>
  );
};

export default SettingsSecurity;
