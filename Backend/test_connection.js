const fetch = require('node-fetch');

async function test() {
    try {
        const res = await fetch('http://localhost:3000/feedback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: "Test User",
                email: "test@example.com",
                message: "Hello world!"
            })
        });
        const data = await res.json();
        console.log("Response:", data);
    } catch (e) {
        console.error("Test failed:", e.message);
    }
}

test();
