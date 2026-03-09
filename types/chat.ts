import { Document } from 'mongoose';

export interface IMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export interface IChat extends Document {
  id: string;
  userId: string;
  title: string;
  messages: IMessage[];
}
