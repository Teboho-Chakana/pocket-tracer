const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// ✅ Serve static files from root
app.use(express.static(__dirname));

// --- SAMPLE DATA ---
const provinces = [
  {
    key: "gauteng",
    name: "Gauteng",
    cities: [
      { key: "pretoria", name: "Pretoria" },
      { key: "johannesburg", name: "Johannesburg" }
    ]
  },
  {
    key: "kzn",
    name: "KwaZulu-Natal",
    cities: [
      { key: "durban", name: "Durban" }
    ]
  }
];

// --- API ROUTES ---
app.get("/api/provinces", (req, res) => {
  res.json(provinces);
});

app.post("/api/journey", (req, res) => {
  const { origin, destination } = req.body;

  const waypoints = [
    { city: origin.city, lat: -25.746, lon: 28.188, temp: 25, description: "Sunny" },
    { city: destination.city, lat: -26.204, lon: 28.047, temp: 22, description: "Cloudy" }
  ];

  res.json({
    total_km: 60,
    waypoints
  });
});

// ✅ Always return index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});