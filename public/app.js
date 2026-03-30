const API = "http://localhost:3001";

let PROVINCES_DATA = [];

const TYPE_LABELS = { mall: "Mall", landmark: "Landmark", hospital: "Hospital", university: "University" };

function showToast(msg, isError = false) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.className = "toast show" + (isError ? " error" : "");
  clearTimeout(t._timer);
  t._timer = setTimeout(() => (t.className = "toast"), 3200);
}

function buildSelect(id, options, placeholder, onchangeFn) {
  const opts = options.map(function(o) {
    return "<option value=\"" + o.value + "\">" + o.label + "</option>";
  }).join("");
  const onchange = onchangeFn ? " onchange=\"" + onchangeFn + "('" + id + "')\"" : "";
  return "<select class=\"input\" id=\"" + id + "\"" + onchange + ">" +
    "<option value=\"\" disabled selected>" + placeholder + "</option>" +
    opts + "</select>";
}

function getCitiesForProvince(provinceKey) {
  const prov = PROVINCES_DATA.find(function(p) { return p.key === provinceKey; });
  return prov ? prov.cities : [];
}

function getPlacesForCity(provinceKey, cityKey) {
  const cities = getCitiesForProvince(provinceKey);
  const city   = cities.find(function(c) { return c.key === cityKey; });
  return city ? city.places : [];
}

function onProvinceChange(selectId) {
  const provinceKey  = document.getElementById(selectId).value;
  const cities       = getCitiesForProvince(provinceKey);
  const cityWrapper  = document.getElementById(selectId + "_cityWrapper");
  const placeWrapper = document.getElementById(selectId + "_placeWrapper");

  if (!cityWrapper) return;

  cityWrapper.innerHTML = buildSelect(
    selectId + "_city",
    cities.map(function(c) { return { value: c.key, label: c.name }; }),
    "Select a city",
    "onCityChange"
  );
  cityWrapper.style.display = "block";

  if (placeWrapper) {
    placeWrapper.innerHTML = "";
    placeWrapper.style.display = "none";
  }
}

function onCityChange(citySelectId) {
  const provinceSelectId = citySelectId.replace("_city", "");
  const provinceKey      = document.getElementById(provinceSelectId).value;
  const cityKey          = document.getElementById(citySelectId).value;
  const places           = getPlacesForCity(provinceKey, cityKey);
  const placeWrapper     = document.getElementById(provinceSelectId + "_placeWrapper");

  if (!placeWrapper) return;

  if (places.length === 0) {
    placeWrapper.style.display = "none";
    return;
  }

  const grouped = {};
  places.forEach(function(p) {
    if (!grouped[p.type]) grouped[p.type] = [];
    grouped[p.type].push(p);
  });

  let opts = "<option value=\"\" disabled selected>Select a place</option>";
  Object.keys(grouped).forEach(function(type) {
    opts += "<optgroup label=\"" + (TYPE_LABELS[type] || type) + "\">";
    grouped[type].forEach(function(p) {
      opts += "<option value=\"" + p.name + "\">" + p.name + "</option>";
    });
    opts += "</optgroup>";
  });

  placeWrapper.innerHTML = "<select class=\"input\" id=\"" + provinceSelectId + "_place\" style=\"margin-top:.5rem\">" + opts + "</select>";
  placeWrapper.style.display = "block";
}

function buildSelectionGroup(baseId, provincePlaceholder) {
  return buildSelect(
    baseId,
    PROVINCES_DATA.map(function(p) { return { value: p.key, label: p.name }; }),
    provincePlaceholder,
    "onProvinceChange"
  ) +
  "<div id=\"" + baseId + "_cityWrapper\" style=\"display:none;margin-top:.5rem\"></div>" +
  "<div id=\"" + baseId + "_placeWrapper\" style=\"display:none;margin-top:.5rem\"></div>";
}

function getSelection(baseId) {
  const provEl  = document.getElementById(baseId);
  const cityEl  = document.getElementById(baseId + "_city");
  const placeEl = document.getElementById(baseId + "_place");
  return {
    province: provEl  ? provEl.value  : "",
    city:     cityEl  ? cityEl.value  : "",
    place:    placeEl ? placeEl.value : "",
  };
}

async function quickCheck() {
  const sel = getSelection("quickProvince");
  if (!sel.province) return showToast("Select a province.", true);
  if (!sel.city)     return showToast("Select a city.", true);

  const box = document.getElementById("quickResult");
  box.classList.remove("hidden");
  box.innerHTML = spinner("Fetching weather...");

  try {
    const data = await postJSON("/api/weather", { province: sel.province, city: sel.city, place: sel.place });
    box.innerHTML = weatherCard(data);
  } catch (err) {
    box.innerHTML = "<p style=\"color:var(--red)\">" + err.message + "</p>";
  }
}

function weatherCard(d) {
  const heading = d.place && d.place !== d.city ? d.place + " - " + d.city + ", " + d.province : d.city + ", " + d.province;
  return "<div class=\"result-info\" style=\"width:100%\">" +
    "<h3>" + heading + "</h3>" +
    "<div class=\"temp\">" + d.temp + "C</div>" +
    "<div class=\"desc\">" + d.description + "</div>" +
    "<div class=\"meta-pills\">" +
    "<span class=\"pill\">Feels like " + d.feels_like + "C</span>" +
    "<span class=\"pill\">Humidity " + d.humidity + "%</span>" +
    "<span class=\"pill\">Wind " + d.wind_kph + " km/h</span>" +
    "</div></div>";
}

let stopCount = 0;

function addStop() {
  stopCount++;
  const pid     = "stop_" + stopCount;
  const wrapper = document.getElementById("stopsWrapper");

  if (stopCount === 1) {
    const lbl = document.createElement("label");
    lbl.className = "lbl";
    lbl.id = "stopsLabel";
    lbl.textContent = "Stops along the way";
    wrapper.prepend(lbl);
  }

  const row = document.createElement("div");
  row.className = "stop-row";
  row.id = "row_" + pid;
  row.style.cssText = "flex-direction:column;align-items:stretch;gap:.5rem";
  row.innerHTML =
    buildSelectionGroup(pid, "Select a province") +
    "<button class=\"btn btn-remove\" onclick=\"removeStop('" + pid + "')\">Remove stop</button>";
  wrapper.appendChild(row);
}

function removeStop(id) {
  const row = document.getElementById("row_" + id);
  if (row) row.remove();
  if (document.querySelectorAll("#stopsWrapper .stop-row").length === 0) {
    const lbl = document.getElementById("stopsLabel");
    if (lbl) lbl.remove();
  }
}

function getStops() {
  const rows  = document.querySelectorAll("#stopsWrapper .stop-row");
  const stops = [];
  rows.forEach(function(row) {
    const provSel = row.querySelector("select");
    if (!provSel || !provSel.value) return;
    const baseId = provSel.id;
    const sel    = getSelection(baseId);
    if (!sel.city) return;
    stops.push(sel);
  });
  return stops;
}

async function planJourney() {
  const origin      = getSelection("origin");
  const destination = getSelection("destination");
  const stops       = getStops();

  if (!origin.province)      return showToast("Select an origin province.", true);
  if (!origin.city)          return showToast("Select an origin city.", true);
  if (!destination.province) return showToast("Select a destination province.", true);
  if (!destination.city)     return showToast("Select a destination city.", true);

  const resultSection = document.getElementById("journeyResult");
  resultSection.classList.remove("hidden");
  resultSection.style.display = "flex";
  resultSection.innerHTML = spinner("Planning your journey...");

  try {
    const data = await postJSON("/api/journey", { origin, destination, stops });
    renderJourney(data, resultSection);
    resultSection.scrollIntoView({ behavior: "smooth" });
  } catch (err) {
    resultSection.innerHTML = "<div class=\"card\" style=\"border-color:rgba(231,76,60,.3)\"><p style=\"color:var(--red)\">" + err.message + "</p></div>";
    showToast(err.message, true);
  }
}

function renderJourney(data, container) {
  const waypoints   = data.waypoints;
  const segments    = data.segments;
  const total_km    = data.total_km;
  const total_hours = data.total_hours;

  const summaryHTML =
    "<div class=\"summary-bar\">" +
    "<div class=\"summary-stat\"><div class=\"val\">" + total_km.toLocaleString() + "</div><div class=\"lbl\">Total km</div></div>" +
    "<div class=\"summary-stat\"><div class=\"val\">" + total_hours + "h</div><div class=\"lbl\">Drive time</div></div>" +
    "<div class=\"summary-stat\"><div class=\"val\">" + waypoints.length + "</div><div class=\"lbl\">Stops</div></div>" +
    "</div>";

  let routeHTML = "<div class=\"card\"><div class=\"card-title\">Route Overview</div>";
  waypoints.forEach(function(wp, i) {
    const dotClass = i === 0 ? "origin" : i === waypoints.length - 1 ? "dest" : "stop";
    const label    = wp.place && wp.place !== wp.city ? wp.place + ", " + wp.city : wp.city + ", " + wp.province;
    routeHTML +=
      "<div class=\"route-line\">" +
      "<div class=\"route-dot " + dotClass + "\"></div>" +
      "<span>" + label + "</span>" +
      "<span style=\"flex:1\"></span>" +
      "<span style=\"color:var(--accent)\">" + wp.temp + "C</span>" +
      "<span style=\"color:var(--muted);margin-left:.4rem\">" + wp.description + "</span>" +
      "</div>";
    if (segments[i]) {
      routeHTML +=
        "<div class=\"route-line\" style=\"padding-left:1.4rem;opacity:.6\">" +
        "<div class=\"route-seg-line\"></div>" +
        "<span class=\"route-seg-dist\">" + segments[i].distance_km + " km - ~" + segments[i].drive_hours + "h</span>" +
        "</div>";
    }
  });
  routeHTML += "</div>";

  const wpCardsHTML =
    "<div class=\"card\"><div class=\"card-title\">Weather at Each Stop</div>" +
    "<div class=\"waypoints-grid\">" +
    waypoints.map(function(wp, i) { return waypointCard(wp, i, waypoints.length); }).join("") +
    "</div></div>";

  const segRows = segments.map(function(s) {
    return "<tr><td>" + s.from + "</td><td>to</td><td>" + s.to + "</td>" +
      "<td class=\"dist\">" + s.distance_km + " km</td>" +
      "<td class=\"time\">~" + s.drive_hours + "h</td></tr>";
  }).join("");

  const segTableHTML =
    "<div class=\"card\"><div class=\"card-title\">Segment Distances</div>" +
    "<table class=\"seg-table\"><thead><tr>" +
    "<th>From</th><th></th><th>To</th><th>Distance</th><th>Drive time</th>" +
    "</tr></thead><tbody>" + segRows + "</tbody></table></div>";

  container.innerHTML = summaryHTML + routeHTML + wpCardsHTML + segTableHTML;
}

function waypointCard(wp, index, total) {
  const isOrigin   = index === 0;
  const isDest     = index === total - 1;
  const badgeClass = isOrigin ? "badge-origin" : isDest ? "badge-dest" : "badge-stop";
  const badgeText  = isOrigin ? "Origin" : isDest ? "Destination" : "Stop " + index;
  const cardClass  = isOrigin ? "origin-card" : isDest ? "dest-card" : "";
  const placeLine  = wp.place && wp.place !== wp.city ? wp.place : "";

  return "<div class=\"wp-card " + cardClass + "\">" +
    "<div class=\"wp-badge " + badgeClass + "\">" + badgeText + "</div>" +
    (placeLine ? "<div class=\"wp-place\">" + placeLine + "</div>" : "") +
    "<div class=\"wp-city\">" + wp.city + "</div>" +
    "<div class=\"wp-country\">" + wp.province + "</div>" +
    "<div class=\"wp-temp\">" + wp.temp + "C</div>" +
    "<div class=\"wp-desc\">" + wp.description + "</div>" +
    "<div class=\"wp-extras\">Humidity " + wp.humidity + "% - Wind " + wp.wind_kph + " km/h</div>" +
    "</div>";
}

async function postJSON(endpoint, body) {
  const res = await fetch(API + endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Server error");
  return data;
}

function spinner(msg) {
  return "<div class=\"spinner-wrap\"><div class=\"spinner\"></div>" + (msg || "Loading...") + "</div>";
}

window.addEventListener("DOMContentLoaded", async function() {
  try {
    const res  = await fetch(API + "/api/provinces");
    PROVINCES_DATA = await res.json();
  } catch (e) {
    showToast("Could not load data. Is the server running?", true);
    return;
  }

  document.querySelector("#quickCard .input-row").innerHTML =
    buildSelectionGroup("quickProvince", "Select a province...") +
    "<button class=\"btn btn-accent\" onclick=\"quickCheck()\">Check</button>";

  document.getElementById("originWrapper").innerHTML      = buildSelectionGroup("origin", "Select origin province");
  document.getElementById("destinationWrapper").innerHTML = buildSelectionGroup("destination", "Select destination province");
});