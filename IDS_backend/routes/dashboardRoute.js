const express = require("express");
const router = express.Router();

const Device = require("../models/Device");
const Threat = require("../models/Threat");
// const BrokerStatus = require("../models/BrokerStatus");

router.get("/stats", async (req, res) => {
  try {
    // connected devices
    const connectedDevices = await Device.countDocuments({
      status: "connected",
    });

    // total threats
    const totalThreats = await Threat.countDocuments();

    // distinct attack types = vulnerabilities
    const vulnerabilities = await Threat.distinct("attack_type");
    const totalVulnerabilities = vulnerabilities.length;

    // broker status
    // const broker = await BrokerStatus.findOne({
    //   broker_name: "mosquitto-broker",
    // });

    let brokerStatus = "online";

    // if (broker) {
    //   const diff = Date.now() - new Date(broker.last_heartbeat).getTime();

    //   if (diff < 15000) {
    //     brokerStatus = "online";
    //   }
    // }

    res.json({
      success: true,
      data: {
        totalConnectedDevices: connectedDevices,
        totalThreats,
        totalVulnerabilities,
        brokerStatus,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard stats",
    });
  }
});

module.exports = router;
