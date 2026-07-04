import { NotificationRepository } from '../repositories/notificationRepository';
import { notificationGateway } from '../socket/notificationGateway';
import { Notification, NotificationType } from '@prisma/client';

const notificationRepo = new NotificationRepository();

export class NotificationService {
  async createNotification(data: {
    userId: string;
    title: string;
    description: string;
    type: NotificationType;
    actionUrl?: string;
  }): Promise<Notification> {
    const notification = await notificationRepo.create(data);
    
    // Real-time emit to Socket room
    try {
      notificationGateway.sendRealTimeNotification(data.userId, notification);
    } catch (err) {
      console.warn('Real-time notification socket push skipped');
    }

    return notification;
  }

  async getUserNotificationsGrouped(userId: string) {
    const all = await notificationRepo.getUserNotifications(userId);
    const unread = all.filter(n => !n.isRead);
    const read = all.filter(n => n.isRead);

    const groupedUnread: any[] = [];
    
    const taskUnread = unread.filter(n => n.type === 'TASK');
    const projectUnread = unread.filter(n => n.type === 'PROJECT');
    const messageUnread = unread.filter(n => n.type === 'MESSAGE');
    const systemUnread = unread.filter(n => n.type === 'SYSTEM');

    if (taskUnread.length > 1) {
      groupedUnread.push({
        id: `grouped-task-${Date.now()}`,
        userId,
        title: 'Task Updates',
        description: `You have ${taskUnread.length} new task updates.`,
        type: 'TASK',
        isRead: false,
        actionUrl: '/tasks',
        createdAt: taskUnread[0].createdAt,
        ids: taskUnread.map(n => n.id)
      });
    } else if (taskUnread.length === 1) {
      groupedUnread.push(taskUnread[0]);
    }

    if (projectUnread.length > 1) {
      groupedUnread.push({
        id: `grouped-project-${Date.now()}`,
        userId,
        title: 'Project Updates',
        description: `You have ${projectUnread.length} new project updates.`,
        type: 'PROJECT',
        isRead: false,
        actionUrl: '/projects',
        createdAt: projectUnread[0].createdAt,
        ids: projectUnread.map(n => n.id)
      });
    } else if (projectUnread.length === 1) {
      groupedUnread.push(projectUnread[0]);
    }

    if (messageUnread.length > 1) {
      groupedUnread.push({
        id: `grouped-message-${Date.now()}`,
        userId,
        title: 'New Chat Messages',
        description: `You have ${messageUnread.length} new messages.`,
        type: 'MESSAGE',
        isRead: false,
        actionUrl: '/chat',
        createdAt: messageUnread[0].createdAt,
        ids: messageUnread.map(n => n.id)
      });
    } else if (messageUnread.length === 1) {
      groupedUnread.push(messageUnread[0]);
    }

    groupedUnread.push(...systemUnread);

    return {
      unread: groupedUnread,
      read
    };
  }

  async markAsRead(id: string, ids?: string[]): Promise<void> {
    if (ids && ids.length > 0) {
      await notificationRepo.markManyAsRead(ids);
    } else {
      await notificationRepo.markAsRead(id);
    }
  }

  async markAllAsRead(userId: string): Promise<void> {
    await notificationRepo.markAllAsRead(userId);
  }
}
export default NotificationService;
