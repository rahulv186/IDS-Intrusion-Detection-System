const express = require("express");
const router = express.Router();
const Threat = require("../models/Threat");

// POST /api/threats
router.post("/", async (req, res) => {

    try {

        console.log(
            "Incoming Threat Data:",
            req.body
        );

        const {
            timestamp,
            client_id,
            topic,
            threat_type,
            severity,
            threat_details,
            raw_payload,
            attack_type,
            ip
        } = req.body;

        const newThreat =
            new Threat({

                timestamp,

                client_id,

                topic,

                threat_type,

                severity,

                threat_details,

                raw_payload,

                attack_type,

                ip
            });

        const threat =
            await newThreat.save();

        res
            .status(201)
            .json({

                success: true,

                message:
                    "Threat report saved",

                data:
                    threat
            });

    } catch (err) {

        console.error(
            "Threat API Error:",
            err
        );

        res
            .status(500)
            .json({

                success: false,

                error:
                    err.message,

                received_data:
                    req.body
            });
    }
});


// GET /api/threats
router.get("/", async (req, res) => {

    try {

        const {
            severity
        } = req.query;

        let query = {};

        if (severity) {
            query.severity =
                severity;
        }

        const threats =
            await Threat
                .find(query)
                .sort({
                    timestamp: -1
                });

        res.json(
            threats
        );

    } catch (err) {

        console.error(
            err.message
        );

        res
            .status(500)
            .send(
                "Server Error"
            );
    }
});


// GET threats by device
router.get("/:deviceId",
async (req, res) => {

    try {

        const threats =
            await Threat
                .find({
                    client_id:
                    req.params.deviceId
                })
                .sort({
                    timestamp: -1
                });

        res.json(
            threats
        );

    } catch (err) {

        console.error(
            err.message
        );

        res
            .status(500)
            .send(
                "Server Error"
            );
    }
});


// DELETE threat
router.delete("/:id",
async (req, res) => {

    try {

        const threat =
            await Threat
                .findByIdAndDelete(
                    req.params.id
                );

        if (!threat) {

            return res
                .status(404)
                .json({

                    success:
                        false,

                    message:
                        "Threat not found"
                });
        }

        res.json({

            success:
                true,

            message:
                "Threat deleted successfully",

            data:
                threat
        });

    } catch (err) {

        console.error(
            err
        );

        res
            .status(500)
            .json({

                success:
                    false,

                message:
                    "Server Error",

                error:
                    err.message
            });
    }
});

module.exports = router;