const express = require("express");
const cors    = require("cors");
const fetch   = require("node-fetch");
const path    = require("path");

const app = express();
app.use(cors());
app.use(express.json());

const PROVINCES = {
  "gauteng": {
    name: "Gauteng",
    cities: {
      "johannesburg": { lat: -26.2041, lon: 28.0473, name: "Johannesburg" },
      "pretoria":     { lat: -25.7479, lon: 28.2293, name: "Pretoria"     },
      "soweto":       { lat: -26.2677, lon: 27.8585, name: "Soweto"       },
      "sandton":      { lat: -26.1076, lon: 28.0567, name: "Sandton"      },
      "boksburg":     { lat: -26.2144, lon: 28.2617, name: "Boksburg"     },
    }
  },
  "western cape": {
    name: "Western Cape",
    cities: {
      "cape town":    { lat: -33.9249, lon: 18.4241, name: "Cape Town"    },
      "stellenbosch": { lat: -33.9321, lon: 18.8602, name: "Stellenbosch" },
      "george":       { lat: -33.9646, lon: 22.4617, name: "George"       },
      "paarl":        { lat: -33.7342, lon: 18.9629, name: "Paarl"        },
      "worcester":    { lat: -33.6457, lon: 19.4480, name: "Worcester"    },
    }
  },
  "kwazulu-natal": {
    name: "KwaZulu-Natal",
    cities: {
      "durban":               { lat: -29.8587, lon: 31.0218, name: "Durban"               },
      "pietermaritzburg":     { lat: -29.6006, lon: 30.3794, name: "Pietermaritzburg"     },
      "richards bay":         { lat: -28.7833, lon: 32.0833, name: "Richards Bay"         },
      "newcastle":            { lat: -27.7559, lon: 29.9317, name: "Newcastle"            },
      "ladysmith":            { lat: -28.5667, lon: 29.7833, name: "Ladysmith"            },
    }
  },
  "eastern cape": {
    name: "Eastern Cape",
    cities: {
      "port elizabeth": { lat: -33.9608, lon: 25.6022, name: "Port Elizabeth" },
      "east london":    { lat: -32.9732, lon: 27.8930, name: "East London"    },
      "mthatha":        { lat: -31.5894, lon: 28.7847, name: "Mthatha"        },
      "grahamstown":    { lat: -33.3042, lon: 26.5328, name: "Grahamstown"    },
      "queenstown":     { lat: -31.8991, lon: 26.8782, name: "Queenstown"     },
    }
  },
  "limpopo": {
    name: "Limpopo",
    cities: {
      "polokwane":       { lat: -23.9045, lon: 29.4689, name: "Polokwane"       },
      "tzaneen":         { lat: -23.8333, lon: 30.1667, name: "Tzaneen"         },
      "louis trichardt": { lat: -23.0436, lon: 29.9044, name: "Louis Trichardt" },
      "phalaborwa":      { lat: -23.9333, lon: 31.1333, name: "Phalaborwa"      },
      "thohoyandou":     { lat: -22.9500, lon: 30.4833, name: "Thohoyandou"     },
    }
  },
  "mpumalanga": {
    name: "Mpumalanga",
    cities: {
      "mbombela":   { lat: -25.4753, lon: 30.9694, name: "Mbombela"   },
      "witbank":    { lat: -25.8744, lon: 29.2381, name: "Witbank"    },
      "secunda":    { lat: -26.5167, lon: 29.2000, name: "Secunda"    },
      "middelburg": { lat: -25.7742, lon: 29.4644, name: "Middelburg" },
      "standerton": { lat: -26.9500, lon: 29.2333, name: "Standerton" },
    }
  },
  "free state": {
    name: "Free State",
    cities: {
      "bloemfontein": { lat: -29.0852, lon: 26.1596, name: "Bloemfontein" },
      "welkom":       { lat: -27.9833, lon: 26.7333, name: "Welkom"       },
      "kroonstad":    { lat: -27.6500, lon: 27.2333, name: "Kroonstad"    },
      "bethlehem":    { lat: -28.2333, lon: 28.3000, name: "Bethlehem"    },
      "sasolburg":    { lat: -26.8167, lon: 27.8167, name: "Sasolburg"    },
    }
  },
  "north west": {
    name: "North West",
    cities: {
      "mahikeng":      { lat: -25.8653, lon: 25.6432, name: "Mahikeng"      },
      "rustenburg":    { lat: -25.6667, lon: 27.2333, name: "Rustenburg"    },
      "klerksdorp":    { lat: -26.8667, lon: 26.6667, name: "Klerksdorp"    },
      "potchefstroom": { lat: -26.7167, lon: 27.1000, name: "Potchefstroom" },
      "brits":         { lat: -25.6333, lon: 27.7833, name: "Brits"         },
    }
  },
  "northern cape": {
    name: "Northern Cape",
    cities: {
      "kimberley":  { lat: -28.7282, lon: 24.7499, name: "Kimberley"  },
      "upington":   { lat: -28.4478, lon: 21.2561, name: "Upington"   },
      "springbok":  { lat: -29.6644, lon: 17.8865, name: "Springbok"  },
      "de aar":     { lat: -30.6500, lon: 24.0167, name: "De Aar"     },
      "kuruman":    { lat: -27.4500, lon: 23.4333, name: "Kuruman"    },
    }
  },
};

const CITY_PLACES = {
  "johannesburg": [
    { name: "Sandton City Mall", type: "mall" },
    { name: "Mall of Africa", type: "mall" },
    { name: "Eastgate Shopping Centre", type: "mall" },
    { name: "Rosebank Mall", type: "mall" },
    { name: "Constitutional Hill", type: "landmark" },
    { name: "Apartheid Museum", type: "landmark" },
    { name: "Gold Reef City", type: "landmark" },
    { name: "Charlotte Maxeke Hospital", type: "hospital" },
    { name: "Milpark Hospital", type: "hospital" },
    { name: "University of Johannesburg", type: "university" },
    { name: "Wits University", type: "university" },
  ],
  "pretoria": [
    { name: "Menlyn Park Shopping Centre", type: "mall" },
    { name: "Brooklyn Mall", type: "mall" },
    { name: "Hatfield Plaza", type: "mall" },
    { name: "Union Buildings", type: "landmark" },
    { name: "Voortrekker Monument", type: "landmark" },
    { name: "Pretoria Zoo", type: "landmark" },
    { name: "Steve Biko Academic Hospital", type: "hospital" },
    { name: "Kalafong Hospital", type: "hospital" },
    { name: "University of Pretoria", type: "university" },
    { name: "Tshwane University of Technology", type: "university" },
  ],
  "soweto": [
    { name: "Maponya Mall", type: "mall" },
    { name: "Jabulani Mall", type: "mall" },
    { name: "Hector Pieterson Museum", type: "landmark" },
    { name: "Vilakazi Street", type: "landmark" },
    { name: "Chris Hani Baragwanath Hospital", type: "hospital" },
    { name: "University of Johannesburg Soweto", type: "university" },
  ],
  "sandton": [
    { name: "Sandton City Mall", type: "mall" },
    { name: "Nelson Mandela Square", type: "landmark" },
    { name: "Sandton Convention Centre", type: "landmark" },
    { name: "Netcare Sandton Hospital", type: "hospital" },
  ],
  "boksburg": [
    { name: "East Rand Mall", type: "mall" },
    { name: "Boksburg Lake", type: "landmark" },
    { name: "Far East Rand Hospital", type: "hospital" },
  ],
  "cape town": [
    { name: "V&A Waterfront", type: "mall" },
    { name: "Canal Walk Shopping Centre", type: "mall" },
    { name: "Cavendish Square", type: "mall" },
    { name: "Table Mountain", type: "landmark" },
    { name: "Robben Island", type: "landmark" },
    { name: "Cape Point", type: "landmark" },
    { name: "Groote Schuur Hospital", type: "hospital" },
    { name: "Tygerberg Hospital", type: "hospital" },
    { name: "University of Cape Town", type: "university" },
    { name: "Cape Peninsula University of Technology", type: "university" },
  ],
  "stellenbosch": [
    { name: "Eikestad Mall", type: "mall" },
    { name: "Stellenbosch Wine Route", type: "landmark" },
    { name: "Village Museum", type: "landmark" },
    { name: "Stellenbosch Hospital", type: "hospital" },
    { name: "Stellenbosch University", type: "university" },
  ],
  "george": [
    { name: "Garden Route Mall", type: "mall" },
    { name: "Outeniqua Pass", type: "landmark" },
    { name: "George Hospital", type: "hospital" },
    { name: "Nelson Mandela University George", type: "university" },
  ],
  "paarl": [
    { name: "Paarl Mall", type: "mall" },
    { name: "Paarl Mountain Nature Reserve", type: "landmark" },
    { name: "Paarl Hospital", type: "hospital" },
  ],
  "worcester": [
    { name: "Hexvallei Shopping Centre", type: "mall" },
    { name: "Karoo Desert National Botanical Garden", type: "landmark" },
    { name: "Worcester Hospital", type: "hospital" },
  ],
  "durban": [
    { name: "Gateway Theatre of Shopping", type: "mall" },
    { name: "Pavilion Shopping Centre", type: "mall" },
    { name: "Durban Point Waterfront", type: "mall" },
    { name: "uShaka Marine World", type: "landmark" },
    { name: "Moses Mabhida Stadium", type: "landmark" },
    { name: "Golden Mile Beach", type: "landmark" },
    { name: "Inkosi Albert Luthuli Hospital", type: "hospital" },
    { name: "Addington Hospital", type: "hospital" },
    { name: "University of KwaZulu-Natal", type: "university" },
    { name: "Durban University of Technology", type: "university" },
  ],
  "pietermaritzburg": [
    { name: "Liberty Midlands Mall", type: "mall" },
    { name: "Msunduzi Museum", type: "landmark" },
    { name: "Howick Falls", type: "landmark" },
    { name: "Greys Hospital", type: "hospital" },
    { name: "University of KwaZulu-Natal PMB", type: "university" },
  ],
  "richards bay": [
    { name: "Boardwalk Mall", type: "mall" },
    { name: "Richards Bay Nature Reserve", type: "landmark" },
    { name: "Ngwelezane Hospital", type: "hospital" },
  ],
  "newcastle": [
    { name: "Newcastle Mall", type: "mall" },
    { name: "Fort Amiel Museum", type: "landmark" },
    { name: "Newcastle Provincial Hospital", type: "hospital" },
  ],
  "ladysmith": [
    { name: "Oval Shopping Centre", type: "mall" },
    { name: "Siege Museum", type: "landmark" },
    { name: "Ladysmith Provincial Hospital", type: "hospital" },
  ],
  "port elizabeth": [
    { name: "Baywest City Mall", type: "mall" },
    { name: "Greenacres Shopping Centre", type: "mall" },
    { name: "Addo Elephant Park", type: "landmark" },
    { name: "Donkin Reserve", type: "landmark" },
    { name: "Dora Nginza Hospital", type: "hospital" },
    { name: "Nelson Mandela University", type: "university" },
  ],
  "east london": [
    { name: "Hemingways Mall", type: "mall" },
    { name: "Vincent Park Centre", type: "mall" },
    { name: "East London Museum", type: "landmark" },
    { name: "Nahoon Beach", type: "landmark" },
    { name: "Frere Hospital", type: "hospital" },
    { name: "Walter Sisulu University", type: "university" },
  ],
  "mthatha": [
    { name: "Mthatha Mall", type: "mall" },
    { name: "Nelson Mandela Museum", type: "landmark" },
    { name: "Nelson Mandela Academic Hospital", type: "hospital" },
    { name: "Walter Sisulu University Mthatha", type: "university" },
  ],
  "grahamstown": [
    { name: "Pepper Grove Mall", type: "mall" },
    { name: "1820 Settlers Monument", type: "landmark" },
    { name: "Settlers Hospital", type: "hospital" },
    { name: "Rhodes University", type: "university" },
  ],
  "queenstown": [
    { name: "Steelpoort Mall", type: "mall" },
    { name: "Queenstown Museum", type: "landmark" },
    { name: "Frontier Hospital", type: "hospital" },
  ],
  "polokwane": [
    { name: "Mall of the North", type: "mall" },
    { name: "Savannah Mall", type: "mall" },
    { name: "Polokwane Game Reserve", type: "landmark" },
    { name: "Polokwane Hospital", type: "hospital" },
    { name: "University of Limpopo", type: "university" },
  ],
  "tzaneen": [
    { name: "Tzaneen Mall", type: "mall" },
    { name: "Debegeni Falls", type: "landmark" },
    { name: "Tzaneen Hospital", type: "hospital" },
  ],
  "louis trichardt": [
    { name: "Soutpansberg Mall", type: "mall" },
    { name: "Soutpansberg Mountains", type: "landmark" },
    { name: "Louis Trichardt Hospital", type: "hospital" },
  ],
  "phalaborwa": [
    { name: "Phalaborwa Mall", type: "mall" },
    { name: "Kruger National Park Gate", type: "landmark" },
    { name: "Phalaborwa Hospital", type: "hospital" },
  ],
  "thohoyandou": [
    { name: "Thohoyandou Mall", type: "mall" },
    { name: "Venda Art Museum", type: "landmark" },
    { name: "Donald Fraser Hospital", type: "hospital" },
    { name: "University of Venda", type: "university" },
  ],
  "mbombela": [
    { name: "Crossing Shopping Centre", type: "mall" },
    { name: "Mbombela Stadium", type: "landmark" },
    { name: "Sudwala Caves", type: "landmark" },
    { name: "Rob Ferreira Hospital", type: "hospital" },
    { name: "University of Mpumalanga", type: "university" },
  ],
  "witbank": [
    { name: "Highveld Mall", type: "mall" },
    { name: "eMalahleni Lake", type: "landmark" },
    { name: "Witbank Hospital", type: "hospital" },
  ],
  "secunda": [
    { name: "Secunda Mall", type: "mall" },
    { name: "Sasol Complex", type: "landmark" },
    { name: "Evander Hospital", type: "hospital" },
  ],
  "middelburg": [
    { name: "Middelburg Mall", type: "mall" },
    { name: "Steve Tshwete Nature Reserve", type: "landmark" },
    { name: "Middelburg Hospital", type: "hospital" },
  ],
  "standerton": [
    { name: "Standerton Mall", type: "mall" },
    { name: "Vaal River", type: "landmark" },
    { name: "Standerton Hospital", type: "hospital" },
  ],
  "bloemfontein": [
    { name: "Mimosa Mall", type: "mall" },
    { name: "Cavendish Waterfront", type: "mall" },
    { name: "Naval Hill Planetarium", type: "landmark" },
    { name: "Anglo-Boer War Museum", type: "landmark" },
    { name: "Pelonomi Hospital", type: "hospital" },
    { name: "University of the Free State", type: "university" },
    { name: "Central University of Technology", type: "university" },
  ],
  "welkom": [
    { name: "Goldfields Mall", type: "mall" },
    { name: "Welkom Airfield", type: "landmark" },
    { name: "Bongani Hospital", type: "hospital" },
  ],
  "kroonstad": [
    { name: "Kroonstad Mall", type: "mall" },
    { name: "Vals River", type: "landmark" },
    { name: "Kroonstad Hospital", type: "hospital" },
  ],
  "bethlehem": [
    { name: "Bethlehem Plaza", type: "mall" },
    { name: "Loch Athlone", type: "landmark" },
    { name: "Bethlehem Hospital", type: "hospital" },
  ],
  "sasolburg": [
    { name: "Sasolburg Mall", type: "mall" },
    { name: "Vaal Dam", type: "landmark" },
    { name: "Sasolburg Hospital", type: "hospital" },
  ],
  "mahikeng": [
    { name: "Mega City Shopping Centre", type: "mall" },
    { name: "Mmabatho Stadium", type: "landmark" },
    { name: "Mahikeng Provincial Hospital", type: "hospital" },
    { name: "North West University Mahikeng", type: "university" },
  ],
  "rustenburg": [
    { name: "Waterfall Mall", type: "mall" },
    { name: "Rustenburg Nature Reserve", type: "landmark" },
    { name: "Rustenburg Provincial Hospital", type: "hospital" },
    { name: "North West University Rustenburg", type: "university" },
  ],
  "klerksdorp": [
    { name: "City Mall Klerksdorp", type: "mall" },
    { name: "Faan Meintjes Nature Reserve", type: "landmark" },
    { name: "Klerksdorp Hospital", type: "hospital" },
  ],
  "potchefstroom": [
    { name: "Potchefstroom Mall", type: "mall" },
    { name: "Mooi River", type: "landmark" },
    { name: "Potchefstroom Hospital", type: "hospital" },
    { name: "North West University Potchefstroom", type: "university" },
  ],
  "brits": [
    { name: "Brits Mall", type: "mall" },
    { name: "Hartbeespoort Dam", type: "landmark" },
    { name: "Brits Hospital", type: "hospital" },
  ],
  "kimberley": [
    { name: "Diamond Pavilion Mall", type: "mall" },
    { name: "The Big Hole", type: "landmark" },
    { name: "Kimberley Mine Museum", type: "landmark" },
    { name: "Robert Mangaliso Sobukwe Hospital", type: "hospital" },
    { name: "Sol Plaatje University", type: "university" },
  ],
  "upington": [
    { name: "Upington Plaza", type: "mall" },
    { name: "Augrabies Falls", type: "landmark" },
    { name: "Upington Hospital", type: "hospital" },
  ],
  "springbok": [
    { name: "Springbok Plaza", type: "mall" },
    { name: "Namaqualand Flower Route", type: "landmark" },
    { name: "Springbok Hospital", type: "hospital" },
  ],
  "de aar": [
    { name: "De Aar Shopping Centre", type: "mall" },
    { name: "De Aar Railway Junction", type: "landmark" },
    { name: "De Aar Hospital", type: "hospital" },
  ],
  "kuruman": [
    { name: "Kuruman Mall", type: "mall" },
    { name: "Eye of Kuruman", type: "landmark" },
    { name: "Kuruman Hospital", type: "hospital" },
  ],
};

const WMO_CODES = {
  0: "Clear sky", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
  45: "Fog", 48: "Icy fog",
  51: "Light drizzle", 53: "Drizzle", 55: "Heavy drizzle",
  61: "Light rain", 63: "Rain", 65: "Heavy rain",
  71: "Light snow", 73: "Snow", 75: "Heavy snow",
  80: "Rain showers", 81: "Heavy showers", 82: "Violent showers",
  95: "Thunderstorm", 96: "Thunderstorm with hail", 99: "Heavy thunderstorm",
};

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 1.3;
}

async function fetchWeather(provinceName, cityName, placeName) {
  const provKey  = provinceName.trim().toLowerCase();
  const cityKey  = cityName.trim().toLowerCase();
  const province = PROVINCES[provKey];
  if (!province) throw new Error("Province not found: " + provinceName);
  const city = province.cities[cityKey];
  if (!city) throw new Error("City not found: " + cityName);

  const url = "https://api.open-meteo.com/v1/forecast?latitude=" + city.lat +
    "&longitude=" + city.lon +
    "&current_weather=true&hourly=relativehumidity_2m,apparent_temperature,windspeed_10m";
  const res  = await fetch(url);
  if (!res.ok) throw new Error("Weather service unavailable.");
  const data    = await res.json();
  const current = data.current_weather;

  return {
    place:       placeName || city.name,
    city:        city.name,
    province:    province.name,
    country:     "ZA",
    lat:         city.lat,
    lon:         city.lon,
    temp:        Math.round(current.temperature),
    feels_like:  Math.round(data.hourly.apparent_temperature[0]),
    humidity:    data.hourly.relativehumidity_2m[0],
    wind_kph:    Math.round(current.windspeed),
    description: WMO_CODES[current.weathercode] || "Unknown",
  };
}

app.get("/api/provinces", function(req, res) {
  const list = Object.keys(PROVINCES).map(function(pk) {
    const prov = PROVINCES[pk];
    return {
      key:  pk,
      name: prov.name,
      cities: Object.keys(prov.cities).map(function(ck) {
        return {
          key:    ck,
          name:   prov.cities[ck].name,
          places: CITY_PLACES[ck] || [],
        };
      }),
    };
  });
  res.json(list);
});

app.post("/api/weather", async function(req, res) {
  try {
    const province = req.body.province;
    const city     = req.body.city;
    const place    = req.body.place || "";
    if (!province || !city) return res.status(400).json({ error: "Province and city are required" });
    const weather = await fetchWeather(province, city, place);
    res.json(weather);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

app.post("/api/journey", async function(req, res) {
  try {
    const origin      = req.body.origin;
    const destination = req.body.destination;
    const stops       = req.body.stops || [];
    if (!origin || !destination) {
      return res.status(400).json({ error: "Origin and destination are required" });
    }
    const allPlaces = [origin].concat(stops).concat([destination]);
    const results = await Promise.all(
      allPlaces.map(function(p) { return fetchWeather(p.province, p.city, p.place); })
    );
    const segments = [];
    let totalKm = 0;
    for (let i = 0; i < results.length - 1; i++) {
      const km = Math.round(haversineKm(results[i].lat, results[i].lon, results[i+1].lat, results[i+1].lon));
      const driveHours = (km / 100).toFixed(1);
      totalKm += km;
      segments.push({ from: results[i].place + ", " + results[i].city, to: results[i+1].place + ", " + results[i+1].city, distance_km: km, drive_hours: driveHours });
    }
    res.json({ waypoints: results, segments: segments, total_km: Math.round(totalKm), total_hours: (totalKm / 100).toFixed(1) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.use(express.static(path.join(__dirname, "public")));

const PORT = process.env.PORT || 3001;
app.listen(PORT, function() { console.log("Server running on http://localhost:" + PORT); });