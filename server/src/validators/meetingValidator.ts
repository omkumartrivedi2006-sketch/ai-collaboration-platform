import { body, param } from 'express-validator';
import { validateRequest } from './authValidator';

export const createMeetingValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Meeting title is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Title must be between 2 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  body('projectId')
    .optional({ nullable: true })
    .isUUID()
    .withMessage('Invalid project ID format'),
  body('startTime')
    .notEmpty()
    .withMessage('Start time is required')
    .isISO8601()
    .withMessage('Start time must be a valid ISO8601 date string'),
  body('endTime')
    .notEmpty()
    .withMessage('End time is required')
    .isISO8601()
    .withMessage('End time must be a valid ISO8601 date string')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.startTime)) {
        throw new Error('End time must be after start time');
      }
      return true;
    }),
  body('timezone')
    .trim()
    .notEmpty()
    .withMessage('Timezone is required'),
  body('invitedUserIds')
    .optional()
    .isArray()
    .withMessage('invitedUserIds must be an array of user IDs'),
  body('invitedUserIds.*')
    .isUUID()
    .withMessage('Invalid invited user ID format'),
  validateRequest
];

export const updateMeetingValidator = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Title must be between 2 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  body('startTime')
    .optional()
    .isISO8601()
    .withMessage('Start time must be a valid ISO8601 date string'),
  body('endTime')
    .optional()
    .isISO8601()
    .withMessage('End time must be a valid ISO8601 date string')
    .custom((value, { req }) => {
      if (req.body.startTime && new Date(value) <= new Date(req.body.startTime)) {
        throw new Error('End time must be after start time');
      }
      return true;
    }),
  body('timezone')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Timezone cannot be empty'),
  body('notes')
    .optional()
    .trim(),
  validateRequest
];

export const meetingIdParamValidator = [
  param('id')
    .isUUID()
    .withMessage('Invalid meeting ID format'),
  validateRequest
];

export const inviteMembersValidator = [
  body('invitedUserIds')
    .isArray({ min: 1 })
    .withMessage('invitedUserIds must be an array with at least one user ID'),
  body('invitedUserIds.*')
    .isUUID()
    .withMessage('Invalid invited user ID format'),
  validateRequest
];

export const respondInvitationValidator = [
  body('response')
    .isIn(['ACCEPT', 'DECLINE'])
    .withMessage('Response must be ACCEPT or DECLINE'),
  validateRequest
];
