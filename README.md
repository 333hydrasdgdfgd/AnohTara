# AnohTara?

A food-finder app. Pick filters (establishment type, food category, distance) or hit randomize and let it decide where you're eating.

## Files

- `index.html` — page structure/markup
- `styles.css` — all styling
- `script.js` — filtering, randomize, geolocation, and JSON loading logic
- `data.json` — the place list the app reads on load

No build step, no dependencies to install.

## Run it locally

`script.js` loads `data.json` with `fetch()`, which most browsers block when a page is opened directly as a `file://` path. So instead of double-clicking `index.html`, serve the folder with a tiny local server:

```bash
# Python (built into most systems)
python3 -m http.server 8000
```

Then open `http://localhost:8000` in your browser. This restriction goes away once it's hosted on GitHub Pages or any real web server.

## Use your own data

Edit `data.json` directly, following this shape:

```json
[
  {
    "name": "Sample Cafe Dumaguete",
    "address": "Rizal Boulevard",
    "coordinates": { "lat": 9.3068, "lng": 123.3054 },
    "establishment_type": "cafe",
    "food_categories": ["pastry", "coffee", "breakfast"]
  }
]
```

Or, without editing anything, use the **"Use my own JSON list instead"** button inside the app to upload a `.json` file for that session only (this doesn't touch `data.json` on disk).

## Deploy for free with GitHub Pages

1. Create a new repo on GitHub (e.g. `anohtara`) — don't initialize it with a README, this folder already has one.
2. Push this folder:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/anohtara.git
   git push -u origin main
   ```
3. On GitHub, go to **Settings → Pages**.
4. Under "Build and deployment", set **Source** to `Deploy from a branch`, branch `main`, folder `/ (root)`.
5. Save. GitHub will give you a live URL, usually:
   ```
   https://YOUR-USERNAME.github.io/anohtara/
   ```
   It can take a minute or two to go live.

That's it — no server, no backend, just a static page.
