import mongoose from 'mongoose';

const mentalHealthResourceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true },
  content: { type: String, required: true },
  steps: [{
    step: { type: Number, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true }
  }],
  imageUrl: { type: String }
});

export const MentalHealthResource = mongoose.model('MentalHealthResource', mentalHealthResourceSchema); 