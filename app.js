const OPENROUTER_API_KEY = "YOUR_OPENROUTER_KEY_HERE";
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const OPENROUTER_MODEL = "meta-llama/llama-3.3-70b-instruct";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STORAGE HELPERS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function getPlayer() {
  const current = getCurrentUser();
  let data;
  try {
    data = JSON.parse(localStorage.getItem("omegaPlayer"));
  } catch {
    return null;
  }
  if (!current || !data || typeof data !== "object") return null;
  if (data.username && data.username.toLowerCase() !== current.toLowerCase()) return null;
  return data;
}

function savePlayer(data) {
  localStorage.setItem("omegaPlayer", JSON.stringify(data));
}

function getCurrentUser() {
  return localStorage.getItem("currentPlayer") || null;
}

function setCurrentUser(username) {
  localStorage.setItem("currentPlayer", username);
}

function getAllPlayers() {
  try {
    return JSON.parse(localStorage.getItem("omegaPlayers")) || {};
  } catch {
    return {};
  }
}

function saveAllPlayers(data) {
  localStorage.setItem("omegaPlayers", JSON.stringify(data));
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// XP SYSTEM
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function awardXP(amount, domains = [], subject = null) {
  const player = getPlayer();
  if (!player) return;
  const oldLevel = player.level;
  player.xp += amount;
  player.level = Math.floor(player.xp / 150) + 1;
  if (domains.length > 0) {
    const per = Math.floor(amount / domains.length);
    domains.forEach((d) => {
      player.domainXP[d] = (player.domainXP[d] || 0) + per;
    });
  }
  if (subject) {
    player.subjectXP[subject] = (player.subjectXP[subject] || 0) + amount;
  }
  savePlayer(player);
  showToast(`⚡ +${amount} XP`, "xp");
  if (player.level > oldLevel) triggerLevelUp(player.level);
  checkAchievements();
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// LEVEL UP OVERLAY
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function triggerLevelUp(level) {
  const titles = {
    1: "学生 Student",
    3: "見習い Apprentice",
    5: "戦士 Warrior",
    8: "侍 Samurai",
    10: "賢者 Sage",
    15: "忍者 Ninja",
    20: "電脳忍者 Cyber Ninja",
    30: "大師 Grand Master",
    50: "神 God",
    75: "Ω OMEGA",
  };
  const title =
    Object.entries(titles)
      .reverse()
      .find(([l]) => level >= Number(l))?.[1] || "学生 Student";
  const overlay = document.createElement("div");
  overlay.className = "levelup-overlay";
  overlay.innerHTML = `
    <div class="levelup-content">
      <div class="levelup-jp">レベルアップ</div>
      <div class="levelup-text">LEVEL UP</div>
      <div class="levelup-num">${level}</div>
      <div class="levelup-title">${title}</div>
    </div>`;
  document.body.appendChild(overlay);
  setTimeout(() => overlay.remove(), 2500);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TOAST SYSTEM
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function showToast(message, type = "success") {
  const container =
    document.getElementById("toast-container") || createToastContainer();
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.classList.add("show"), 10);
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

function createToastContainer() {
  const c = document.createElement("div");
  c.id = "toast-container";
  document.body.appendChild(c);
  return c;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// OPENROUTER API
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async function callArchitect(systemPrompt, history = [], userMessage) {
  const messages = [];

  if (systemPrompt) {
    messages.push({ role: "system", content: systemPrompt });
  }

  history.forEach((msg) => {
    const role = msg.role === "model" ? "assistant" : msg.role;
    const content = msg.parts ? msg.parts[0].text : msg.content;
    messages.push({ role, content });
  });

  messages.push({ role: "user", content: userMessage });

  const response = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + OPENROUTER_API_KEY,
      "HTTP-Referer": "http://127.0.0.1:5500",
      "X-Title": "OMEGA LIFE",
    },
    body: JSON.stringify({
      model: OPENROUTER_MODEL,
      messages: messages,
      max_tokens: 1024,
      temperature: 0.85,
    }),
  });

  const data = await response.json();

  if (data.error) {
    throw new Error(data.error.message || "OpenRouter API error");
  }

  return data.choices[0].message.content;
}

async function callArchitectOnce(prompt) {
  return await callArchitect("", [], prompt);
}

async function fetchSubjectEmoji(subjectName) {
  const safe = String(subjectName || "").trim().slice(0, 120);
  if (!safe) return "📚";
  try {
    const raw = await callArchitectOnce(
      `Return ONLY one single emoji that best represents this academic subject. Nothing else, just the emoji: ${safe}`
    );
    const t = (raw || "").trim();
    const m = t.match(/\p{Extended_Pictographic}/u);
    return m ? m[0] : "📚";
  } catch {
    return "📚";
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ARCHITECT SYSTEM PROMPT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function buildArchitectPrompt() {
  const p = getPlayer();
  if (!p) return "";
  const domainXP = p.domainXP || {};
  const strongest =
    Object.entries(domainXP).sort((a, b) => b[1] - a[1])[0]?.[0] || "none";
  const weakest =
    Object.entries(domainXP).sort((a, b) => a[1] - b[1])[0]?.[0] || "none";
  const recentTasks = (p.taskHistory || [])
    .slice(-5)
    .map((t) => t.name)
    .join(", ");

  let fieldContext = "";
  if (p.lifeField === "school")
    fieldContext = `Grade ${p.grade} at ${p.schoolName}, targeting ${p.dreamCollege}, subjects: ${(p.subjects || []).map((s) => s.name).join(", ")}`;
  else if (p.lifeField === "university")
    fieldContext = `Year ${p.currentYear} of ${p.totalYears} at ${p.universityName}, major: ${p.major}, targeting: ${p.dreamJob || p.businessIdea}`;
  else if (p.lifeField === "job")
    fieldContext = `${p.jobTitle} at ${p.company}, ${p.yearsExp} yrs exp, targeting ${p.dreamJobTitle}`;
  else if (p.lifeField === "retired")
    fieldContext = `Former ${p.previousProfession}, now focused on ${(p.retirementGoals || []).join(", ")}`;

  return `You are ARCHITECT — an AI mentor embedded in OMEGA LIFE, a gamified life operating system. You are blunt, intelligent, and deeply analytical. You do not sugarcoat. Ever. You speak in short, sharp, precise sentences. You are not cruel — you are honest. You address the user as ${p.realName} occasionally for impact. You know everything about them: Age: ${p.age} | Life field: ${p.lifeField} | ${fieldContext} | Self-given title: "${p.title}" | Domain priorities: ${(p.domainPriorities || []).join(", ")} | Biggest struggle: "${p.architectBriefing}" | Level: ${p.level} | XP: ${p.xp} | Streak: ${p.streak} days | Strongest domain: ${strongest} | Weakest domain: ${weakest} | Recent tasks: ${recentTasks}. You help with life advice, study help, math, science, facts, research, routine building, goal setting, mental clarity. You NEVER refuse a genuine question. Respond in the same language the user writes in. Occasionally drop one Japanese word for atmosphere with inline translation. Keep responses concise and impactful. No filler. No cheerleading. You are their most honest advisor. Not their friend. Their ARCHITECT.`;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ACHIEVEMENTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function checkAchievements() {
  const p = getPlayer();
  if (!p) return;
  if (!Array.isArray(p.achievements)) p.achievements = [];

  const unlock = (id, name) => {
    if (!p.achievements.includes(id)) {
      p.achievements.push(id);
      savePlayer(p);
      showToast(`🏆 ACHIEVEMENT UNLOCKED: ${name}`, "success");
    }
  };

  const dt = p.domainsTasked || {};
  if (dt.biological) unlock("body_check", "BODY CHECK");
  if (dt.psychological) unlock("mind_games", "MIND GAMES");
  if (dt.social) unlock("social_animal", "SOCIAL ANIMAL");
  if (dt.economic) unlock("first_coin", "FIRST COIN");
  if (dt.time) unlock("clock_watcher", "CLOCK WATCHER");
  if (dt.creative) unlock("creator", "CREATOR");
  if (dt.existential) unlock("seeker", "SEEKER");

  if (p.tasksCompleted >= 1) unlock("first_blood", "FIRST BLOOD");
  if (p.bossesDefeated >= 1) unlock("boss_slayer", "BOSS SLAYER");
  if (p.streak >= 3) unlock("on_fire", "ON FIRE");
  if (p.streak >= 7) unlock("unstoppable", "UNSTOPPABLE");
  if (p.streak >= 30) unlock("iron_will", "IRON WILL");
  if (p.xp >= 500) unlock("power_surge", "POWER SURGE");
  if (p.level >= 10) unlock("shogun", "SHOGUN");
  if (p.level >= 25) unlock("cyber_god", "電脳神");
  if (p.level >= 50) unlock("omega_rank", "OMEGA");
  if (p.tasksCompleted >= 10) unlock("scholar", "SCHOLAR");

  if (
    p.bossesDefeated >= 1 &&
    (p.bosses || []).find((b) => b.difficulty === "legendary" && b.defeated)
  )
    unlock("legendary_hunter", "LEGENDARY HUNTER");

  const th = p.taskHistory || [];
  const byDay = {};
  th.forEach((t) => {
    const d = new Date(t.completedAt).toDateString();
    byDay[d] = (byDay[d] || 0) + 1;
  });
  if (Object.values(byDay).some((c) => c >= 10))
    unlock("perfect_day", "PERFECT DAY");

  const subjXp = p.subjectXP || {};
  const lvl3Subs = Object.values(subjXp).filter(
    (x) => Math.floor(x / 50) + 1 >= 3
  );
  if (lvl3Subs.length >= 3) unlock("cyber_scholar", "CYBER SCHOLAR");

  const dxp = p.domainXP || {};
  if (Object.values(dxp).some((x) => x >= 450))
    unlock("domain_master", "DOMAIN MASTER");

  const domains = Object.keys(dxp).filter((d) => dxp[d] > 0);
  if (domains.length >= 5) unlock("omega_initiate", "OMEGA INITIATE");
  if (domains.length >= 8) unlock("full_spectrum", "FULL SPECTRUM");

  if (p.trustArchitect) unlock("trust_architect", "TRUST THE ARCHITECT");
  if (p.tacticianUnlocked) unlock("tactician", "TACTICIAN");
  if ((p.monstersResisted || 0) >= 5) unlock("monster_tamer", "MONSTER TAMER");
  if ((p.monstersDefeated || 0) >= 10) unlock("counter_striker", "COUNTER-STRIKER");
  if (p.nightOwlUnlocked) unlock("night_owl", "NIGHT OWL");
  if (p.earlyRiserUnlocked) unlock("early_riser", "EARLY RISER");

  savePlayer(p);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STREAK
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function updateStreak() {
  const p = getPlayer();
  if (!p) return;
  const today = new Date().toDateString();
  const last = p.lastActive;
  if (last === today) return;
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  if (last === yesterday) {
    p.streak = (p.streak || 0) + 1;
  } else {
    p.streak = 1;
  }
  p.lastActive = today;
  p.longestStreak = Math.max(p.longestStreak || 0, p.streak || 0);
  savePlayer(p);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// KANJI DRIFT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function initKanji() {
  const kanji = "電脳人生力夢戦魂道光影命".split("");
  const container = document.createElement("div");
  container.style.cssText =
    "position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0;overflow:hidden;";
  for (let i = 0; i < 12; i++) {
    const el = document.createElement("span");
    el.textContent = kanji[Math.floor(Math.random() * kanji.length)];
    el.style.cssText = `position:absolute;font-family:'Noto Sans JP';font-size:${
      Math.random() * 20 + 12
    }px;color:var(--cyan);opacity:0.06;left:${
      Math.random() * 100
    }%;top:${Math.random() * 100}%;animation:kanjiFloat ${
      Math.random() * 15 + 10
    }s linear infinite;animation-delay:-${Math.random() * 15}s;`;
    container.appendChild(el);
  }
  document.body.appendChild(container);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// KATAKANA RAIN (login page)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const KATAKANA_RAIN_CHARS =
  "アイウエオカキクケコサシスセソタチツテトナニヌネノ".split("");

function initKatakanaRain() {
  const canvas = document.getElementById("katakana-rain");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  let w, h, fontSize, columnCount, speeds, heads, colChars;

  function pickChar() {
    return KATAKANA_RAIN_CHARS[
      Math.floor(Math.random() * KATAKANA_RAIN_CHARS.length)
    ];
  }

  function layout() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    fontSize = 15;
    columnCount = Math.max(1, Math.ceil(w / fontSize));
    speeds = Array.from({ length: columnCount }, () => 0.5 + Math.random() * 2.8);
    heads = Array.from({ length: columnCount }, () => Math.random() * h);
    colChars = Array.from({ length: columnCount }, () => pickChar());
  }

  layout();
  window.addEventListener("resize", layout);

  function frame() {
    ctx.fillStyle = "rgba(7, 8, 15, 0.22)";
    ctx.fillRect(0, 0, w, h);
    ctx.font = `${fontSize}px "Noto Sans JP", sans-serif`;
    ctx.textAlign = "center";
    for (let i = 0; i < columnCount; i++) {
      const x = i * fontSize + fontSize / 2;
      ctx.fillStyle = "rgba(0, 255, 245, 0.15)";
      ctx.fillText(colChars[i], x, heads[i]);
      heads[i] += speeds[i];
      if (heads[i] > h + fontSize) {
        heads[i] = -fontSize * Math.random();
        colChars[i] = pickChar();
      }
    }
    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// LOGIN
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function runLogin() {
  const userEl = document.getElementById("login-username");
  const passEl = document.getElementById("login-password");
  const errEl = document.getElementById("login-error");
  const card = document.getElementById("login-card");
  const btn = document.getElementById("login-submit");

  if (!userEl || !passEl || !errEl) return;

  const user = userEl.value.trim();
  const pass = passEl.value;

  function showError(detail) {
    errEl.innerHTML = `<span class="login-error__line1">ACCESS DENIED // アクセス拒否</span><span class="login-error__line2">${detail}</span>`;
    errEl.classList.remove("is-hidden");
    card?.classList.remove("login-card--shake");
    void card?.offsetWidth;
    card?.classList.add("login-card--shake");
  }

  function clearError() {
    errEl.classList.add("is-hidden");
    errEl.innerHTML = "";
    card?.classList.remove("login-card--shake");
  }

  clearError();

  if (!user || !pass) {
    showError("Fields cannot be empty, soldier.");
    return;
  }

  const all = getAllPlayers();
  let storageKey = null;
  let player = null;

  for (const [k, p] of Object.entries(all)) {
    if (!p || typeof p !== "object") continue;
    const tag = p.username != null ? String(p.username) : k;
    if (tag.toLowerCase() === user.toLowerCase()) {
      storageKey = k;
      player = p;
      break;
    }
  }

  if (!player || storageKey == null) {
    showError("No player found with that tag.");
    return;
  }

  if (player.password !== pass) {
    showError("Wrong password. Try again.");
    return;
  }

  const loginUsername =
    player.username != null ? String(player.username) : storageKey;
  player.username = loginUsername;
  savePlayer(player);
  setCurrentUser(loginUsername);

  if (btn) {
    btn.textContent = "AUTHENTICATED ✓";
    btn.classList.add("btn-login-success");
    btn.disabled = true;
  }

  const redirect =
    localStorage.getItem("redirectAfterLogin") || "dashboard.html";
  localStorage.removeItem("redirectAfterLogin");
  setTimeout(() => {
    window.location.href = redirect;
  }, 500);
}

function initLoginPage() {
  if (!document.getElementById("login-username")) return;

  initKatakanaRain();

  document
    .getElementById("login-toggle-pass")
    ?.addEventListener("click", () => {
      const inp = document.getElementById("login-password");
      if (!inp) return;
      inp.type = inp.type === "password" ? "text" : "password";
    });

  document
    .getElementById("login-submit")
    ?.addEventListener("click", runLogin);

  ["login-username", "login-password"].forEach((id) => {
    document.getElementById(id)?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") runLogin();
    });
  });

  ["login-username", "login-password"].forEach((id) => {
    document.getElementById(id)?.addEventListener("input", () => {
      document.getElementById("login-error")?.classList.add("is-hidden");
      document
        .getElementById("login-card")
        ?.classList.remove("login-card--shake");
    });
  });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HOMEPAGE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function initHomePage() {
  const nav = document.getElementById("site-nav");
  const toggle = nav?.querySelector(".site-nav__toggle");
  if (nav && toggle) {
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    document.querySelectorAll("#site-nav-links a").forEach((a) => {
      a.addEventListener("click", () => {
        if (window.matchMedia("(max-width: 767px)").matches) {
          nav.classList.remove("is-open");
          toggle.setAttribute("aria-expanded", "false");
        }
      });
    });
  }

  document.querySelectorAll(".domain-card").forEach((el) => {
    const di = parseInt(el.getAttribute("data-domain-index"), 10);
    if (!Number.isNaN(di)) el.style.setProperty("--di", String(di));
    const obs = new IntersectionObserver(
      (entries, o) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add("is-visible");
            o.unobserve(en.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );
    obs.observe(el);
  });

  const grid = document.getElementById("leaderboard-grid");
  if (!grid) return;

  const all = getAllPlayers();
  const rows = Object.entries(all)
    .map(([username, raw]) => {
      const data =
        raw && typeof raw === "object" ? { ...raw, username } : { username };
      return data;
    })
    .sort((a, b) => (b.xp || 0) - (a.xp || 0));

  const top = rows.slice(0, 3);
  const ghostCount = Math.max(0, 3 - top.length);
  const rankNeon = ["var(--yellow)", "var(--cyan)", "var(--pink)"];

  grid.replaceChildren();

  top.forEach((p, i) => {
    const card = document.createElement("article");
    card.className = "leader-card card";
    card.innerHTML = `
      <div class="leader-card__rank font-orbitron" style="color:${rankNeon[i]}">${i + 1}</div>
      <div class="leader-card__avatar">${p.avatar || "🎮"}</div>
      <div class="leader-card__body">
        <div class="leader-card__tag font-orbitron">${p.title || p.realName || p.username || "???"}</div>
        <div class="leader-card__meta muted">LV ${p.level ?? 1} · ${p.xp ?? 0} XP</div>
      </div>`;
    grid.appendChild(card);
  });

  for (let g = 0; g < ghostCount; g++) {
    const card = document.createElement("article");
    card.className = "leader-card leader-card--ghost card";
    card.innerHTML = `
      <div class="leader-card__rank font-orbitron">?</div>
      <div class="leader-card__avatar">👤</div>
      <div class="leader-card__body">
        <div class="leader-card__tag font-orbitron">???</div>
        <div class="leader-card__meta muted">LV ??? · ??? XP</div>
      </div>`;
    grid.appendChild(card);
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DASHBOARD INIT (legacy stub)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function initDashboardPage() {
  const levelEl = document.getElementById("dash-level");
  if (!levelEl) return;
  const p = getPlayer();
  if (p) {
    const xpEl = document.getElementById("dash-xp");
    const streakEl = document.getElementById("dash-streak");
    const emptyEl = document.getElementById("dash-empty");
    if (emptyEl) emptyEl.style.display = "none";
    levelEl.textContent = String(p.level ?? 1);
    if (xpEl) xpEl.textContent = String(p.xp ?? 0);
    if (streakEl) streakEl.textContent = String(p.streak ?? 0);
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ARCHITECT PAGE INIT (legacy stub)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function initArchitectPage() {
  // Full logic is handled inline in architect.html
  // This stub exists so DOMContentLoaded doesn't throw
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DOM READY
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

document.addEventListener("DOMContentLoaded", () => {
  document.body.classList.add("loaded");
  initKanji();
  updateStreak();
  initHomePage();
  initLoginPage();
  initDashboardPage();
  initArchitectPage();
});
