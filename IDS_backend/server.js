const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

// Initialize Express
const app = express();

// Connect Database
connectDB();

// Init Middleware
app.use(express.json({ extended: false }));
app.use(cors());

// Define Routes
app.use("/api/device", require("./routes/devices"));
app.use("/api/dashboard", require("./routes/dashboardRoute"));
app.use("/api/devices", require("./routes/devices"));
app.use("/api/monitor", require("./routes/logs"));
app.use("/api/logs", require("./routes/logs"));
app.use("/api/threats", require("./routes/threats"));

// Root Endpoint
app.get("/", (req, res) => res.send("IoT Security Dashboard API Running"));

const PORT = process.env.PORT || 5050;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
