// The backend owns plan prices and durations so users cannot alter them in requests.
const SUBSCRIPTION_PLANS = Object.freeze({
  monthly: { amount: 99, durationDays: 30 },
  yearly: { amount: 999, durationDays: 365 },
});

// Returns the trusted plan configuration for a submitted plan name.
function getPlan(plan) {
  return SUBSCRIPTION_PLANS[plan];
}

module.exports = { SUBSCRIPTION_PLANS, getPlan };
