import mongoose, { Schema } from 'mongoose';
import { nanoid } from 'nanoid';
import { IChat } from '../types/chat.js';
import { MessageSchema } from './Message.js';

const ChatSchema = new Schema<IChat>(
  {
    id: {
      type: String,
      required: true,
      default: () => nanoid(),
      unique: true,
    },
    userId: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    messages: {
      type: [MessageSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IChat>('Chat', ChatSchema);
