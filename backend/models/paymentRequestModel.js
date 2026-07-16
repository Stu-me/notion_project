const mongoose = require('mongoose');
const { SUBSCRIPTION_PLANS } = require('../config/subscriptionPlans');

// Stores each manual UPI/bank payment submission for later admin review.
const paymentRequestSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  plan: {
    type: String,
    enum: Object.keys(SUBSCRIPTION_PLANS),
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  transactionId: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  proofUrl: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  reviewedAt: Date,
  rejectionReason: {
    type: String,
    trim: true,
  },
}, { timestamps: true });

// Speeds up the admin view of a user's payment-request history.
paymentRequestSchema.index({ user: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model('PaymentRequest', paymentRequestSchema);
