const mongoose = require("mongoose");

const LogSchema = new mongoose.Schema({
  client_id: {
    type: String,
    required: true,
  },
  topic: {
    type: String,
  },
  message_rate: {
    type: Number,
  },
  payload_size: {
    type: Number,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Log", LogSchema);
