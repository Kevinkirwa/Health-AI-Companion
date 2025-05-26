const { Schema, model } = require('mongoose');

const chatMessageSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  metadata: {
    type: Map,
    of: Schema.Types.Mixed,
    default: {}
  }
});

// Index for faster queries
chatMessageSchema.index({ userId: 1, timestamp: -1 });

const ChatMessage = model('ChatMessage', chatMessageSchema);

module.exports = ChatMessage; 