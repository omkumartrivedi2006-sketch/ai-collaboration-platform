import { Router } from 'express';
import { ChatController } from '../controllers/chatController';
import { protect } from '../middleware/authMiddleware';
import { upload } from '../middleware/uploadMiddleware';
import {
  createConversationValidator,
  createMessageValidator,
  editMessageValidator,
  addReactionValidator
} from '../validators/chatValidator';

const router = Router();
const controller = new ChatController();

router.use(protect);

router.post('/conversations', createConversationValidator, controller.getOrCreateConversation);
router.get('/conversations', controller.getConversations);
router.get('/conversations/:id', controller.getConversationById);

router.get('/messages/search', controller.searchMessages);
router.get('/messages/:conversationId', controller.getMessages);
router.post('/messages', upload.single('file'), controller.createMessage);
router.put('/messages/:id', editMessageValidator, controller.editMessage);
router.delete('/messages/:id', controller.deleteMessage);

router.post('/messages/:id/reactions', addReactionValidator, controller.addReaction);
router.delete('/messages/:id/reactions', controller.removeReaction);

export default router;
