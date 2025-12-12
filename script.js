// script.js (works with your current HTML)

const chatBox = document.getElementById("chatBox");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const statusText = document.getElementById("statusText");

// backend endpoint
const API_URL = "http://localhost:3000/api/chat";

function addBubble(text, who = "user") {
  const row = document.createElement("div");
  row.className = `msg-row ${who === "user" ? "user" : "assistant"}`;

  const bubble = document.createElement("div");
  bubble.className = "msg-bubble";

  if (who !== "user") {
    const meta = document.createElement("div");
    meta.className = "msg-meta";
    meta.textContent = "AI Assistant";
    bubble.appendChild(meta);
  }

  const body = document.createElement("div");
  body.textContent = text;

  bubble.appendChild(body);
  row.appendChild(bubble);
  chatBox.appendChild(row);

  chatBox.scrollTop = chatBox.scrollHeight;
}

async function sendMessage() {
  const text = (userInput.value || "").trim();
  if (!text) return;

  addBubble(text, "user");
  userInput.value = "";
  userInput.focus();

  statusText.textContent = "AI ভাবছে...";

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      throw new Error(`Server ${res.status}: ${errText}`);
    }

    const data = await res.json();
    const reply = data?.reply || "দুঃখিত, কোনো উত্তর পাওয়া যায়নি।";
    addBubble(reply, "assistant");

    statusText.textContent = "Ready.";
  } catch (e) {
    console.error(e);
    statusText.textContent = "Connection error.";
    addBubble("দুঃখিত—সার্ভারে কানেক্ট হচ্ছে না। (server চালু আছে তো?)", "assistant");
  }
}

// click
sendBtn.addEventListener("click", sendMessage);

// Enter = Send (Shift+Enter = new line)
userInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});
