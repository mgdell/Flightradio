# SignalScout

Small local website for finding scanner frequencies by metro area or browser
location.

## What it does

- Shows curated starter channels for featured US metro areas.
- Filters by service type such as police, fire, EMS, aviation, rail, marine,
  and public works.
- Uses browser geolocation to choose the nearest featured region.
- Builds a copy-ready programming bank for scanner notes or import workflows.
- Runs locally with no backend API dependency.

## Files

- `index.html`: scanner-focused app shell and layout
- `styles.css`: responsive visual design
- `app.js`: built-in frequency dataset, filtering, and geolocation logic
- `server.py`: lightweight static file server for local development

## Local use

Run the bundled local server:

```bash
python3 server.py
```

Then open `http://127.0.0.1:8000`.

## Notes

- The bundled channels are a curated starter list, not a full live database.
- Verify local legality, mode, tone, trunking, and encryption details before
  programming a permanent scanner bank.
- Expanding this into a larger or live-updated reference will require a real
  data source and normalization layer.
