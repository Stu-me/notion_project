const asyncHandler = require('express-async-handler');
const PaymentRequest = require('../models/paymentRequestModel');
const Subscription = require('../models/subscriptionModel');
const { getPlan } = require('../config/subscriptionPlans');

// Calculates the expiration date for the plan selected by an approved payment.
const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

// Lets an authenticated user submit a bank/UPI transaction for manual review.
const createManualPaymentRequest = asyncHandler(async (req, res) => {
  const plan = getPlan(req.body.plan);
  const transactionId = req.body.transactionId?.trim();

  if (!plan || !transactionId) {
    res.status(400);
    throw new Error('A valid plan and payment transaction ID are required');
  }

  // A transaction must be used once, and each user can have only one request awaiting review.
  const [existingTransaction, pendingRequest] = await Promise.all([
    PaymentRequest.findOne({ transactionId }),
    PaymentRequest.findOne({ user: req.user._id, status: 'pending' }),
  ]);

  if (existingTransaction) {
    res.status(400);
    throw new Error('This transaction ID has already been submitted');
  }

  if (pendingRequest) {
    res.status(400);
    throw new Error('You already have a payment request waiting for review');
  }

  const paymentRequest = await PaymentRequest.create({
    user: req.user._id,
    plan: req.body.plan,
    amount: plan.amount,
    transactionId,
    proofUrl: req.body.proofUrl?.trim(),
  });

  return res.status(201).json(paymentRequest);
});

// Returns the requesting user's own payment history without exposing admin details.
const getMyPaymentRequests = asyncHandler(async (req, res) => {
  const paymentRequests = await PaymentRequest.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .select('-reviewedBy');
  return res.status(200).json(paymentRequests);
});

// Returns the user's current access state and lazily marks expired subscriptions.
const getMySubscription = asyncHandler(async (req, res) => {
  const subscription = await Subscription.findOne({ user: req.user._id });
  if (subscription?.status === 'active' && subscription.endsAt <= new Date()) {
    subscription.status = 'expired';
    await subscription.save();
  }
  return res.status(200).json(subscription);
});

// Lets the master admin view pending, approved, or rejected manual payment requests.
const getPaymentRequests = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) {
    if (!['pending', 'approved', 'rejected'].includes(req.query.status)) {
      res.status(400);
      throw new Error('Invalid payment request status');
    }
    filter.status = req.query.status;
  }

  const paymentRequests = await PaymentRequest.find(filter)
    .populate('user', 'name email')
    .populate('reviewedBy', 'name email')
    .sort({ createdAt: -1 });
  return res.status(200).json(paymentRequests);
});

// Converts a verified pending payment into an active subscription or a renewal.
const approvePaymentRequest = asyncHandler(async (req, res) => {
  const paymentRequest = await PaymentRequest.findById(req.params.id);
  if (!paymentRequest) {
    res.status(404);
    throw new Error('Payment request not found');
  }
  if (paymentRequest.status !== 'pending') {
    res.status(400);
    throw new Error('Only pending payment requests can be approved');
  }

  const plan = getPlan(paymentRequest.plan);
  const now = new Date();
  const currentSubscription = await Subscription.findOne({ user: paymentRequest.user });
  // Renewals extend from the existing end date instead of losing unused subscription time.
  const startsAt = currentSubscription?.status === 'active' && currentSubscription.endsAt > now
    ? currentSubscription.endsAt
    : now;

  const subscription = await Subscription.findOneAndUpdate(
    { user: paymentRequest.user },
    {
      plan: paymentRequest.plan,
      status: 'active',
      startsAt,
      endsAt: addDays(startsAt, plan.durationDays),
      approvedBy: req.user._id,
      paymentRequest: paymentRequest._id,
    },
    { new: true, upsert: true, runValidators: true },
  );

  paymentRequest.status = 'approved';
  paymentRequest.reviewedBy = req.user._id;
  paymentRequest.reviewedAt = now;
  paymentRequest.rejectionReason = undefined;
  await paymentRequest.save();

  return res.status(200).json({ paymentRequest, subscription });
});

// Records an admin rejection while retaining the request as an audit record.
const rejectPaymentRequest = asyncHandler(async (req, res) => {
  const paymentRequest = await PaymentRequest.findById(req.params.id);
  if (!paymentRequest) {
    res.status(404);
    throw new Error('Payment request not found');
  }
  if (paymentRequest.status !== 'pending') {
    res.status(400);
    throw new Error('Only pending payment requests can be rejected');
  }

  paymentRequest.status = 'rejected';
  paymentRequest.reviewedBy = req.user._id;
  paymentRequest.reviewedAt = new Date();
  paymentRequest.rejectionReason = req.body.reason?.trim();
  await paymentRequest.save();

  return res.status(200).json(paymentRequest);
});

// Lets the master admin see every user's current subscription state.
const getSubscriptions = asyncHandler(async (req, res) => {
  const subscriptions = await Subscription.find({})
    .populate('user', 'name email')
    .populate('approvedBy', 'name email')
    .sort({ endsAt: 1 });
  return res.status(200).json(subscriptions);
});

// Removes paid-feature access without deleting the user or their data.
const suspendSubscription = asyncHandler(async (req, res) => {
  const subscription = await Subscription.findOne({ user: req.params.userId });
  if (!subscription) {
    res.status(404);
    throw new Error('Subscription not found');
  }

  subscription.status = 'suspended';
  await subscription.save();
  return res.status(200).json(subscription);
});

module.exports = {
  createManualPaymentRequest,
  getMyPaymentRequests,
  getMySubscription,
  getPaymentRequests,
  approvePaymentRequest,
  rejectPaymentRequest,
  getSubscriptions,
  suspendSubscription,
};
