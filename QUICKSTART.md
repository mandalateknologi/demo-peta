# Quickstart — Peta Bencana Mandala

Get the app running locally in under 5 minutes.

---

## Prerequisites

- [Node.js](https://nodejs.org/) LTS (v20 or later recommended)
- npm (bundled with Node.js)

---

## 1. Clone and Install

```bash
git clone https://github.com/your-org/demo-peta.git
cd demo-peta
npm install
```

## 2. Start the Dev Server

```bash
npm run dev
```

Open **http://localhost:5173** in your browser.

> No API keys or environment variables are required. All map tiles and data sources are either self-served from `public/data/` or fetched from free public endpoints.

---

## What You'll See

![Peta Bencana Mandala — main view](public/screen/main.png)

The interface has three main areas:

| Area             | Location      | Purpose                        |
| ---------------- | ------------- | ------------------------------ |
| **Toolbar**      | Top bar       | App title, theme toggle        |
| **Sidebar**      | Left panel    | Layer toggles and point counts |
| **Map**          | Centre        | Interactive MapLibre GL map    |
| **Time Filter**  | Below toolbar | Time range selector            |
| **Running Text** | Bottom bar    | Scrolling news ticker          |

---

## Using the Map

### Toggle Data Layers

Click any layer name in the left sidebar to show or hide it. The badge next to each name shows the current visible point count (after time filtering).

### Filter by Time

Use the time range buttons below the toolbar to filter all dated layers:

| Button | Window                      |
| ------ | --------------------------- |
| 1h     | Last 1 hour                 |
| 6h     | Last 6 hours                |
| 24h    | Last 24 hours               |
| 48h    | Last 48 hours               |
| 7d     | Last 7 days                 |
| ALL    | All data regardless of date |

Layers without date information (e.g., Gamma Irradiators) always show all data regardless of the selected filter.

### Switch Theme

Click the sun/moon icon in the top-right of the toolbar to toggle between dark and light basemaps. Your preference is saved and restored on next visit.

### Explore a Province

Click anywhere on a province boundary (or an empty area of the map within a province) to open the **Province Info Panel** on the right side. It shows:

- Province name, capital, governor
- Population and area
- Island group classification
- Count of each hazard type recorded within the province

![Province info panel](public/screen/province_view.png)

Click the × button to close the panel.

### Click a Marker

Click any circle or GIF marker to open a popup with details from the source data (location, date, magnitude, alert level, etc.).

![Marker popup open with sidebar showing layer selection](public/screen/selected.png)

---

## Adding a Custom Hazard Point

1. Click the **Add Data** button in the toolbar.
2. Fill in the category, title, description, and date.
3. Enter coordinates manually, or click **Pick from map** and then tap the map to auto-fill the lat/lon fields.
4. Click **Save**. The point is stored locally in your browser's IndexedDB — no account or internet connection needed for this step.

> Custom points are stored in the `PetaBencanaDB` IndexedDB database. You can inspect them in DevTools → Application → IndexedDB.

---

## Build for Production

```bash
npm run build
# Output is in dist/ — deploy to any static host (Nginx, Vercel, Netlify, GitHub Pages, etc.)
```

---

## Next Steps

- **Architecture & Data Layer Reference** → [DEVELOPMENT.md](DEVELOPMENT.md)
- **Contributing a Fix or Feature** → [CONTRIBUTING.md](CONTRIBUTING.md)
- **Version History** → [CHANGELOG.md](CHANGELOG.md)
