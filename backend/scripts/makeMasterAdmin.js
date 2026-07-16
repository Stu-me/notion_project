require('dotenv').config();

const mongoose = require('mongoose');
const User = require('../models/userModel');

// One-time command to safely promote an existing registered user to master admin.
async function makeMasterAdmin() {
  const email = process.argv[2]?.trim().toLowerCase();
  if (!email) {
    throw new Error('Usage: npm run make-admin -- your-email@example.com');
  }

  await mongoose.connect(process.env.CONNECTION_STRING);
  const user = await User.findOneAndUpdate(
    { email },
    { $set: { role: 'masterAdmin' } },
    { new: true },
  );

  if (!user) {
    throw new Error('No user exists with that email address');
  }

  console.log(`${user.email} is now a master admin.`);
}

makeMasterAdmin()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
