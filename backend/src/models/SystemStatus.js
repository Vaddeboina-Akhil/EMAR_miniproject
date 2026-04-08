const mongoose = require('mongoose');

const systemStatusSchema = new mongoose.Schema({
  isFrozen: { type: Boolean, default: false },
  reason: { type: String, default: '' },
  frozenAt: { type: Date, default: null },
  unfreezBy: { type: String, default: null },
  updatedAt: { type: Date, default: Date.now }
});

// Ensure only one document exists
systemStatusSchema.statics.getInstance = async function() {
  let status = await this.findOne();
  if (!status) {
    status = await this.create({ isFrozen: false, reason: '' });
  }
  return status;
};

module.exports = mongoose.model('SystemStatus', systemStatusSchema);
