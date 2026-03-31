const API = "http://localhost:3005"; 
let PROVINCES_DATA = [];
let map = null, routingControl = null;
let isLoginMode = true;
let userNameToRead = "User"; 

function toggleAuth() {
    isLoginMode = !isLoginMode;
    const title = document.getElementById("authTitle");
    const nameInput = document.getElementById("nameInput");
    const authBtn = document.getElementById("authBtn");
    const toggleText = document.getElementById("toggleText");

    if (isLoginMode) {
        title.innerText = "Sign In";
        nameInput.classList.add("hidden");
        authBtn.innerText = "Login";
        toggleText.innerText = "Don't have an account? Sign Up";
    } else {
        title.innerText = "Create Account";
        nameInput.classList.remove("hidden");
        authBtn.innerText = "Register";
        toggleText.innerText = "Already have an account? Login";
    }
}

function handleAuth() {
    const emailEl = document.getElementById("emailInput");
    const passEl = document.getElementById("passwordInput");
    const nameEl = document.getElementById("nameInput");

    if (!emailEl.value.includes("@")) return alert("Please enter a valid email.");
    
    // Capture name from the input field
    userNameToRead = nameEl.value.trim() || "User";

    document.getElementById("authPage").classList.add("hidden");
    document.getElementById("plannerPage").classList.remove("hidden");

    // Clear fields but keep userNameToRead in memory for the voice
    emailEl.value = "";
    passEl.value = "";
    nameEl.value = "";
    
    ["origin", "destination"].forEach(id => buildProvinceSelect(id));
}

function buildProvinceSelect(id) {
    document.getElementById(id + "Wrapper").innerHTML = `
        <label style="color:#94a3b8; font-size:11px; font-weight:bold; letter-spacing:1px;">${id.toUpperCase()} PROVINCE</label>
        <select class="input" id="${id}_province" onchange="buildCitySelect('${id}')">
            <option value="" disabled selected>Select a province</option>
            ${PROVINCES_DATA.map(p => `<option value="${p.key}">${p.name}</option>`).join("")}
        </select>
        <div id="${id}_cityWrap"></div>`;
}

function buildCitySelect(id) {
    const pKey = document.getElementById(id + "_province").value;
    const prov = PROVINCES_DATA.find(p => p.key === pKey);
    const sortedCities = prov.cities.sort((a,b) => a.name.localeCompare(b.name));

    document.getElementById(id + "_cityWrap").innerHTML = `
        <select class="input" id="${id}_city">
            <option value="" disabled selected>Select City</option>
            ${sortedCities.map(c => `<option value="${c.name}">${c.name}</option>`).join("")}
        </select>`;
}

async function planJourney() {
    const oC = document.getElementById("origin_city")?.value;
    const dC = document.getElementById("destination_city")?.value;
    const oP = document.getElementById("origin_province")?.value;
    const dP = document.getElementById("destination_province")?.value;

    if (!oC || !dC) return alert("Select cities first.");

    const resDiv = document.getElementById("journeyResult");
    resDiv.classList.remove("hidden");
    resDiv.innerHTML = "<p style='text-align:center; color:#94a3b8;'>Loading weather...</p>";

    try {
        const r = await fetch(API + "/api/journey", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ origin: { province: oP, city: oC }, destination: { province: dP, city: dC } })
        });
        const data = await r.json();
        
        let weatherHtml = `<div style="border-top:1px solid #334155; margin-top:15px; padding-top:10px;">`;
        data.waypoints.forEach(wp => {
            weatherHtml += `<p style="font-size:13px; margin:5px 0;">
                <span style="color:#94a3b8;">${wp.name}:</span> 
                <span style="color:#f59e0b; font-weight:bold;">${wp.temp}°C</span>
            </p>`;
        });
        weatherHtml += `</div>`;

        resDiv.innerHTML = `
            <div style="margin-top:20px; padding:15px; background:#0f172a; border-radius:8px; border:1px solid #334155;">
                <p style="font-size:14px;"><strong>Distance:</strong> ${data.total_km} km</p>
                ${weatherHtml}
                <button class="btn btn-start" onclick='startNav(${JSON.stringify(data)})'>Start Navigation</button>
            </div>`;
    } catch (e) { alert("Server error."); }
}

function startNav(data) {
    document.getElementById("plannerPage").classList.add("hidden");
    document.getElementById("navigationPage").classList.remove("hidden");
    
    const destTemp = data.waypoints[1].temp;
    const totalDist = data.total_km;

    // UPDATED VOICE SCRIPT
    const speech = new SpeechSynthesisUtterance(
        `Hello ${userNameToRead}. Welcome to my RouteAhead website. The temperature is ${destTemp} degrees currently and the distance will be ${totalDist} kilometers. Drive safely.`
    );
    window.speechSynthesis.speak(speech);

    if (!map) {
        map = L.map('map').setView([data.waypoints[0].lat, data.waypoints[0].lon], 10);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    }
    if (routingControl) map.removeControl(routingControl);
    routingControl = L.Routing.control({
        waypoints: data.waypoints.map(wp => L.latLng(wp.lat, wp.lon)),
        lineOptions: { styles: [{ color: '#3b82f6', weight: 6 }] }
    }).addTo(map);
}

window.addEventListener("DOMContentLoaded", async () => {
    document.getElementById("emailInput").value = "";
    document.getElementById("passwordInput").value = "";
    document.getElementById("nameInput").value = "";

    try {
        const r = await fetch(API + "/api/provinces");
        PROVINCES_DATA = await r.json();
    } catch (e) { console.error("Database connection failed"); }
});