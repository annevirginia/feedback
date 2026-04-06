const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;

// Middleware to allow the frontend to communicate with the backend (CORS)
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// Middleware to parse JSON data sent from the frontend
app.use(express.json());

app.post('/feedback', (req, res) => {
    const feedbackFile = path.join(__dirname, 'feedback.json');

    fs.readFile(feedbackFile, 'utf8', (err, data) => {
        let feedbacks = [];
        if (!err && data) {
            try {
                feedbacks = JSON.parse(data);
            } catch (e) {}
        }
        const { message } = req.body;
        feedbacks.push({ message });

        fs.writeFile(feedbackFile, JSON.stringify(feedbacks, null, 2), (err) => {
            if (err) console.error("Error saving file:", err);
            console.log("Feedback received and saved:", { message });
            res.json({ message: "Feedback submitted successfully!" });
        });
    });
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});