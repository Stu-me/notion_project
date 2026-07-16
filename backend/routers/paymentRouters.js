const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const {
  getSubscriptionPlans,
  createManualPaymentRequest,
  getMyPaymentRequests,
  getMySubscription,
} = require('../controllers/paymentController');

// User-facing routes: submit a payment and inspect personal payment/access status.
const router = express.Router();

router.get('/plans', authMiddleware, getSubscriptionPlans);
router.post('/manual-request', authMiddleware, createManualPaymentRequest);
router.get('/my-requests', authMiddleware, getMyPaymentRequests);
router.get('/subscription', authMiddleware, getMySubscription);

module.exports = router;
