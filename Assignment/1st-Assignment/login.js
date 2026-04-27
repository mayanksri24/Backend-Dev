const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();

// Log file path
const logFilePath = path.join(__dirname, "requests.log");

// Request Logging Middleware
app.use((req, res, next) => {
    const startTime = Date.now();

    res.on("finish", () => {
        const endTime = Date.now();
        const responseTime = endTime - startTime;

        const log = `${new Date().toISOString()} | ${req.method} | ${req.originalUrl} | ${res.statusCode} | ${responseTime}ms\n`;

        fs.appendFile(logFilePath, log, (err) => {
            if (err) console.error("Error writing log:", err);
        });
    });

    next();
});

// Routes
app.get("/", (req, res) => {
    res.send("Hello World");
});

app.get("/api", (req, res) => {
    res.json({ message: "API working" });
});

// Start Server
app.listen(3000, () => {
    console.log("Server running on port 3000");
});