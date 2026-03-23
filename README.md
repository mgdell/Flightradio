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
- `server.py`: local API for geocoding, airport lookup, and frequency loading

## Local use

Run the bundled local server:

<small><code>python3 server.py</code></small>

Then open `http://127.0.0.1:8000`.

## A2 Hosting

This project is now compatible with cPanel `Setup Python App`.

Upload these files to your app directory:

- `index.html`
- `styles.css`
- `app.js`
- `server.py`
- `passenger_wsgi.py`
- `flight-radio-logo.png`

In A2 cPanel:

1. Open `Setup Python App`.
2. Create an app using Python 3.
3. Set the application root to this project folder.
4. Set the application startup file to `passenger_wsgi.py`.
5. Set the application entry point to `application`.
6. Restart the app from cPanel after uploading or changing files.

This app now uses relative asset and API paths, so it is safe to mount under a
subpath such as `https://mikedell.org/flightradio/`.

## Data notes

- Airport and frequency data are loaded from the OurAirports public dataset.
- Typed location search uses OpenStreetMap Nominatim geocoding.
- Always verify aviation frequencies against current FAA publications before
  programming a permanent scanner bank.
