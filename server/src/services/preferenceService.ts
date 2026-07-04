import prisma from '../config/db';
import { Theme, Language } from '@prisma/client';

export class PreferenceService {
  async getPreferences(userId: string) {
    let preference = await prisma.userPreference.findUnique({
      where: { userId }
    });

    if (!preference) {
      preference = await prisma.userPreference.create({
        data: {
          userId,
          theme: Theme.SYSTEM,
          language: Language.ENGLISH,
          timezone: 'UTC',
          dateFormat: 'YYYY-MM-DD',
          timeFormat: '24h',
          sidebarCollapsed: false,
          compactMode: false,
          emailNotifications: true,
          pushNotifications: true,
          meetingReminders: true,
          taskReminders: true,
          projectUpdates: true,
          chatNotifications: true,
          highContrast: false,
          reducedMotion: false,
          fontSize: 'medium',
          profileVisibility: 'public',
          activityVisibility: 'public',
          onlineStatusVisibility: 'public',
          aiDataSharing: true
        }
      });
    }

    return preference;
  }

  async updatePreferences(userId: string, data: any) {
    const preference = await this.getPreferences(userId);

    return prisma.userPreference.update({
      where: { id: preference.id },
      data: {
        theme: data.theme,
        language: data.language,
        timezone: data.timezone,
        dateFormat: data.dateFormat,
        timeFormat: data.timeFormat,
        sidebarCollapsed: data.sidebarCollapsed,
        compactMode: data.compactMode,
        emailNotifications: data.emailNotifications,
        pushNotifications: data.pushNotifications,
        meetingReminders: data.meetingReminders,
        taskReminders: data.taskReminders,
        projectUpdates: data.projectUpdates,
        chatNotifications: data.chatNotifications,
        highContrast: data.highContrast,
        reducedMotion: data.reducedMotion,
        fontSize: data.fontSize,
        profileVisibility: data.profileVisibility,
        activityVisibility: data.activityVisibility,
        onlineStatusVisibility: data.onlineStatusVisibility,
        aiDataSharing: data.aiDataSharing
      }
    });
  }
}
