const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    airtableUserId: { type: String, required: true },
    email: String,
    name: String,

    oauth: {
      accessToken: String,
      refreshToken: String,
      expiresAt: Date,
    },

    loginAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
