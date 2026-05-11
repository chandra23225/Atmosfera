# 🌐 Atmosfera — Interactive Weather Globe

A real-time weather app built around an interactive 3D Earth. Search any city in the world and watch the globe animate to that location, displaying live weather conditions and a 5-day forecast.

**[🚀 Live Demo](https://chandra23225.github.io/Atmosfera/)**

---

## ✨ Features

- **3D Interactive Globe** — drag to rotate, powered by Three.js
- **Fly-to Animation** — smooth camera-style rotation to any searched city
- **Real-time Weather** — current temperature, feels like, humidity, wind speed, UV index, and rain chance
- **5-Day Forecast** — daily high/low with weather icons
- **Zero API Keys** — uses Open-Meteo (weather) and Nominatim/OpenStreetMap (geocoding), both free and open
- **Responsive** — works on desktop and mobile

---

## 🛠️ Tech Stack

| Layer      | Technology |
|------------|------------|
| 3D Rendering | [Three.js r128](https://threejs.org/) |
| Weather Data | [Open-Meteo API](https://open-meteo.com/) |
| Geocoding  | [Nominatim (OpenStreetMap)](https://nominatim.org/) |
| Frontend   | Vanilla HTML, CSS, JavaScript (no frameworks) |
| Hosting    | GitHub Pages |

---

## 📁 Project Structure

```
Atmosfera/
├── index.html        # App shell and markup
├── css/
│   └── style.css     # All styles
├── js/
│   └── app.js        # Globe setup, API calls, UI logic
└── README.md
```

---

## 🚀 Running Locally

No build step or dependencies to install — just open the file:

```bash
git clone https://github.com/chandra23225/Atmosfera.git
cd Atmosfera
# Open index.html in your browser
```

Or serve it with any static file server:

```bash
npx serve .
```

---

## 🌍 How It Works

1. User types a city name and hits search
2. The app geocodes the city using Nominatim to get lat/lon coordinates
3. Coordinates are sent to Open-Meteo to fetch current weather + forecast
4. The globe animates (fly-to) to rotate the searched location to face the camera
5. A location pin is placed on the globe surface
6. The weather panel slides up with all data

---

## 📸 Preview

> Search a city → globe flies to it → weather panel appears

---

## 📄 License

MIT — free to use and modify.
