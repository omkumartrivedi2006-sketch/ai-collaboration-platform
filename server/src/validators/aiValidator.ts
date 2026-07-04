import { body, query } from 'express-validator';
import { validateRequest } from './authValidator';

export const chatValidator = [
  body('conversationId')
    .optional({ nullable: true })
    .isUUID()
    .withMessage('Invalid conversation ID format'),
  body('message')
    .notEmpty()
    .withMessage('Message content is required')
    .trim(),
  validateRequest
];

export const summarizeMeetingValidator = [
  body('meetingId')
    .notEmpty()
    .withMessage('Meeting ID is required')
    .isUUID()
    .withMessage('Invalid meeting ID format'),
  validateRequest
];

export const generateTasksValidator = [
  body('summaryOrText')
    .notEmpty()
    .withMessage('Summary or free text requirements are required')
    .trim(),
  validateRequest
];

export const projectReportValidator = [
  body('projectId')
    .notEmpty()
    .withMessage('Project ID is required')
    .isUUID()
    .withMessage('Invalid project ID format'),
  body('reportType')
    .notEmpty()
    .withMessage('Report type is required')
    .isIn(['PROJECT', 'MEETING', 'TASK', 'SPRINT'])
    .withMessage('Invalid report type. Supported: PROJECT, MEETING, TASK, SPRINT'),
  validateRequest
];

export const translateValidator = [
  body('text')
    .notEmpty()
    .withMessage('Text to translate is required')
    .trim(),
  body('targetLanguage')
    .notEmpty()
    .withMessage('Target language is required')
    .trim(),
  validateRequest
];

export const documentSummaryValidator = [
  body('content')
    .notEmpty()
    .withMessage('Document text content is required')
    .trim(),
  body('filename')
    .notEmpty()
    .withMessage('Document filename is required')
    .trim(),
  validateRequest
];
export default {
  chatValidator,
  summarizeMeetingValidator,
  generateTasksValidator,
  projectReportValidator,
  translateValidator,
  documentSummaryValidator
};
