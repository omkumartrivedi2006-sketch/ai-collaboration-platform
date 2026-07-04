import { Router } from 'express';
import { NotificationController } from '../controllers/notificationController';
import { protect } from '../middleware/authMiddleware';

const router = Router();
const controller = new NotificationController();

router.use(protect);

router.get('/', controller.getNotifications);
router.patch('/read-all', controller.markAllAsRead);
router.patch('/read/:id', controller.markAsRead);

export default router;
