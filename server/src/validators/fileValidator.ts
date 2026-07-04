import { body, param } from 'express-validator';
import { validateRequest } from './authValidator';

export const createFolderValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Folder name is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Folder name must be between 1 and 100 characters')
    .matches(/^[^\\/?%*:|"<>\.]+$/)
    .withMessage('Folder name contains invalid characters'),
  body('parentId')
    .optional({ nullable: true })
    .isUUID()
    .withMessage('Invalid parent folder ID format'),
  body('projectId')
    .optional({ nullable: true })
    .isUUID()
    .withMessage('Invalid project ID format'),
  validateRequest
];

export const renameFolderValidator = [
  param('id')
    .isUUID()
    .withMessage('Invalid folder ID format'),
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Folder name is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Folder name must be between 1 and 100 characters')
    .matches(/^[^\\/?%*:|"<>\.]+$/)
    .withMessage('Folder name contains invalid characters'),
  validateRequest
];

export const fileIdParamValidator = [
  param('id')
    .isUUID()
    .withMessage('Invalid file ID format'),
  validateRequest
];

export const renameFileValidator = [
  param('id')
    .isUUID()
    .withMessage('Invalid file ID format'),
  body('name')
    .trim()
    .notEmpty()
    .withMessage('File name is required')
    .isLength({ min: 1, max: 150 })
    .withMessage('File name must be between 1 and 150 characters'),
  validateRequest
];

export const shareFileValidator = [
  param('id')
    .isUUID()
    .withMessage('Invalid file ID format'),
  body('targetUserId')
    .isUUID()
    .withMessage('Invalid target user ID format'),
  body('permission')
    .isIn(['VIEW', 'DOWNLOAD', 'EDIT', 'OWNER'])
    .withMessage('Invalid permission level'),
  validateRequest
];
