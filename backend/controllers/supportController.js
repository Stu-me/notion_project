const asyncHandler = require('express-async-handler');
const SupportQuery = require('../models/supportQueryModel');

// Lets a signed-in user raise a support question for the master admin.
const createSupportQuery = asyncHandler(async (req, res) => {
  const subject = req.body.subject?.trim();
  const message = req.body.message?.trim();
  if (!subject || !message) {
    res.status(400);
    throw new Error('A subject and message are required');
  }

  const query = await SupportQuery.create({ user: req.user._id, subject, message });
  return res.status(201).json(query);
});

// Returns only the signed-in user's own questions and never exposes another user's data.
const getMySupportQueries = asyncHandler(async (req, res) => {
  const queries = await SupportQuery.find({ user: req.user._id }).sort({ createdAt: -1 });
  return res.status(200).json(queries);
});

module.exports = { createSupportQuery, getMySupportQueries };
