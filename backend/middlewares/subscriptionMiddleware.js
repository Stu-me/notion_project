const asyncHandler = require('express-async-handler');
const Subscription = require('../models/subscriptionModel');

// Allows only the account promoted to master admin to use admin endpoints.
const requireMasterAdmin = (req, res, next) => {
  if (req.user.role !== 'masterAdmin') {
    return res.status(403).json({ message: 'Master admin access is required' });
  }

  return next();
};

// Blocks normal users from paid features unless their subscription is active and unexpired.
const requireActiveSubscription = asyncHandler(async (req, res, next) => {
  if (req.user.role === 'masterAdmin') return next();

  const now = new Date();
  const subscription = await Subscription.findOne({
    user: req.user._id,
    status: 'active',
    endsAt: { $gt: now },
  });

  if (!subscription) {
    // Mark an active-but-expired subscription correctly before denying access.
    await Subscription.updateOne(
      { user: req.user._id, status: 'active', endsAt: { $lte: now } },
      { $set: { status: 'expired' } },
    );
    return res.status(403).json({ message: 'An active subscription is required' });
  }

  req.subscription = subscription;
  return next();
});

module.exports = { requireMasterAdmin, requireActiveSubscription };
