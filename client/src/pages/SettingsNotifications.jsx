import React, { useEffect, useState } from 'react';
import { useSettings } from '../context/SettingsContext';
import SettingsHeader from '../components/SettingsHeader';
import Card from '../components/Card';
import Loader from '../components/Loader';
import { Bell, Mail, Radio, Users, MessageCircle, ClipboardCheck, CalendarRange, Save } from 'lucide-react';

export const SettingsNotifications = () => {
  const { preferences, fetchPreferences, updatePreferences } = useSettings();

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [meetingReminders, setMeetingReminders] = useState(true);
  const [taskReminders, setTaskReminders] = useState(true);
  const [projectUpdates, setProjectUpdates] = useState(true);
  const [chatNotifications, setChatNotifications] = useState(true);

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  useEffect(() => {
    if (preferences) {
      setEmailNotifications(preferences.emailNotifications);
      setPushNotifications(preferences.pushNotifications);
      setMeetingReminders(preferences.meetingReminders);
      setTaskReminders(preferences.taskReminders);
      setProjectUpdates(preferences.projectUpdates);
      setChatNotifications(preferences.chatNotifications);
    }
  }, [preferences]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updatePreferences({
        emailNotifications,
        pushNotifications,
        meetingReminders,
        taskReminders,
        projectUpdates,
        chatNotifications
      });
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (!preferences) {
    return <Loader size="lg" message="Reading notification filters..." fullPage />;
  }

  const switches = [
    {
      title: 'Email Notifications',
      description: 'Receive system alerts, billing reports, and admin modifications via email',
      value: emailNotifications,
      setter: setEmailNotifications,
      icon: Mail
    },
    {
      title: 'Push Notifications',
      description: 'Real-time alert prompts delivered directly to your web browser dashboard',
      value: pushNotifications,
      setter: setPushNotifications,
      icon: Radio
    },
    {
      title: 'Meeting Reminders',
      description: 'Alert notifications 10 minutes prior to sync room scheduled calendar slots',
      value: meetingReminders,
      setter: setMeetingReminders,
      icon: CalendarRange
    },
    {
      title: 'Task Assignment Reminders',
      description: 'Receive warnings when new task cards are delegated or deadlines are modified',
      value: taskReminders,
      setter: setTaskReminders,
      icon: ClipboardCheck
    },
    {
      title: 'Project Update Alerts',
      description: 'Receive updates when new project directories or backlogs are initialized',
      value: projectUpdates,
      setter: setProjectUpdates,
      icon: Users
    },
    {
      title: 'Chat Message Notifications',
      description: 'Direct alert prompts when another teammate messages you on Chat Channels',
      value: chatNotifications,
      setter: setChatNotifications,
      icon: MessageCircle
    }
  ];

  return (
    <div className="space-y-6 font-sans text-xs">
      <SettingsHeader
        title="Notification Preferences"
        subtitle="Control and filter communication channels, meeting rings, and assignment pings"
      />

      <Card className="border border-slate-200 bg-white p-5 shadow-2xs max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          
          <div className="space-y-4">
            {switches.map((sw, idx) => {
              const Icon = sw.icon;
              return (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl">
                  <div className="flex gap-3 items-start pr-4">
                    <span className="p-2 bg-indigo-50 border border-indigo-150 text-indigo-650 rounded-lg flex-shrink-0 mt-0.5">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="font-bold text-slate-750">{sw.title}</p>
                      <p className="text-[9px] text-slate-400 font-semibold leading-relaxed">{sw.description}</p>
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={sw.value}
                      onChange={(e) => sw.setter(e.target.checked)}
                      className="sr-only peer cursor-pointer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-605" />
                  </label>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end pt-2 border-t border-slate-100">
            <button
              type="submit"
              disabled={saving}
              className="cursor-pointer bg-indigo-605 hover:bg-indigo-755 text-white font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              <span>{saving ? 'Saving...' : 'Save Notification Prefs'}</span>
            </button>
          </div>

        </form>
      </Card>
    </div>
  );
};

export default SettingsNotifications;
