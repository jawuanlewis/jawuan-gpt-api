import express, { RequestHandler } from 'express';
import chatController from '../controllers/chatController.js';

const router = express.Router();

router.get(
  '/history',
  chatController.getChatHistory as unknown as RequestHandler
);
router.post(
  '/prompt',
  chatController.handlePrompt as unknown as RequestHandler
);
router.patch(
  '/title',
  chatController.updateChatTitle as unknown as RequestHandler
);

export default router;
