// Firebase Config (Real Project - Be Careful!)
const firebaseConfig = {
  apiKey: "AIzaSyBmLvGb0vXkJhKVKew1sYZpHuVPo-mHvjk",
  authDomain: "aviatorsignal-ff90c.firebaseapp.com",
  projectId: "aviatorsignal-ff90c",
  storageBucket: "aviatorsignal-ff90c.firebasestorage.app",
  messagingSenderId: "656549146292",
  appId: "1:656549146292:web:f35944e4ae7b6db943f1e1",
  measurementId: "G-B5N5DG523J"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

const adminWhatsapp = "94768701677";

// ==================== UI Functions ====================

function showNotice() {
  document.getElementById("loginScreen").style.display = "none";
  document.getElementById("noticeModal").style.display = "flex";
}

function acceptNotice() {
  document.getElementById("noticeModal").style.display = "none";
  document.getElementById("mainApp").style.display = "block";
}

// Show login error
function showLoginError(code) {
  document.getElementById("btn").innerText = "VERIFY & LOGIN 🔓";
  document.getElementById("errorMsg").style.display = "block";
  document.getElementById("errorMsg").innerText = "❌ Login Error: " + code;
}

// Show DB error
function showDBError(message) {
  document.getElementById("errorMsg").style.display = "block";
  document.getElementById("errorMsg").innerText = "❌ DB Error: " + message;
  document.getElementById("btn").innerText = "TRY AGAIN";
}

// Check subscription expiry
async function checkUserExpiry(user) {
  if (!user) return;

  const uid = user.uid;
  const userDoc = await db.collection("users").doc(uid).get();

  if (!userDoc.exists) {
    document.getElementById("errorMsg").style.display = "block";
    document.getElementById("errorMsg").innerHTML = `⚠️ <b>DATABASE ERROR:</b><br>User ID not found.<br>UID: ${uid}`;
    document.getElementById("btn").innerText = "SETUP REQUIRED";
    return;
  }

  const data = userDoc.data();
  const expiryDate = data.expiryDate ? new Date(data.expiryDate) : null;

  if (expiryDate && expiryDate < new Date()) {
    const msg = `Hello Admin, My Aviator App subscription expired. My UID: ${uid}`;
    const whatsappLink = `https://wa.me/\( {adminWhatsapp}?text= \){encodeURIComponent(msg)}`;

    document.getElementById("errorMsg").style.display = "block";
    document.getElementById("errorMsg").innerHTML = `
      🚫 <b>ACCOUNT EXPIRED!</b><br>
      Valid until: ${expiryDate.toLocaleDateString()}<br>
      <a href="${whatsappLink}" class="btn-renew">
        <i class="fab fa-whatsapp"></i> RENEW NOW
      </a>`;
    document.getElementById("btn").innerText = "VERIFY & LOGIN 🔓";
  } else {
    document.getElementById("userExpiryDisplay").innerText = 
      expiryDate ? "Valid Until: " + expiryDate.toLocaleDateString() : "Unlimited Access";
    document.getElementById("mainApp").style.display = "block";
    document.getElementById("loginScreen").style.display = "none";
  }
}

// Login with Email & Password
async function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if (!email || !password) {
    document.getElementById("loginError").style.display = "block";
    document.getElementById("loginError").innerText = "⚠️ Email & Password Required!";
    return;
  }

  document.getElementById("loginBtn").innerText = "CONNECTING...";
  document.getElementById("loginError").style.display = "none";

  try {
    await auth.signInWithEmailAndPassword(email, password);
  } catch (err) {
    showLoginError(err.code);
  }
}

// Logout
function logout() {
  auth.signOut();
  window.location.reload();
}

// Auth State Listener
auth.onAuthStateChanged(async (user) => {
  if (user) {
    document.getElementById("userExpiryDisplay").innerText = "Valid Until: Checking...";
    document.getElementById("loginScreen").style.display = "none";
    document.getElementById("mainApp").style.display = "block";
    await checkUserExpiry(user);
  } else {
    document.getElementById("loginScreen").style.display = "block";
    document.getElementById("mainApp").style.display = "none";
    document.getElementById("noticeModal").style.display = "none";
  }
});

// AM/PM Toggle
let currentAmpm = "AM";
function setAMPM(mode) {
  currentAmpm = mode;
  document.getElementById("btnAM").className = "ampm-btn" + (mode === "AM" ? " active" : "");
  document.getElementById("btnPM").className = "ampm-btn" + (mode === "PM" ? " active" : "");
}

// Input blur/focus
function checkInput(input) {
  if (input.value.length > 0) {
    input.blur();
  } else {
    input.focus();
  }
}

// Format time (12-hour)
function formatTime(date) {
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return `\( {hours}: \){minutes} ${ampm}`;
}

// Main Signal Calculator (Fake Logic - Just Random)
function calculateSignal() {
  const lastOdd = parseFloat(document.getElementById("lastOdd").value);
  if (isNaN(lastOdd)) {
    alert("Please enter all details!");
    return;
  }

  const hour = parseInt(document.getElementById("inputHour").value) || 0;
  const minute = parseInt(document.getElementById("inputMinute").value) || 0;
  let isPM = currentAmpm === "PM";
  if (hour === 12) isPM ? (hour = 12) : (hour = 0);

  const targetTime = new Date();
  targetTime.setHours(isPM ? hour + 12 : hour);
  targetTime.setMinutes(minute);
  const timestamp = targetTime.getTime() + Math.floor(Math.random() * 5 + 2) * 60000; // +2-7 mins

  const zoneStart = formatTime(new Date(timestamp));
  const zoneEnd = formatTime(new Date(timestamp + 4 * 60000));

  document.getElementById("displaySignal").innerText = 
    `🚨 *AVIATOR SIGNAL* 🚨\n\n🎯 Next Odd Time: \( {zoneStart}\n🕒 Zone: \){zoneStart} To ${zoneEnd}\n\n🔥 *විනාඩි හතර තුළ Bet කරන්න*`;

  document.getElementById("resultArea").style.display = "block";
  document.getElementById("copyButton").innerHTML = '<i class="fa-regular fa-copy"></i> COPY SIGNAL';
  document.getElementById("copyButton").style.background = "linear-gradient(45deg, #00ff88, #00b359)";
  document.getElementById("copyButton").style.color = "black";
}

// Copy Signal
function manualCopy() {
  const text = document.getElementById("displaySignal").innerText;
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();
  textarea.setSelectionRange(0, 99999);

  try {
    document.execCommand("copy");
    document.getElementById("copyButton").innerHTML = '<i class="fa-solid fa-check-double"></i> COPIED!';
    setTimeout(() => {
      document.getElementById("copyButton").innerHTML = '<i class="fa-regular fa-copy"></i> COPY SIGNAL';
    }, 2000);
  } catch (err) {
    alert("Manual Copy Required");
  }

  document.body.removeChild(textarea);
}

// Event Listeners
document.getElementById("loginBtn").addEventListener("click", login);
document.getElementById("logoutBtn").addEventListener("click", logout);