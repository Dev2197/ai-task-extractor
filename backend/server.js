require("dotenv").config();
const express = require("express");
const cors = require("cors");
const openaiService = require("./openaiService");

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Single task parsing endpoint
app.post("/api/parse", async (req, res) => {
  const { taskText } = req.body;

  if (!taskText) {
    return res.status(400).json({
      success: false,
      error: "Task text is required",
    });
  }

  try {
    const result = await openaiService.parseTask(taskText);
    res.json(result);
  } catch (error) {
    console.error("Task parsing error:", error.message);
    res.status(500).json({
      success: false,
      error: "Failed to parse task",
    });
  }
});

// Meeting transcript parsing endpoint
app.post("/api/parse-transcript", async (req, res) => {
  const { transcript } = req.body;

  if (!transcript) {
    return res.status(400).json({
      success: false,
      error: "Transcript text is required",
    });
  }

  try {
    const result = await openaiService.parseTranscript(transcript);

    if (!result.success) {
      console.error("Transcript parsing failed:", result.error);
      return res.status(500).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error("Transcript parsing error:", error.message);
    res.status(500).json({
      success: false,
      error: "Failed to parse transcript",
    });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Smart Task Manager API running on port ${port}`);
});
