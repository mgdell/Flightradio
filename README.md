# Flight Radio

Small local website for finding nearby airport communication frequencies from a
typed location.

## What it does

- Accepts a typed location such as a city, airport, or town.
- Geocodes that location and finds nearby airports within a chosen radius.
- Shows aviation-only frequencies such as Tower, Ground, ATIS, CTAF, UNICOM,
  Approach, Departure, AWOS, and ASOS.
- Generates a copy-ready programming list for an airband scanner.

## Files

- `index.html`: aviation-focused app shell and layout
- `styles.css`: responsive visual design
- `app.js`: frontend search flow, rendering, and copy behavior
- `server.py`: backend API for geocoding, airport lookup, and frequency loading
- `passenger_wsgi.py`: WSGI entry point for Python hosting environments

## Data notes

- Airport and frequency data are loaded from the OurAirports public dataset.
- Typed location search uses OpenStreetMap Nominatim geocoding.
- Always verify aviation frequencies against current FAA publications before
  programming a permanent scanner bank.
