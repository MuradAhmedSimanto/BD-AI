const chatBox = document.getElementById("chatBox");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const statusText = document.getElementById("statusText");

const API_URL = "http://localhost:3000/api/chat";

/* Send button active/inactive */
function toggleSendButton() {
  const hasText = (userInput.value || "").trim().length > 0;
  if (hasText) {
    sendBtn.classList.add("active");
    sendBtn.disabled = false;
  } else {
    sendBtn.classList.remove("active");
    sendBtn.disabled = true;
  }
}

/* bubbles */
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
  userInput.blur();          // ✅ hide keyboard after send
  toggleSendButton();

  statusText.textContent = "AI is thinking...";

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
    const reply = data?.reply || "Sorry, no reply found.";
    addBubble(reply, "assistant");

    statusText.textContent = "Ready.";
  } catch (e) {
    console.error(e);
    statusText.textContent = "Connection error.";
    addBubble("Sorry—cannot connect to the server. (Is the server running?)", "assistant");
  }
}

/* events */
sendBtn.addEventListener("click", sendMessage);

userInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

userInput.addEventListener("input", toggleSendButton);

/* tap input => show keyboard again */
userInput.addEventListener("click", () => {
  userInput.focus();
});

/* initial */
toggleSendButton();
