console.log("Feedback Hub Client Protocol: Initialized");

function showNotification(text, duration = 3000) {
    const notif = document.getElementById("notification");
    const notifText = document.getElementById("notif-text");

    notifText.innerText = text;
    notif.classList.add("show");

    setTimeout(() => {
        notif.classList.remove("show");
    }, duration);
}

document.getElementById("feedbackForm").addEventListener("submit", function (event) {
    event.preventDefault();

    // Anonymize: Name and Email are ignored
    const message = document.getElementById("message").value;
    const submitBtn = this.querySelector("button");

    // UX: Visual feedback during processing
    submitBtn.innerText = "Processing...";
    submitBtn.style.opacity = "0.7";
    submitBtn.disabled = true;

    fetch("http://127.0.0.1:3000/feedback", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ message })
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Server Error: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log("Server Handshake Success:", data);

            // Premium Notification logic
            showNotification("Success: Feedback Received!", 4000);

            // Reset state
            this.reset();
            submitBtn.innerText = "Submit Feedback";
            submitBtn.style.opacity = "1";
            submitBtn.disabled = false;
        })
        .catch(error => {
            console.error("Transmission Error:", error);
            showNotification("Error: " + (error.message === "Failed to fetch" ? "Lost connection to hub" : error.message));

            submitBtn.innerText = "Try Again";
            submitBtn.style.opacity = "1";
            submitBtn.disabled = false;
        });
});
