const mongoose = require("mongoose");

const ThreatSchema = new mongoose.Schema({
  client_id: {
    type: String,
    required: true,
  },
  attack_type: {
    type: String,
    required: true,
  },
  severity: {
    type: String,
    enum: ["Low", "Medium", "High", "Critical"],
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Threat", ThreatSchema);
