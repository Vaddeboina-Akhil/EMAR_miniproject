const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
    required: true
  },
  actor_entity: {
    type: String,
    required: true
  },
  action_type: {
    type: String,
    enum: [
      "requested",
      "approved",
      "denied",
      "record_uploaded",
      "record_approved",
      "record_rejected",
      "emergency",
      "view"
    ],
    required: true
  },
  affected_resource: {
    type: String
  },
  metadata: {
    reason: String,
    ipAddress: String,
    userAgent: String,
    recordType: String
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("AuditLog", auditLogSchema);
