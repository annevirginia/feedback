const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();

app.use(cors());
app.use(express.json());

// Serve static files from the frontend project folder
app.use(express.static(path.join(__dirname, "../Feedback-project")));

// In-memory storage (Data is NOT saved to disk, fulfilling "dont store in feedback.json" requirement)
let feedbacks = [];
let clients = [];

// API to receive feedback and broadcast it real-time
app.post("/feedback", (req, res) => {
    // Enforce anonymity: Only extract message
    const { message } = req.body;

    const newFeedback = {
        id: Date.now(),
        message: message,
        timestamp: new Date().toISOString()
    };

    console.log("\n" + "=".repeat(50));
    console.log("🔔 NOTIFICATION: New Anonymous Feedback Received!");
    console.log(`ID: ${newFeedback.id}`);
    console.log("=".repeat(50) + "\n");

    // Add to in-memory list
    feedbacks.push(newFeedback);

    // Notify all connected receivers via SSE
    clients.forEach(client => {
        client.res.write(`data: ${JSON.stringify(newFeedback)}\n\n`);
    });

    res.json({ message: "Feedback broadcasted successfully!" });
});

// SSE Endpoint for real-time notifications to the receiver team
app.get("/events", (req, res) => {
    res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive"
    });

    const clientId = Date.now();
    const newClient = { id: clientId, res };
    clients.push(newClient);

    // Send existing feedbacks to newly connected client
    res.write(`data: ${JSON.stringify({ type: 'init', data: feedbacks })}\n\n`);

    req.on("close", () => {
        clients = clients.filter(c => c.id !== clientId);
    });
});

// Route to view the current session's feedbacks (Filtered for Privacy)
app.get("/view-feedbacks", (req, res) => {
    const filteredFeedbacks = feedbacks.map(({ id, message, timestamp }) => ({
        id,
        message,
        timestamp
    }));
    res.json(filteredFeedbacks);
});

// Root route to serve the form
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../Feedback-project/index.html"));
});

// API to receiver to delete specific feedback
app.delete("/feedback/:id", (req, res) => {
    const id = parseInt(req.params.id);
    console.log(`🗑️ DELETE request for feedback ID: ${id}`);

    const initialLength = feedbacks.length;
    feedbacks = feedbacks.filter(f => f.id !== id);

    if (feedbacks.length < initialLength) {
        console.log(`✅ Deleted feedback ${id}`);
        // Notify all connected receivers via SSE
        clients.forEach(client => {
            client.res.write(`data: ${JSON.stringify({ type: 'delete', id: id })}\n\n`);
        });
        res.json({ success: true, message: "Feedback deleted successfully!" });
    } else {
        console.log(`❓ Feedback ${id} not found`);
        res.status(404).json({ success: false, message: "Feedback not found" });
    }
});

// API to delete multiple feedbacks
app.delete("/feedback", (req, res) => {
    const { ids } = req.body;
    console.log(`🗑️ BULK DELETE request for IDs:`, ids);

    if (ids && Array.isArray(ids)) {
        const initialLength = feedbacks.length;
        feedbacks = feedbacks.filter(f => !ids.map(Number).includes(Number(f.id)));

        console.log(`✅ Bulk deletion complete. Items removed: ${initialLength - feedbacks.length}`);

        // Notify all connected receivers
        clients.forEach(client => {
            client.res.write(`data: ${JSON.stringify({ type: 'delete_multiple', ids: ids })}\n\n`);
        });
        res.json({ success: true, message: "Feedbacks cleared successfully!" });
    } else {
        console.log(`🗑️ Clearing ALL feedbacks`);
        feedbacks = [];
        clients.forEach(client => {
            client.res.write(`data: ${JSON.stringify({ type: 'clear_all' })}\n\n`);
        });
        res.json({ success: true, message: "All feedbacks cleared successfully!" });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log("Visit http://localhost:3000 to see your feedback form.");
    console.log("Visit http://localhost:3000/receiver.html to see the Receiver Dashboard (Notified Side).");
    console.log("Visit http://localhost:3000/view-feedbacks to see raw filtered data.");
});
