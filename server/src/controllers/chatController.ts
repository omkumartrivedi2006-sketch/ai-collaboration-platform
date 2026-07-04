import { Request, Response, NextFunction } from 'express';
import { ConversationService } from '../services/conversationService';
import { MessageService } from '../services/messageService';
import { validationResult } from 'express-validator';
import { AppError } from '../utils/AppError';

const conversationService = new ConversationService();
const messageService = new MessageService();

export class ChatController {
  async getOrCreateConversation(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          status: 'error',
          errors: errors.array()
        });
        return;
      }

      const { type, userIds, name, projectId } = req.body;
      const userId = req.user?.id;
      if (!userId) return next(new AppError('Not authenticated', 401));

      let conv;
      if (projectId) {
        conv = await conversationService.getOrCreateProjectChat(projectId, userId, req.user?.role || 'Employee');
      } else if (type === 'DIRECT') {
        if (!userIds || userIds.length === 0) {
          return next(new AppError('Receiver user ID is required for direct chat', 400));
        }
        conv = await conversationService.getOrCreateDirectConversation(userId, userIds[0]);
      } else {
        // Group chat
        const allMembers = Array.from(new Set([userId, ...userIds]));
        // Instantiate using conversationRepo directly or via service
        const conversationRepo = (await import('../repositories/conversationRepository')).default;
        const repo = new conversationRepo();
        conv = await repo.createGroup(name || 'Group Chat', allMembers, userId);
      }

      res.status(200).json({
        status: 'success',
        data: { conversation: conv }
      });
    } catch (err) {
      next(err);
    }
  }

  async getConversations(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) return next(new AppError('Not authenticated', 401));

      const conversations = await conversationService.getUserConversations(userId);

      res.status(200).json({
        status: 'success',
        data: { conversations }
      });
    } catch (err) {
      next(err);
    }
  }

  async getConversationById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      if (!userId) return next(new AppError('Not authenticated', 401));

      const conv = await conversationService.getConversation(id, userId);

      res.status(200).json({
        status: 'success',
        data: { conversation: conv }
      });
    } catch (err) {
      next(err);
    }
  }

  async getMessages(req: Request, res: Response, next: NextFunction) {
    try {
      const { conversationId } = req.params;
      const userId = req.user?.id;
      if (!userId) return next(new AppError('Not authenticated', 401));

      const limit = parseInt(req.query.limit as string) || 30;
      const cursor = req.query.cursor as string;

      const messages = await messageService.getConversationMessages(conversationId, userId, limit, cursor);

      res.status(200).json({
        status: 'success',
        data: { messages }
      });
    } catch (err) {
      next(err);
    }
  }

  async createMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) return next(new AppError('Not authenticated', 401));

      let { conversationId, message, messageType, parentMessageId } = req.body;
      
      // If file uploaded via Multer, extract url
      let typeOfMsg = messageType || 'TEXT';
      if (req.file) {
        message = `/uploads/${req.file.filename}`;
        typeOfMsg = req.file.mimetype.startsWith('image/') ? 'IMAGE' : 'FILE';
      }

      if (!message || message.trim() === '') {
        return next(new AppError('Message body cannot be empty', 400));
      }

      const created = await messageService.createMessage({
        conversationId,
        senderId: userId,
        message,
        messageType: typeOfMsg,
        parentMessageId: parentMessageId || undefined
      });

      res.status(201).json({
        status: 'success',
        data: { message: created }
      });
    } catch (err) {
      next(err);
    }
  }

  async editMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { message } = req.body;
      const userId = req.user?.id;
      if (!userId) return next(new AppError('Not authenticated', 401));

      if (!message || message.trim() === '') {
        return next(new AppError('Message body cannot be empty', 400));
      }

      const updated = await messageService.editMessage(id, userId, message);

      res.status(200).json({
        status: 'success',
        data: { message: updated }
      });
    } catch (err) {
      next(err);
    }
  }

  async deleteMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      if (!userId) return next(new AppError('Not authenticated', 401));

      await messageService.deleteMessage(id, userId, req.user?.role || 'Employee');

      res.status(200).json({
        status: 'success',
        message: 'Message deleted successfully'
      });
    } catch (err) {
      next(err);
    }
  }

  async addReaction(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { emoji } = req.body;
      const userId = req.user?.id;
      if (!userId) return next(new AppError('Not authenticated', 401));

      if (!emoji) return next(new AppError('Emoji is required', 400));

      const reaction = await messageService.addReaction(id, userId, emoji);

      res.status(201).json({
        status: 'success',
        data: { reaction }
      });
    } catch (err) {
      next(err);
    }
  }

  async removeReaction(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { emoji } = req.body;
      const userId = req.user?.id;
      if (!userId) return next(new AppError('Not authenticated', 401));

      if (!emoji) return next(new AppError('Emoji is required', 400));

      await messageService.removeReaction(id, userId, emoji);

      res.status(200).json({
        status: 'success',
        message: 'Reaction removed successfully'
      });
    } catch (err) {
      next(err);
    }
  }

  async searchMessages(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) return next(new AppError('Not authenticated', 401));

      const query = req.query.q as string;
      if (!query) return next(new AppError('Search query is required', 400));

      const messages = await messageService.searchMessages(userId, query);

      res.status(200).json({
        status: 'success',
        data: { messages }
      });
    } catch (err) {
      next(err);
    }
  }
}
export default ChatController;
