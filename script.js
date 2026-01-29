// ===============================
// CHAT (UNCHANGED ✅)
// ===============================
const chatBox = document.getElementById("chatBox");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const statusText = document.getElementById("statusText");
const heroArea = document.getElementById("heroArea");

// backend endpoint
const API_URL = "https://ai-chat-backend-sandy.vercel.app/api/chat";

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

function addBubble(text, who = "user") {
  const row = document.createElement("div");
  row.className = `msg-row ${who === "user" ? "user" : "assistant"}`;

  const bubble = document.createElement("div");
  bubble.className = "msg-bubble";

  if (who !== "user") {
    const meta = document.createElement("div");
    meta.className = "msg-meta";
    meta.textContent = "AI Assistant"; // (unchanged as you had)
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

  if (heroArea) heroArea.style.display = "none";
  addBubble(text, "user");

  userInput.value = "";
  userInput.blur();
  toggleSendButton();

  statusText.textContent = "thingking Ai...";

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text }),
    });

    if (!res.ok) throw new Error("Server error");
    const data = await res.json();

    
addBubble(
  data.reply || data.message || data.response || "Sorry, no reply found.",
  "assistant"
);

    
  } catch (e) {
    console.error(e);
    statusText.textContent = "Connection error.";
    addBubble(
      "Sorry—cannot connect to the server. (Is the server running?)",
      "assistant"
    );
  }
}

// chat events
sendBtn.addEventListener("click", sendMessage);
userInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});
userInput.addEventListener("input", toggleSendButton);
userInput.addEventListener("click", () => userInput.focus());
toggleSendButton();

// ===============================
// PROFILE (NO SIGN-IN ✅) - localStorage based
// ===============================

// HTML elements (from your updated index.html)
const profileBtn = document.getElementById("profileBtn");
const profileModal = document.getElementById("profileModal");
const closeProfile = document.getElementById("closeProfile");

const headerName = document.getElementById("headerName");
const headerAvatar = document.getElementById("headerAvatar");
const headerSub = document.getElementById("headerSub");

const profileNameInput = document.getElementById("profileName");
const profilePhotoInput = document.getElementById("profilePhoto"); // file input
const saveProfileBtn = document.getElementById("saveProfile");
const removeProfileBtn = document.getElementById("removeProfile");

// Defaults (your original)
const DEFAULT_PROFILE = {
  name: "Everest",
  
  sub: "Murad Ahmed Simanto(Founder)",
  avatar:
    "04f699c3-4135-464b-ae60-4fdd065b9109.jpg",
};

// Storage keys
const LS_KEY = "Everest_profile_v1";

// Helpers
function openProfileModal() {
  profileModal.classList.remove("hidden");
}
function closeProfileModal() {
  profileModal.classList.add("hidden");
}

function formatHeaderName(name, role) {
  const n = (name || "").trim();
  const r = (role || "").trim();
  if (!n) return `${DEFAULT_PROFILE.name} (${DEFAULT_PROFILE.role})`;
  if (!r) return n;
  return `${n} (${r})`;
}

function loadSavedProfile() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    const obj = JSON.parse(raw);
    if (!obj || typeof obj !== "object") return null;
    return obj;
  } catch (_) {
    return null;
  }
}

function saveProfileToStorage(profile) {
  localStorage.setItem(LS_KEY, JSON.stringify(profile));
}

function clearProfileStorage() {
  localStorage.removeItem(LS_KEY);
}

function applyProfileToUI(profile) {
  const p = profile || null;

  // Default mode
  if (!p) {
    headerName.textContent = formatHeaderName(DEFAULT_PROFILE.name, DEFAULT_PROFILE.role);
    if (headerSub) headerSub.textContent = DEFAULT_PROFILE.sub;
    if (headerAvatar) headerAvatar.src = DEFAULT_PROFILE.avatar;
    return;
  }

  // User mode
  const userName = (p.name || "").trim() || "User";
  const avatar = p.avatar || DEFAULT_PROFILE.avatar;

  headerName.textContent = formatHeaderName(userName, "User");
  if (headerSub) headerSub.textContent = "Murad Ahmed Simanto";
  if (headerAvatar) headerAvatar.src = avatar;
}

function hydrateProfileForm(profile) {
  if (!profile) {
    profileNameInput.value = "";
    // file input cannot be set programmatically for security
    if (profilePhotoInput) profilePhotoInput.value = "";
    return;
  }
  profileNameInput.value = profile.name || "";
  if (profilePhotoInput) profilePhotoInput.value = "";
}

// Convert chosen image file to base64 dataURL (so it persists in localStorage)
function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    if (!file) return resolve(null);
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Failed to read image"));
    reader.readAsDataURL(file);
  });
}

// Initial apply on page load
(function initProfile() {
  const saved = loadSavedProfile();
  applyProfileToUI(saved);
})();

// Open modal
profileBtn.addEventListener("click", () => {
  const saved = loadSavedProfile();
  hydrateProfileForm(saved);
  openProfileModal();
});

// Close modal
closeProfile.addEventListener("click", closeProfileModal);
profileModal.addEventListener("click", (e) => {
  if (e.target === profileModal) closeProfileModal();
});

// Save profile
saveProfileBtn.addEventListener("click", async () => {
  const name = (profileNameInput.value || "").trim();

  // Keep previous avatar if user doesn't choose a new one
  const existing = loadSavedProfile();
  let avatar = existing?.avatar || null;

  const file = profilePhotoInput?.files?.[0] || null;
  if (file) {
    // Optional: basic size guard (so localStorage doesn’t explode)
    // 2MB limit
    if (file.size > 2 * 1024 * 1024) {
      alert("ছবিটি খুব বড় (Max 2MB). ছোট ছবি দিন।");
      return;
    }
    try {
      const dataURL = await fileToDataURL(file);
      if (dataURL) avatar = dataURL;
    } catch (e) {
      console.error(e);
      alert("ছবি আপলোড করা যায়নি। আবার চেষ্টা করুন।");
      return;
    }
  }

  const profile = {
    name: name || "User",
    avatar: avatar || DEFAULT_PROFILE.avatar,
    updatedAt: Date.now(),
  };

  saveProfileToStorage(profile);
  applyProfileToUI(profile);
  closeProfileModal();
});

// Remove profile (back to default Murad Ahmed)
removeProfileBtn.addEventListener("click", () => {
  clearProfileStorage();
  applyProfileToUI(null);
  closeProfileModal();
});









