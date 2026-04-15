const http = require("http");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");

function setCors(req, res) {
  // Allow static frontend hosts (e.g., GitHub Pages) to call this API.
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Max-Age", "86400");
}

function loadDotEnv(filePath) {
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    raw.split(/\r?\n/).forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) return;
      const eq = trimmed.indexOf("=");
      if (eq <= 0) return;
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed.slice(eq + 1).trim();
      if (!process.env[key]) process.env[key] = value;
    });
  } catch (_) {}}

loadDotEnv(path.join(__dirname, ".env"));

const ROOT_DIR = __dirname;
const PORT = process.env.PORT || 3000;
const GROQ_API_KEY = process.env.GROQ_API_KEY || "";
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.1-8b-instant";

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
};

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
  });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 1_000_000) {
        reject(new Error("Payload too large"));
        req.destroy();
      }
    });
    req.on("end", () => resolve(raw));
    req.on("error", reject);
  });
}

function toSafeHistory(history) {
  if (!Array.isArray(history)) return [];
  return history.map((m) => {
    const role = m && m.role === "model" ? "assistant" : (m && m.role) || "user";
    const content = Array.isArray(m && m.parts)
      ? m.parts.map((p) => p && p.text).filter(Boolean).join("\n")
      : "";
    return { role, content };
  });
}

async function callGroq(messages, maxTokens, temperature) {
  if (!GROQ_API_KEY) {
    throw new Error("Server missing GROQ_API_KEY");
  }

  const response = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages,
      max_tokens: maxTokens,
      temperature,
    }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    const message = errData && errData.error && errData.error.message;
    throw new Error(message || `Groq request failed (${response.status})`);
  }

  const data = await response.json();
  const text = data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
  if (!text) throw new Error("Empty response");
  return text;
}

async function handleArchitectApi(req, res) {
  let parsed;
  try {
    const raw = await readBody(req);
    parsed = raw ? JSON.parse(raw) : {};
  } catch (err) {
    return sendJson(res, 400, { error: "Invalid JSON body" });
  }

  try {
    const mode = String(parsed.mode || "");
    let text = "";

    if (mode === "chat") {
      const messages = [
        { role: "system", content: String(parsed.systemPrompt || "") },
        ...toSafeHistory(parsed.history),
        { role: "user", content: String(parsed.userMessage || "") },
      ];
      text = await callGroq(messages, 1024, 0.85);
    } else if (mode === "once") {
      const messages = [{ role: "user", content: String(parsed.prompt || "") }];
      const maxTokens = Number(parsed.maxOutputTokens) || 128;
      text = await callGroq(messages, maxTokens, 0.6);
    } else if (mode === "text") {
      const messages = [{ role: "user", content: String(parsed.prompt || "") }];
      const maxTokens = Number(parsed.maxOutputTokens) || 1024;
      text = await callGroq(messages, maxTokens, 0.75);
    } else {
      return sendJson(res, 400, { error: "Invalid mode" });
    }

    return sendJson(res, 200, { text });
  } catch (err) {
    return sendJson(res, 502, { error: String(err && err.message ? err.message : err) });
  }
}

function resolvePath(urlPathname) {
  const pathname = decodeURIComponent(urlPathname);
  const cleanPath = pathname === "/" ? "/index.html" : pathname;
  const absolutePath = path.resolve(ROOT_DIR, `.${cleanPath}`);
  if (!absolutePath.startsWith(ROOT_DIR)) return null;
  return absolutePath;
}

function serveStatic(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const absolutePath = resolvePath(url.pathname);
  if (!absolutePath) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.readFile(absolutePath, (err, data) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Not Found");
      return;
    }
    const ext = path.extname(absolutePath).toLowerCase();
    res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
    res.end(data);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  setCors(req, res);
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/health") {
    return sendJson(res, 200, { ok: true, keyConfigured: Boolean(GROQ_API_KEY) });
  }

  if (req.method === "POST" && url.pathname === "/api/architect") {
    return handleArchitectApi(req, res);
  }

  if (req.method === "GET") {
    return serveStatic(req, res);
  }

  res.writeHead(405, { "Content-Type": "text/plain; charset=utf-8" });
  res.end("Method Not Allowed");
});

server.listen(PORT, () => {
  console.log(`Omega Life running at http://localhost:${PORT}`);
});
