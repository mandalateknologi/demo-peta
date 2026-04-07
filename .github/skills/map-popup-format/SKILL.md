---
name: map-popup-format
description: "Customize MapLibre popup display for a data layer. Use when changing popup fields, adding alert badges, formatting values, or styling popup appearance in Peta Bencana."
---

# Map Popup Formatting

Customize how data is displayed in MapLibre popups when a user clicks a marker.

## When to Use

- Adding or removing fields from a layer's popup
- Changing field labels or display order
- Adding formatted values (magnitude badges, color-coded alerts)
- Styling or restructuring popup HTML

## How Popups Work

Popups are built by `buildPopupHTML()` in `src/components/Map/MapContainer.tsx`. The function:

1. Looks up the `LayerConfig` by `point.layerId`
2. Reads `popupFields` from the config
3. Renders each field as an HTML row with label + value
4. Adds an alert badge for volcanic status codes (`cu_avcode`)
5. Appends coordinates at the bottom

## Procedure

### Changing Which Fields Appear

Edit `popupFields` in the layer's config in `src/config/layers.ts`:

```ts
popupFields: [
  { key: "property_key", label: "Display Label" },
  { key: "mag", label: "Magnitudo", format: "magnitude" },
];
```

- `key` — property name in `DataPoint.properties`
- `label` — display label in the popup
- `format` — optional formatter: `'date'` or `'magnitude'`
- Fields render in array order; empty/null values are automatically skipped

### Adding a New Format Type

1. Add the format name to `PopupField.format` union in `src/types/index.ts`:

   ```ts
   export interface PopupField {
     key: string;
     label: string;
     format?: "date" | "magnitude" | "your-format";
   }
   ```

2. Handle it in `buildPopupHTML()` in `src/components/Map/MapContainer.tsx`

### Alert Badges

Volcanic alert levels (`cu_avcode`) automatically render as color-coded badges using `ALERT_COLORS` from `config/layers.ts`:

```ts
export const ALERT_COLORS: Record<string, string> = {
  GREEN: "#38a169",
  YELLOW: "#d69e2e",
  ORANGE: "#dd6b20",
  RED: "#e53e3e",
};
```

To add badge support for other status fields, extend the badge logic in `buildPopupHTML()`.

### Popup Styling

Global popup CSS overrides are in `src/index.css` under `.maplibregl-popup-content`. These affect all popups. Per-popup inline styles are in `buildPopupHTML()`.

## Security

- Property values are inserted directly into HTML — sanitize any user-controllable values
- Current data comes from trusted static JSON files, but if adding external data sources, escape HTML entities

## Checklist

- [ ] Updated `popupFields` in `config/layers.ts`
- [ ] If new format type: updated `PopupField` type and `buildPopupHTML()`
- [ ] Verified popup renders correctly on click
- [ ] Checked dark and light theme appearance
