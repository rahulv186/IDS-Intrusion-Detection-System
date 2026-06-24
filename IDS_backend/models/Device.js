const mongoose = require("mongoose");

const DeviceSchema = new mongoose.Schema({
  client_id: {
    type: String,
    required: true,
    unique: true,
  },
  ip: {
    type: String,
  },
  status: {
    type: String,
    enum: ["connected", "disconnected"],
    default: "disconnected",
  },
  last_seen: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Device", DeviceSchema);
