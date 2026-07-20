const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const Subscription = require('../models/subscriptionModel');
const PaymentRequest = require('../models/paymentRequestModel');
const SupportQuery = require('../models/supportQueryModel');

const ONLINE_WINDOW_MS = 1 * 60 * 1000;

// Returns the aggregate figures shown in the four summary cards without loading every user into memory.
const getAdminOverview = asyncHandler(async (req, res) => {
  const now = new Date();
  const onlineSince = new Date(Date.now() - ONLINE_WINDOW_MS);
  const [totalUsers, activeUsers, subscribedUsers, pendingPayments, openQueries] = await Promise.all([
    User.countDocuments({ role: 'user' }),
    User.countDocuments({ role: 'user', lastSeenAt: { $gte: onlineSince } }),
    Subscription.countDocuments({ status: 'active', endsAt: { $gt: now } }),
    PaymentRequest.countDocuments({ status: 'pending' }),
    SupportQuery.countDocuments({ status: 'open' }),
  ]);

  return res.status(200).json({ totalUsers, activeUsers, subscribedUsers, pendingApprovals: pendingPayments, openQueries });
});

// Returns one paginated admin-friendly row per user, including their current subscription and latest payment request.
const getAdminUsers = asyncHandler(async (req, res) => {
  const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 20, 1), 100);
  const search = req.query.search?.trim();
  const match = { role: 'user' };
  if (search) match.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];

  const [result] = await User.aggregate([
    { $match: match },
    { $sort: { createdAt: -1 } },
    { $facet: {
      rows: [
        { $skip: (page - 1) * limit },
        { $limit: limit },
        { $lookup: { from: 'subscriptions', localField: '_id', foreignField: 'user', as: 'subscription' } },
        { $unwind: { path: '$subscription', preserveNullAndEmptyArrays: true } },
        { $lookup: { from: 'paymentrequests', let: { userId: '$_id' }, pipeline: [
          { $match: { $expr: { $eq: ['$user', '$$userId'] } } },
          { $sort: { createdAt: -1 } }, { $limit: 1 },
        ], as: 'latestPayment' } },
        { $unwind: { path: '$latestPayment', preserveNullAndEmptyArrays: true } },
        { $project: { name: 1, email: 1, lastSeenAt: 1, createdAt: 1, 'subscription.plan': 1, 'subscription.status': 1, 'subscription.endsAt': 1, 'latestPayment._id': 1, 'latestPayment.status': 1, 'latestPayment.plan': 1 } },
      ],
      total: [{ $count: 'count' }],
    } },
  ]);

  const onlineSince = Date.now() - ONLINE_WINDOW_MS;
  const users = result.rows.map((user) => ({
    ...user,
    presence: user.lastSeenAt && new Date(user.lastSeenAt).getTime() >= onlineSince ? 'online' : 'offline',
  }));
  return res.status(200).json({ users, page, limit, total: result.total[0]?.count || 0 });
});

// Supplies the notification drawer with the newest payment approvals and open support questions.
const getAdminNotifications = asyncHandler(async (req, res) => {
  const [payments, queries] = await Promise.all([
    PaymentRequest.find({ status: 'pending' }).populate('user', 'name email').sort({ createdAt: -1 }).limit(10),
    SupportQuery.find({ status: 'open' }).populate('user', 'name email').sort({ createdAt: -1 }).limit(10),
  ]);
  const notifications = [
    ...payments.map((payment) => ({ id: payment._id, type: 'payment', createdAt: payment.createdAt, title: 'Payment approval requested', detail: `${payment.user?.name || 'A user'} submitted a ${payment.plan} plan payment.` })),
    ...queries.map((query) => ({ id: query._id, type: 'query', createdAt: query.createdAt, title: query.subject, detail: `${query.user?.name || 'A user'} raised a support query.` })),
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return res.status(200).json(notifications);
});

// Resolves a support question without deleting the record, preserving a small audit trail.
const resolveSupportQuery = asyncHandler(async (req, res) => {
  const query = await SupportQuery.findOneAndUpdate(
    { _id: req.params.id, status: 'open' },
    { status: 'resolved', resolvedBy: req.user._id, resolvedAt: new Date() },
    { new: true },
  );
  if (!query) {
    res.status(404);
    throw new Error('Open support query not found');
  }
  return res.status(200).json(query);
});

module.exports = { getAdminOverview, getAdminUsers, getAdminNotifications, resolveSupportQuery };
