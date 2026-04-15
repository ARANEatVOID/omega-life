(function () {
  "use strict";

  const DOMAINS = [
    { id: "biological", icon: "⚡", label: "Biological", color: "#00ff9f" },
    { id: "psychological", icon: "🧠", label: "Psychological", color: "#b44fff" },
    { id: "social", icon: "👥", label: "Social", color: "#00fff5" },
    { id: "academic", icon: "📚", label: "Academic", color: "#d4ff00" },
    { id: "economic", icon: "💴", label: "Economic", color: "#ff8c00" },
    { id: "time", icon: "⏱️", label: "Time / Productivity", color: "#ff2d78" },
    { id: "creative", icon: "🎨", label: "Creative", color: "#ff6ec7" },
    { id: "existential", icon: "🔮", label: "Existential", color: "#a0a0ff" },
  ];

  const SUBFIELDS = {
    biological: ["Health", "Growth", "Maintenance", "Energy"],
    psychological: ["Cognition", "Emotion", "Identity", "Habits"],
    social: ["Family", "Friendships", "Romantic", "Society"],
    academic: ["Learning", "Performance", "Skill Building", "Curiosity"],
    economic: ["Income", "Expenses", "Assets", "Opportunities"],
    time: ["Planning", "Execution", "Procrastination", "Efficiency"],
    creative: ["Art", "Writing", "Music", "Innovation"],
    existential: ["Purpose", "Goals", "Philosophy", "Legacy"],
  };

  const EST_MS = {
    "5min": 300000,
    "15min": 900000,
    "30min": 1800000,
    "1hr": 3600000,
    "2hr": 7200000,
    "3hr+": 10800000,
  };

  const BOSS_XP = { easy: 50, normal: 100, hard: 200, legendary: 500 };

  const MONSTER_DEFS = [
    { emoji: "🐉", name: "YouTube Dragon", tag: "Drains 2 hours minimum" },
    { emoji: "🌸", name: "Anime Specter", tag: '"Just one more episode..."' },
    { emoji: "📱", name: "Scroll Demon", tag: "Infinite feed, zero progress" },
    { emoji: "🎮", name: "Game Wraith", tag: "One match becomes five" },
    { emoji: "💬", name: "Chat Phantom", tag: "Replies that lead nowhere" },
    { emoji: "😴", name: "Sleep Leech", tag: "The nap that lasts 3 hours" },
  ];

  const MOTIVATION_QUOTES = [
    "Your competition didn't take a break today. Did you?",
    "The exam doesn't care about your feelings.",
    "Every hour you waste is an hour your rival is ahead.",
    "Stop waiting for motivation. It doesn't live here anymore.",
    "Your future self is watching. Don't embarrass him.",
    "Mediocrity is a choice. So is greatness. Choose.",
    "Failure is not an option — it's your current reality. Change it.",
    "Life has no pause button. Neither does your enemy.",
  ];

  const DAILY_QUOTES = MOTIVATION_QUOTES;

  const ACHIEVEMENTS_UI = [
    { id: "first_blood", icon: "🌅", name: "FIRST BLOOD", desc: "Complete your first task" },
    { id: "boss_slayer", icon: "⚔️", name: "BOSS SLAYER", desc: "Defeat your first boss" },
    { id: "legendary_hunter", icon: "💀", name: "LEGENDARY HUNTER", desc: "Defeat a LEGENDARY boss" },
    { id: "scholar", icon: "📖", name: "SCHOLAR", desc: "Complete 10 tasks" },
    { id: "perfect_day", icon: "🎯", name: "PERFECT DAY", desc: "10 tasks in one day" },
    { id: "cyber_scholar", icon: "🌐", name: "CYBER SCHOLAR", desc: "3 subjects at level 3+" },
    { id: "body_check", icon: "🧬", name: "BODY CHECK", desc: "First Biological task" },
    { id: "mind_games", icon: "🧠", name: "MIND GAMES", desc: "First Psychological task" },
    { id: "social_animal", icon: "👥", name: "SOCIAL ANIMAL", desc: "First Social task" },
    { id: "first_coin", icon: "💴", name: "FIRST COIN", desc: "First Economic task" },
    { id: "clock_watcher", icon: "⏱️", name: "CLOCK WATCHER", desc: "First Time task" },
    { id: "creator", icon: "🎨", name: "CREATOR", desc: "First Creative task" },
    { id: "seeker", icon: "🔮", name: "SEEKER", desc: "First Existential task" },
    { id: "omega_initiate", icon: "🌐", name: "OMEGA INITIATE", desc: "XP in 5 domains" },
    { id: "full_spectrum", icon: "👁️", name: "FULL SPECTRUM", desc: "All 8 domains" },
    { id: "domain_master", icon: "🏯", name: "DOMAIN MASTER", desc: "450+ XP in a domain" },
    { id: "on_fire", icon: "🔥", name: "ON FIRE", desc: "3-day streak" },
    { id: "unstoppable", icon: "⚡", name: "UNSTOPPABLE", desc: "7-day streak" },
    { id: "iron_will", icon: "💎", name: "IRON WILL", desc: "30-day streak" },
    { id: "power_surge", icon: "⚡", name: "POWER SURGE", desc: "500 XP earned" },
    { id: "shogun", icon: "🏯", name: "SHOGUN", desc: "Level 10" },
    { id: "cyber_god", icon: "👑", name: "電脳神", desc: "Level 25" },
    { id: "omega_rank", icon: "Ω", name: "OMEGA", desc: "Level 50" },
    { id: "trust_architect", icon: "🤖", name: "TRUST THE ARCHITECT", desc: "Anti-cheat honest" },
    { id: "tactician", icon: "📅", name: "TACTICIAN", desc: "Lock a full plan" },
    { id: "monster_tamer", icon: "👾", name: "MONSTER TAMER", desc: "Resist 5 monsters" },
    { id: "counter_striker", icon: "💪", name: "COUNTER-STRIKER", desc: "10 counter-attacks" },
    { id: "night_owl", icon: "🌙", name: "NIGHT OWL", desc: "Task after 11PM" },
    { id: "early_riser", icon: "🌅", name: "EARLY RISER", desc: "Task before 7AM" },
  ];

  let quoteIndex = 0;
  let monsterInterval = null;
  let pendingAnticheatTask = null;
  let plannerDate = null;
  let plannerBlocks = [];
  let taskForm = { xp: 25, time: "15min", priority: "MEDIUM", secondaries: new Set() };

  function calcLevelProgress(totalXP) {
    if (typeof levelFromXP === "function") return levelFromXP(totalXP);
    const fallbackXP = Math.max(0, Number(totalXP) || 0);
    return {
      level: Math.floor(fallbackXP / 150) + 1,
      currentLevelXP: fallbackXP % 150,
      nextLevelXP: 150,
    };
  }

  function domainById(id) {
    return DOMAINS.find((d) => d.id === id) || DOMAINS[0];
  }

  function ensurePlayer(p) {
    if (!p.domainXP) p.domainXP = {};
    DOMAINS.forEach((d) => {
      if (p.domainXP[d.id] == null) p.domainXP[d.id] = 0;
    });
    p.tasks = Array.isArray(p.tasks) ? p.tasks : [];
    p.bosses = Array.isArray(p.bosses) ? p.bosses : [];
    p.taskHistory = Array.isArray(p.taskHistory) ? p.taskHistory : [];
    p.taskTemplates = Array.isArray(p.taskTemplates) ? p.taskTemplates : [];
    p.bossTemplates = Array.isArray(p.bossTemplates) ? p.bossTemplates : [];
    p.planHistory = p.planHistory && typeof p.planHistory === "object" ? p.planHistory : {};
    p.subjectXP = p.subjectXP && typeof p.subjectXP === "object" ? p.subjectXP : {};
    p.achievements = Array.isArray(p.achievements) ? p.achievements : [];
    p.domainsTasked = p.domainsTasked && typeof p.domainsTasked === "object" ? p.domainsTasked : {};
    p.monstersResisted = p.monstersResisted || 0;
    p.monstersDefeated = p.monstersDefeated || 0;
    p.longestStreak = p.longestStreak || p.streak || 0;
    p.tasksCompleted = p.tasksCompleted ?? 0;
    p.bossesDefeated = p.bossesDefeated ?? 0;
    return p;
  }

  function syncPlayerToStore(p) {
    const u = getCurrentUser();
    if (!u) return;
    p = ensurePlayer(p);
    savePlayer(p);
    const all = getAllPlayers();
    if (all[u]) {
      all[u] = JSON.parse(JSON.stringify(p));
      saveAllPlayers(all);
    }
  }

  function rankTitleForLevel(level) {
    const t = {
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
    return (
      Object.entries(t)
        .reverse()
        .find(([l]) => level >= Number(l))?.[1] || "学生 Student"
    );
  }

  function lifeBadge(p) {
    if (p.lifeField === "school")
      return `🏫 Grade ${p.grade || "?"} · ${p.schoolName || "School"}`;
    if (p.lifeField === "university")
      return `🎓 Year ${p.currentYear || "?"} · ${p.universityName || "Uni"}`;
    if (p.lifeField === "job")
      return `💼 ${p.jobTitle || "Role"} · ${p.company || "Co"}`;
    if (p.lifeField === "retired") return `🌅 Retired · ${p.previousProfession || "—"}`;
    return "FIELD UNKNOWN";
  }

  function strongestDomain(p) {
    const dx = p.domainXP || {};
    let best = "academic";
    let mx = -1;
    Object.entries(dx).forEach(([k, v]) => {
      if (v > mx) {
        mx = v;
        best = k;
      }
    });
    return domainById(mx < 0 ? "academic" : best);
  }

  function drawRadar(canvas, size) {
    if (!canvas) return;
    const p = ensurePlayer(getPlayer() || {});
    const ctx = canvas.getContext("2d");
    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const R = Math.min(w, h) * 0.38;
    const order = DOMAINS.map((d) => d.id);
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = "rgba(0,255,245,0.25)";
    ctx.lineWidth = 1;
    for (let ring = 1; ring <= 4; ring++) {
      ctx.beginPath();
      const r = (R * ring) / 4;
      for (let i = 0; i <= order.length; i++) {
        const a = (Math.PI * 2 * i) / order.length - Math.PI / 2;
        const x = cx + Math.cos(a) * r;
        const y = cy + Math.sin(a) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();
    }
    const pts = [];
    order.forEach((id, i) => {
      const a = (Math.PI * 2 * i) / order.length - Math.PI / 2;
      const v = Math.min((p.domainXP[id] || 0) / 250, 1);
      const r = R * v;
      pts.push({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r, id });
    });
    ctx.beginPath();
    pts.forEach((pt, i) => (i === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y)));
    ctx.closePath();
    ctx.fillStyle = "rgba(0,255,245,0.12)";
    ctx.fill();
    ctx.strokeStyle = "var(--cyan)";
    ctx.stroke();
    order.forEach((id, i) => {
      const a = (Math.PI * 2 * i) / order.length - Math.PI / 2;
      const x = cx + Math.cos(a) * (R + 14);
      const y = cy + Math.sin(a) * (R + 14);
      const d = domainById(id);
      ctx.font = "12px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "rgba(232,232,255,0.85)";
      ctx.fillText(d.icon, x, y);
    });
  }

  function startOfToday() {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t.getTime();
  }

  function renderSidebar() {
    const p = ensurePlayer(getPlayer() || {});
    const sd = strongestDomain(p);
    const ring = document.getElementById("dash-avatar-ring");
    if (ring) {
      ring.style.borderColor = sd.color;
      ring.style.boxShadow = `0 0 18px ${sd.color}55`;
    }
    const em = document.getElementById("dash-avatar-emoji");
    if (em) em.textContent = p.avatar || "🎮";
    const rn = document.getElementById("dash-realname");
    if (rn) rn.textContent = p.realName || "";
    const pt = document.getElementById("dash-playertag");
    if (pt) pt.textContent = "@" + (p.username || getCurrentUser() || "");
    const td = document.getElementById("dash-title-display");
    if (td) td.textContent = p.title || "—";
    const lb = document.getElementById("dash-life-badge");
    if (lb) lb.textContent = lifeBadge(p);
    const ln = document.getElementById("dash-level-num");
    if (ln) ln.textContent = String(p.level ?? 1);
    const rt = document.getElementById("dash-rank-title");
    if (rt) rt.textContent = rankTitleForLevel(p.level ?? 1);
    const progress = calcLevelProgress(p.xp || 0);
    const xf = document.getElementById("dash-xp-frac");
    if (xf) xf.textContent = `${progress.currentLevelXP} / ${progress.nextLevelXP}`;
    const fill = document.getElementById("dash-xp-fill");
    if (fill)
      fill.style.width = `${Math.min(
        100,
        (progress.currentLevelXP / Math.max(1, progress.nextLevelXP)) * 100
      )}%`;
    document.getElementById("dash-streak-val").textContent = String(p.streak ?? 0);
    document.getElementById("dash-boss-val").textContent = String(p.bossesDefeated ?? 0);
    document.getElementById("dash-task-val").textContent = String(p.tasksCompleted ?? 0);
    drawRadar(document.getElementById("dash-radar-canvas"), 200);
    const sc = document.getElementById("dash-subject-chips");
    if (sc) {
      sc.innerHTML = "";
      (p.subjects || []).forEach((s) => {
        const el = document.createElement("span");
        el.className = "dash-subject-chip";
        el.textContent = `${s.emoji || "📚"} ${s.name}`;
        sc.appendChild(el);
      });
    }
    const day = Math.floor(Date.now() / 86400000) % DAILY_QUOTES.length;
    const sq = document.getElementById("dash-sidebar-quote");
    if (sq) {
      sq.textContent = DAILY_QUOTES[day];
      sq.className = "italic";
    }
  }

  function rotateQuote() {
    const el = document.getElementById("motivation-quote");
    if (!el) return;
    el.style.opacity = "0";
    setTimeout(() => {
      quoteIndex = (quoteIndex + 1) % MOTIVATION_QUOTES.length;
      el.textContent = MOTIVATION_QUOTES[quoteIndex];
      el.style.opacity = "1";
    }, 400);
  }

  function wireTitleEdit() {
    const disp = document.getElementById("dash-title-display");
    const btn = document.getElementById("dash-title-edit-btn");
    const wrap = document.getElementById("dash-title-input-wrap");
    const inp = document.getElementById("dash-title-input");
    const commit = () => {
      const p = ensurePlayer(getPlayer());
      if (!p) return;
      p.title = inp.value.trim() || p.title;
      syncPlayerToStore(p);
      disp.textContent = p.title;
      wrap.classList.add("is-hidden");
    };
    const open = () => {
      const p = getPlayer();
      inp.value = p?.title || "";
      wrap.classList.remove("is-hidden");
      inp.focus();
    };
    btn?.addEventListener("click", open);
    disp?.addEventListener("click", open);
    inp?.addEventListener("blur", commit);
    inp?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        inp.blur();
      }
    });
  }

  function wireTabs() {
    document.querySelectorAll(".dash-tab").forEach((tab) => {
      tab.addEventListener("click", () => {
        const name = tab.dataset.tab;
        document.querySelectorAll(".dash-tab").forEach((t) => t.classList.remove("is-active"));
        tab.classList.add("is-active");
        document.querySelectorAll(".dash-panel").forEach((panel) => {
          const on = panel.dataset.panel === name;
          panel.hidden = !on;
          panel.classList.toggle("is-active", on);
        });
        if (name === "stats") {
          requestAnimationFrame(() => drawRadar(document.getElementById("stats-radar-canvas"), 280));
          renderLifeStats();
        }
        if (name === "planner") renderPlanner();
        if (name === "study") renderStudy();
      });
    });
  }

  function wireSidebarMobile() {
    const toggle = document.getElementById("sidebar-toggle");
    const side = document.getElementById("dash-sidebar");
    const ov = document.getElementById("dash-sidebar-overlay");
    const close = () => {
      side?.classList.remove("sidebar-open");
      ov?.classList.remove("is-visible");
      ov?.setAttribute("aria-hidden", "true");
    };
    toggle?.addEventListener("click", () => {
      side?.classList.toggle("sidebar-open");
      ov?.classList.toggle("is-visible");
      ov?.setAttribute("aria-hidden", side?.classList.contains("sidebar-open") ? "false" : "true");
    });
    ov?.addEventListener("click", close);
  }

  function initTaskForm() {
    const domSel = document.getElementById("task-domain");
    if (!domSel) return;
    domSel.innerHTML = DOMAINS.map(
      (d) => `<option value="${d.id}">${d.icon} ${d.label}</option>`
    ).join("");
    const sub = document.getElementById("task-subfield");
    const fillSub = () => {
      const id = domSel.value;
      sub.innerHTML = (SUBFIELDS[id] || []).map((s) => `<option>${s}</option>`).join("");
    };
    fillSub();
    domSel.addEventListener("change", () => {
      fillSub();
      document.getElementById("task-subject-wrap").classList.toggle("is-hidden", domSel.value !== "academic");
    });
    const sec = document.getElementById("task-secondary-chips");
    sec.innerHTML = "";
    DOMAINS.forEach((d) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "chip chip-toggle";
      b.dataset.domain = d.id;
      b.textContent = `${d.icon} ${d.label}`;
      b.addEventListener("click", () => {
        b.classList.toggle("is-selected");
        if (b.classList.contains("is-selected")) taskForm.secondaries.add(d.id);
        else taskForm.secondaries.delete(d.id);
      });
      sec.appendChild(b);
    });
    const xpChips = document.getElementById("task-xp-chips");
    [10, 25, 50, 100, 200, "CUSTOM"].forEach((x) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "chip chip-toggle" + (x === 25 ? " is-selected" : "");
      b.textContent = x === "CUSTOM" ? "CUSTOM" : String(x);
      b.addEventListener("click", () => {
        xpChips.querySelectorAll(".chip").forEach((c) => c.classList.remove("is-selected"));
        b.classList.add("is-selected");
        taskForm.xp = x === "CUSTOM" ? "CUSTOM" : x;
        document.getElementById("task-xp-custom-wrap").classList.toggle("is-hidden", x !== "CUSTOM");
      });
      xpChips.appendChild(b);
    });
    const tChips = document.getElementById("task-time-chips");
    ["5min", "15min", "30min", "1hr", "2hr", "3hr+"].forEach((t) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "chip chip-toggle" + (t === "15min" ? " is-selected" : "");
      b.textContent = t;
      b.addEventListener("click", () => {
        tChips.querySelectorAll(".chip").forEach((c) => c.classList.remove("is-selected"));
        b.classList.add("is-selected");
        taskForm.time = t;
      });
      tChips.appendChild(b);
    });
    const pChips = document.getElementById("task-priority-chips");
    ["LOW", "MEDIUM", "HIGH", "CRITICAL"].forEach((pr) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "chip chip-toggle" + (pr === "MEDIUM" ? " is-selected" : "");
      b.textContent = pr;
      b.addEventListener("click", () => {
        pChips.querySelectorAll(".chip").forEach((c) => c.classList.remove("is-selected"));
        b.classList.add("is-selected");
        taskForm.priority = pr;
      });
      pChips.appendChild(b);
    });
    const subj = document.getElementById("task-subject");
    const p = ensurePlayer(getPlayer());
    subj.innerHTML = (p.subjects || [])
      .map((s) => `<option value="${s.name}">${s.emoji || "📚"} ${s.name}</option>`)
      .join("");

    const panel = document.getElementById("add-task-panel");
    if (panel && !document.getElementById("task-template-wrap")) {
      const row = document.createElement("div");
      row.id = "task-template-wrap";
      row.className = "form-group";
      row.innerHTML = `
        <label class="form-label">TASK TEMPLATE</label>
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          <select class="form-input" id="task-template-select" style="flex:1;min-width:180px;"></select>
          <button type="button" class="btn btn-cyan btn-sm" id="task-template-apply">APPLY</button>
          <button type="button" class="btn btn-yellow btn-sm" id="task-template-save">SAVE AS TEMPLATE</button>
        </div>`;
      const createBtn = document.getElementById("btn-create-task");
      panel.insertBefore(row, createBtn);
    }
    refreshTaskTemplates();
    document.getElementById("task-template-save")?.addEventListener("click", saveTaskTemplate);
    document.getElementById("task-template-apply")?.addEventListener("click", applyTaskTemplate);
  }

  function refreshTaskTemplates() {
    const sel = document.getElementById("task-template-select");
    if (!sel) return;
    const p = ensurePlayer(getPlayer());
    const options = [`<option value="">Select template...</option>`]
      .concat(
        (p.taskTemplates || []).map(
          (t) => `<option value="${t.id}">${escapeHtml(t.templateName || "Template")}</option>`
        )
      )
      .join("");
    sel.innerHTML = options;
  }

  function saveTaskTemplate() {
    const p = ensurePlayer(getPlayer());
    const name = prompt("Template name?");
    if (!name) return;
    const dom = document.getElementById("task-domain").value;
    const tpl = {
      id: crypto.randomUUID(),
      templateName: name.trim(),
      name: document.getElementById("task-name").value.trim(),
      description: document.getElementById("task-desc").value.trim(),
      primaryDomain: dom,
      subField: document.getElementById("task-subfield").value,
      secondaryDomains: [...taskForm.secondaries],
      subject: dom === "academic" ? document.getElementById("task-subject").value : null,
      xpReward:
        taskForm.xp === "CUSTOM"
          ? Number(document.getElementById("task-xp-custom").value) || 25
          : taskForm.xp,
      estimatedTime: taskForm.time,
      priority: taskForm.priority,
    };
    p.taskTemplates.push(tpl);
    syncPlayerToStore(p);
    refreshTaskTemplates();
    showToast("Task template saved.", "success");
  }

  function applyTaskTemplate() {
    const sel = document.getElementById("task-template-select");
    const p = ensurePlayer(getPlayer());
    const tpl = (p.taskTemplates || []).find((t) => t.id === sel?.value);
    if (!tpl) return;
    document.getElementById("task-name").value = tpl.name || "";
    document.getElementById("task-desc").value = tpl.description || "";
    document.getElementById("task-domain").value = tpl.primaryDomain || "academic";
    document.getElementById("task-domain").dispatchEvent(new Event("change"));
    document.getElementById("task-subfield").value = tpl.subField || "";
    document.getElementById("task-subject").value = tpl.subject || "";
    document.getElementById("task-priority-chips")
      ?.querySelectorAll(".chip")
      .forEach((c) => {
        const on = c.textContent === (tpl.priority || "MEDIUM");
        c.classList.toggle("is-selected", on);
      });
    taskForm.priority = tpl.priority || "MEDIUM";
    document.getElementById("task-time-chips")
      ?.querySelectorAll(".chip")
      .forEach((c) => {
        const on = c.textContent === (tpl.estimatedTime || "15min");
        c.classList.toggle("is-selected", on);
      });
    taskForm.time = tpl.estimatedTime || "15min";
    document.getElementById("task-xp-chips")
      ?.querySelectorAll(".chip")
      .forEach((c) => c.classList.remove("is-selected"));
    const xpChip = Array.from(
      document.getElementById("task-xp-chips")?.querySelectorAll(".chip") || []
    ).find((c) => c.textContent === String(tpl.xpReward));
    if (xpChip) {
      xpChip.classList.add("is-selected");
      taskForm.xp = Number(tpl.xpReward) || 25;
      document.getElementById("task-xp-custom-wrap")?.classList.add("is-hidden");
    } else {
      const custom = Array.from(
        document.getElementById("task-xp-chips")?.querySelectorAll(".chip") || []
      ).find((c) => c.textContent === "CUSTOM");
      custom?.classList.add("is-selected");
      taskForm.xp = "CUSTOM";
      document.getElementById("task-xp-custom-wrap")?.classList.remove("is-hidden");
      document.getElementById("task-xp-custom").value = String(tpl.xpReward || 25);
    }
    taskForm.secondaries = new Set(tpl.secondaryDomains || []);
    document.getElementById("task-secondary-chips")
      ?.querySelectorAll(".chip")
      .forEach((c) => {
        c.classList.toggle("is-selected", taskForm.secondaries.has(c.dataset.domain));
      });
    showToast("Task template applied.", "success");
  }

  function renderTasks() {
    const p = ensurePlayer(getPlayer());
    const now = Date.now();
    const sod = startOfToday();
    const wrap = document.getElementById("task-sections");
    if (!wrap) return;
    const active = [];
    const overdue = [];
    const completed = [];
    p.tasks.forEach((t) => {
      if (t.completed) completed.push(t);
      else if (t.due && new Date(t.due).getTime() < now) overdue.push(t);
      else active.push(t);
    });
    const card = (t, section) => {
      const d = domainById(t.primaryDomain);
      const pr = t.priority || "MEDIUM";
      const prClass = `priority-${pr}`;
      return `<article class="task-card card" data-task-id="${t.id}" style="--task-domain-color:${d.color}">
        <div class="task-card__row1"><span class="task-card__name font-orbitron">${escapeHtml(t.name)}</span><span class="task-priority ${prClass}">${pr}</span></div>
        <div class="task-card__row2 muted">${d.icon} ${d.label}${t.subject ? ` · ${escapeHtml(t.subject)}` : ""}${t.due ? ` · Due ${new Date(t.due).toLocaleString()}` : ""}</div>
        <div class="task-card__row3"><span class="task-xp-badge">+${t.xpReward} XP</span><span>${t.estimatedTime || ""}</span></div>
        ${t.completed ? '<div class="task-card__row2"><span class="task-xp-badge">CONQUERED ✓</span></div>' : ""}
        <div class="task-card__actions" ${t.completed ? 'style="display:none;"' : ""}>
          <button type="button" class="btn btn-cyan btn-sm task-start" data-id="${t.id}" ${t.startTime ? "disabled" : ""}>${t.startTime ? "IN PROGRESS…" : "▶ START"}</button>
          <button type="button" class="btn btn-pink btn-sm task-done" data-id="${t.id}">✓ COMPLETE</button>
        </div>
      </article>`;
    };
    const section = (title, list, id, extraClass = "", open = true) =>
      `<div class="task-section ${extraClass}">
        <button type="button" class="task-section__head font-orbitron" data-collapse="${id}">${title} (${list.length})</button>
        <div class="task-section__body" id="${id}" style="display:${open ? "block" : "none"}">${list.map((t) => card(t, id)).join("") || '<p class="muted">None.</p>'}</div>
      </div>`;
    wrap.innerHTML =
      section("ACTIVE MISSIONS", active, "sec-active", "", true) +
      section("OVERDUE", overdue, "sec-overdue", overdue.length ? "task-section--overdue" : "", true) +
      section("COMPLETION TAB // CONQUERED", completed.sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0)), "sec-done", "", false);
    wrap.querySelectorAll(".task-section__head").forEach((h) => {
      h.addEventListener("click", () => {
        const b = document.getElementById(h.dataset.collapse);
        if (b) b.style.display = b.style.display === "none" ? "block" : "none";
      });
    });
    wrap.querySelectorAll(".task-start").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.id;
        const p2 = ensurePlayer(getPlayer());
        const t = p2.tasks.find((x) => x.id === id);
        if (!t || t.startTime) return;
        t.startTime = Date.now();
        syncPlayerToStore(p2);
        renderTasks();
        renderSidebar();
      });
    });
    wrap.querySelectorAll(".task-done").forEach((btn) => {
      btn.addEventListener("click", () => completeTaskById(btn.dataset.id));
    });
  }

  function escapeHtml(s) {
    const d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  }

  function completeTaskById(id) {
    const p = ensurePlayer(getPlayer());
    const t = p.tasks.find((x) => x.id === id);
    if (!t || t.completed) return;
    const startTime = t.startTime || t.createdAt || Date.now();
    const est = EST_MS[t.estimatedTime] || EST_MS["15min"];
    const taken = Date.now() - startTime;
    if (taken < est * 0.4) {
      pendingAnticheatTask = t;
      openAnticheatModal(t, est, taken);
      return;
    }
    finalizeTaskComplete(t);
  }

  function openAnticheatModal(task, estMs, takenMs) {
    const modal = document.getElementById("anticheat-modal");
    const qEl = document.getElementById("anticheat-question");
    modal.classList.remove("is-hidden");
    qEl.innerHTML =
      '<span class="anticheat-loading">ARCHITECT IS ANALYZING<span class="anticheat-dots">...</span></span>';
    const estMin = Math.round(estMs / 60000);
    const tookMin = Math.max(1, Math.round(takenMs / 60000));
    const p = getPlayer();
    const prompt = `You are ARCHITECT, a brutally honest AI mentor with zero tolerance for self-deception.
A player marked a task complete suspiciously fast. Generate ONE sharp interrogation question
to verify they actually did it. Be direct, slightly cold, zero fluff.
Max 2 sentences. Task: ${task.name}. Estimated: ${estMin} min. Completed in: ${tookMin} min.
Player age: ${p.age}. Life field: ${p.lifeField}.`;
    (async () => {
      try {
        if (typeof GEMINI_API_KEY !== "undefined" && GEMINI_API_KEY !== "YOUR_KEY_HERE") {
          const text = await callArchitectOnce(prompt, 256);
          qEl.innerHTML = `<span class="anticheat-qtext">${escapeHtml(text.trim())}</span>`;
        } else {
          qEl.innerHTML =
            '<span class="anticheat-qtext">Did you actually do this, or are you lying to yourself?</span>';
        }
      } catch {
        qEl.innerHTML =
          '<span class="anticheat-qtext">Prove it. What was the hardest step?</span>';
      }
    })();
  }

  function closeAnticheat() {
    document.getElementById("anticheat-modal")?.classList.add("is-hidden");
    pendingAnticheatTask = null;
  }

  function finalizeTaskComplete(task) {
    const p = ensurePlayer(getPlayer());
    const t = p.tasks.find((x) => x.id === task.id);
    if (!t || t.completed) return;
    const domains = [t.primaryDomain, ...(t.secondaryDomains || [])].filter(Boolean);
    const subj = t.primaryDomain === "academic" && t.subject ? t.subject : null;
    awardXP(t.xpReward, domains, subj);
    const p2 = ensurePlayer(getPlayer());
    const tt = p2.tasks.find((x) => x.id === task.id);
    if (tt) {
      tt.completed = true;
      tt.completedAt = Date.now();
    }
    p2.tasksCompleted = (p2.tasksCompleted || 0) + 1;
    p2.taskHistory = p2.taskHistory || [];
    p2.taskHistory.push({
      name: t.name,
      xp: t.xpReward,
      domains,
      subject: subj,
      completedAt: Date.now(),
      primaryDomain: t.primaryDomain,
    });
    if (!p2.domainsTasked) p2.domainsTasked = {};
    p2.domainsTasked[t.primaryDomain] = true;
    const h = new Date().getHours();
    if (h >= 23) p2.nightOwlUnlocked = true;
    if (h < 7) p2.earlyRiserUnlocked = true;
    p2.lastTaskCompletedAt = Date.now();
    syncPlayerToStore(p2);
    updateStreak();
    checkAchievements();
    renderTasks();
    renderSidebar();
    drawRadar(document.getElementById("dash-radar-canvas"), 200);
  }

  function buildBossPanel() {
    const el = document.getElementById("add-boss-panel");
    if (!el || el.dataset.built) return;
    el.dataset.built = "1";
    el.innerHTML = `
      <div class="form-group"><label class="form-label">BOSS NAME</label>
      <input type="text" class="form-input" id="boss-name" placeholder="量子力学の悪魔" /></div>
      <div class="form-group"><label class="form-label">DOMAIN</label>
      <select class="form-input" id="boss-domain">${DOMAINS.map((d) => `<option value="${d.id}">${d.icon} ${d.label}</option>`).join("")}</select></div>
      <div class="form-group" id="boss-subject-wrap"><label class="form-label">SUBJECT</label>
      <select class="form-input" id="boss-subject"></select></div>
      <p class="form-label">DIFFICULTY</p>
      <div class="chip-grid" id="boss-diff-chips"></div>
      <button type="button" class="btn btn-red" id="btn-summon-boss">SUMMON BOSS ⚔️</button>`;
    const refreshSubj = () => {
      const p = ensurePlayer(getPlayer());
      const sel = document.getElementById("boss-subject");
      sel.innerHTML = (p.subjects || [])
        .map((s) => `<option value="${s.name}">${s.emoji} ${s.name}</option>`)
        .join("");
    };
    refreshSubj();
    document.getElementById("boss-domain").addEventListener("change", () => {
      const ac = document.getElementById("boss-domain").value === "academic";
      document.getElementById("boss-subject-wrap").classList.toggle("is-hidden", !ac);
    });
    document.getElementById("boss-subject-wrap").classList.add("is-hidden");
    let bossDiff = "normal";
    const wrap = document.getElementById("boss-diff-chips");
    [
      ["easy", "EASY · 50 XP", "diff-easy"],
      ["normal", "NORMAL · 100 XP", "diff-norm"],
      ["hard", "HARD · 200 XP", "diff-hard"],
      ["legendary", "LEGENDARY · 500 XP", "diff-legend diff-legend-pulse"],
    ].forEach(([id, label, cls]) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = `chip chip-toggle ${cls}` + (id === "normal" ? " is-selected" : "");
      b.dataset.diff = id;
      b.textContent = label;
      b.addEventListener("click", () => {
        wrap.querySelectorAll(".chip").forEach((c) => c.classList.remove("is-selected"));
        b.classList.add("is-selected");
        bossDiff = id;
      });
      wrap.appendChild(b);
    });
    const templateRow = document.createElement("div");
    templateRow.className = "form-group";
    templateRow.innerHTML = `
      <label class="form-label">BOSS TEMPLATE</label>
      <div style="display:flex;gap:8px;flex-wrap:wrap;">
        <select class="form-input" id="boss-template-select" style="flex:1;min-width:180px;"></select>
        <button type="button" class="btn btn-cyan btn-sm" id="boss-template-apply">APPLY</button>
        <button type="button" class="btn btn-yellow btn-sm" id="boss-template-save">SAVE AS TEMPLATE</button>
      </div>`;
    el.insertBefore(templateRow, document.getElementById("btn-summon-boss"));
    const refreshBossTemplates = () => {
      const p = ensurePlayer(getPlayer());
      const sel = document.getElementById("boss-template-select");
      if (!sel) return;
      sel.innerHTML = [`<option value="">Select template...</option>`]
        .concat(
          (p.bossTemplates || []).map(
            (t) => `<option value="${t.id}">${escapeHtml(t.templateName || "Template")}</option>`
          )
        )
        .join("");
    };
    refreshBossTemplates();
    document.getElementById("boss-template-save").addEventListener("click", () => {
      const p = ensurePlayer(getPlayer());
      const templateName = prompt("Boss template name?");
      if (!templateName) return;
      p.bossTemplates.push({
        id: crypto.randomUUID(),
        templateName: templateName.trim(),
        name: document.getElementById("boss-name").value.trim(),
        domain: document.getElementById("boss-domain").value,
        subject:
          document.getElementById("boss-domain").value === "academic"
            ? document.getElementById("boss-subject").value
            : null,
        difficulty: bossDiff,
      });
      syncPlayerToStore(p);
      refreshBossTemplates();
      showToast("Boss template saved.", "success");
    });
    document.getElementById("boss-template-apply").addEventListener("click", () => {
      const p = ensurePlayer(getPlayer());
      const tpl = (p.bossTemplates || []).find(
        (t) => t.id === document.getElementById("boss-template-select").value
      );
      if (!tpl) return;
      document.getElementById("boss-name").value = tpl.name || "";
      document.getElementById("boss-domain").value = tpl.domain || "academic";
      document.getElementById("boss-domain").dispatchEvent(new Event("change"));
      document.getElementById("boss-subject").value = tpl.subject || "";
      bossDiff = tpl.difficulty || "normal";
      wrap.querySelectorAll(".chip").forEach((chip) => {
        chip.classList.toggle("is-selected", chip.dataset.diff === bossDiff);
      });
      showToast("Boss template applied.", "success");
    });
    document.getElementById("btn-summon-boss").addEventListener("click", async (e) => {
      const button = e.currentTarget;
      const originalText = button.textContent;
      button.disabled = true;
      button.textContent = "...";
      try {
      const name = document.getElementById("boss-name").value.trim();
      if (!name) return showToast("Name your boss.", "warning");
      const p = ensurePlayer(getPlayer());
      const dom = document.getElementById("boss-domain").value;
      const subj =
        dom === "academic" ? document.getElementById("boss-subject").value : null;
      p.bosses.push({
        id: crypto.randomUUID(),
        name,
        domain: dom,
        subject: subj,
        difficulty: bossDiff,
        defeated: false,
        createdAt: Date.now(),
      });
      syncPlayerToStore(p);
      document.getElementById("boss-name").value = "";
      el.classList.add("is-hidden");
      renderBosses();
      showToast("Boss summoned.", "success");
      } finally {
        button.disabled = false;
        button.textContent = originalText;
      }
    });
  }

  function renderBosses() {
    buildBossPanel();
    const p = ensurePlayer(getPlayer());
    const active = p.bosses.filter((b) => !b.defeated);
    const dead = p.bosses.filter((b) => b.defeated);
    const list = document.getElementById("boss-active-list");
    const trophy = document.getElementById("boss-trophy-list");
    const card = (b, defeated) => {
      const xp = BOSS_XP[b.difficulty] || 100;
      const d = domainById(b.domain);
      return `<article class="boss-card card ${defeated ? "boss-card--dead" : ""}" data-boss-id="${b.id}">
        <h4 class="boss-card__name font-orbitron">${escapeHtml(b.name)}</h4>
        <p class="boss-card__meta muted">${d.icon} ${b.difficulty.toUpperCase()}${b.subject ? ` · ${escapeHtml(b.subject)}` : ""}</p>
        <div class="boss-hpbar"><div class="boss-hpbar__fill" style="width:100%"></div></div>
        ${defeated ? `<p class="muted small">Defeated ${new Date(b.defeatedAt).toLocaleDateString()}</p>` : `<button type="button" class="btn btn-red btn-sm boss-engage" data-id="${b.id}">⚔️ ENGAGE</button>`}
      </article>`;
    };
    if (list) list.innerHTML = active.map((b) => card(b, false)).join("") || "<p class='muted'>No active bosses.</p>";
    if (trophy) trophy.innerHTML = dead.map((b) => card(b, true)).join("") || "<p class='muted'>Empty trophy room.</p>";
    list?.querySelectorAll(".boss-engage").forEach((btn) => {
      btn.addEventListener("click", () => openBossModal(btn.dataset.id));
    });
  }

  function openBossModal(id) {
    const p = ensurePlayer(getPlayer());
    const b = p.bosses.find((x) => x.id === id);
    if (!b) return;
    const root = document.getElementById("modal-root");
    const ov = document.createElement("div");
    ov.className = "boss-modal-overlay";
    ov.innerHTML = `<div class="boss-modal card">
      <h3 class="font-orbitron boss-modal__title">${escapeHtml(b.name)}</h3>
      <p class="muted">Complete this challenge to defeat the boss. Mark done when finished.</p>
      <button type="button" class="btn btn-red" data-defeat="${b.id}">💀 BOSS DEFEATED</button>
    </div>`;
    root.appendChild(ov);
    ov.querySelector("[data-defeat]").addEventListener("click", () => {
      defeatBoss(b.id);
      ov.remove();
    });
  }

  function defeatBoss(id) {
    const p = ensurePlayer(getPlayer());
    const b = p.bosses.find((x) => x.id === id);
    if (!b || b.defeated) return;
    const xp = BOSS_XP[b.difficulty] || 100;
    document.body.classList.add("screen-shake");
    setTimeout(() => document.body.classList.remove("screen-shake"), 600);
    const ov = document.createElement("div");
    ov.className = "boss-defeated-overlay";
    ov.innerHTML = `<div class="boss-defeated-inner font-orbitron">
      <div>BOSS DEFEATED // 撃破</div>
      <div class="boss-defeated-name">${escapeHtml(b.name)}</div>
      <div class="boss-defeated-xp">+${xp} XP</div>
    </div>`;
    document.body.appendChild(ov);
    setTimeout(() => ov.remove(), 2000);
    awardXP(xp, [b.domain], b.subject || null);
    const p2 = ensurePlayer(getPlayer());
    const bb = p2.bosses.find((x) => x.id === id);
    if (bb) {
      bb.defeated = true;
      bb.defeatedAt = Date.now();
    }
    p2.bossesDefeated = (p2.bossesDefeated || 0) + 1;
    syncPlayerToStore(p2);
    checkAchievements();
    renderBosses();
    renderSidebar();
    drawRadar(document.getElementById("dash-radar-canvas"), 200);
  }

  function renderAchievements() {
    const p = ensurePlayer(getPlayer());
    const grid = document.getElementById("achievements-grid");
    if (!grid) return;
    const has = (id) =>
      p.achievements.includes(id) || (id === "omega_rank" && p.achievements.includes("omega"));
    grid.innerHTML = ACHIEVEMENTS_UI.map((a) => {
      const u = has(a.id);
      return `<article class="achievement-card card ${u ? "is-unlocked" : "is-locked"}" data-aid="${a.id}">
        <span class="achievement-card__icon">${u ? a.icon : "🔒"}</span>
        <span class="achievement-card__name font-orbitron">${u ? a.name : "???"}</span>
        <span class="achievement-card__desc muted">${u ? a.desc : "Locked."}</span>
      </article>`;
    }).join("");
  }

  function renderMonsterBestiary() {
    const el = document.getElementById("monster-bestiary");
    if (!el) return;
    el.innerHTML = MONSTER_DEFS.map(
      (m) => `<div class="monster-info-card card">
      <span class="monster-info-emoji">${m.emoji}</span>
      <h4 class="font-orbitron">${m.name}</h4>
      <p class="muted">${m.tag}</p>
      <span class="monster-threat">THREAT LEVEL: HIGH</span>
    </div>`
    ).join("");
    const p = ensurePlayer(getPlayer());
    const row = document.getElementById("monster-stats-row");
    if (row)
      row.textContent = `Resisted: ${p.monstersResisted} | Defeated: ${p.monstersDefeated} | Times Attacked: ${p.monsterTimesAttacked || 0}`;
  }

  function showMonsterBanner() {
    const p = ensurePlayer(getPlayer());
    if (!p.tasks || p.tasks.length === 0) return;
    const last = p.lastTaskCompletedAt || 0;
    if (Date.now() - last < 30 * 60 * 1000) return;
    const m = MONSTER_DEFS[Math.floor(Math.random() * MONSTER_DEFS.length)];
    p.monsterTimesAttacked = (p.monsterTimesAttacked || 0) + 1;
    syncPlayerToStore(p);
    const ban = document.getElementById("monster-attack-banner");
    if (!ban) return;
    ban.classList.remove("is-hidden");
    ban.innerHTML = `<div class="monster-banner-inner">
      <span class="monster-banner-emoji">${m.emoji}</span>
      <div><div class="font-orbitron">${m.name} IS ATTACKING! // 邪魔が来た</div><p class="muted">${m.tag}</p></div>
      <button type="button" class="btn btn-yellow btn-sm" data-resist>🛡️ RESIST</button>
      <button type="button" class="btn btn-pink btn-sm" data-counter>⚔️ COUNTER-ATTACK</button>
    </div>`;
    const close = () => {
      ban.classList.add("is-hidden");
      ban.innerHTML = "";
    };
    ban.querySelector("[data-resist]")?.addEventListener("click", () => {
      const pl = ensurePlayer(getPlayer());
      pl.monstersResisted = (pl.monstersResisted || 0) + 1;
      syncPlayerToStore(pl);
      showToast("Monster resisted. +0 XP. Stay focused.", "success");
      checkAchievements();
      close();
    });
    ban.querySelector("[data-counter]")?.addEventListener("click", () => {
      const pl = ensurePlayer(getPlayer());
      pl.monstersDefeated = (pl.monstersDefeated || 0) + 1;
      syncPlayerToStore(pl);
      awardXP(10, [], null);
      showToast("⚡ +10 XP — Monster defeated!", "xp");
      checkAchievements();
      close();
    });
    setTimeout(close, 60000);
  }

  function domainLevel(xp) {
    return Math.floor(xp / 50) + 1;
  }

  function domainLevelTitle(lv) {
    if (lv >= 20) return "神域";
    if (lv >= 10) return "達人";
    if (lv >= 5) return "熟練";
    return "入門";
  }

  function renderLifeStats() {
    const p = ensurePlayer(getPlayer());
    drawRadar(document.getElementById("stats-radar-canvas"), 280);
    const cards = document.getElementById("stats-domain-cards");
    if (cards) {
      cards.innerHTML = DOMAINS.map((d) => {
        const xp = p.domainXP[d.id] || 0;
        const lv = domainLevel(xp);
        return `<div class="stats-domain-card card">
          <span>${d.icon}</span><span class="font-orbitron">${d.label}</span>
          <span class="muted">${xp} XP · Lv${lv} ${domainLevelTitle(lv)}</span>
        </div>`;
      }).join("");
    }
    const subjSec = document.getElementById("stats-subject-section");
    const bars = document.getElementById("stats-subject-bars");
    const sx = p.subjectXP || {};
    const keys = Object.keys(sx);
    if (keys.length) {
      subjSec?.classList.remove("is-hidden");
      bars.innerHTML = keys
        .map((k) => {
          const xp = sx[k];
          const lv = domainLevel(xp);
          const pct = ((xp % 50) / 50) * 100;
          return `<div class="subject-bar-row"><span>${k}</span><div class="subject-bar"><div class="subject-bar-fill" style="width:${pct}%"></div></div><span>${xp} XP Lv${lv}</span></div>`;
        })
        .join("");
    } else subjSec?.classList.add("is-hidden");
    const cal = document.getElementById("stats-week-cal");
    if (cal) {
      const now = new Date();
      const mon = new Date(now);
      mon.setDate(now.getDate() - ((now.getDay() + 6) % 7));
      mon.setHours(0, 0, 0, 0);
      const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      cal.innerHTML = days
        .map((name, i) => {
          const d = new Date(mon);
          d.setDate(mon.getDate() + i);
          const ds = d.toDateString();
          const completedTasks = (p.taskHistory || []).filter(
            (t) => new Date(t.completedAt).toDateString() === ds
          );
          const planBlocks = p.planHistory?.[ds]?.blocks || [];
          const dots = completedTasks
            .slice(0, 5)
            .map((t) => {
              const col = domainById(t.primaryDomain || "academic").color;
              return `<span class="cal-dot" style="background:${col}"></span>`;
            })
            .join("");
          const routine = planBlocks
            .slice(0, 3)
            .map(
              () =>
                '<span class="cal-dot" style="background:transparent;border:1px solid var(--yellow);"></span>'
            )
            .join("");
          const today = d.toDateString() === new Date().toDateString();
          return `<div class="cal-day ${today ? "is-today" : ""}"><span class="font-orbitron">${name}</span><span>${d.getDate()}</span>
          <div class="cal-dots">${completedTasks.length || planBlocks.length ? `${dots}${routine}` : '<span class="muted small">休息</span>'}</div></div>`;
        })
        .join("");
    }
    const hist = document.getElementById("stats-task-history");
    if (hist) {
      hist.innerHTML = (p.taskHistory || [])
        .slice(-20)
        .reverse()
        .map((t) => {
          const rel = formatRelTime(t.completedAt);
          return `<div class="hist-row"><span>${escapeHtml(t.name)}</span><span>${t.xp} XP</span><span class="muted">${rel}</span></div>`;
        })
        .join("") || "<p class='muted'>No history.</p>";
    }
    const og = document.getElementById("stats-overall-grid");
    if (og) {
      const days = Math.max(
        1,
        Math.floor((Date.now() - (p.createdAt || Date.now())) / 86400000)
      );
      og.innerHTML = [
        ["Total XP", p.xp],
        ["Level", p.level],
        ["Streak", p.streak],
        ["Longest", p.longestStreak || p.streak],
        ["Tasks", p.tasksCompleted],
        ["Bosses", p.bossesDefeated],
        ["Achievements", p.achievements.length],
        ["Days in system", days],
      ]
        .map(
          ([a, b]) =>
            `<div class="stats-mini-card card"><span class="muted font-orbitron">${a}</span><span class="font-orbitron big">${b}</span></div>`
        )
        .join("");
    }
    const dx = p.domainXP || {};
    const sorted = Object.entries(dx).sort((a, b) => b[1] - a[1]);
    const hi = document.getElementById("stats-domain-highlight");
    if (hi && sorted.length) {
      const best = domainById(sorted[0][0]);
      const worst = domainById(sorted[sorted.length - 1][0]);
      hi.innerHTML = `<p><strong>Most active:</strong> ${best.icon} ${best.label}</p><p><strong>Least:</strong> ${worst.icon} ${worst.label}</p>`;
    }
  }

  function formatRelTime(ts) {
    const s = Math.floor((Date.now() - ts) / 1000);
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
    return "yesterday+";
  }

  function renderPlanner() {
    if (!plannerDate) {
      plannerDate = new Date();
      plannerDate.setDate(plannerDate.getDate() + 1);
      plannerDate.setHours(0, 0, 0, 0);
    }
    const label = document.getElementById("planner-date-label");
    if (label)
      label.textContent = plannerDate.toLocaleDateString("en-GB", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      }).toUpperCase();
    const grid = document.getElementById("planner-grid");
    if (!grid) return;
    let html = "";
    for (let h = 6; h <= 23; h++) {
      html += `<div class="planner-row"><span class="planner-hour font-orbitron">${h === 12 ? 12 : h % 12}${h < 12 ? "AM" : "PM"}</span>
        <div class="planner-slot" data-hour="${h}"></div></div>`;
    }
    grid.innerHTML = html;
    const key = plannerDate.toDateString();
    plannerBlocks = (getPlayer().planHistory[key]?.blocks || []).slice();
    plannerBlocks.forEach((b) => {
      const slot = grid.querySelector(`[data-hour="${b.hour}"]`);
      if (slot)
        slot.innerHTML = `<span class="planner-block" style="border-color:${domainById(b.domain).color}">${escapeHtml(b.name)} <button type="button" class="planner-del" data-hour="${b.hour}">×</button></span>`;
    });
    grid.querySelectorAll(".planner-slot").forEach((slot) => {
      slot.addEventListener("click", (e) => {
        if (e.target.closest(".planner-del")) return;
        if (e.target.closest(".planner-inline-form")) return;
        const hour = Number(slot.dataset.hour);
        const existingForm = grid.querySelector(".planner-inline-form");
        if (existingForm) existingForm.closest(".planner-slot")?.dispatchEvent(new Event("cancelInlineForm"));

        const originalContent = slot.innerHTML;
        slot.innerHTML = `
          <div class="planner-inline-form card" style="padding:8px;display:grid;gap:6px;">
            <input type="text" class="form-input" data-role="activity" placeholder="Activity name" />
            <select class="form-input" data-role="domain">
              <option value="biological">biological</option>
              <option value="psychological">psychological</option>
              <option value="social">social</option>
              <option value="academic" selected>academic</option>
              <option value="economic">economic</option>
              <option value="time">time</option>
              <option value="creative">creative</option>
              <option value="existential">existential</option>
            </select>
            <div style="display:flex;gap:6px;">
              <button type="button" class="btn btn-cyan btn-sm" data-role="confirm">CONFIRM</button>
              <button type="button" class="btn btn-yellow btn-sm" data-role="cancel">CANCEL</button>
            </div>
          </div>`;

        const form = slot.querySelector(".planner-inline-form");
        const activityInput = form?.querySelector('[data-role="activity"]');
        const domainSelect = form?.querySelector('[data-role="domain"]');
        const confirmBtn = form?.querySelector('[data-role="confirm"]');
        const cancelBtn = form?.querySelector('[data-role="cancel"]');

        const closeForm = () => {
          slot.innerHTML = originalContent;
          grid.querySelectorAll(".planner-del").forEach((btn) => {
            btn.addEventListener("click", (ev) => {
              ev.stopPropagation();
              const h = Number(btn.dataset.hour);
              plannerBlocks = plannerBlocks.filter((b) => b.hour !== h);
              savePlannerDay();
              renderPlanner();
            });
          });
        };

        slot.addEventListener(
          "cancelInlineForm",
          () => {
            closeForm();
          },
          { once: true }
        );

        confirmBtn?.addEventListener("click", (ev) => {
          ev.stopPropagation();
          const name = activityInput?.value.trim() || "";
          if (!name) {
            showToast("Activity name required.", "warning");
            activityInput?.focus();
            return;
          }
          const domain = domainSelect?.value || "academic";
          plannerBlocks.push({ hour, name, domain, xp: 10 });
          savePlannerDay();
          renderPlanner();
        });

        cancelBtn?.addEventListener("click", (ev) => {
          ev.stopPropagation();
          closeForm();
        });

        activityInput?.focus();
      });
    });
    grid.querySelectorAll(".planner-del").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const h = Number(btn.dataset.hour);
        plannerBlocks = plannerBlocks.filter((b) => b.hour !== h);
        savePlannerDay();
        renderPlanner();
      });
    });
    const hist = document.getElementById("planner-history");
    if (hist) {
      const ph = getPlayer().planHistory || {};
      hist.innerHTML = Object.keys(ph)
        .map(
          (k) =>
            `<details class="planner-acc"><summary class="font-orbitron">${k}</summary><pre class="muted">${JSON.stringify(ph[k], null, 2)}</pre></details>`
        )
        .join("") || "<p class='muted'>No locked plans yet.</p>";
    }
  }

  function savePlannerDay() {
    const p = ensurePlayer(getPlayer());
    const key = plannerDate.toDateString();
    p.planHistory[key] = { blocks: plannerBlocks, updatedAt: Date.now() };
    syncPlayerToStore(p);
  }

  function renderStudy() {
    const p = ensurePlayer(getPlayer());
    const grid = document.getElementById("study-skill-grid");
    if (grid) {
      grid.innerHTML = (p.subjects || [])
        .map((s) => {
          const xp = p.subjectXP[s.name] || 0;
          const lv = domainLevel(xp);
          const pct = ((xp % 50) / 50) * 100;
          const jp = "学問";
          return `<div class="study-card card">
            <span class="study-emoji">${s.emoji || "📚"}</span>
            <span class="font-orbitron">${escapeHtml(s.name)}</span>
            <span class="jp muted">${jp}</span>
            <span>Lv${lv} · ${lv >= 10 ? "熟練者" : lv >= 5 ? "中級者" : "初心者"}</span>
            <div class="subject-bar"><div class="subject-bar-fill" style="width:${pct}%"></div></div>
            <button type="button" class="btn btn-yellow btn-sm study-log" data-subj="${encodeURIComponent(s.name)}">📖 LOG STUDY SESSION</button>
          </div>`;
        })
        .join("") || "<p class='muted'>No subjects.</p>";
      grid.querySelectorAll(".study-log").forEach((btn) => {
        btn.addEventListener("click", () => {
          const name = decodeURIComponent(btn.dataset.subj);
          const mins = prompt("Minutes studied?", "30");
          const m = Number(mins) || 30;
          let xp = Math.round((m / 60) * 50);
          if (m <= 15) xp = 10;
          else if (m <= 30) xp = 25;
          else if (m <= 60) xp = 50;
          else if (m <= 120) xp = 100;
          awardXP(xp, ["academic"], name);
          renderStudy();
          renderSidebar();
        });
      });
    }
    const sl = document.getElementById("study-boss-list");
    if (sl) {
      const ac = p.bosses.filter((b) => b.domain === "academic");
      sl.innerHTML = ac.length
        ? ac
            .map(
              (b) =>
                `<div class="boss-card card">${escapeHtml(b.name)} — ${b.defeated ? "✓" : "ACTIVE"}</div>`
            )
            .join("")
        : "<p class='muted'>No academic bosses.</p>";
    }
  }

  function initDashboard() {
    if (!document.getElementById("dash-topbar")) return;

    const _authUser = getCurrentUser();
    const _authPlayer = getPlayer();
    if (!_authUser || !_authPlayer) {
      localStorage.setItem("redirectAfterLogin", "dashboard.html");
      window.location.href = "login.html";
      return;
    }

    const boot = getPlayer();
    ensurePlayer(boot);
    syncPlayerToStore(boot);

    quoteIndex = Math.floor(Math.random() * MOTIVATION_QUOTES.length);
    const mq = document.getElementById("motivation-quote");
    if (mq) {
      mq.textContent = MOTIVATION_QUOTES[quoteIndex];
      mq.style.transition = "opacity 0.4s ease";
    }
    setInterval(rotateQuote, 60000);

    document.getElementById("dash-logout")?.addEventListener("click", () => {
      localStorage.removeItem("currentPlayer");
      window.location.href = "index.html";
    });

    wireTitleEdit();
    wireTabs();
    wireSidebarMobile();

    document.getElementById("btn-toggle-add-task")?.addEventListener("click", () => {
      document.getElementById("add-task-panel")?.classList.toggle("is-hidden");
    });
    initTaskForm();
    document.getElementById("btn-create-task")?.addEventListener("click", () => {
      const name = document.getElementById("task-name").value.trim();
      if (!name) return showToast("Task name required.", "warning");
      let xp = taskForm.xp;
      if (xp === "CUSTOM")
        xp = Number(document.getElementById("task-xp-custom").value) || 25;
      const p = ensurePlayer(getPlayer());
      const dom = document.getElementById("task-domain").value;
      const task = {
        id: crypto.randomUUID(),
        name,
        description: document.getElementById("task-desc").value.trim(),
        primaryDomain: dom,
        subField: document.getElementById("task-subfield").value,
        secondaryDomains: [...taskForm.secondaries],
        subject:
          dom === "academic"
            ? document.getElementById("task-subject").value
            : null,
        xpReward: xp,
        estimatedTime: taskForm.time,
        due: document.getElementById("task-due").value || null,
        priority: taskForm.priority,
        createdAt: Date.now(),
        startTime: null,
        completed: false,
      };
      p.tasks.push(task);
      syncPlayerToStore(p);
      taskForm.secondaries = new Set();
      document
        .getElementById("task-secondary-chips")
        ?.querySelectorAll(".chip")
        .forEach((c) => c.classList.remove("is-selected"));
      document.getElementById("task-name").value = "";
      document.getElementById("add-task-panel")?.classList.add("is-hidden");
      renderTasks();
      showToast("Mission created.", "success");
    });

    document.getElementById("btn-toggle-add-boss")?.addEventListener("click", () => {
      document.getElementById("add-boss-panel")?.classList.toggle("is-hidden");
    });

    document.getElementById("anticheat-honest")?.addEventListener("click", async (e) => {
      const button = e.currentTarget;
      const originalText = button.textContent;
      button.disabled = true;
      button.textContent = "...";
      const t = pendingAnticheatTask;
      try {
        if (!t) return closeAnticheat();
        const p = ensurePlayer(getPlayer());
        p.trustArchitect = true;
        syncPlayerToStore(p);
        closeAnticheat();
        finalizeTaskComplete(t);
        try {
          if (typeof GEMINI_API_KEY !== "undefined" && GEMINI_API_KEY !== "YOUR_KEY_HERE") {
            const line = await callArchitectOnce("One short cold approving sentence. Player was honest.", 80);
            showToast(line.trim(), "success");
          }
        } catch (_) {}
        checkAchievements();
      } finally {
        button.disabled = false;
        button.textContent = originalText;
      }
    });
    document.getElementById("anticheat-cancel")?.addEventListener("click", () => {
      closeAnticheat();
      showToast("Task remains incomplete. Don't waste ARCHITECT's time.", "error");
    });

    document.getElementById("planner-prev")?.addEventListener("click", () => {
      plannerDate.setDate(plannerDate.getDate() - 1);
      renderPlanner();
    });
    document.getElementById("planner-next")?.addEventListener("click", () => {
      plannerDate.setDate(plannerDate.getDate() + 1);
      renderPlanner();
    });
    document.getElementById("planner-lock")?.addEventListener("click", () => {
      const p = ensurePlayer(getPlayer());
      const key = plannerDate.toDateString();
      const blocks = p.planHistory[key]?.blocks || plannerBlocks;
      if (blocks.length < 4) {
        showToast("Fill more of the day before locking.", "warning");
        return;
      }
      p.planHistory[key] = { blocks, lockedAt: Date.now() };
      p.tacticianUnlocked = true;
      syncPlayerToStore(p);
      showToast("Plan locked. ARCHITECT has been notified.", "success");
      checkAchievements();
      renderPlanner();
    });
    document.getElementById("planner-architect")?.addEventListener("click", async (e) => {
      const button = e.currentTarget;
      const originalText = button.textContent;
      button.disabled = true;
      button.textContent = "...";
      const st = document.getElementById("planner-architect-status");
      st.classList.remove("is-hidden");
      st.textContent = "ARCHITECT IS CALCULATING YOUR ROUTINE...";
      const p = ensurePlayer(getPlayer());
      const prompt = `You are ARCHITECT, blunt AI life mentor. Generate a specific time-blocked daily routine for tomorrow.
Format each block EXACTLY as: HH:MM-HH:MM | [Activity] | [Domain] | [XP]
One block per line. No intro text, no conclusion. Just the blocks.
Player: Name=${p.realName}, Age=${p.age}, Life field=${p.lifeField},
Domain priorities=${(p.domainPriorities || []).join(",")}, Streak=${p.streak},
Recent tasks=${(p.taskHistory || []).slice(-5).map((x) => x.name).join(",")}`;
      try {
        const text = await callArchitectText(prompt, 800);
        const chips = document.getElementById("planner-suggestion-chips");
        chips.innerHTML = "";
        text.split("\n").forEach((line) => {
          const m = line.match(/(\d{1,2}:\d{2})-(\d{1,2}:\d{2})\s*\|\s*([^|]+)\|\s*([^|]+)\|\s*(\d+)/);
          if (!m) return;
          const matchedDomain = m[4].trim().toLowerCase();
          const normalizedDomain =
            [
              "biological",
              "psychological",
              "social",
              "academic",
              "economic",
              "time",
              "creative",
              "existential",
            ].find((id) => matchedDomain.includes(id)) || "academic";
          const b = document.createElement("button");
          b.type = "button";
          b.className = "chip chip-toggle";
          b.textContent = line.trim().slice(0, 60);
          b.addEventListener("click", () => {
            const h = parseInt(m[1], 10);
            plannerBlocks.push({
              hour: h,
              name: m[3].trim(),
              domain: normalizedDomain,
              xp: Number(m[5]),
            });
            savePlannerDay();
            renderPlanner();
          });
          chips.appendChild(b);
        });
        st.textContent = "Suggestions ready. Tap a chip to add.";
      } catch (err) {
        console.error("Planner architect suggestion failed:", err);
        st.classList.remove("is-hidden");
        st.textContent = "ARCHITECT unavailable. Failed to fetch suggestions.";
      } finally {
        button.disabled = false;
        button.textContent = originalText;
      }
    });

    document.getElementById("btn-academic-boss")?.addEventListener("click", () => {
      document.getElementById("btn-toggle-add-boss")?.click();
      document.getElementById("add-boss-panel")?.classList.remove("is-hidden");
      const d = document.getElementById("boss-domain");
      if (d) {
        d.value = "academic";
        document.getElementById("boss-subject-wrap")?.classList.remove("is-hidden");
      }
      document.querySelector('[data-tab="bosses"]')?.click();
    });

    renderSidebar();
    renderTasks();
    renderBosses();
    renderAchievements();
    renderMonsterBestiary();
    renderLifeStats();
    renderPlanner();
    renderStudy();

    if (monsterInterval) clearInterval(monsterInterval);
    monsterInterval = setInterval(showMonsterBanner, 300000);
  }

  document.addEventListener("DOMContentLoaded", initDashboard);
})();
