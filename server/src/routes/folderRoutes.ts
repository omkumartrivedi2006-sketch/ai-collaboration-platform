import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import {
  createFolder,
  updateFolder,
  deleteFolder,
  getFolderContents,
  getFolderTree
} from '../controllers/folderController';
import {
  createFolderValidator,
  renameFolderValidator
} from '../validators/fileValidator';

const router = Router();

router.use(protect);

router.post('/', createFolderValidator, createFolder);
router.put('/:id', renameFolderValidator, updateFolder);
router.delete('/:id', deleteFolder);
router.get('/tree', getFolderTree);
router.get('/:id/contents', getFolderContents);
router.get('/contents', getFolderContents); // Root contents

export default router;
