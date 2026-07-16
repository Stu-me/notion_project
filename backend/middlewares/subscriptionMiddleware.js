const asyncHandler = require('express-async-handler');
const Subscription = require('../models/subscriptionModel');
const Workspace = require('../models/workspaceModel');
const Page = require('../models/pageModel');
const Block = require('../models/blockModel');
const { FREE_TIER } = require('../config/subscriptionPlans');

// Allows only the account promoted to master admin to use admin endpoints.
const requireMasterAdmin = (req, res, next) => {
  if (req.user.role !== 'masterAdmin') {
    return res.status(403).json({ message: 'Master admin access is required' });
  }

  return next();
};

// Resolves free or premium access without blocking free users from normal app features.
const resolveAccountTier = asyncHandler(async (req, res, next) => {
  if (req.user.role === 'masterAdmin') {
    req.accountTier = 'masterAdmin';
    return next();
  }

  const now = new Date();
  const subscription = await Subscription.findOne({
    user: req.user._id,
    status: 'active',
    endsAt: { $gt: now },
  });

  if (!subscription) {
    // Keep expired subscriptions accurate while allowing the user to use the free tier.
    await Subscription.updateOne(
      { user: req.user._id, status: 'active', endsAt: { $lte: now } },
      { $set: { status: 'expired' } },
    );
    req.accountTier = 'free';
    return next();
  }

  req.accountTier = 'premium';
  req.subscription = subscription;
  return next();
});

// Returns a response the frontend can use to direct a user to the upgrade screen.
const sendFreeLimitReached = (res, resource, limit) => res.status(403).json({
  code: 'FREE_PLAN_LIMIT_REACHED',
  message: `Free plan ${resource} limit reached. Upgrade to create more.`,
  resource,
  limit,
});

// Enforces free-tier creation limits while leaving premium and master-admin accounts unlimited.
const enforceFreeResourceLimit = (resource) => asyncHandler(async (req, res, next) => {
  if (req.accountTier !== 'free') return next();

  if (resource === 'workspace') {
    const count = await Workspace.countDocuments({ owner: req.user._id });
    if (count >= FREE_TIER.limits.workspaces) {
      return sendFreeLimitReached(res, 'workspace', FREE_TIER.limits.workspaces);
    }
    return next();
  }

  if (resource === 'page') {
    const workspace = await Workspace.findOne({ _id: req.body.workspace, owner: req.user._id });
    if (!workspace) return res.status(404).json({ message: 'Workspace not found' });

    const count = await Page.countDocuments({ workspace: workspace._id, createdBy: req.user._id });
    if (count >= FREE_TIER.limits.pagesPerWorkspace) {
      return sendFreeLimitReached(res, 'page', FREE_TIER.limits.pagesPerWorkspace);
    }
    return next();
  }

  if (resource === 'block') {
    const page = await Page.findOne({ _id: req.params.pageId, createdBy: req.user._id });
    if (!page) return res.status(404).json({ message: 'Page not found' });

    const count = await Block.countDocuments({ page: page._id });
    if (count >= FREE_TIER.limits.blocksPerPage) {
      return sendFreeLimitReached(res, 'block', FREE_TIER.limits.blocksPerPage);
    }
  }

  return next();
});

// Keeps all current block types free; add premium-only types here when the app expands.
const enforceBlockTypeAccess = (req, res, next) => {
  if (req.accountTier !== 'free' || !req.body.type || FREE_TIER.blockTypes.includes(req.body.type)) {
    return next();
  }

  return res.status(403).json({
    code: 'PREMIUM_BLOCK_TYPE_REQUIRED',
    message: 'This block type requires a premium subscription',
  });
};

module.exports = {
  requireMasterAdmin,
  resolveAccountTier,
  enforceFreeResourceLimit,
  enforceBlockTypeAccess,
};
