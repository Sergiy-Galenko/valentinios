"use strict";

const ui = {
  summaryCards: document.getElementById("summaryCards"),
  visitsBody: document.getElementById("visitsBody"),
  searchInput: document.getElementById("searchInput"),
  refreshButton: document.getElementById("refreshButton"),
  statusText: document.getElementById("statusText"),
  lastUpdated: document.getElementById("lastUpdated"),
};

const state = {
  visits: [],
  summary: {},
  refreshTimer: null,
};

init();

function init() {
  ui.refreshButton.addEventListener("click", () => {
    loadVisits();
  });

  ui.searchInput.addEventListener("input", () => {
    renderTable();
  });

  loadVisits();
  state.refreshTimer = window.setInterval(loadVisits, 15000);
  window.addEventListener("beforeunload", () => {
    if (state.refreshTimer) window.clearInterval(state.refreshTimer);
  });
}

async function loadVisits() {
  setStatus("Оновлюю дані...", false);
  ui.refreshButton.disabled = true;

  try {
    const response = await fetch("/api/admin/visits?limit=500", { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const payload = await response.json();
    state.visits = Array.isArray(payload.visits) ? payload.visits : [];
    state.summary = payload.summary && typeof payload.summary === "object" ? payload.summary : {};

    renderSummary();
    renderTable();

    const updatedAt = payload.generatedAt ? new Date(payload.generatedAt) : new Date();
    ui.lastUpdated.textContent = `Останнє оновлення: ${updatedAt.toLocaleString()}`;
    setStatus(`Показано записів: ${state.visits.length}`, false);
  } catch (error) {
    setStatus("Не вдалося завантажити дані. Перевір сервер.", true);
  } finally {
    ui.refreshButton.disabled = false;
  }
}

function renderSummary() {
  const total = Number(state.summary.total || 0);
  const uniqueIps = Number(state.summary.uniqueIps || 0);
  const last24h = Number(state.summary.last24h || 0);
  const devices = state.summary.devices || {};

  const topCountry = formatTopItem(state.summary.topCountries);
  const topBrowser = formatTopItem(state.summary.topBrowsers);
  const deviceLine = [
    `Mobile: ${devices.Mobile || 0}`,
    `Desktop: ${devices.Desktop || 0}`,
    `Tablet: ${devices.Tablet || 0}`,
    `Bot: ${devices.Bot || 0}`,
  ].join(" • ");

  const cards = [
    {
      title: "Всього відвідувань",
      value: String(total),
      extra: `Топ країна: ${topCountry}`,
    },
    {
      title: "Унікальні IP",
      value: String(uniqueIps),
      extra: "Оцінка унікальних підключень",
    },
    {
      title: "За 24 години",
      value: String(last24h),
      extra: `Топ браузер: ${topBrowser}`,
    },
    {
      title: "Типи пристроїв",
      value: "Devices",
      extra: deviceLine,
    },
  ];

  ui.summaryCards.innerHTML = cards
    .map(
      (card) => `
        <article class="summary-card">
          <h3>${escapeHtml(card.title)}</h3>
          <p class="summary-value">${escapeHtml(card.value)}</p>
          <p class="summary-extra">${escapeHtml(card.extra)}</p>
        </article>
      `
    )
    .join("");
}

function renderTable() {
  const query = ui.searchInput.value.trim().toLowerCase();
  const visibleRows = state.visits.filter((row) => matchesSearch(row, query));

  if (visibleRows.length === 0) {
    ui.visitsBody.innerHTML = `
      <tr class="admin-empty-row">
        <td colspan="7">Немає даних для відображення.</td>
      </tr>
    `;
    return;
  }

  ui.visitsBody.innerHTML = visibleRows
    .map((row) => {
      const when = row.timestamp ? new Date(row.timestamp).toLocaleString() : "-";
      const geo = [row.country || "Unknown", row.city || "", row.region || ""].filter(Boolean).join(", ");
      const browserOs = [row.browser || "Unknown", row.os || "Unknown"].join(" / ");
      const referrer = row.referrer ? truncate(row.referrer, 60) : "Direct";
      const path = row.path || "/";
      const device = row.deviceType || "Unknown";
      const langTz = [row.language || "-", row.timezone || "-"].join(" • ");
      const viewport = [row.screen || "-", row.viewport || "-"].join(" / ");

      return `
        <tr>
          <td>${escapeHtml(when)}</td>
          <td>${escapeHtml(row.ip || "-")}</td>
          <td>${escapeHtml(geo || "Unknown")}</td>
          <td>
            <span class="device-pill">${escapeHtml(device)}</span>
            <span class="meta-small">${escapeHtml(viewport)}</span>
          </td>
          <td>
            ${escapeHtml(browserOs)}
            <span class="meta-small">${escapeHtml(langTz)}</span>
          </td>
          <td>${escapeHtml(path)}</td>
          <td title="${escapeHtml(row.referrer || "")}">${escapeHtml(referrer)}</td>
        </tr>
      `;
    })
    .join("");
}

function matchesSearch(row, query) {
  if (!query) return true;

  const source = [
    row.ip,
    row.country,
    row.city,
    row.region,
    row.deviceType,
    row.browser,
    row.os,
    row.path,
    row.referrer,
    row.language,
    row.timezone,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return source.includes(query);
}

function setStatus(text, isError) {
  ui.statusText.textContent = text;
  ui.statusText.classList.toggle("error", Boolean(isError));
}

function formatTopItem(items) {
  if (!Array.isArray(items) || items.length === 0) return "—";
  return `${items[0].label} (${items[0].value})`;
}

function truncate(value, maxLength) {
  const text = String(value || "");
  return text.length > maxLength ? `${text.slice(0, maxLength - 1)}…` : text;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
