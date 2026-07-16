const mongoose = require('mongoose');
const { SUBSCRIPTION_PLANS } = require('../config/subscriptionPlans');

// Stores one user's current subscription and access period.
const subscriptionSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  plan: {
    type: String,
    enum: Object.keys(SUBSCRIPTION_PLANS),
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'suspended'],
    default: 'active',
  },
  startsAt: {
    type: Date,
    required: true,
  },
  endsAt: {
    type: Date,
    required: true,
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  paymentRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PaymentRequest',
    required: true,
  },
}, { timestamps: true });

// Supports quick subscription checks for protected API requests.
subscriptionSchema.index({ user: 1, status: 1, endsAt: 1 });

module.exports = mongoose.model('Subscription', subscriptionSchema);
