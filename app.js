// --- UPDATED API LINK ---
// Use the Vercel link for production
const API = "https://pocket-tracer-nine.vercel.app"; 
let PROVINCES_DATA = [];
let map = null;
let routingControl = null;
let isLoginMode = true;

// --- UI HELPERS ---
function wipeFields() {
  const fields = ["emailInput", "passwordInput", "usernameInput"];
  fields.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
}

function toggleFooter(show) {
  const footer = document.getElementById("mainFooter");
  if (footer) {
    if (show) footer.classList.remove("hidden");
    else footer.classList.add("hidden");
  }
}

// --- AUTH LOGIC ---
function toggleAuthMode() {
  isLoginMode = !isLoginMode;
  wipeFields();
  document.getElementById("signupFields").classList.toggle("hidden");
  document.getElementById("authSubtitle").innerText = isLoginMode ? "Sign in to start your journey" : "Register your account";
  document.getElementById("authBtn").innerText = isLoginMode ? "Login" : "Register Now";
}

function handleAuth() {
  const email = document.getElementById("emailInput").value;
  const pass = document.getElementById("passwordInput").value;
  const name = document.getElementById("usernameInput").value;

  if (!email.includes("@") || !email.includes(".")) return alert("Enter valid email!");

  let users = JSON.parse(localStorage.getItem("routeUsers") || "[]");

  if (isLoginMode) {
    const user = users.find(u => u.email === email && u.password === pass);
    if (user) {
      localStorage.setItem("currentUser", JSON.stringify(user));
      wipeFields();
      showPlanner();
    } else alert("Invalid credentials.");
  } else {
    if (!name || !pass) return alert("Fill all fields!");
    const newUser = { name, email, password: pass };
    users.push(newUser);
    localStorage.setItem("routeUsers", JSON.stringify(users));
    localStorage.setItem("currentUser", JSON.stringify(newUser));
    wipeFields();
    showPlanner();
  }
}

function showPlanner() {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  if (!user) return;
  document.getElementById("loginPage").classList.add("hidden");
  document.getElementById("plannerPage").classList.remove("hidden");
  document.getElementById("welcomeUser").innerText = `Welcome, ${user.name}`;
  toggleFooter(true);
  
  // Re-run dropdown creation if data was already fetched
  if (PROVINCES_DATA.length > 0) {
    ["origin", "destination"].forEach(id => createDropdowns(id));
  }
}

function logout() {
  localStorage.removeItem("currentUser");
  wipeFields();
  location.reload();
}

// --- DROPDOWNS & WEATHER ---
function createDropdowns(id) {
  const container = document.getElementById(id + "Wrapper");
  if (!container) return;
  container.innerHTML = `
    <label class="lbl">${id === 'origin' ? 'From' : 'To'}</label>
    <select class="input" id="${id}_province" onchange="updateCities('${id}')">
      <option value="" disabled selected>Select Province</option>
      ${PROVINCES_DATA.map(p => `<option value="${p.key}">${p.name}</option>`).join("")}
    </select>
    <div id="${id}_cityWrap"></div>`;
}

function updateCities(id) {
  const pKey = document.getElementById(id + "_province").value;
  const prov = PROVINCES_DATA.find(p => p.key === pKey);
  const cityWrap = document.getElementById(id + "_cityWrap");
  if (cityWrap && prov) {
    cityWrap.innerHTML = `
      <select class="input" id="${id}_city" style="margin-top:8px">
        <option value="" disabled selected>Select City</option>
        ${prov.cities.map(c => `<option value="${c.key}">${c.name}</option>`).join("")}
      </select>`;
  }
}

async function planJourney() {
  const oP = document.getElementById("origin_province")?.value;
  const oC = document.getElementById("origin_city")?.value;
  const dP = document.getElementById("destination_province")?.value;
  const dC = document.getElementById("destination_city")?.value;

  if (!oP || !oC || !dP || !dC) return alert("Select locations!");

  const resDiv = document.getElementById("journeyResult");
  resDiv.classList.remove("hidden");
  resDiv.innerHTML = "<div class='card'>Fetching route & weather...</div>";

  try {
    const r = await fetch(API + "/api/journey", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ origin: { province: oP, city: oC }, destination: { province: dP, city: dC } })
    });
    const data = await r.json();

    let weatherHtml = `<h3>Weather Ahead</h3>`;
    data.waypoints.forEach(wp => {
      weatherHtml += `<div class="weather-step"><span class="step-city">${wp.city}</span><span class="step-info">${wp.temp}°C - ${wp.description}</span></div>`;
    });

    resDiv.innerHTML = `
      <div class="card">
        <h3>Distance: ${data.total_km} km</h3>
        ${weatherHtml}
        <button class="btn btn-primary" style="background:var(--green); margin-top:15px" onclick='startNav(${JSON.stringify(data)})'>START JOURNEY</button>
      </div>`;
  } catch (e) { resDiv.innerHTML = "<div class='card'>Server error. Please try again.</div>"; }
}

function startNav(data) {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  document.getElementById("plannerPage").classList.add("hidden");
  document.getElementById("navigationPage").classList.remove("hidden");
  toggleFooter(false);

  if (!map) {
    map = L.map('map').setView([data.waypoints[0].lat, data.waypoints[0].lon], 16);
    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png').addTo(map);
  }
  
  if (routingControl) map.removeControl(routingControl);
  
  routingControl = L.Routing.control({
    waypoints: data.waypoints.map(wp => L.latLng(wp.lat, wp.lon)),
    show: false,
    addWaypoints: false,
    routeWhileDragging: false
  }).addTo(map);

  const dest = data.waypoints[data.waypoints.length - 1].city;
  document.getElementById("destDisplay").innerText = "To: " + dest;
  
  const msg = new SpeechSynthesisUtterance(`Hello ${user.name}. Navigation starting to ${dest}. Drive safely!`);
  window.speechSynthesis.speak(msg);
}

window.addEventListener("DOMContentLoaded", async () => {
  wipeFields();
  try {
    const r = await fetch(API + "/api/provinces");
    if (!r.ok) throw new Error("Network response was not ok");
    PROVINCES_DATA = await r.json();
    
    if(localStorage.getItem("currentUser")) {
      showPlanner();
    } else {
      toggleFooter(true);
    }
  } catch (e) { 
    console.error("Fetch error:", e);
    const resDiv = document.getElementById("journeyResult");
    if (resDiv) {
        resDiv.classList.remove("hidden");
        resDiv.innerHTML = "<div class='card'>Could not connect to server. Check your connection.</div>";
    }
    toggleFooter(true); 
  }
});