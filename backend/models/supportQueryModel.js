const mongoose = require('mongoose');

// Stores a user question so the master admin can see and resolve it from one queue.
const supportQuerySchema = mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, required: true, trim: true, maxlength: 120 },
  message: { type: String, required: true, trim: true, maxlength: 2000 },
  status: { type: String, enum: ['open', 'resolved'], default: 'open' },
  resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  resolvedAt: { type: Date },
}, { timestamps: true });

// Speeds up the newest-open-first queue displayed in the admin notification panel.
supportQuerySchema.index({ status: 1, createdAt: -1 });
supportQuerySchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('SupportQuery', supportQuerySchema);
