const express = require("express");
const cors    = require("cors");
const fetch   = require("node-fetch");

const app = express();
app.use(cors());
app.use(express.json());

const CITY_DATA = {
    "GP": [
        { name: "Johannesburg", lat: -26.2041, lon: 28.0473 },
        { name: "Pretoria", lat: -25.7479, lon: 28.2293 },
        { name: "Soweto", lat: -26.2485, lon: 27.8540 },
        { name: "Centurion", lat: -25.8640, lon: 28.1858 },
        { name: "Midrand", lat: -25.9895, lon: 28.1284 },
        { name: "Kempton Park", lat: -26.1114, lon: 28.2423 },
        { name: "Vanderbijlpark", lat: -26.6976, lon: 27.8315 },
        { name: "Benoni", lat: -26.1886, lon: 28.3183 }
    ],
    "WC": [
        { name: "Cape Town", lat: -33.9249, lon: 18.4241 },
        { name: "Stellenbosch", lat: -33.9321, lon: 18.8602 },
        { name: "George", lat: -33.9667, lon: 22.4500 },
        { name: "Paarl", lat: -33.7225, lon: 18.9558 },
        { name: "Mossel Bay", lat: -34.1833, lon: 22.1500 },
        { name: "Knysna", lat: -34.0351, lon: 23.0465 },
        { name: "Worcester", lat: -33.6449, lon: 19.4452 },
        { name: "Oudtshoorn", lat: -33.5907, lon: 22.2014 }
    ],
    "KZN": [
        { name: "Durban", lat: -29.8587, lon: 31.0218 },
        { name: "Pietermaritzburg", lat: -29.6006, lon: 30.3794 },
        { name: "Newcastle", lat: -27.7527, lon: 29.9364 },
        { name: "Richards Bay", lat: -28.7807, lon: 32.0383 },
        { name: "Ballito", lat: -29.5381, lon: 31.2131 },
        { name: "Ladysmith", lat: -28.5529, lon: 29.7788 },
        { name: "Port Shepstone", lat: -30.7411, lon: 30.4549 },
        { name: "Amanzimtoti", lat: -30.0519, lon: 30.8814 }
    ],
    "EC": [
        { name: "Gqeberha (PE)", lat: -33.9608, lon: 25.6022 },
        { name: "East London", lat: -33.0153, lon: 27.9116 },
        { name: "Mthatha", lat: -31.5889, lon: 28.7844 },
        { name: "Makhanda", lat: -33.3131, lon: 26.5201 },
        { name: "Bhisho", lat: -32.8465, lon: 27.4398 },
        { name: "Queenstown", lat: -31.8976, lon: 26.8910 },
        { name: "Jeffreys Bay", lat: -34.0514, lon: 24.9158 },
        { name: "Port St. Johns", lat: -31.6229, lon: 29.5369 }
    ],
    "FS": [
        { name: "Bloemfontein", lat: -29.1181, lon: 26.2227 },
        { name: "Welkom", lat: -27.9830, lon: 26.7209 },
        { name: "Sasolburg", lat: -26.8167, lon: 27.8333 },
        { name: "Kroonstad", lat: -27.6476, lon: 27.2349 },
        { name: "Bethlehem", lat: -28.2323, lon: 28.3074 },
        { name: "Parys", lat: -26.9014, lon: 27.4589 },
        { name: "Harrismith", lat: -28.2721, lon: 29.1293 },
        { name: "Ficksburg", lat: -28.8714, lon: 27.8764 }
    ],
    "LP": [
        { name: "Polokwane", lat: -23.9045, lon: 29.4689 },
        { name: "Tzaneen", lat: -23.8332, lon: 30.1635 },
        { name: "Thohoyandou", lat: -22.9535, lon: 30.4715 },
        { name: "Mokopane", lat: -24.1834, lon: 29.0069 },
        { name: "Phalaborwa", lat: -23.9430, lon: 31.1408 },
        { name: "Bela-Bela", lat: -24.8847, lon: 28.2917 },
        { name: "Musina", lat: -22.3386, lon: 30.0347 },
        { name: "Louis Trichardt", lat: -23.0462, lon: 29.9048 }
    ],
    "MP": [
        { name: "Mbombela", lat: -25.4753, lon: 30.9694 },
        { name: "Witbank", lat: -25.8728, lon: 29.2321 },
        { name: "Secunda", lat: -26.5144, lon: 29.1833 },
        { name: "Middelburg", lat: -25.7725, lon: 29.4608 },
        { name: "Ermelo", lat: -26.5171, lon: 29.9868 },
        { name: "Standerton", lat: -26.9472, lon: 29.2415 },
        { name: "Lydenburg", lat: -25.0964, lon: 30.4447 },
        { name: "Hazyview", lat: -25.0483, lon: 31.1244 }
    ],
    "NW": [
        { name: "Mahikeng", lat: -25.8560, lon: 25.6403 },
        { name: "Potchefstroom", lat: -26.7145, lon: 27.0970 },
        { name: "Rustenburg", lat: -25.6544, lon: 27.2459 },
        { name: "Klerksdorp", lat: -26.8641, lon: 26.6639 },
        { name: "Brits", lat: -25.6322, lon: 27.7802 },
        { name: "Vryburg", lat: -26.9566, lon: 24.7285 },
        { name: "Lichtenburg", lat: -26.1520, lon: 26.1597 },
        { name: "Zeerust", lat: -25.5392, lon: 26.0754 }
    ],
    "NC": [
        { name: "Kimberley", lat: -28.7282, lon: 24.7499 },
        { name: "Upington", lat: -28.4478, lon: 21.2561 },
        { name: "Kuruman", lat: -27.4524, lon: 23.4325 },
        { name: "Springbok", lat: -29.6643, lon: 17.8865 },
        { name: "De Aar", lat: -30.6497, lon: 24.0123 },
        { name: "Kathu", lat: -27.6955, lon: 23.0537 },
        { name: "Colesberg", lat: -30.7214, lon: 25.0975 },
        { name: "Calvinia", lat: -31.4722, lon: 19.7758 }
    ]
};

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

app.get("/api/provinces", (req, res) => {
    res.json(PROVINCES.map(p => ({ ...p, cities: CITY_DATA[p.key] || [] })));
});

app.post("/api/journey", async (req, res) => {
    try {
        const { origin, destination } = req.body;
        const oCity = CITY_DATA[origin.province]?.find(c => c.name === origin.city);
        const dCity = CITY_DATA[destination.province]?.find(c => c.name === destination.city);

        if (!oCity || !dCity) return res.status(400).json({ error: "Location unknown" });

        const weatherResults = [];
        for (const city of [oCity, dCity]) {
            const wRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current_weather=true`);
            const wData = await wRes.json();
            weatherResults.push({
                name: city.name,
                temp: wData.current_weather.temperature,
                lat: city.lat,
                lon: city.lon
            });
        }

        const total_km = (Math.sqrt(Math.pow(dCity.lat - oCity.lat, 2) + Math.pow(dCity.lon - oCity.lon, 2)) * 111).toFixed(1);
        res.json({ total_km, waypoints: weatherResults });
    } catch (e) {
        res.status(500).json({ error: "Server error" });
    }
});

app.listen(3005, () => console.log("Server listening on port 3005"));