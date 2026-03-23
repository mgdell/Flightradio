const form = document.querySelector("#search-form");
const locationQueryInput = document.querySelector("#location-query");
const radiusSelect = document.querySelector("#radius-select");
const typeSelect = document.querySelector("#type-select");
const geoButton = document.querySelector("#geo-button");
const copyButton = document.querySelector("#copy-button");
const programOutput = document.querySelector("#program-output");
const summaryTitle = document.querySelector("#summary-title");
const statusPill = document.querySelector("#status-pill");
const statusMessage = document.querySelector("#status-message");
const metaLocation = document.querySelector("#meta-location");
const metaRadius = document.querySelector("#meta-radius");
const metaAirports = document.querySelector("#meta-airports");
const metaCount = document.querySelector("#meta-count");
const resultsNode = document.querySelector("#results");

form.addEventListener("submit", handleSearch);
geoButton.addEventListener("click", handleUseMyLocation);
copyButton.addEventListener("click", handleCopyProgramList);

setStatus({
  title: "Ready to search",
  pill: "Idle",
  message: "Type a place or use your current location to find nearby airport frequencies.",
  state: "idle",
});
renderProgramOutput([]);
renderEmptyState("No airport frequencies loaded yet.");

handleInitialSearch();

async function handleInitialSearch() {
  await runSearch({ query: locationQueryInput.value.trim() });
}

async function handleSearch(event) {
  event.preventDefault();
  await runSearch({ query: locationQueryInput.value.trim() });
}

function handleUseMyLocation() {
  if (!navigator.geolocation) {
    setStatus({
      title: "Location unavailable",
      pill: "Browser limit",
      message: "This browser does not expose geolocation. Type a place instead.",
      state: "warning",
    });
    return;
  }

  setStatus({
    title: "Locating listener",
    pill: "Working",
    message: "Resolving your current location for nearby airport frequencies.",
    state: "active",
  });

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      await runSearch({
        query: `${position.coords.latitude}, ${position.coords.longitude}`,
      });
    },
    () => {
      setStatus({
        title: "Location unavailable",
        pill: "Permission needed",
        message: "Location access was denied or failed. Type a place instead.",
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

async function runSearch({ query }) {
  if (!query) {
    setStatus({
      title: "Missing location",
      pill: "Check form",
      message: "Type a location before searching.",
      state: "warning",
    });
    renderEmptyState("Enter a location to search for airport frequencies.");
    renderProgramOutput([]);
    return;
  }

  setStatus({
    title: "Finding airport frequencies",
    pill: "Loading",
    message: "Resolving the location and loading nearby airport communications.",
    state: "active",
  });
  renderProgramOutput([]);
  renderEmptyState("Loading nearby airport frequencies...");

  try {
    const payload = await fetchAviationFrequencies({
      query,
      radiusMiles: radiusSelect.value,
      frequencyType: typeSelect.value,
    });
    renderPayload(payload);
  } catch (error) {
    setStatus({
      title: "Search failed",
      pill: "Error",
      message: "The local backend could not load airport frequencies. Confirm the Python server is running and try again.",
      state: "warning",
    });
    renderEmptyState("Airport frequency search failed.");
    renderProgramOutput([]);
  }
}

async function fetchAviationFrequencies({ query, radiusMiles, frequencyType }) {
  const endpoint = new URL("/fr2026/api/aviation", window.location.origin);
  endpoint.searchParams.set("query", query);
  endpoint.searchParams.set("radiusMiles", radiusMiles);
  if (frequencyType) {
    endpoint.searchParams.set("frequencyTypes", frequencyType);
  }

  const response = await fetch(endpoint, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Aviation request failed with ${response.status}`);
  }

  return response.json();
}

function renderPayload(payload) {
  const airports = payload.airports ?? [];
  const totalFrequencies = airports.reduce(
    (count, airport) => count + airport.frequencies.length,
    0,
  );

  setStatus({
    title: airports.length
      ? `Found ${airports.length} nearby airports`
      : "No nearby airports found",
    pill: airports.length ? "Loaded" : "Warning",
    message: payload.message,
    state: airports.length ? "active" : "warning",
  });

  metaLocation.textContent = payload.location.displayName;
  metaRadius.textContent = `${payload.radiusMiles} miles`;
  metaAirports.textContent = airports.length ? airports.map((airport) => airport.ident).join(", ") : "None";
  metaCount.textContent = `${totalFrequencies} frequency${totalFrequencies === 1 ? "" : "ies"}`;

  renderProgramOutput(airports);

  if (!airports.length) {
    renderEmptyState("No nearby airport frequencies matched this search. Try a larger radius.");
    return;
  }

  resultsNode.innerHTML = airports
    .map(
      (airport) => `
        <article class="channel-card">
          <div class="channel-header">
            <span class="tag">${escapeHtml(airport.ident)}</span>
            <span class="mode-badge">${escapeHtml(`${airport.distanceMiles} mi`)}</span>
          </div>
          <div class="channel-frequency">${escapeHtml(airport.name)}</div>
          <h3 class="channel-label">${escapeHtml(airport.municipality || airport.ident)}</h3>
          <div class="channel-agency">${escapeHtml(formatAirportType(airport.type))}</div>
          <div class="airport-frequency-list">
            ${airport.frequencies
              .map(
                (frequency) => `
                  <div class="airport-frequency-row">
                    <span>${escapeHtml(frequency.label)}${frequency.band ? ` • ${escapeHtml(frequency.band)}` : ""}</span>
                    <strong>${escapeHtml(frequency.frequencyMHz)} MHz</strong>
                    <span>${escapeHtml(frequency.description)}${frequency.corrected ? " (corrected military UHF display)" : ""}</span>
                  </div>
                `,
              )
              .join("")}
          </div>
        </article>
      `,
    )
    .join("");
}

function renderProgramOutput(airports) {
  if (!airports.length) {
    programOutput.value = "No airport frequencies to program.";
    return;
  }

  const lines = airports.flatMap((airport) =>
    airport.frequencies.map(
      (frequency) =>
        `${airport.ident} | ${frequency.frequencyMHz} MHz | ${frequency.label}${frequency.band ? ` ${frequency.band}` : ""} | ${frequency.description}`,
    ),
  );

  programOutput.value = lines.join("\n");
}

function renderEmptyState(message) {
  resultsNode.innerHTML = `<article class="empty-state">${escapeHtml(message)}</article>`;
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

function formatAirportType(value) {
  return String(value || "")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

function setStatus({ title, pill, message, state }) {
  summaryTitle.textContent = title;
  statusPill.textContent = pill;
  statusPill.dataset.state = state;
  statusMessage.textContent = message;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
