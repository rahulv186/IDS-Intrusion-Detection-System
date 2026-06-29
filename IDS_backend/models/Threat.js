const mongoose = require("mongoose");
const {Mongoose} = require("mongoose");

const ThreatSchema = new mongoose.Schema({
  client_id: {
    type: String,
    required: true,
  },
  ip:{
    type: String,
    required : true
  },
  attack_type: {
    type: String,
    required: true,
  },
  topic:{
    type: String,
    default: null,
  },
  severity: {
    type: String,
    enum: ["Low", "Medium", "High"],
    required: true,
  },
  threat_details:{
    type: String,
    default : null
  },
  raw_payload : {
    type: mongoose.Schema.Types.Mixed,
    default:null
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Threat", ThreatSchema);
