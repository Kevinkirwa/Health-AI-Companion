import mongoose from 'mongoose';

const chatMessageSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, required: true }, // user or assistant
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

export const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema); 