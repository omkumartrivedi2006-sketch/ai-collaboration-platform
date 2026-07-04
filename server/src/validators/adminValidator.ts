import { body, param, query } from 'express-validator';
import { Role } from '@prisma/client';

export const validateCreateUser = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').trim().isEmail().withMessage('Valid email is required'),
  body('password')
    .optional()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role')
    .optional()
    .isIn(Object.values(Role))
    .withMessage(`Role must be one of: ${Object.values(Role).join(', ')}`),
  body('departmentId')
    .optional()
    .isUUID()
    .withMessage('Department ID must be a valid UUID')
];

export const validateUpdateUser = [
  param('id').isUUID().withMessage('Valid User ID is required'),
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('email').optional().trim().isEmail().withMessage('Valid email is required'),
  body('role')
    .optional()
    .isIn(Object.values(Role))
    .withMessage(`Role must be one of: ${Object.values(Role).join(', ')}`),
  body('departmentId')
    .optional()
    .custom((val) => val === '' || val === null || /^[0-9a-fA-F-]{36}$/.test(val))
    .withMessage('Department ID must be a valid UUID or empty')
];

export const validateCreateDepartment = [
  body('name').trim().notEmpty().withMessage('Department name is required'),
  body('description').optional().trim(),
  body('managerId')
    .optional()
    .custom((val) => val === '' || val === null || /^[0-9a-fA-F-]{36}$/.test(val))
    .withMessage('Manager ID must be a valid UUID or empty')
];

export const validateUpdateDepartment = [
  param('id').isUUID().withMessage('Valid Department ID is required'),
  body('name').optional().trim().notEmpty().withMessage('Department name cannot be empty'),
  body('description').optional().trim(),
  body('managerId')
    .optional()
    .custom((val) => val === '' || val === null || /^[0-9a-fA-F-]{36}$/.test(val))
    .withMessage('Manager ID must be a valid UUID or empty')
];

export const validateCreateInvitation = [
  body('email').trim().isEmail().withMessage('Valid recipient email is required'),
  body('role')
    .isIn(Object.values(Role))
    .withMessage(`Role must be one of: ${Object.values(Role).join(', ')}`),
  body('departmentId')
    .optional()
    .custom((val) => val === '' || val === null || /^[0-9a-fA-F-]{36}$/.test(val))
    .withMessage('Department ID must be a valid UUID or empty')
];

export const validateUpdateSettings = [
  body('name').trim().notEmpty().withMessage('Organization Name is required'),
  body('email').optional().trim().isEmail().withMessage('Valid contact email is required'),
  body('timezone').optional().trim(),
  body('brandColors').optional().trim().matches(/^#[0-9a-fA-F]{6}$/).withMessage('Brand color must be a valid hex color code'),
  body('workingDays').optional().trim(),
  body('workingHours').optional().trim()
];
