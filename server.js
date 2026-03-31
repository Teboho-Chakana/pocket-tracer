const express = require("express");
const cors    = require("cors");
const fetch   = require("node-fetch");

const app = express();

// 1. ALLOWS AWS TO TALK TO VERCEL
app.use(cors()); 
app.use(express.json());

// --- DATA ---
const PROVINCES = [
    { key: "GP", name: "Gauteng" },
    { key: "WC", name: "Western Cape" },
    { key: "KZN", name: "KwaZulu-Natal" },
    { key: "FS", name: "Free State" },
    { key: "EC", name: "Eastern Cape" },
    { key: "LP", name: "Limpopo" },
    { key: "MP", name: "Mpumalanga" },
    { key: "NW", name: "North West" },
    { key: "NC", name: "Northern Cape" }
];

const CITY_PLACES = {
    "GP": [
        { key: "jhb", name: "Johannesburg", lat: -26.2041, lon: 28.0473 },
        { key: "pta", name: "Pretoria", lat: -25.7479, lon: 28.2293 }
    ],
    "WC": [
        { key: "cpt", name: "Cape Town", lat: -33.9249, lon: 18.4241 },
        { key: "grj", name: "George", lat: -33.9669, lon: 22.4501 }
    ],
    "KZN": [
        { key: "dur", name: "Durban", lat: -29.8587, lon: 31.0218 },
        { key: "pmb", name: "Pietermaritzburg", lat: -29.6006, lon: 30.3794 }
    ],
    "FS": [
        { key: "bfn", name: "Bloemfontein", lat: -29.1181, lon: 26.2235 }
    ],
    "EC": [
        { key: "plz", name: "Gqeberha", lat: -33.9608, lon: 25.6022 },
        { key: "els", name: "East London", lat: -33.0292, lon: 27.8546 }
    ],
    "LP": [
        { key: "pol", name: "Polokwane", lat: -23.8962, lon: 29.4486 }
    ],
    "MP": [
        { key: "nel", name: "Mbombela", lat: -25.4753, lon: 30.9694 }
    ],
    "NW": [
        { key: "mmb", name: "Mahikeng", lat: -25.8560, lon: 25.6403 }
    ],
    "NC": [
        { key: "kmy", name: "Kimberley", lat: -28.7282, lon: 24.7499 }
    ]
};

const WMO_CODES = {
    0: "Clear sky", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
    45: "Fog", 48: "Depositing rime fog",
    51: "Drizzle: Light", 53: "Drizzle: Moderate", 55: "Drizzle: Dense intensity",
    61: "Rain: Slight", 63: "Rain: Moderate", 65: "Rain: Heavy intensity",
    80: "Rain showers: Slight", 81: "Rain showers: Moderate", 82: "Rain showers: Violent"
};

// --- ROUTES ---

// Get Provinces with Cities
app.get("/api/provinces", (req, res) => {
    const data = PROVINCES.map(p => ({
        ...p,
        cities: CITY_PLACES[p.key] || []
    }));
    res.json(data);
});

// Calculate Journey and Weather
app.post("/api/journey", async (req, res) => {
    try {
        const { origin, destination } = req.body;
        const oCity = CITY_PLACES[origin.province].find(c => c.key === origin.city);
        const dCity = CITY_PLACES[destination.province].find(c => c.key === destination.city);

        if (!oCity || !dCity) return res.status(400).json({ error: "Invalid locations" });

        const waypoints = [oCity, dCity];
        const results = [];

        for (const wp of waypoints) {
            const wRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${wp.lat}&longitude=${wp.lon}&current_weather=true`);
            const wData = await wRes.json();
            results.push({
                city: wp.name,
                lat: wp.lat,
                lon: wp.lon,
                temp: wData.current_weather.temperature,
                description: WMO_CODES[wData.current_weather.weathercode] || "Unknown"
            });
        }

        // Mock distance calculation
        const total_km = (Math.sqrt(Math.pow(dCity.lat - oCity.lat, 2) + Math.pow(dCity.lon - oCity.lon, 2)) * 111).toFixed(1);

        res.json({ total_km, waypoints: results });
    } catch (error) {
        res.status(500).json({ error: "Server error fetching weather" });
    }
});

// PORT SETTINGS
const PORT = process.env.PORT || 3001;
app.listen(PORT, "0.0.0.0", () => { 
    console.log("Server running on port " + PORT); 
});