import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import {
  getDashboardOverview,
  getProjectAnalytics,
  getTeamAnalytics,
  getEmployeeAnalytics,
  getMeetingAnalytics,
  getAIAnalytics
} from '../controllers/analyticsController';

const router = Router();

// Protect all routes
router.use(protect);

router.get('/dashboard', getDashboardOverview);
router.get('/projects', getProjectAnalytics);
router.get('/team', getTeamAnalytics);
router.get('/employees', getEmployeeAnalytics);
router.get('/meetings', getMeetingAnalytics);
router.get('/ai', getAIAnalytics);

export default router;
