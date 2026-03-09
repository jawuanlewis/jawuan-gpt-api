import { Request, Response } from 'express';
import { nanoid } from 'nanoid';
import { IMessage } from '../types/chat.js';
import Chat from '../models/Chat.js';
import openai from '../config/open-ai.js';

const chatController = {
  getChatHistory: async (req: Request, res: Response) => {
    try {
      // Retrieve active user's chat history
      const userId = req.headers['x-client-id'] as string;
      const chats = await Chat.find({ userId }).sort({ updatedAt: -1 });
      return res.json({ chatHistory: chats });
    } catch (error) {
      console.error('(Server) Error getting chat history:', error);
      return res.status(500).json({ error: 'Failed to get chat history.' });
    }
  },

  handlePrompt: async (req: Request, res: Response) => {
    try {
      const { chat, prompt } = req.body;
      const userId = req.headers['x-client-id'] as string;

      if (!prompt || typeof prompt !== 'string') {
        return res
          .status(400)
          .json({ error: '(Server) Prompt is required and must be a string.' });
      }

      let chatDoc;
      const newMessage: IMessage = {
        id: nanoid(),
        role: 'user',
        content: prompt,
      };

      if (chat?.id) {
        // Update existing chat
        chatDoc = await Chat.findOne({ id: chat.id, userId });

        if (!chatDoc) {
          chatDoc = await Chat.findOne({ id: chat.id });

          if (chatDoc) {
            chatDoc.userId = userId;
            await chatDoc.save();
          }
        }

        if (!chatDoc) {
          return res
            .status(404)
            .json({ error: '(Server) Chat not found for this client.' });
        }

        chatDoc.messages.push(newMessage);
      } else {
        // Create new chat
        chatDoc = await Chat.create({
          id: nanoid(),
          userId,
          title: `Chat ${Date.now()}`,
          messages: [newMessage],
        });
      }

      const messagesForAssistant = chatDoc.messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      // Generate assistant response
      try {
        const completion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: messagesForAssistant,
        });

        const completionText = completion.choices[0].message.content;
        if (!completionText) {
          throw new Error('(Server) No response from the model.');
        }

        // Add assistant's message
        const assistantMessage: IMessage = {
          id: nanoid(),
          role: 'assistant',
          content: completionText,
        };

        chatDoc.messages.push(assistantMessage);
        await chatDoc.save();

        return res.json({ chat: chatDoc });
      } catch (openaiError: any) {
        console.error('(Server) OpenAI API error:', openaiError);
        return res.status(503).json({
          error: 'Failed to generate AI response. Please try again.',
        });
      }
    } catch (error) {
      console.error('(Server) Error handling user prompt:', error);
      return res.status(500).json({ error: 'Failed to process user prompt.' });
    }
  },

  updateChatTitle: async (req: Request, res: Response) => {
    try {
      const { chatId, title } = req.body;
      const userId = req.headers['x-client-id'] as string;

      if (!title || typeof title !== 'string') {
        return res
          .status(400)
          .json({ error: '(Server) Title is required and must be a string.' });
      }

      const chatDoc = await Chat.findOne({ id: chatId, userId });
      if (!chatDoc) {
        return res
          .status(404)
          .json({ error: '(Server) Chat not found for this client.' });
      }

      chatDoc.title = title;
      await chatDoc.save();

      return res.json({ chat: chatDoc });
    } catch (error) {
      console.error('(Server) Error updating chat title:', error);
      return res.status(500).json({ error: 'Failed to update chat title.' });
    }
  },
};

export default chatController;
