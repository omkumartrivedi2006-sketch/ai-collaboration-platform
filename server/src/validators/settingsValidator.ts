import { body } from 'express-validator';
import { Theme, Language } from '@prisma/client';

export const validateUpdatePreferences = [
  body('theme')
    .optional()
    .isIn(Object.values(Theme))
    .withMessage(`Theme must be one of: ${Object.values(Theme).join(', ')}`),
  body('language')
    .optional()
    .isIn(Object.values(Language))
    .withMessage(`Language must be one of: ${Object.values(Language).join(', ')}`),
  body('timezone').optional().trim(),
  body('dateFormat').optional().trim(),
  body('timeFormat').optional().trim(),
  body('sidebarCollapsed').optional().isBoolean(),
  body('compactMode').optional().isBoolean(),
  body('emailNotifications').optional().isBoolean(),
  body('pushNotifications').optional().isBoolean(),
  body('meetingReminders').optional().isBoolean(),
  body('taskReminders').optional().isBoolean(),
  body('projectUpdates').optional().isBoolean(),
  body('chatNotifications').optional().isBoolean(),
  body('highContrast').optional().isBoolean(),
  body('reducedMotion').optional().isBoolean(),
  body('fontSize').optional().trim().isIn(['small', 'medium', 'large']),
  body('profileVisibility').optional().trim().isIn(['public', 'private']),
  body('activityVisibility').optional().trim().isIn(['public', 'private']),
  body('onlineStatusVisibility').optional().trim().isIn(['public', 'private']),
  body('aiDataSharing').optional().isBoolean()
];

export const validateUpdateProfile = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('phone')
    .optional()
    .custom((val) => val === '' || val === null || /^\+?[0-9\s-]{8,20}$/.test(val))
    .withMessage('Phone number must be a valid format or empty'),
  body('avatar').optional().trim(),
  body('designation').optional().trim(),
  body('bio').optional().trim(),
  body('website')
    .optional()
    .custom((val) => val === '' || val === null || /^https?:\/\/[^\s$.?#].[^\s]*$/.test(val))
    .withMessage('Website must be a valid URL or empty'),
  body('location').optional().trim()
];

export const validateChangePassword = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
];
