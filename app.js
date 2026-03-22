const regions = [
  {
    id: "detroit",
    name: "Detroit Metro",
    lat: 42.3314,
    lon: -83.0458,
    coverage: "Detroit, Dearborn, Downriver, and Wayne County starter bank",
    areas: ["Detroit", "Dearborn", "Wayne County", "DTW"],
    queryTokens: [
      "detroit",
      "wayne county",
      "dearborn",
      "romulus",
      "dtw",
      "michigan",
      "great lakes",
    ],
    channels: [
      makeChannel("853.9875", "police", "Detroit Police Dispatch", "Detroit Police", "P25", "Citywide dispatch and routine patrol traffic when clear.", "High activity most evenings."),
      makeChannel("154.4300", "fire", "Detroit Fire Dispatch", "Detroit Fire Department", "FM", "Primary dispatch and incident assignment traffic.", "Busy during working fires and storms."),
      makeChannel("155.3400", "ems", "Regional EMS Coordination", "SE Michigan EMS", "FM", "Hospital and field coordination channel used across the metro area.", "Useful during larger incidents."),
      makeChannel("119.5000", "aviation", "DTW Tower", "Detroit Metro Airport", "AM", "Local runway control for Detroit Metro departures and arrivals.", "Best near the airport or with an outdoor antenna."),
      makeChannel("160.8000", "rail", "CN Detroit Terminal", "Canadian National", "NFM", "Yard and terminal railroad operations around Detroit.", "Often active throughout the day."),
      makeChannel("156.8000", "marine", "Marine Channel 16", "USCG / Great Lakes Marine", "FM", "Hailing and distress traffic on the Detroit River and nearby water.", "Seasonal boating traffic is strongest."),
      makeChannel("453.4500", "public-works", "Road Commission Ops", "Wayne County Public Works", "FM", "Snow, salt, and field maintenance operations.", "Most useful during winter weather."),
    ],
  },
  {
    id: "chicago",
    name: "Chicago Corridor",
    lat: 41.8781,
    lon: -87.6298,
    coverage: "Chicago city, suburbs, and O'Hare corridor starter bank",
    areas: ["Chicago", "Cook County", "O'Hare", "Midway"],
    queryTokens: ["chicago", "cook county", "ohare", "ord", "midway", "illinois"],
    channels: [
      makeChannel("460.4250", "police", "Chicago Police Citywide", "Chicago Police", "P25", "Citywide operations and event traffic where monitorable.", "Activity depends on district and events."),
      makeChannel("154.1300", "fire", "Chicago Fire Main", "Chicago Fire Department", "FM", "Fire dispatch and major incident coordination.", "Often strong during storms and structure fires."),
      makeChannel("463.0000", "ems", "EMS Ops", "Chicago EMS", "FM", "Medical coordination and support traffic.", "Most useful during larger incidents."),
      makeChannel("120.7500", "aviation", "ORD Tower", "O'Hare International", "AM", "Primary tower traffic for O'Hare runway operations.", "Constant airline traffic."),
      makeChannel("160.9500", "rail", "Metra Road", "Metra", "NFM", "Commuter rail dispatch and movement authority traffic.", "Peak hours are especially active."),
      makeChannel("156.6500", "marine", "Bridge / Harbor Ops", "Chicago Marine", "FM", "Harbor coordination and bridge traffic on the waterfront.", "Best in warm months."),
      makeChannel("453.6750", "public-works", "Streets and Sanitation", "Chicago Public Works", "FM", "Snow response and heavy equipment coordination.", "Useful during storms and overnight plowing."),
    ],
  },
  {
    id: "atlanta",
    name: "Atlanta Metro",
    lat: 33.749,
    lon: -84.388,
    coverage: "Atlanta urban core and airport-heavy metro scanner bank",
    areas: ["Atlanta", "Fulton County", "DeKalb County", "ATL"],
    queryTokens: ["atlanta", "fulton county", "dekalb", "atl", "georgia", "hartsfield"],
    channels: [
      makeChannel("460.2000", "police", "Atlanta Police Dispatch", "Atlanta Police", "P25", "Primary dispatch traffic for central city operations.", "Urban events can raise activity quickly."),
      makeChannel("154.1900", "fire", "Atlanta Fire Dispatch", "Atlanta Fire Rescue", "FM", "Main fire dispatch and assignment traffic.", "Solid daily activity."),
      makeChannel("155.2800", "ems", "Metro EMS Mutual Aid", "Atlanta EMS", "FM", "Interoperability and regional medical support channel.", "Often quiet until incidents ramp up."),
      makeChannel("119.1000", "aviation", "ATL Tower", "Hartsfield-Jackson", "AM", "High-volume tower channel for Atlanta arrivals and departures.", "One of the easiest strong signals to monitor."),
      makeChannel("160.3200", "rail", "CSX Atlanta Terminal", "CSX", "NFM", "Freight railroad terminal and road traffic.", "Good around yards and industrial areas."),
      makeChannel("156.7000", "marine", "Lake Lanier / Chattahoochee Ops", "Regional Marine", "FM", "Marine safety and event traffic on major waterways.", "Mostly seasonal."),
      makeChannel("453.0250", "public-works", "DOT Field Ops", "Georgia DOT Metro", "FM", "Traffic management and maintenance crews.", "Useful during major weather and lane closures."),
    ],
  },
  {
    id: "dallas",
    name: "Dallas-Fort Worth",
    lat: 32.7767,
    lon: -96.797,
    coverage: "Dallas, Fort Worth, and DFW corridor programming bank",
    areas: ["Dallas", "Fort Worth", "DFW Airport", "Tarrant County"],
    queryTokens: ["dallas", "fort worth", "dfw", "dal", "texas", "love field"],
    channels: [
      makeChannel("460.5750", "police", "Dallas Police Dispatch", "Dallas Police", "P25", "Primary city dispatch and major events traffic.", "Monitorability depends on local system use."),
      makeChannel("154.3700", "fire", "Dallas Fire Rescue", "Dallas Fire-Rescue", "FM", "Dispatch and incident assignment channel.", "Busy during severe weather."),
      makeChannel("155.2200", "ems", "Regional MED Channel", "North Texas EMS", "FM", "Hospital patch and mutual aid medical traffic.", "Useful during mass-casualty or surge periods."),
      makeChannel("126.5500", "aviation", "DFW Tower", "Dallas Fort Worth International", "AM", "Parallel runway tower ops at DFW.", "Very active across airline banks."),
      makeChannel("161.1000", "rail", "BNSF Dispatcher", "BNSF", "NFM", "Freight movement and dispatcher traffic across the metroplex.", "Good with an outside antenna."),
      makeChannel("156.6000", "marine", "Lake Patrol", "Regional Marine", "FM", "Lake and reservoir enforcement and boating safety traffic.", "Seasonal and event-driven."),
      makeChannel("453.9000", "public-works", "Street Services", "Dallas Public Works", "FM", "Street maintenance and response crews.", "Most useful in storm cleanup."),
    ],
  },
  {
    id: "denver",
    name: "Denver Front Range",
    lat: 39.7392,
    lon: -104.9903,
    coverage: "Denver metro and Front Range listening bank",
    areas: ["Denver", "Aurora", "Front Range", "DEN"],
    queryTokens: ["denver", "aurora", "den", "colorado", "front range", "dia"],
    channels: [
      makeChannel("460.5500", "police", "Denver Police Dispatch", "Denver Police", "P25", "Metro dispatch and event traffic where accessible.", "Downtown events can drive heavy activity."),
      makeChannel("154.3100", "fire", "Denver Fire Dispatch", "Denver Fire Department", "FM", "Primary fire dispatch and assignment channel.", "Consistent daily use."),
      makeChannel("155.1750", "ems", "Medical Coordination", "Front Range EMS", "FM", "Regional EMS support and hospital coordination.", "Best during larger incidents."),
      makeChannel("118.7500", "aviation", "DEN Tower", "Denver International", "AM", "Main tower operations for Denver International.", "Easy target with decent antenna placement."),
      makeChannel("160.2900", "rail", "UP Moffat Sub", "Union Pacific", "NFM", "Dispatcher and train movements across the Front Range.", "Mountain routes can be especially interesting."),
      makeChannel("156.7500", "marine", "Reservoir Ops", "Colorado Parks / Marine", "FM", "Boat safety and patrol traffic on larger reservoirs.", "Mostly warm weather activity."),
      makeChannel("453.2500", "public-works", "Snow Operations", "Denver Public Works", "FM", "Plow routes, snow staging, and field response.", "Strongest in winter storms."),
    ],
  },
  {
    id: "seattle",
    name: "Seattle Puget Sound",
    lat: 47.6062,
    lon: -122.3321,
    coverage: "Seattle, Tacoma, and Puget Sound regional scanner bank",
    areas: ["Seattle", "Tacoma", "Puget Sound", "SEA"],
    queryTokens: ["seattle", "tacoma", "puget sound", "sea", "seatac", "washington"],
    channels: [
      makeChannel("460.1500", "police", "Seattle Police Dispatch", "Seattle Police", "P25", "Primary city dispatch and event coordination traffic.", "Can spike during major downtown events."),
      makeChannel("154.0700", "fire", "Seattle Fire Dispatch", "Seattle Fire Department", "FM", "Dispatch and tactical assignments.", "Active year-round."),
      makeChannel("155.2350", "ems", "Medic Coordination", "Seattle EMS", "FM", "Regional medic and support coordination.", "Often quieter than fire dispatch."),
      makeChannel("119.9000", "aviation", "SEA Tower", "Seattle-Tacoma International", "AM", "Tower control for Sea-Tac operations.", "Strong airline traffic throughout the day."),
      makeChannel("161.5500", "rail", "Sounder / BNSF Road", "BNSF / Sound Transit", "NFM", "Passenger and freight rail movement traffic.", "Rush hour and freight windows are best."),
      makeChannel("156.8000", "marine", "Puget Sound Calling", "Marine VHF", "FM", "Calling and safety traffic around ferries and local marine ops.", "Excellent on the waterfront."),
      makeChannel("453.1500", "public-works", "Seattle Public Utilities", "City Utilities", "FM", "Storm drainage, field crews, and maintenance response.", "Useful during wind and rain events."),
    ],
  },
];

const form = document.querySelector("#filter-form");
const regionSelect = document.querySelector("#region-select");
const categorySelect = document.querySelector("#category-select");
const locationQueryInput = document.querySelector("#location-query");
const geoButton = document.querySelector("#geo-button");
const demoButton = document.querySelector("#demo-button");
const copyButton = document.querySelector("#copy-button");
const programOutput = document.querySelector("#program-output");
const summaryTitle = document.querySelector("#summary-title");
const statusPill = document.querySelector("#status-pill");
const statusMessage = document.querySelector("#status-message");
const metaRegion = document.querySelector("#meta-region");
const metaCoverage = document.querySelector("#meta-coverage");
const metaAreas = document.querySelector("#meta-areas");
const metaCount = document.querySelector("#meta-count");
const resultsNode = document.querySelector("#results");

populateRegions();
form.addEventListener("submit", handleFilterSubmit);
geoButton.addEventListener("click", handleUseMyLocation);
demoButton.addEventListener("click", () => {
  regionSelect.value = "detroit";
  categorySelect.value = "all";
  locationQueryInput.value = "";
  renderRegion("detroit");
});
copyButton.addEventListener("click", handleCopyProgramList);

renderRegion("detroit");

function makeChannel(frequency, category, label, agency, mode, note, window, encrypted = false) {
  return {
    frequency,
    category,
    label,
    agency,
    mode,
    note,
    window,
    encrypted,
  };
}

function populateRegions() {
  const options = ['<option value="all">All featured regions</option>']
    .concat(
      regions.map(
        (region) => `<option value="${region.id}">${escapeHtml(region.name)}</option>`,
      ),
    )
    .join("");

  regionSelect.innerHTML = options;
}

function handleFilterSubmit(event) {
  event.preventDefault();
  const region = resolveRegionFromInput(locationQueryInput.value, regionSelect.value);
  renderRegion(region?.id ?? regionSelect.value);
}

function renderRegion(regionId) {
  const category = categorySelect.value;
  const query = locationQueryInput.value.trim();
  const selectedRegion = regionId && regionId !== "all"
    ? regions.find((region) => region.id === regionId) ?? null
    : null;
  const matches = filterChannels(selectedRegion, category, query);

  if (selectedRegion) {
    regionSelect.value = selectedRegion.id;
    setStatus({
      title: `${selectedRegion.name} starter bank`,
      pill: "Loaded",
      message:
        query && !matches.length
          ? `No exact matches for "${query}" in ${selectedRegion.name}. Try a broader service or clear the search.`
          : `Showing curated scanner channels for ${selectedRegion.name}. Verify tones, talkgroups, and encryption before long-term programming.`,
      state: matches.length ? "active" : "warning",
    });
    renderMeta(selectedRegion, matches.length);
  } else {
    regionSelect.value = "all";
    setStatus({
      title: "Featured scanner banks",
      pill: "Browse",
      message:
        "Showing channels across the built-in metro areas. Use location for the nearest featured set or search by agency, city, or service.",
      state: "active",
    });
    renderMeta(
      {
        name: "All featured regions",
        coverage: "Curated metro-area starter banks for common scanner services",
        areas: Array.from(new Set(regions.flatMap((region) => region.areas))),
      },
      matches.length,
    );
  }

  renderProgramOutput(selectedRegion, matches);

  if (!matches.length) {
    resultsNode.innerHTML =
      '<article class="empty-state">No frequencies matched that filter. Try a broader city name, switch service categories, or use <strong>All featured regions</strong>.</article>';
    return;
  }

  resultsNode.innerHTML = matches
    .map(
      (item) => `
        <article class="channel-card">
          <div class="channel-header">
            <span class="tag">${escapeHtml(formatCategory(item.category))}</span>
            <span class="mode-badge">${escapeHtml(item.mode)}</span>
          </div>
          <div class="channel-frequency">${escapeHtml(item.frequency)} MHz</div>
          <h3 class="channel-label">${escapeHtml(item.label)}</h3>
          <div class="channel-agency">${escapeHtml(item.agency)}</div>
          <p class="channel-note">${escapeHtml(item.note)}</p>
          <div class="channel-footer">
            <span>${escapeHtml(item.regionName)}</span>
            <span>${escapeHtml(item.window)}</span>
          </div>
          ${item.encrypted ? '<p class="encrypted-flag">May be encrypted or intermittent.</p>' : ""}
        </article>
      `,
    )
    .join("");
}

function filterChannels(region, category, query) {
  const scopedRegions = region ? [region] : regions;
  const normalizedQuery = query.trim().toLowerCase();

  return scopedRegions.flatMap((entry) =>
    entry.channels
      .filter((channel) => category === "all" || channel.category === category)
      .filter((channel) => {
        if (!normalizedQuery) {
          return true;
        }

        const haystack = [
          entry.name,
          entry.coverage,
          ...entry.areas,
          ...entry.queryTokens,
          channel.frequency,
          channel.category,
          channel.label,
          channel.agency,
          channel.mode,
          channel.note,
        ]
          .join(" ")
          .toLowerCase();

        return haystack.includes(normalizedQuery);
      })
      .map((channel) => ({
        ...channel,
        regionName: entry.name,
      })),
  );
}

function resolveRegionFromInput(query, selectedRegionId) {
  if (selectedRegionId && selectedRegionId !== "all") {
    const selectedRegion = regions.find((region) => region.id === selectedRegionId);
    if (selectedRegion) {
      return selectedRegion;
    }
  }

  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return null;
  }

  return (
    regions.find(
      (region) =>
        region.name.toLowerCase().includes(normalized) ||
        region.queryTokens.some((token) => token.includes(normalized)) ||
        region.areas.some((area) => area.toLowerCase().includes(normalized)),
    ) ?? null
  );
}

function handleUseMyLocation() {
  if (!navigator.geolocation) {
    setStatus({
      title: "Location unavailable",
      pill: "Browser limit",
      message: "This browser does not expose geolocation. Pick a region manually instead.",
      state: "warning",
    });
    return;
  }

  setStatus({
    title: "Locating listener",
    pill: "Working",
    message: "Requesting browser geolocation to pick the nearest featured scanner region.",
    state: "active",
  });

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const nearest = findNearestRegion(position.coords.latitude, position.coords.longitude);
      if (!nearest) {
        return;
      }

      locationQueryInput.value = nearest.name;
      categorySelect.value = "all";
      renderRegion(nearest.id);
      statusMessage.textContent = `Nearest featured scanner bank from your browser location: ${nearest.name}, about ${Math.round(nearest.distance)} miles away.`;
    },
    () => {
      setStatus({
        title: "Location unavailable",
        pill: "Permission needed",
        message: "Location access was denied or failed. You can still choose a metro area or search by service.",
        state: "warning",
      });
    },
    {
      enableHighAccuracy: false,
      timeout: 8000,
      maximumAge: 300000,
    },
  );
}

function handleCopyProgramList() {
  if (!programOutput.value.trim()) {
    return;
  }

  if (!navigator.clipboard) {
    programOutput.focus();
    programOutput.select();
    statusMessage.textContent = "Clipboard access is unavailable here. The programming list is selected so you can copy it manually.";
    statusPill.textContent = "Manual copy";
    statusPill.dataset.state = "warning";
    return;
  }

  navigator.clipboard.writeText(programOutput.value).then(() => {
    statusMessage.textContent = "Programming list copied to the clipboard.";
    statusPill.textContent = "Copied";
    statusPill.dataset.state = "active";
  }).catch(() => {
    programOutput.focus();
    programOutput.select();
    statusMessage.textContent = "Clipboard access failed. The programming list is selected so you can copy it manually.";
    statusPill.textContent = "Manual copy";
    statusPill.dataset.state = "warning";
  });
}

function renderProgramOutput(region, matches) {
  if (!matches.length) {
    programOutput.value = "No matching channels to program.";
    return;
  }

  const heading = region ? `${region.name} starter bank` : "All featured regions starter bank";
  const lines = matches.map(
    (item, index) =>
      `${String(index + 1).padStart(2, "0")}. ${item.frequency} MHz | ${formatCategory(item.category)} | ${item.mode} | ${item.label} | ${item.agency}`,
  );

  programOutput.value = [heading, "", ...lines].join("\n");
}

function findNearestRegion(lat, lon) {
  return regions.reduce((closest, region) => {
    const distance = haversineMiles(lat, lon, region.lat, region.lon);
    if (!closest || distance < closest.distance) {
      return { ...region, distance };
    }
    return closest;
  }, null);
}

function haversineMiles(lat1, lon1, lat2, lon2) {
  const toRadians = (value) => (value * Math.PI) / 180;
  const earthRadiusMiles = 3958.8;
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) ** 2;
  return 2 * earthRadiusMiles * Math.asin(Math.sqrt(a));
}

function renderMeta(region, count) {
  metaRegion.textContent = region.name;
  metaCoverage.textContent = region.coverage;
  metaAreas.textContent = region.areas.join(", ");
  metaCount.textContent = `${count} channel${count === 1 ? "" : "s"}`;
}

function setStatus({ title, pill, message, state }) {
  summaryTitle.textContent = title;
  statusPill.textContent = pill;
  statusPill.dataset.state = state;
  statusMessage.textContent = message;
}

function formatCategory(value) {
  if (value === "ems") {
    return "EMS";
  }
  if (value === "public-works") {
    return "Public Works";
  }
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
