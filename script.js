// ===============================
// FIREBASE INIT (COMPAT) ✅
// ===============================
const firebaseConfig = {
  apiKey: "AIzaSyCpo6OlfT-8YyncA_xLiWANNBtwlqet3y4",
  authDomain: "ai-quick-help.firebaseapp.com",
  projectId: "ai-quick-help",
  storageBucket: "ai-quick-help.firebasestorage.app",
  messagingSenderId: "401118176448",
  appId: "1:401118176448:web:5d70d48c5f7beccc48f925",
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();


// ===============================
// CHAT (UNCHANGED)
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

  if (heroArea) heroArea.style.display = "none";
  addBubble(text, "user");

  userInput.value = "";
  userInput.blur();
  toggleSendButton();

  statusText.textContent = "AI is thinking...";

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text }),
    });

    if (!res.ok) throw new Error("Server error");
    const data = await res.json();
    addBubble(data?.reply || "Sorry, no reply found.", "assistant");
    statusText.textContent = "";
  } catch (e) {
    console.error(e);
    statusText.textContent = "Connection error.";
    addBubble("Sorry—cannot connect to the server. (Is the server running?)", "assistant");
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
// AUTH UI + REAL LOGIN
// ===============================
const signInBtn = document.getElementById("signInBtn");
const authModal = document.getElementById("authModal");
const closeModal = document.getElementById("closeModal");
const headerName = document.getElementById("headerName");
const authMsg = document.getElementById("authMsg");

const loginList = document.getElementById("loginList");
const screenChooser = document.getElementById("screen-chooser");
const screenEmail = document.getElementById("screen-email");
const screenPhone = document.getElementById("screen-phone");
const screenProfile = document.getElementById("screen-profile");

// list btn
const openEmailPhone = document.getElementById("openEmailPhone");
const facebookLoginBtn = document.getElementById("facebookLoginBtn");
const googleLoginBtn = document.getElementById("googleLoginBtn");

// chooser
const goEmail = document.getElementById("goEmail");
const goPhone = document.getElementById("goPhone");

// email
const emailField = document.getElementById("emailField");
const passField = document.getElementById("passField");
const emailSignIn = document.getElementById("emailSignIn");
const emailSignUp = document.getElementById("emailSignUp");

// phone
const phoneField = document.getElementById("phoneField");
const otpField = document.getElementById("otpField");
const sendOtp = document.getElementById("sendOtp");
const verifyOtp = document.getElementById("verifyOtp");

// profile
const nameField = document.getElementById("nameField");
const photoField = document.getElementById("photoField");
const saveProfile = document.getElementById("saveProfile");
const logoutBtn = document.getElementById("logoutBtn");

const DEFAULT_NAME = "Murad Ahmed (Founder)";

function setMsg(t){ authMsg.textContent = t || ""; }

function openAuth(){ authModal.classList.remove("hidden"); }
function closeAuth(){ authModal.classList.add("hidden"); setMsg(""); showList(); }

function hideAll(){
  loginList.classList.add("hidden");
  screenChooser.classList.add("hidden");
  screenEmail.classList.add("hidden");
  screenPhone.classList.add("hidden");
  screenProfile.classList.add("hidden");
}
function showList(){ hideAll(); loginList.classList.remove("hidden"); }
function showScreen(el){ hideAll(); el.classList.remove("hidden"); }

// modal close handlers
closeModal.addEventListener("click", closeAuth);
authModal.addEventListener("click", (e) => { if (e.target === authModal) closeAuth(); });

// back buttons
authModal.querySelectorAll("[data-back]").forEach(btn => {
  btn.addEventListener("click", () => { setMsg(""); showList(); });
});

// open modal
signInBtn.addEventListener("click", async () => {
  if (auth.currentUser) {
    await loadProfileToUI(auth.currentUser);
    showScreen(screenProfile);
    openAuth();
    return;
  }
  showList();
  openAuth();
});

// list -> chooser
openEmailPhone.addEventListener("click", () => showScreen(screenChooser));
goEmail.addEventListener("click", () => showScreen(screenEmail));
goPhone.addEventListener("click", () => showScreen(screenPhone));

// Google login
googleLoginBtn.addEventListener("click", async () => {
  try{
    setMsg("Opening Google...");
    const provider = new firebase.auth.GoogleAuthProvider();
    await auth.signInWithPopup(provider);
    setMsg("");
    closeAuth();
  }catch(e){
    setMsg(e.message);
  }
});

// Facebook login (এখন provider enable না করলে error হবে)
facebookLoginBtn.addEventListener("click", async () => {
  try{
    setMsg("Opening Facebook...");
    const provider = new firebase.auth.FacebookAuthProvider();
    await auth.signInWithPopup(provider);
    setMsg("");
    closeAuth();
  }catch(e){
    setMsg(e.message);
  }
});

// Email sign in
emailSignIn.addEventListener("click", async () => {
  try{
    setMsg("Signing in...");
    await auth.signInWithEmailAndPassword(emailField.value.trim(), passField.value);
    setMsg("");
    closeAuth();
  }catch(e){ setMsg(e.message); }
});

// Email sign up
emailSignUp.addEventListener("click", async () => {
  try{
    setMsg("Creating account...");
    await auth.createUserWithEmailAndPassword(emailField.value.trim(), passField.value);
    setMsg("");
    await loadProfileToUI(auth.currentUser);
    showScreen(screenProfile);
  }catch(e){ setMsg(e.message); }
});

// Phone OTP
let confirmationResult = null;
let recaptchaVerifier = null;

function ensureRecaptcha(){
  if (recaptchaVerifier) return;
  recaptchaVerifier = new firebase.auth.RecaptchaVerifier("recaptcha-container", { size: "normal" });
  recaptchaVerifier.render();
}

sendOtp.addEventListener("click", async () => {
  try{
    ensureRecaptcha();
    setMsg("Sending OTP...");
    confirmationResult = await auth.signInWithPhoneNumber(phoneField.value.trim(), recaptchaVerifier);
    setMsg("OTP sent. Enter code.");
  }catch(e){ setMsg(e.message); }
});

verifyOtp.addEventListener("click", async () => {
  try{
    if (!confirmationResult) return setMsg("Send OTP first.");
    setMsg("Verifying...");
    await confirmationResult.confirm(otpField.value.trim());
    setMsg("");
    closeAuth();
  }catch(e){ setMsg(e.message); }
});

// Firestore profile
async function loadProfileToUI(user){
  if (!user) return;
  const ref = db.collection("users").doc(user.uid);
  const snap = await ref.get();
  const data = snap.exists ? snap.data() : {};
  nameField.value = data?.displayName || user.displayName || "";
  photoField.value = data?.photoURL || user.photoURL || "";
}

async function saveProfileToDB(user){
  const displayName = (nameField.value || "").trim();
  const photoURL = (photoField.value || "").trim();

  await db.collection("users").doc(user.uid).set({
    displayName: displayName || user.displayName || "User",
    photoURL: photoURL || user.photoURL || "",
    updatedAt: Date.now()
  }, { merge:true });

  await user.updateProfile({
    displayName: displayName || user.displayName || "",
    photoURL: photoURL || user.photoURL || ""
  });
}

saveProfile.addEventListener("click", async () => {
  try{
    const user = auth.currentUser;
    if (!user) return setMsg("Not logged in.");
    setMsg("Saving...");
    await saveProfileToDB(user);
    setMsg("Saved!");
    closeAuth();
  }catch(e){ setMsg(e.message); }
});

logoutBtn.addEventListener("click", async () => {
  await auth.signOut();
  closeAuth();
});

// header name update
async function applyHeader(user){
  if (!user){
    headerName.textContent = DEFAULT_NAME;
    signInBtn.textContent = "Sign in";
    return;
  }

  let name = user.displayName || "User";
  try{
    const snap = await db.collection("users").doc(user.uid).get();
    if (snap.exists && (snap.data()?.displayName || "").trim()) {
      name = snap.data().displayName.trim();
    }
  }catch(_) {}

  headerName.textContent = name;
  signInBtn.textContent = "Profile";
}

// auth state
auth.onAuthStateChanged(async (user) => {
  await applyHeader(user);
  if (user) await loadProfileToUI(user);
});
