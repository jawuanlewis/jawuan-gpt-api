import { Schema } from 'mongoose';
import { nanoid } from 'nanoid';

export const MessageSchema = new Schema(
  {
    id: {
      type: String,
      required: true,
      default: () => nanoid(),
    },
    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);
