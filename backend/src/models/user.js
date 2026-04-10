const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    regNum: { type: String, required: true, unique: true, index: true },
    // Demo-only storage. For production use hashed passwords.
    password: { type: String, required: true },
    appState: {
      wishlist: { type: Array, default: [] },
      selections: { type: Array, default: [] },
      ttMap: { type: Object, default: {} },
      isFinalized: { type: Boolean, default: false },
    },
    lastLoginAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);

