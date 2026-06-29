const express = require("express");
const router = express.Router();
const Device = require("../models/Device");

// POST /api/devices
router.post("/", async (req, res) => {
    try {
        console.log("[BODY] : ", req.body)
        const {
            client_id,
            ip,
            old_ip,
            status,
            last_seen
        } = req.body;

        if (!client_id || !status) {
            return res.status(400).json({
                message:
                    "client_id and status are required"
            });
        }

        const updatedDevice =
            await Device.findOneAndUpdate(
                {
                    client_id
                },
                {
                    client_id,

                    ip: ip ?? null,

                    old_ip: old_ip ?? null,

                    status,

                    last_seen:
                        last_seen
                        || new Date()
                },
                {
                    new: true,
                    upsert: true
                }
            );

        res.status(200).json({
            message:
                "Device updated successfully",

            device:
                updatedDevice
        });

    } catch (error) {

        console.error(
            "Error saving broker log:",
            error
        );

        res.status(500).json({
            message:
                "Server error"
        });
    }
});

// GET /api/devices
router.get("/", async (req, res) => {

    try {

        const devices =
            await Device
                .find()
                .sort({
                    last_seen: -1
                });

        res.json(devices);

    } catch (err) {

        console.error(err.message);

        res
            .status(500)
            .send(
                "Server Error"
            );
    }
});

module.exports = router;