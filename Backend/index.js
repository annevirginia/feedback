const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

// Enable CORS to allow requests from the frontend
app.use(cors());

// Middleware to parse JSON request bodies
app.use(express.json());

// Handle POST requests to /feedback
app.post('/feedback', (req, res) => {
    const { message } = req.body;
    
    console.log('Feedback received:', { message });

    // Respond to the client
    res.json({
        message: "Feedback received successfully",
        receivedData: { message }
    });
});

app.listen(port, () => {
    console.log(`Feedback Hub running on http://localhost:${port}`);
});