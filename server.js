"use strict";

const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const HOST = "0.0.0.0";
const PORT = Number(process.env.PORT || 3000);
const ROOT_DIR = __dirname;
const DATA_DIR = path.join(ROOT_DIR, "data");
const VISITS_FILE = path.join(DATA_DIR, "visits.json");
const MAX_VISITS = 2500;

const GEO_CACHE = new Map();
const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp",
};
const ALLOWED_STATIC_EXT = new Set(Object.keys(MIME_TYPES));

ensureDataStore();
let visits = readVisitsFromDisk();

const server = http.createServer(async (req, res) => {
  try {
    const host = req.headers.host || `localhost:${PORT}`;
    const url = new URL(req.url || "/", `http://${host}`);
    const pathname = decodeURIComponent(url.pathname);

    if (pathname === "/api/track" && req.method === "POST") {
      await handleTrack(req, res);
      return;
    }

    if (pathname === "/api/admin/visits" && req.method === "GET") {
      handleAdminVisits(req, res, url);
      return;
    }

    if (pathname === "/new" || pathname === "/new/") {
      serveFile(res, path.join(ROOT_DIR, "admin.html"));
      return;
    }

    if (pathname === "/" || pathname === "/index.html") {
      serveFile(res, path.join(ROOT_DIR, "index.html"));
      return;
    }

    const staticFilePath = resolveStaticPath(pathname);
    if (staticFilePath) {
      serveFile(res, staticFilePath);
      return;
    }

    // SPA fallback
    serveFile(res, path.join(ROOT_DIR, "index.html"));
  } catch (error) {
    sendJson(res, 500, { ok: false, error: "internal_error" });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

function ensureDataStore() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(VISITS_FILE)) {
    fs.writeFileSync(VISITS_FILE, "[]", "utf8");
  }
}

function readVisitsFromDisk() {
  try {
    const raw = fs.readFileSync(VISITS_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persistVisits() {
  try {
    fs.writeFileSync(VISITS_FILE, JSON.stringify(visits, null, 2), "utf8");
  } catch (error) {
    console.error("Failed to persist visits:", error);
  }
}

function resolveStaticPath(pathname) {
  const relative = pathname.replace(/^\/+/, "");
  if (!relative) return null;

  const resolved = path.resolve(ROOT_DIR, relative);
  if (!resolved.startsWith(ROOT_DIR)) return null;
  if (!fs.existsSync(resolved) || !fs.statSync(resolved).isFile()) return null;

  const ext = path.extname(resolved).toLowerCase();
  if (!ALLOWED_STATIC_EXT.has(ext)) return null;

  return resolved;
}

async function handleTrack(req, res) {
  const body = await readJsonBody(req);
  const ip = getClientIp(req);
  const userAgent = req.headers["user-agent"] || "Unknown";
  const userInfo = parseUserAgent(userAgent);
  const geo = await resolveGeo(ip, req.headers["cf-ipcountry"]);

  const record = {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    ip,
    country: geo.country,
    region: geo.region,
    city: geo.city,
    deviceType: userInfo.deviceType,
    browser: userInfo.browser,
    os: userInfo.os,
    isBot: userInfo.isBot,
    path: sanitizeText(body.path, 300),
    referrer: sanitizeText(body.referrer, 500),
    language: sanitizeText(body.language, 30),
    screen: sanitizeText(body.screen, 30),
    viewport: sanitizeText(body.viewport, 30),
    timezone: sanitizeText(body.timezone, 80),
    userAgent,
  };

  visits.unshift(record);
  if (visits.length > MAX_VISITS) visits.length = MAX_VISITS;
  persistVisits();

  sendJson(res, 201, { ok: true });
}

function handleAdminVisits(req, res, url) {
  const limitRaw = Number(url.searchParams.get("limit") || 250);
  const limit = Number.isFinite(limitRaw) ? clamp(limitRaw, 1, 1000) : 250;
  const slice = visits.slice(0, limit);

  sendJson(res, 200, {
    ok: true,
    generatedAt: new Date().toISOString(),
    summary: buildSummary(visits),
    visits: slice,
  });
}

async function resolveGeo(ip, cfCountryCode) {
  if (!ip || isPrivateIp(ip)) {
    return { country: "Local", region: "", city: "" };
  }

  if (cfCountryCode && typeof cfCountryCode === "string" && cfCountryCode !== "XX") {
    return { country: cfCountryCode, region: "", city: "" };
  }

  if (GEO_CACHE.has(ip)) {
    return GEO_CACHE.get(ip);
  }

  const fallback = { country: "Unknown", region: "", city: "" };

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2200);
    const response = await fetch(`https://ipwho.is/${encodeURIComponent(ip)}`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) {
      GEO_CACHE.set(ip, fallback);
      return fallback;
    }

    const data = await response.json();
    const result =
      data && data.success !== false
        ? {
            country: data.country || "Unknown",
            region: data.region || "",
            city: data.city || "",
          }
        : fallback;

    GEO_CACHE.set(ip, result);
    return result;
  } catch {
    GEO_CACHE.set(ip, fallback);
    return fallback;
  }
}

function parseUserAgent(userAgent) {
  const ua = String(userAgent || "");
  const uaLower = ua.toLowerCase();
  const isBot = /bot|crawler|spider|slurp|bingpreview|headless|curl|wget/i.test(ua);

  let browser = "Unknown";
  if (/edg\//i.test(ua)) browser = "Edge";
  else if (/opr\//i.test(ua) || /opera/i.test(ua)) browser = "Opera";
  else if (/samsungbrowser/i.test(ua)) browser = "Samsung Internet";
  else if (/chrome\//i.test(ua)) browser = "Chrome";
  else if (/firefox\//i.test(ua)) browser = "Firefox";
  else if (/safari\//i.test(ua) && !/chrome\//i.test(ua)) browser = "Safari";

  let os = "Unknown";
  if (/windows nt/i.test(ua)) os = "Windows";
  else if (/android/i.test(ua)) os = "Android";
  else if (/iphone|ipad|ipod/i.test(ua)) os = "iOS";
  else if (/mac os x/i.test(ua)) os = "macOS";
  else if (/linux/i.test(ua)) os = "Linux";

  let deviceType = "Desktop";
  if (isBot) deviceType = "Bot";
  else if (/ipad|tablet|playbook|silk|android(?!.*mobile)/i.test(uaLower)) deviceType = "Tablet";
  else if (/mobi|iphone|ipod|android/i.test(uaLower)) deviceType = "Mobile";

  return { browser, os, deviceType, isBot };
}

function buildSummary(records) {
  const total = records.length;
  const uniqueIps = new Set(records.map((item) => item.ip || "unknown")).size;

  const now = Date.now();
  const last24h = records.filter((item) => now - Date.parse(item.timestamp || 0) <= 24 * 60 * 60 * 1000).length;

  const devices = countBy(records, (item) => item.deviceType || "Unknown");
  const countries = countBy(records, (item) => item.country || "Unknown");
  const browsers = countBy(records, (item) => item.browser || "Unknown");

  return {
    total,
    uniqueIps,
    last24h,
    devices,
    topCountries: topEntries(countries, 5),
    topBrowsers: topEntries(browsers, 5),
  };
}

function countBy(items, keySelector) {
  const result = {};
  for (const item of items) {
    const key = keySelector(item);
    result[key] = (result[key] || 0) + 1;
  }
  return result;
}

function topEntries(counter, limit) {
  return Object.entries(counter)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([label, value]) => ({ label, value }));
}

function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  let ip = "";

  if (typeof forwarded === "string" && forwarded.length > 0) {
    ip = forwarded.split(",")[0].trim();
  } else if (req.socket && req.socket.remoteAddress) {
    ip = req.socket.remoteAddress.trim();
  }

  if (ip.startsWith("::ffff:")) ip = ip.slice(7);
  if (ip === "::1") ip = "127.0.0.1";
  return ip || "unknown";
}

function isPrivateIp(ip) {
  if (!ip) return true;
  if (ip === "127.0.0.1" || ip === "0.0.0.0") return true;
  if (ip.startsWith("10.")) return true;
  if (ip.startsWith("192.168.")) return true;
  if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(ip)) return true;
  if (ip.startsWith("169.254.")) return true;

  if (ip.includes(":")) {
    const lower = ip.toLowerCase();
    if (lower === "::1") return true;
    if (lower.startsWith("fc") || lower.startsWith("fd")) return true;
    if (lower.startsWith("fe80")) return true;
  }

  return false;
}

function sanitizeText(value, maxLength) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function sendJson(res, statusCode, data) {
  const body = JSON.stringify(data);
  res.writeHead(statusCode, {
    "Cache-Control": "no-store",
    "Content-Length": Buffer.byteLength(body),
    "Content-Type": "application/json; charset=utf-8",
  });
  res.end(body);
}

function serveFile(res, filePath) {
  try {
    const ext = path.extname(filePath).toLowerCase();
    const mimeType = MIME_TYPES[ext] || "application/octet-stream";
    const content = fs.readFileSync(filePath);
    res.writeHead(200, {
      "Cache-Control": ext === ".html" ? "no-cache" : "public, max-age=300",
      "Content-Length": content.length,
      "Content-Type": mimeType,
    });
    res.end(content);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
  }
}

function readJsonBody(req) {
  return new Promise((resolve) => {
    let raw = "";

    req.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 1_000_000) req.destroy();
    });

    req.on("end", () => {
      try {
        const parsed = raw ? JSON.parse(raw) : {};
        resolve(parsed && typeof parsed === "object" ? parsed : {});
      } catch {
        resolve({});
      }
    });

    req.on("error", () => resolve({}));
  });
}
