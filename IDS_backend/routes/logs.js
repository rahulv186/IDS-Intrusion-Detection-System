const express = require("express");
const router = express.Router();
const Log = require("../models/Log");

// @route   POST /api/monitor
// @desc    Receive monitor logs from Python scripts
router.post("/", async (req, res) => {
  try {
    console.log("Incoming Monitor Data:", req.body);
    const data = req.body;

    const log = new Log({
      client_id: data.client_id,
      topic: data.topic,
      payload_size: data.payload_size,
      message_rate: data.message_rate || 0,
      timestamp: data.timestamp
        ? new Date(data.timestamp * 1000) // convert seconds → ms
        : new Date(),
    });

    await log.save();

    res.status(201).json({
      success: true,
      message: "Log saved",
      data: log,
    });
  } catch (err) {
    console.error("Monitor API Error:", err);

    res.status(500).json({
      success: false,
      error: err.message,
      received_data: req.body,
    });
  }
});

// @route   GET /api/logs
// @desc    Get all logs for dashboard with optional date filtering
router.get("/", async (req, res) => {
  try {
    const { start, end } = req.query;
    let query = {};

    if (start || end) {
      query.timestamp = {};
      if (start) query.timestamp.$gte = new Date(start);
      if (end) query.timestamp.$lte = new Date(end);
    }

    const logs = await Log.find(query).sort({ timestamp: -1 });
    res.json(logs);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   GET /api/logs/:deviceId
// @desc    Get logs for a particular device
router.get("/:deviceId", async (req, res) => {
  try {
    const logs = await Log.find({ client_id: req.params.deviceId }).sort({
      timestamp: -1,
    });
    res.json(logs);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
