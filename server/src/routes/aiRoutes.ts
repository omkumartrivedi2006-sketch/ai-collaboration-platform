import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import {
  chat,
  summarizeMeeting,
  generateTasks,
  projectReport,
  translate,
  documentSummary,
  getConversations,
  getConversationMessages,
  getReports
} from '../controllers/aiController';
import {
  chatValidator,
  summarizeMeetingValidator,
  generateTasksValidator,
  projectReportValidator,
  translateValidator,
  documentSummaryValidator
} from '../validators/aiValidator';

const router = Router();

// Protect all AI features endpoints
router.use(protect);

router.post('/chat', chatValidator, chat);
router.post('/summarize-meeting', summarizeMeetingValidator, summarizeMeeting);
router.post('/generate-tasks', generateTasksValidator, generateTasks);
router.post('/project-report', projectReportValidator, projectReport);
router.post('/translate', translateValidator, translate);
router.post('/document-summary', documentSummaryValidator, documentSummary);

router.get('/conversations', getConversations);
router.get('/conversations/:id/messages', getConversationMessages);
router.get('/reports', getReports);

export default router;
