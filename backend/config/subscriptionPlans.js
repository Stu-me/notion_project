// The backend owns plan prices and durations so users cannot alter them in requests.
const SUBSCRIPTION_PLANS = Object.freeze({
  monthly: { amount: 10, durationDays: 30 },
  yearly: { amount: 100, durationDays: 365 },
});

// Default free-tier limits. Adjust these values here when the product rules change.
const FREE_TIER = Object.freeze({
  name: 'Free',
  limits: {
    workspaces: 3,
    pagesPerWorkspace: 5,
    blocksPerPage: 20,
  },
  // All current block types remain free. Add future premium-only types separately.
  blockTypes: ['text', 'heading', 'todo', 'image'],
});

// Returns the trusted plan configuration for a submitted plan name.
function getPlan(plan) {
  return SUBSCRIPTION_PLANS[plan];
}

module.exports = { SUBSCRIPTION_PLANS, FREE_TIER, getPlan };
