const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  // passwordHash is optional to support OAuth users (they don't have a local password)
  passwordHash: { type: String },
  boxes: { type: [Number], default: [] }, // store indexes of completed boxes 1..200
  lastUpdateDate: { type: String, default: null }
}, { timestamps: true });

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);
