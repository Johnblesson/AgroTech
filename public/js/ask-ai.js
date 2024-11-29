// Load the AI model from the server
const form = document.getElementById('askForm');
const chatBox = document.getElementById('conversation');
const askButton = document.getElementById('askButton');
const suggestionList = document.getElementById("suggestion-list");
const toggleButton = document.getElementById("toggle-suggestions");
const userMessageInput = document.getElementById("userMessage");

const suggestions = [
  "What are the best crops to grow in Sierra Leone during the rainy season?",
  "How can I improve soil fertility on my farm?",
  "What are the common pests affecting rice crops in Sierra Leone?",
  "Which farming methods are suitable for cassava production?",
  "What are the benefits of crop rotation in Sierra Leone?",
  "How can I access farming grants or loans in Sierra Leone?",
  "What is the best way to conserve water for irrigation?",
  "How can I start poultry farming in Sierra Leone?",
  "What are effective ways to prevent post-harvest losses?",
  "How can I use organic farming techniques to increase yield?",
];

// Function to render suggestions
function renderSuggestions(limit) {
  suggestionList.innerHTML = suggestions
    .slice(0, limit)
    .map((text) => `<button class="suggestion-btn">${text}</button>`)
    .join("");
}

// Initial rendering with 3 suggestions
renderSuggestions(3);

toggleButton.addEventListener("click", () => {
  const showingAll = toggleButton.textContent === "Hide";

  if (showingAll) {
    renderSuggestions(3); // Show first 3 suggestions
    toggleButton.textContent = "See More";
  } else {
    renderSuggestions(suggestions.length); // Show all suggestions
    toggleButton.textContent = "Hide";
  }
});

// Handle suggestion button clicks
suggestionList.addEventListener("click", (event) => {
  if (event.target.classList.contains("suggestion-btn")) {
    const suggestionText = event.target.textContent;
    userMessageInput.value = suggestionText; // Populate the input field
  }
});

// Handle form submission
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const message = userMessageInput.value;
  chatBox.innerHTML += `<div class="user-message"><strong>You:</strong> ${message}</div>`;
  chatBox.scrollTop = chatBox.scrollHeight; // Auto-scroll

  askButton.disabled = true;
  askButton.textContent = 'Loading...';

  try {
    const response = await fetch('/ask-ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) throw new Error('Network response was not ok');

    const data = await response.json();
    chatBox.innerHTML += `<div class="ai-message"><strong>AI:</strong> ${data.aiMessage}</div>`;
  } catch (error) {
    console.error('Error fetching AI response:', error);
    chatBox.innerHTML += `<div class="ai-message"><strong>AI:</strong> Sorry, an error occurred while fetching the response.</div>`;
  } finally {
    form.reset();
    askButton.disabled = false;
    askButton.textContent = 'Ask';
    chatBox.scrollTop = chatBox.scrollHeight; // Auto-scroll after AI response
  }
});
