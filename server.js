const express = require("express");
const cors    = require("cors");
const fetch   = require("node-fetch");
const path    = require("path");

const app = express();

// 1. THIS IS THE BIG CHANGE: Allows your AWS website to talk to this server
app.use(cors()); 
app.use(express.json());

// ... [Keep all your PROVINCES, CITY_PLACES, and WMO_CODES data here exactly as they are] ...

// 2. YOUR ROUTES (These remain the same as your file)
app.get("/api/provinces", function(req, res) {
  // ... [Your existing provinces code] ...
});

app.post("/api/weather", async function(req, res) {
  // ... [Your existing weather code] ...
});

app.post("/api/journey", async function(req, res) {
  // ... [Your existing journey code] ...
});

app.use(express.static(path.join(__dirname, "public")));

// 3. THIS IS THE OTHER BIG CHANGE: This lets Render/AWS choose the port automatically
const PORT = process.env.PORT || 3001;
app.listen(PORT, "0.0.0.0", function() { 
    console.log("Server running on port " + PORT); 
});