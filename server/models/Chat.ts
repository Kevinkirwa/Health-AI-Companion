import mongoose from 'mongoose';

export interface IChat extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  message: string;
  response: string;
  createdAt: Date;
}

const chatSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  message: { type: String, required: true },
  response: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export const Chat = mongoose.model<IChat>('Chat', chatSchema); 