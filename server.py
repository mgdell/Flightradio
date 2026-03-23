from __future__ import annotations

import csv
import io
import json
import math
import mimetypes
import re
import ssl
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.parse import parse_qs, urlencode
from urllib.request import Request, urlopen
from wsgiref.simple_server import make_server

HOST = "127.0.0.1"
PORT = 8000
APP_DIR = Path(__file__).resolve().parent
USER_AGENT = "Flight-Radio/1.0 (python app)"
AIRPORTS_CSV_URL = "https://davidmegginson.github.io/ourairports-data/airports.csv"
FREQUENCIES_CSV_URL = "https://davidmegginson.github.io/ourairports-data/airport-frequencies.csv"
GEOCODE_URL = "https://nominatim.openstreetmap.org/search"
AIRNAV_URL_TEMPLATE = "https://www.airnav.com/airport/{ident}"
CACHE_TTL_SECONDS = 60 * 60 * 6
MAX_AIRPORTS = 6
MAX_FREQUENCIES_PER_AIRPORT = 12

TYPE_LABELS = {
  "TWR": "Tower",
  "GND": "Ground",
  "APP": "Approach",
  "DEP": "Departure",
  "ATIS": "ATIS",
  "CTAF": "CTAF",
  "UNIC": "UNICOM",
  "AWOS": "AWOS",
  "ASOS": "ASOS",
  "CLEARANCE DELIVERY": "Clearance",
}

MILITARY_NAME_MARKERS = (
  "air force base",
  "air reserve base",
  "air national guard",
  "naval air station",
  "army airfield",
  "army heliport",
  "military",
  "joint base",
  "marine corps",
  "coast guard",
  "reserve base",
)

AIRPORTS_CACHE: tuple[float, list[dict[str, Any]]] | None = None
FREQUENCIES_CACHE: tuple[float, dict[str, list[dict[str, str]]]] | None = None
AIRNAV_CACHE: dict[str, tuple[float, list[dict[str, str]]]] = {}


@dataclass(frozen=True)
class Place:
  display_name: str
  lat: float
  lon: float


def application(environ: dict[str, Any], start_response: Any) -> list[bytes]:
  path = normalize_request_path(environ)
  method = environ.get("REQUEST_METHOD", "GET").upper()

  if method != "GET":
    return respond_json(start_response, 405, {"error": "Method not allowed."})

  if path == "/api/aviation":
    query_params = parse_query_string(environ.get("QUERY_STRING", ""))
    try:
      payload = find_aviation_frequencies(query_params)
      return respond_json(start_response, 200, payload)
    except ValueError as exc:
      return respond_json(start_response, 400, {"error": str(exc)})
    except Exception as exc:
      return respond_json(start_response, 502, {"error": f"Aviation lookup failed: {exc}"})

  return serve_static(start_response, path)


def normalize_request_path(environ: dict[str, Any]) -> str:
  path = environ.get("PATH_INFO", "/") or "/"
  script_name = environ.get("SCRIPT_NAME", "") or ""
  request_uri = environ.get("REQUEST_URI", "") or ""

  if script_name and path.startswith(script_name):
    path = path[len(script_name):] or "/"

  if request_uri:
    request_path = request_uri.split("?", 1)[0]
    if request_path.endswith(path) and request_path != path:
      prefix = request_path[: -len(path)]
      if prefix and path.startswith("/") and request_path.startswith(prefix):
        path = path or "/"

  path_parts = [part for part in path.split("/") if part]
  if len(path_parts) >= 2:
    candidate = APP_DIR / path_parts[-1]
    if candidate.is_file():
      return f"/{path_parts[-1]}"

  if path.endswith("/api/aviation") and path != "/api/aviation":
    return "/api/aviation"

  if path.endswith("/"):
    return path

  return path


def parse_query_string(query_string: str) -> dict[str, str]:
  parsed = parse_qs(query_string, keep_blank_values=True)
  return {key: values[-1] for key, values in parsed.items()}


def serve_static(start_response: Any, path: str) -> list[bytes]:
  relative_path = "index.html" if path in {"", "/"} else path.lstrip("/")
  file_path = (APP_DIR / relative_path).resolve()

  if not str(file_path).startswith(str(APP_DIR)) or not file_path.is_file():
    return respond_text(start_response, 404, "Not found.")

  content_type = mimetypes.guess_type(file_path.name)[0] or "application/octet-stream"
  body = file_path.read_bytes()
  start_response(
    f"200 OK",
    [
      ("Content-Type", content_type),
      ("Content-Length", str(len(body))),
    ],
  )
  return [body]


def respond_json(start_response: Any, status: int, payload: dict[str, Any]) -> list[bytes]:
  encoded = json.dumps(payload).encode("utf-8")
  start_response(
    f"{status} {status_text(status)}",
    [
      ("Content-Type", "application/json; charset=utf-8"),
      ("Content-Length", str(len(encoded))),
    ],
  )
  return [encoded]


def respond_text(start_response: Any, status: int, message: str) -> list[bytes]:
  encoded = message.encode("utf-8")
  start_response(
    f"{status} {status_text(status)}",
    [
      ("Content-Type", "text/plain; charset=utf-8"),
      ("Content-Length", str(len(encoded))),
    ],
  )
  return [encoded]


def status_text(status: int) -> str:
  return {
    200: "OK",
    400: "Bad Request",
    404: "Not Found",
    405: "Method Not Allowed",
    502: "Bad Gateway",
  }.get(status, "OK")


def find_aviation_frequencies(params: dict[str, str]) -> dict[str, Any]:
  query = params.get("query", "").strip()
  if not query:
    raise ValueError("Type a city, airport, or location.")

  radius_miles = min(max(int(params.get("radiusMiles", "75") or "75"), 10), 250)
  selected_types = normalize_types(params.get("frequencyTypes", ""))
  place = geocode_place(query)
  airports = find_nearby_airports(place, radius_miles, selected_types)

  return {
    "location": {
      "displayName": place.display_name,
      "lat": place.lat,
      "lon": place.lon,
    },
    "radiusMiles": radius_miles,
    "frequencyTypes": sorted(selected_types) if selected_types else [],
    "message": (
      "Showing nearby airport communications. AirNav is preferred for U.S. airports, "
      "with OurAirports as fallback. Verify against current FAA publications before programming."
    ),
    "airports": airports,
  }


def normalize_types(raw_value: str) -> set[str]:
  if not raw_value.strip():
    return set()
  values = {value.strip().upper() for value in raw_value.split(",") if value.strip()}
  return {value for value in values if value in TYPE_LABELS}


def geocode_place(query: str) -> Place:
  payload = fetch_json(
    GEOCODE_URL
    + "?"
    + urlencode({"q": query, "format": "jsonv2", "limit": 1}),
    extra_headers={"Accept-Language": "en-US,en;q=0.8"},
  )
  if not isinstance(payload, list) or not payload:
    raise ValueError("No matching location found.")

  item = payload[0]
  lat = safe_float(item.get("lat"))
  lon = safe_float(item.get("lon"))
  if lat is None or lon is None:
    raise ValueError("Location lookup returned invalid coordinates.")

  return Place(str(item.get("display_name") or query), lat, lon)


def find_nearby_airports(place: Place, radius_miles: int, selected_types: set[str]) -> list[dict[str, Any]]:
  airports = load_airports()
  frequencies_by_airport = load_frequencies_by_airport()

  matches: list[dict[str, Any]] = []
  for airport in airports:
    distance = haversine_miles(place.lat, place.lon, airport["lat"], airport["lon"])
    if distance > radius_miles:
      continue

    airport_frequencies = resolve_airport_frequencies(airport, frequencies_by_airport)
    filtered_frequencies = [
      normalize_frequency(freq, airport)
      for freq in airport_frequencies
      if not selected_types or freq["type"] in selected_types
    ]
    filtered_frequencies = [freq for freq in filtered_frequencies if freq]
    filtered_frequencies = [
      freq
      for freq in filtered_frequencies
      if not should_hide_military_frequency(freq, airport)
    ]
    if not filtered_frequencies:
      continue

    matches.append(
      {
        "ident": airport["ident"],
        "gpsCode": airport["gps_code"],
        "name": airport["name"],
        "municipality": airport["municipality"],
        "type": airport["type"],
        "distanceMiles": round(distance, 1),
        "frequencies": filtered_frequencies[:MAX_FREQUENCIES_PER_AIRPORT],
      }
    )

  matches.sort(key=lambda airport: (airport["distanceMiles"], airport["ident"]))
  return matches[:MAX_AIRPORTS]


def load_airports() -> list[dict[str, Any]]:
  global AIRPORTS_CACHE
  if AIRPORTS_CACHE and (time.time() - AIRPORTS_CACHE[0]) < CACHE_TTL_SECONDS:
    return AIRPORTS_CACHE[1]

  rows = fetch_csv_rows(AIRPORTS_CSV_URL)
  airports: list[dict[str, Any]] = []
  for row in rows:
    if row.get("type") in {"closed", "heliport", "seaplane_base", "balloonport"}:
      continue
    ident = (row.get("ident") or "").strip()
    if not ident:
      continue
    lat = safe_float(row.get("latitude_deg"))
    lon = safe_float(row.get("longitude_deg"))
    if lat is None or lon is None:
      continue
    airports.append(
      {
        "ident": ident,
        "gps_code": (row.get("gps_code") or ident).strip(),
        "name": (row.get("name") or ident).strip(),
        "municipality": (row.get("municipality") or "").strip(),
        "type": (row.get("type") or "").strip(),
        "lat": lat,
        "lon": lon,
      }
    )

  AIRPORTS_CACHE = (time.time(), airports)
  return airports


def load_frequencies_by_airport() -> dict[str, list[dict[str, str]]]:
  global FREQUENCIES_CACHE
  if FREQUENCIES_CACHE and (time.time() - FREQUENCIES_CACHE[0]) < CACHE_TTL_SECONDS:
    return FREQUENCIES_CACHE[1]

  rows = fetch_csv_rows(FREQUENCIES_CSV_URL)
  grouped: dict[str, list[dict[str, str]]] = {}
  for row in rows:
    airport_ident = (row.get("airport_ident") or "").strip()
    freq_type = (row.get("type") or "").strip().upper()
    if not airport_ident or freq_type not in TYPE_LABELS:
      continue

    grouped.setdefault(airport_ident, []).append(
      {
        "type": freq_type,
        "description": (row.get("description") or "").strip(),
        "frequency_mhz": (row.get("frequency_mhz") or "").strip(),
      }
    )

  FREQUENCIES_CACHE = (time.time(), grouped)
  return grouped


def resolve_airport_frequencies(
  airport: dict[str, Any],
  frequencies_by_airport: dict[str, list[dict[str, str]]],
) -> list[dict[str, str]]:
  if airport["ident"].startswith("K"):
    airnav_rows = fetch_airnav_frequencies(airport["ident"])
    if airnav_rows:
      return airnav_rows
  return frequencies_by_airport.get(airport["ident"], [])


def fetch_airnav_frequencies(ident: str) -> list[dict[str, str]]:
  cached = AIRNAV_CACHE.get(ident)
  if cached and (time.time() - cached[0]) < CACHE_TTL_SECONDS:
    return cached[1]

  try:
    html = fetch_text(AIRNAV_URL_TEMPLATE.format(ident=ident.lower()))
    rows = parse_airnav_frequencies(html)
  except Exception:
    rows = []

  AIRNAV_CACHE[ident] = (time.time(), rows)
  return rows


def parse_airnav_frequencies(html: str) -> list[dict[str, str]]:
  match = re.search(
    r"Airport Communications(.*?)Nearby radio navigation aids",
    html,
    flags=re.IGNORECASE | re.DOTALL,
  )
  if not match:
    return []

  section = match.group(1)
  section = re.sub(r"<br\s*/?>", "\n", section, flags=re.IGNORECASE)
  section = re.sub(r"</p>|</tr>|</td>|</div>", "\n", section, flags=re.IGNORECASE)
  section = re.sub(r"<[^>]+>", " ", section)
  section = html_unescape(section)
  lines = [re.sub(r"\s+", " ", line).strip() for line in section.splitlines()]
  lines = [line for line in lines if ":" in line]

  parsed_rows: list[dict[str, str]] = []
  for line in lines:
    label, values = line.split(":", 1)
    freq_type = classify_airnav_type(label)
    if not freq_type:
      continue

    frequencies = re.findall(r"\b\d{2,3}\.\d{1,3}\b", values)
    for frequency in frequencies:
      parsed_rows.append(
        {
          "type": freq_type,
          "description": normalize_airnav_description(label),
          "frequency_mhz": normalize_frequency_string(frequency),
        }
      )

  return parsed_rows


def html_unescape(value: str) -> str:
  return (
    value.replace("&nbsp;", " ")
    .replace("&amp;", "&")
    .replace("&#39;", "'")
    .replace("&quot;", '"')
  )


def classify_airnav_type(label: str) -> str | None:
  normalized = label.upper()
  if "ATIS" in normalized:
    return "ATIS"
  if "GROUND" in normalized:
    return "GND"
  if "TOWER" in normalized:
    return "TWR"
  if "APPROACH" in normalized:
    return "APP"
  if "DEPARTURE" in normalized:
    return "DEP"
  if "CTAF" in normalized:
    return "CTAF"
  if "UNICOM" in normalized:
    return "UNIC"
  if "AWOS" in normalized:
    return "AWOS"
  if "ASOS" in normalized:
    return "ASOS"
  if "CLEARANCE" in normalized:
    return "CLEARANCE DELIVERY"
  return None


def normalize_airnav_description(label: str) -> str:
  return re.sub(r"\s+", " ", label).strip().title()


def normalize_frequency_string(value: str) -> str:
  numeric = safe_float(value)
  if numeric is None:
    return value
  return f"{numeric:.3f}"


def normalize_frequency(row: dict[str, str], airport: dict[str, Any]) -> dict[str, str] | None:
  raw_frequency = row.get("frequency_mhz", "").strip()
  if not raw_frequency:
    return None

  freq_type = row.get("type", "").strip().upper()
  display_frequency, band = normalize_display_frequency(raw_frequency, airport, freq_type)
  return {
    "type": freq_type,
    "label": TYPE_LABELS.get(freq_type, freq_type),
    "description": row.get("description", "").strip() or TYPE_LABELS.get(freq_type, freq_type),
    "frequencyMHz": display_frequency,
    "band": band,
  }


def normalize_display_frequency(raw_frequency: str, airport: dict[str, Any], freq_type: str) -> tuple[str, str]:
  numeric = safe_float(raw_frequency)
  if numeric is None:
    return raw_frequency, ""

  if 225 <= numeric < 400:
    return f"{numeric:.3f}", "UHF"
  if 108 <= numeric < 137:
    return f"{numeric:.3f}", "VHF"

  if is_likely_military_airport(airport) and freq_type in {"ATIS", "APP", "DEP", "GND", "TWR"}:
    if 20 <= numeric < 40:
      corrected = numeric + 200
      return f"{corrected:.3f}", "UHF"
    if 100 <= numeric < 137:
      return f"{numeric:.3f}", "VHF"

  return raw_frequency, ""


def is_likely_military_airport(airport: dict[str, Any]) -> bool:
  name = f"{airport.get('name', '')} {airport.get('municipality', '')}".lower()
  return any(marker in name for marker in MILITARY_NAME_MARKERS)


def should_hide_military_frequency(freq: dict[str, str], airport: dict[str, Any]) -> bool:
  numeric = safe_float(freq.get("frequencyMHz"))
  if numeric is None:
    return False

  if freq.get("type") in {"ATIS", "APP", "DEP", "GND", "TWR"} and numeric < 108:
    return True

  if not is_likely_military_airport(airport):
    return False

  if freq.get("band") == "UHF":
    return True

  if freq.get("type") in {"ATIS", "APP", "DEP", "GND", "TWR"} and numeric < 108:
    return True

  return False


def fetch_csv_rows(url: str) -> list[dict[str, str]]:
  return list(csv.DictReader(io.StringIO(fetch_text(url))))


def fetch_json(url: str, extra_headers: dict[str, str] | None = None) -> Any:
  return json.loads(fetch_text(url, extra_headers=extra_headers))


def fetch_text(url: str, extra_headers: dict[str, str] | None = None) -> str:
  headers = {"User-Agent": USER_AGENT}
  if extra_headers:
    headers.update(extra_headers)

  request = Request(url, headers=headers)
  try:
    try:
      with urlopen(request, timeout=30) as response:
        return response.read().decode("utf-8")
    except URLError as exc:
      if isinstance(exc.reason, ssl.SSLCertVerificationError):
        insecure_context = ssl._create_unverified_context()
        with urlopen(request, timeout=30, context=insecure_context) as response:
          return response.read().decode("utf-8")
      raise
  except HTTPError as exc:
    raise ValueError(f"Upstream returned HTTP {exc.code}.") from exc
  except URLError as exc:
    raise ValueError(f"Network error: {exc.reason}.") from exc


def safe_float(value: Any) -> float | None:
  try:
    if value in (None, ""):
      return None
    return float(value)
  except (TypeError, ValueError):
    return None


def haversine_miles(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
  lat1_rad = math.radians(lat1)
  lon1_rad = math.radians(lon1)
  lat2_rad = math.radians(lat2)
  lon2_rad = math.radians(lon2)
  delta_lat = lat2_rad - lat1_rad
  delta_lon = lon2_rad - lon1_rad
  a = (
    math.sin(delta_lat / 2) ** 2
    + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(delta_lon / 2) ** 2
  )
  return 2 * 3958.8 * math.asin(math.sqrt(a))


if __name__ == "__main__":
  with make_server(HOST, PORT, application) as server:
    print(f"Serving Flight Radio on http://{HOST}:{PORT}")
    server.serve_forever()
