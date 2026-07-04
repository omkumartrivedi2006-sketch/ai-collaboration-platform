import { Router } from 'express';
import {
  createProject,
  listProjects,
  getProject,
  updateProject,
  deleteProject,
  archiveProject,
  restoreProject,
  addMember,
  removeMember,
  changeManager,
  getMembers,
  getActivities
} from '../controllers/projectController';
import { protect } from '../middleware/authMiddleware';
import {
  createProjectValidator,
  updateProjectValidator,
  memberValidator,
  changeManagerValidator
} from '../validators/projectValidator';

const router = Router();

// Apply auth middleware on all routes
router.use(protect);

router.post('/', createProjectValidator, createProject);
router.get('/', listProjects);
router.get('/:id', getProject);
router.put('/:id', updateProjectValidator, updateProject);
router.delete('/:id', deleteProject);

router.patch('/archive/:id', archiveProject);
router.patch('/restore/:id', restoreProject);

router.post('/:id/members', memberValidator, addMember);
router.delete('/:id/members/:userId', removeMember);
router.patch('/:id/manager', changeManagerValidator, changeManager);
router.get('/:id/members', getMembers);
router.get('/:id/activity', getActivities);

export default router;
