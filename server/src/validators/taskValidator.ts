import { body, param } from 'express-validator';
import { validateRequest } from './authValidator';

export const createTaskValidator = [
  body('projectId')
    .notEmpty()
    .withMessage('Project ID is required')
    .isUUID()
    .withMessage('Invalid project ID format'),
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Task title is required')
    .isLength({ min: 2, max: 150 })
    .withMessage('Task title must be between 2 and 150 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),
  body('status')
    .optional()
    .isIn(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'BLOCKED', 'COMPLETED'])
    .withMessage('Invalid task status'),
  body('priority')
    .optional()
    .isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
    .withMessage('Invalid task priority'),
  body('assignedTo')
    .optional({ checkFalsy: true })
    .isUUID()
    .withMessage('Invalid assignee user ID format'),
  body('estimatedHours')
    .optional({ checkFalsy: true })
    .isFloat({ min: 0 })
    .withMessage('Estimated hours must be a positive number'),
  body('startDate')
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage('Start date must be a valid ISO date'),
  body('deadline')
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage('Deadline must be a valid ISO date')
    .custom((value, { req }) => {
      if (req.body.startDate && value && new Date(value) < new Date(req.body.startDate)) {
        throw new Error('Deadline cannot be prior to start date');
      }
      return true;
    }),
  validateRequest
];

export const updateTaskValidator = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 2, max: 150 })
    .withMessage('Task title must be between 2 and 150 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),
  body('status')
    .optional()
    .isIn(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'BLOCKED', 'COMPLETED'])
    .withMessage('Invalid task status'),
  body('priority')
    .optional()
    .isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
    .withMessage('Invalid task priority'),
  body('assignedTo')
    .optional({ nullable: true })
    .custom((value) => {
      if (value === null || value === '') return true;
      const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
      if (!uuidRegex.test(value)) {
        throw new Error('Invalid assignee user ID format');
      }
      return true;
    }),
  body('estimatedHours')
    .optional({ nullable: true })
    .custom((value) => {
      if (value === null || value === '') return true;
      if (typeof value !== 'number' || value < 0) {
        throw new Error('Estimated hours must be a positive number');
      }
      return true;
    }),
  body('actualHours')
    .optional({ nullable: true })
    .custom((value) => {
      if (value === null || value === '') return true;
      if (typeof value !== 'number' || value < 0) {
        throw new Error('Actual hours must be a positive number');
      }
      return true;
    }),
  body('startDate')
    .optional({ nullable: true })
    .custom((value) => {
      if (value === null || value === '') return true;
      if (isNaN(Date.parse(value))) {
        throw new Error('Start date must be a valid date string');
      }
      return true;
    }),
  body('deadline')
    .optional({ nullable: true })
    .custom((value, { req }) => {
      if (value === null || value === '') return true;
      if (isNaN(Date.parse(value))) {
        throw new Error('Deadline must be a valid date string');
      }
      if (req.body.startDate && new Date(value) < new Date(req.body.startDate)) {
        throw new Error('Deadline cannot be prior to start date');
      }
      return true;
    }),
  validateRequest
];

export const commentValidator = [
  body('comment')
    .trim()
    .notEmpty()
    .withMessage('Comment text is required')
    .isLength({ max: 1000 })
    .withMessage('Comment must not exceed 1000 characters'),
  validateRequest
];

export const taskIdParamValidator = [
  param('id')
    .isUUID()
    .withMessage('Invalid task ID format'),
  validateRequest
];
