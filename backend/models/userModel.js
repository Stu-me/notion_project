const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    resetPasswordToken:{
      type:String
    },
    resetPasswordExpire:{
      type:Date
    },
    currentStreak: { type: Number, default: 0 },
    lastActiveDate: { type: Date },
    role: {
      type: String,
      enum: ['user', 'masterAdmin'],
      default: 'user',
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("User", userSchema);
