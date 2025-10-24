const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  recipeId: { type: String, required: true, index: true }, // Can be mealId or user recipe _id
  recipeType: { type: String, enum: ['MealDB', 'User'], required: true },
  messages: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    username: { type: String, required: true },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

// Keep only last 10 messages
chatSchema.pre('save', function(next) {
  if (this.messages.length > 10) {
    this.messages = this.messages.slice(-10);
  }
  next();
});

module.exports = mongoose.model('Chat', chatSchema);
