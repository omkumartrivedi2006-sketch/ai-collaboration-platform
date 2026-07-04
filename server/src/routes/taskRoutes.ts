import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import { upload } from '../middleware/uploadMiddleware';
import {
  createTask,
  listTasks,
  getTask,
  updateTask,
  updateTaskStatus,
  updateTaskPriority,
  archiveTask,
  restoreTask,
  deleteTask,
  addComment,
  updateComment,
  deleteComment,
  addAttachment,
  deleteAttachment,
  getActivities
} from '../controllers/taskController';
import {
  createTaskValidator,
  updateTaskValidator,
  commentValidator,
  taskIdParamValidator
} from '../validators/taskValidator';

const router = Router();

// Apply auth middleware globally on task routes
router.use(protect);

router.post('/', createTaskValidator, createTask);
router.get('/', listTasks);
router.get('/:id', taskIdParamValidator, getTask);
router.put('/:id', taskIdParamValidator, updateTaskValidator, updateTask);
router.delete('/:id', taskIdParamValidator, deleteTask);

router.patch('/:id/status', taskIdParamValidator, updateTaskStatus);
router.patch('/:id/priority', taskIdParamValidator, updateTaskPriority);
router.patch('/:id/archive', taskIdParamValidator, archiveTask);
router.patch('/:id/restore', taskIdParamValidator, restoreTask);

router.post('/:id/comments', taskIdParamValidator, commentValidator, addComment);
router.put('/comments/:id', commentValidator, updateComment);
router.delete('/comments/:id', deleteComment);

router.post('/:id/attachments', taskIdParamValidator, upload.single('file'), addAttachment);
router.delete('/attachments/:id', deleteAttachment);

router.get('/:id/activity', taskIdParamValidator, getActivities);

export default router;
