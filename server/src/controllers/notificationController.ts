import { Request, Response, NextFunction } from 'express';
import { NotificationService } from '../services/notificationService';
import { AppError } from '../utils/AppError';

const notificationService = new NotificationService();

export class NotificationController {
  async getNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) return next(new AppError('Not authenticated', 401));

      const notifications = await notificationService.getUserNotificationsGrouped(userId);

      res.status(200).json({
        status: 'success',
        data: notifications
      });
    } catch (err) {
      next(err);
    }
  }

  async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { ids } = req.body; // Array of IDs in case of grouped notification reads
      const userId = req.user?.id;
      if (!userId) return next(new AppError('Not authenticated', 401));

      await notificationService.markAsRead(id, ids);

      res.status(200).json({
        status: 'success',
        message: 'Notification marked as read successfully'
      });
    } catch (err) {
      next(err);
    }
  }

  async markAllAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) return next(new AppError('Not authenticated', 401));

      await notificationService.markAllAsRead(userId);

      res.status(200).json({
        status: 'success',
        message: 'All notifications marked as read'
      });
    } catch (err) {
      next(err);
    }
  }
}
export default NotificationController;
