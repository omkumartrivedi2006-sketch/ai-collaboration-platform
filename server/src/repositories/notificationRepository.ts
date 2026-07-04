import prisma from '../config/db';
import { Notification, NotificationType } from '@prisma/client';

export class NotificationRepository {
  async create(data: {
    userId: string;
    title: string;
    description: string;
    type: NotificationType;
    actionUrl?: string;
  }): Promise<Notification> {
    return prisma.notification.create({
      data: {
        userId: data.userId,
        title: data.title,
        description: data.description,
        type: data.type,
        actionUrl: data.actionUrl
      }
    });
  }

  async getUserNotifications(userId: string): Promise<Notification[]> {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 100
    });
  }

  async markAsRead(id: string): Promise<Notification> {
    return prisma.notification.update({
      where: { id },
      data: { isRead: true }
    });
  }

  async markManyAsRead(ids: string[]): Promise<void> {
    await prisma.notification.updateMany({
      where: { id: { in: ids } },
      data: { isRead: true }
    });
  }

  async markAllAsRead(userId: string): Promise<void> {
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true }
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.notification.delete({
      where: { id }
    });
  }
}
export default NotificationRepository;
