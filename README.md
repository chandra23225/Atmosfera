# Atmosfera

Atmosfera is an interactive weather globe built with Three.js, Open-Meteo, and OpenStreetMap geocoding. Search for any city and the 3D Earth rotates to that location while showing live weather conditions and a five-day forecast.

[Live demo](https://chandra23225.github.io/Atmosfera/)

## Highlights

- Interactive 3D Earth with drag-to-rotate controls
- Smooth fly-to animation when a city is searched
- Current weather, feels-like temperature, humidity, wind, UV index, and rain chance
- Five-day forecast with daily high/low temperatures
- Location pin on the globe surface
- No API keys required
- Fully static frontend that can run on GitHub Pages

## Data Sources

- [Open-Meteo](https://open-meteo.com/): weather and forecast data
- [Nominatim / OpenStreetMap](https://nominatim.org/): city geocoding

## Tech Stack

- HTML
- CSS
- JavaScript
- Three.js
- GitHub Pages

## Project Structure

```text
Atmosfera/
|-- index.html
|-- css/
|   `-- style.css
|-- js/
|   `-- app.js
|-- wea/
|   `-- index.html
`-- README.md
```

## Run Locally

Clone the repository:

```bash
git clone https://github.com/chandra23225/Atmosfera.git
cd Atmosfera
```

Serve it with any static file server:

```bash
npx serve .
```

Or use Python:

```bash
python -m http.server 8080
```

Then open:

```text
http://localhost:8080
```

You can also open `index.html` directly, but using a local server is more reliable for browser APIs and external assets.

## Deployment

Atmosfera is a static site and is suitable for:

- GitHub Pages
- Netlify
- Vercel
- Cloudflare Pages

The current live version is hosted on GitHub Pages.

## Notes

Open-Meteo does not require an API key. Nominatim is a public geocoding service, so heavy production usage should follow OpenStreetMap's usage policy or move to a dedicated geocoding provider.

## License

MIT
