import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import {
  generateReport,
  getReports,
  downloadReport
} from '../controllers/reportController';

const router = Router();

// Protect all routes
router.use(protect);

router.post('/generate', generateReport);
router.get('/', getReports);
router.get('/download/:id', downloadReport);

export default router;
