import { Router, Request, Response, NextFunction } from 'express';
import { protect } from '../middleware/authMiddleware';
import { uploadRateLimiter } from '../middleware/uploadRateLimiter';
import {
  uploadFile,
  replaceFile,
  renameFile,
  deleteFile,
  restoreFile,
  downloadFile,
  getVersions,
  revertVersion,
  listFiles,
  getFileMetadata,
  getStorageUsage,
  grantPermission,
  revokePermission,
  getPermissions,
  moveFile,
  copyFile
} from '../controllers/fileController';
import {
  fileIdParamValidator,
  renameFileValidator,
  shareFileValidator
} from '../validators/fileValidator';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Custom Multer instance for large files (100MB)
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const uploadLarge = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB
});

const router = Router();

router.use(protect);

// Storage usage
router.get('/storage-usage', getStorageUsage);

// File list and upload
router.get('/', listFiles);
router.post('/upload', uploadRateLimiter, uploadLarge.single('file'), uploadFile);

// File details and management
router.get('/:id', fileIdParamValidator, getFileMetadata);
router.delete('/:id', fileIdParamValidator, deleteFile);
router.patch('/:id/restore', fileIdParamValidator, restoreFile);
router.get('/:id/download', fileIdParamValidator, downloadFile);
router.get('/:id/versions', fileIdParamValidator, getVersions);
router.post('/:id/versions/:versionId/revert', fileIdParamValidator, revertVersion);

// Move and Copy
router.patch('/:id/move', fileIdParamValidator, moveFile);
router.post('/:id/copy', fileIdParamValidator, copyFile);

// PUT route handles both renaming (if JSON name provided) and replacing (if multipart file provided)
router.put('/:id', fileIdParamValidator, uploadLarge.single('file'), (req: Request, res: Response, next: NextFunction) => {
  if (req.file) {
    return replaceFile(req, res, next);
  } else {
    return renameFile(req, res, next);
  }
});

// Sharing & Permissions
router.get('/:id/permissions', fileIdParamValidator, getPermissions);
router.post('/:id/permissions', shareFileValidator, grantPermission);
router.delete('/:id/permissions/:userId', fileIdParamValidator, revokePermission);

export default router;
