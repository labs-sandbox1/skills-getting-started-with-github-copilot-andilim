document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, info]) => {
        const card = document.createElement("div");
        card.className = "activity-card";
        const spotsLeft = info.max_participants - (info.participants ? info.participants.length : 0);
        card.innerHTML = `
          <h4>${name}</h4>
          <p><strong>Description:</strong> ${info.description}</p>
          <p><strong>Schedule:</strong> ${info.schedule}</p>
          <p><strong>Max Participants:</strong> ${info.max_participants}</p>
          <div class="participants-section">
            <h5>Participants:</h5>
            ${info.participants && info.participants.length > 0
              ? `<ul class="participants-list">${info.participants.map(email => `<li><span>${email}</span><span class='delete-icon' title='Remove participant' data-activity='${name}' data-email='${email}'>&#10006;</span></li>`).join("")}</ul>`
              : `<p style="color:#888;font-size:0.95rem;">No participants yet.</p>`}
          </div>
        `;
        activitiesList.appendChild(card);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
      // Add delete icon event listeners
      document.querySelectorAll('.delete-icon').forEach(icon => {
        icon.addEventListener('click', async function() {
          const activity = this.getAttribute('data-activity');
          const email = this.getAttribute('data-email');
          if (confirm(`Remove ${email} from ${activity}?`)) {
            try {
              await fetch(`/activities/${encodeURIComponent(activity)}/unregister`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
              });
              fetchActivities();
            } catch (err) {
              alert('Failed to remove participant.');
            }
          }
        });
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        fetchActivities(); // Refresh activities after signup
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
