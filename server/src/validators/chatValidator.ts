import { body } from 'express-validator';

export const createConversationValidator = [
  body('type')
    .isIn(['DIRECT', 'GROUP'])
    .withMessage('Conversation type must be DIRECT or GROUP'),
  body('userIds')
    .isArray({ min: 1 })
    .withMessage('userIds must be an array of user IDs'),
  body('userIds.*')
    .isUUID()
    .withMessage('Each member ID must be a valid UUID'),
  body('name')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Group conversation name must be between 1 and 100 characters'),
  body('projectId')
    .optional()
    .isUUID()
    .withMessage('projectId must be a valid UUID')
];

export const createMessageValidator = [
  body('conversationId')
    .isUUID()
    .withMessage('conversationId must be a valid UUID'),
  body('message')
    .isString()
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Message must be between 1 and 2000 characters'),
  body('messageType')
    .optional()
    .isIn(['TEXT', 'IMAGE', 'FILE', 'SYSTEM'])
    .withMessage('Invalid message type'),
  body('parentMessageId')
    .optional()
    .isUUID()
    .withMessage('parentMessageId must be a valid UUID')
];

export const editMessageValidator = [
  body('message')
    .isString()
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Message must be between 1 and 2000 characters')
];

export const addReactionValidator = [
  body('emoji')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Emoji must be a valid string')
];
export default {
  createConversationValidator,
  createMessageValidator,
  editMessageValidator,
  addReactionValidator
};
