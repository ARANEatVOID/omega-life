(function () {
  const STEP_NAMES = [
    "IDENTITY CORE",
    "AVATAR",
    "LIFE FIELD",
    "FIELD PROFILE",
    "DOMAIN PRIORITIES",
    "ARCHITECT BRIEFING",
  ];

  const DOMAIN_META = [
    { id: "biological", icon: "⚡", name: "BIOLOGICAL", kanji: "肉体" },
    { id: "psychological", icon: "🧠", name: "PSYCHOLOGICAL", kanji: "精神" },
    { id: "social", icon: "👥", name: "SOCIAL", kanji: "社会" },
    { id: "academic", icon: "📚", name: "ACADEMIC", kanji: "学習" },
    { id: "economic", icon: "💴", name: "ECONOMIC", kanji: "経済" },
    { id: "time", icon: "⏱️", name: "TIME", kanji: "時間" },
    { id: "creative", icon: "🎨", name: "CREATIVE", kanji: "創造" },
    { id: "existential", icon: "🔮", name: "EXISTENTIAL", kanji: "存在" },
  ];

  const SCHOOL_SUBJECTS = [
    ["⚡", "Physics"],
    ["🧪", "Chemistry"],
    ["🧬", "Biology"],
    ["📐", "Mathematics"],
    ["💻", "Computer Science"],
    ["📊", "Accounts"],
    ["🏢", "Business Studies"],
    ["📖", "English"],
    ["🏛️", "History"],
    ["⚖️", "Civics"],
    ["🌍", "Geography"],
    ["🇫🇷", "French"],
    ["🇮🇳", "Hindi"],
    ["📜", "Sanskrit"],
    ["🏠", "Home Science"],
    ["🎨", "Arts"],
  ];

  const EXAMS = [
    "JEE",
    "NEET",
    "UPSC",
    "SAT",
    "IELTS",
    "CUET",
    "Olympiad",
    "Other",
    "None",
  ];

  const UNI_QUICK = [
    ["📐", "Calculus"],
    ["💻", "Programming"],
    ["⚗️", "Organic Chem"],
    ["📊", "Statistics"],
    ["🧠", "Psychology"],
    ["⚖️", "Law"],
    ["💴", "Economics"],
    ["🏗️", "Engineering"],
  ];

  const UNI_CHALL = [
    "Academics",
    "Finances",
    "Social Life",
    "Mental Health",
    "Career Clarity",
    "Time Management",
    "Homesickness",
    "Other",
  ];

  const JOB_CHALL = [
    "Work-Life Balance",
    "Toxic Environment",
    "Lack of Growth",
    "Skill Gaps",
    "Bad Management",
    "Low Pay",
    "Burnout",
    "No Challenge",
    "Other",
  ];

  const RET_GOALS = [
    "Learn new skills",
    "Travel",
    "Spend time with family",
    "Start a hobby",
    "Write / Create",
    "Volunteer",
    "Start a small business",
    "Health & Fitness",
    "Mentoring others",
    "Spiritual exploration",
    "Other",
  ];

  const RET_ARCH = [
    "Daily routines",
    "Learning goals",
    "Health tracking",
    "Reflection",
    "All of the above",
  ];

  function defaultDomainOrder(lifeField) {
    if (lifeField === "job")
      return [
        "economic",
        "time",
        "psychological",
        "social",
        "biological",
        "creative",
        "academic",
        "existential",
      ];
    if (lifeField === "retired")
      return [
        "existential",
        "biological",
        "social",
        "creative",
        "psychological",
        "time",
        "economic",
        "academic",
      ];
    return [
      "academic",
      "psychological",
      "time",
      "biological",
      "social",
      "creative",
      "economic",
      "existential",
    ];
  }

  function shake(el) {
    if (!el) return;
    el.classList.remove("input-shake");
    void el.offsetWidth;
    el.classList.add("input-shake");
  }

  function getRadioGroupPicked(group) {
    const wrap = document.querySelector(`[data-radio-group="${group}"]`);
    return wrap?.dataset.picked || "";
  }

  function setupRadioGroup(group, labels) {
    const wrap = document.querySelector(`[data-radio-group="${group}"]`);
    if (!wrap) return;
    wrap.innerHTML = "";
    labels.forEach((label) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "chip chip-radio";
      b.dataset.value = label;
      b.textContent = label;
      b.addEventListener("click", () => {
        wrap.querySelectorAll(".chip-radio").forEach((c) =>
          c.classList.remove("is-selected")
        );
        b.classList.add("is-selected");
        wrap.dataset.picked = label;
      });
      wrap.appendChild(b);
    });
  }

  function setupMultiChips(container, values) {
    if (!container) return;
    container.innerHTML = "";
    values.forEach((v) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "chip chip-toggle";
      b.dataset.value = v;
      b.textContent = v;
      b.addEventListener("click", () => b.classList.toggle("is-selected"));
      container.appendChild(b);
    });
  }

  function selectedMulti(container) {
    if (!container) return [];
    return [...container.querySelectorAll(".chip-toggle.is-selected")].map(
      (c) => c.dataset.value || c.textContent
    );
  }

  function addSubjectChip(container, name, emoji, removable) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "chip chip-toggle is-selected chip-subject";
    b.dataset.name = name;
    b.dataset.emoji = emoji;
    b.innerHTML = `<span class="chip__emo">${emoji}</span><span>${name}</span>`;
    b.addEventListener("click", (ev) => {
      if (ev.target.closest(".chip-remove")) return;
      b.classList.toggle("is-selected");
    });
    if (removable) {
      const x = document.createElement("span");
      x.className = "chip-remove";
      x.textContent = "×";
      x.setAttribute("aria-label", "Remove");
      x.addEventListener("click", (ev) => {
        ev.stopPropagation();
        b.remove();
      });
      b.appendChild(x);
    }
    container.appendChild(b);
  }

  function collectSubjectChips(container) {
    if (!container) return [];
    return [...container.querySelectorAll(".chip-subject.is-selected")].map(
      (c) => ({
        name: c.dataset.name || "",
        emoji: c.dataset.emoji || "📚",
      })
    );
  }

  function getLifeField() {
    return document.querySelector('input[name="life-field"]:checked')?.value || "";
  }

  function getSchoolGrade() {
    return document.querySelector('input[name="school-grade"]:checked')?.value || "";
  }

  function updateFieldPanels() {
    const lf = getLifeField();
    ["school", "university", "job", "retired"].forEach((k) => {
      const p = document.getElementById(`panel-${k}`);
      if (p) p.classList.toggle("is-hidden", k !== lf);
    });
  }

  function renderDomainList(order) {
    const list = document.getElementById("domain-sort-list");
    if (!list) return;
    list.innerHTML = "";
    const mobile = window.matchMedia("(max-width: 767px)").matches;
    order.forEach((id, idx) => {
      const meta = DOMAIN_META.find((d) => d.id === id);
      if (!meta) return;
      const li = document.createElement("li");
      li.className = "domain-sort-item card";
      li.dataset.domainId = id;
      li.draggable = !mobile;
      li.innerHTML = `
        <span class="domain-sort-handle" aria-hidden="true">⋮⋮</span>
        <span class="domain-sort-icon">${meta.icon}</span>
        <div class="domain-sort-text">
          <span class="domain-sort-name font-orbitron">${meta.name}</span>
          <span class="domain-sort-kanji jp">${meta.kanji}</span>
        </div>
        <div class="domain-sort-mob">
          <button type="button" class="btn btn-cyan btn-icon" data-domain-up aria-label="Move up">↑</button>
          <button type="button" class="btn btn-cyan btn-icon" data-domain-down aria-label="Move down">↓</button>
        </div>`;
      list.appendChild(li);
    });

    let dragEl = null;
    list.querySelectorAll(".domain-sort-item").forEach((li) => {
      li.addEventListener("dragstart", (e) => {
        dragEl = li;
        li.classList.add("is-dragging");
        e.dataTransfer.effectAllowed = "move";
      });
      li.addEventListener("dragend", () => {
        li.classList.remove("is-dragging");
        dragEl = null;
      });
      li.addEventListener("dragover", (e) => {
        e.preventDefault();
        if (!dragEl || dragEl === li) return;
        const rect = li.getBoundingClientRect();
        const before = e.clientY < rect.top + rect.height / 2;
        list.insertBefore(dragEl, before ? li : li.nextSibling);
      });
    });

    list.querySelectorAll("[data-domain-up]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const li = btn.closest(".domain-sort-item");
        const prev = li?.previousElementSibling;
        if (li && prev) list.insertBefore(li, prev);
      });
    });
    list.querySelectorAll("[data-domain-down]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const li = btn.closest(".domain-sort-item");
        const next = li?.nextElementSibling;
        if (li && next) list.insertBefore(next, li);
      });
    });
  }

  function readDomainOrder() {
    return [...document.querySelectorAll("#domain-sort-list .domain-sort-item")].map(
      (li) => li.dataset.domainId
    );
  }

  function updateSummary() {
    const av = document.querySelector('input[name="avatar"]:checked');
    let emoji = "—";
    let avName = "";
    if (av?.value) {
      const [e, en] = av.value.split("|");
      emoji = e || "—";
      avName = en || "";
    }
    const tag = document.getElementById("inp-username")?.value.trim() || "—";
    const title = document.getElementById("inp-title")?.value.trim() || "—";
    const real = document.getElementById("inp-realname")?.value.trim() || "—";
    const lf = getLifeField() || "—";
    const lfLabel =
      { school: "SCHOOL", university: "UNIVERSITY", job: "JOB", retired: "RETIRED" }[
        lf
      ] || lf.toUpperCase();

    let detail = "—";
    if (lf === "school") {
      const g = getSchoolGrade();
      detail = g ? `Grade ${g}` : "—";
    } else if (lf === "university") {
      detail =
        document.getElementById("inp-uni-name")?.value.trim() ||
        document.getElementById("inp-uni-major")?.value.trim() ||
        "—";
    } else if (lf === "job") {
      detail =
        (document.getElementById("inp-job-title")?.value.trim() || "—") +
        " @ " +
        (document.getElementById("inp-job-company")?.value.trim() || "—");
    } else if (lf === "retired") {
      detail =
        document.getElementById("inp-ret-prof")?.value.trim() || "—";
    }

    const order = readDomainOrder();
    const top3 = order
      .slice(0, 3)
      .map((id) => DOMAIN_META.find((d) => d.id === id)?.name || id)
      .join(" · ");

    const elA = document.getElementById("sum-avatar");
    const elN = document.getElementById("sum-name");
    const elT = document.getElementById("sum-tag");
    const elF = document.getElementById("sum-field");
    const elD = document.getElementById("sum-detail");
    const elDom = document.getElementById("sum-domains");
    if (elA) elA.textContent = emoji;
    if (elN) elN.textContent = `${real} // ${title}`;
    if (elT) elT.textContent = `@${tag}${avName ? ` · ${avName}` : ""}`;
    if (elF) elF.textContent = lfLabel;
    if (elD) elD.textContent = detail;
    if (elDom) elDom.textContent = top3 ? `TOP DOMAINS: ${top3}` : "—";
  }

  function validateStep1() {
    const real = document.getElementById("inp-realname");
    const user = document.getElementById("inp-username");
    const pass = document.getElementById("inp-password");
    const age = document.getElementById("inp-age");
    const title = document.getElementById("inp-title");
    let ok = true;
    [real, user, pass, age, title].forEach((el) => {
      if (!el?.value?.trim()) {
        ok = false;
        el.classList.add("error");
        shake(el);
      } else el.classList.remove("error");
    });
    const u = user?.value.trim() || "";
    if (u.length < 3 || /\s/.test(u)) {
      ok = false;
      user.classList.add("error");
      shake(user);
      showToast("Player tag: min 3 chars, no spaces.", "error");
    }
    if (getAllPlayers()[u]) {
      ok = false;
      user.classList.add("error");
      shake(user);
      showToast("That player tag is taken.", "error");
    }
    const pw = pass?.value || "";
    if (pw.length < 6) {
      ok = false;
      pass.classList.add("error");
      shake(pass);
      showToast("Password: min 6 characters.", "error");
    }
    const a = Number(age?.value);
    if (!Number.isFinite(a) || a < 1 || a > 99) {
      ok = false;
      age.classList.add("error");
      shake(age);
    }
    return ok;
  }

  function validateStep2() {
    const sel = document.querySelector('input[name="avatar"]:checked');
    if (!sel) {
      showToast("Choose an avatar.", "warning");
      return false;
    }
    return true;
  }

  function validateStep3() {
    if (!getLifeField()) {
      showToast("Select your battlefield.", "warning");
      return false;
    }
    return true;
  }

  function validateStep4() {
    const lf = getLifeField();
    if (lf === "school") {
      if (!getSchoolGrade()) {
        showToast("Pick a grade.", "warning");
        return false;
      }
      const subs = [
        ...document.querySelectorAll("#school-subject-chips .chip-toggle.is-selected"),
        ...document.querySelectorAll("#school-custom-chips .chip-subject.is-selected"),
      ];
      if (subs.length < 1) {
        showToast("Select at least one subject.", "warning");
        return false;
      }
      const sn = document.getElementById("inp-school-name");
      const sc = document.getElementById("inp-school-city");
      const dc = document.getElementById("inp-school-dream-college");
      const ch = document.getElementById("sel-school-challenge");
      if (!sn?.value.trim() || !sc?.value.trim() || !dc?.value.trim()) {
        [sn, sc, dc].forEach((el) => {
          if (el && !el.value.trim()) {
            el.classList.add("error");
            shake(el);
          }
        });
        showToast("Complete school location fields.", "error");
        return false;
      }
      [sn, sc, dc].forEach((el) => el?.classList.remove("error"));
      if (!ch?.value) {
        showToast("Select your biggest academic challenge.", "warning");
        return false;
      }
      return true;
    }
    if (lf === "university") {
      const req = [
        "inp-uni-name",
        "inp-uni-city",
        "inp-uni-major",
        "inp-uni-total-years",
        "inp-uni-current-year",
        "inp-uni-grad-year",
      ];
      let ok = true;
      req.forEach((id) => {
        const el = document.getElementById(id);
        if (!el?.value?.trim()) {
          ok = false;
          el?.classList.add("error");
          shake(el);
        } else el.classList.remove("error");
      });
      if (!ok) return false;
      const ty = Number(document.getElementById("inp-uni-total-years")?.value);
      const cy = Number(document.getElementById("inp-uni-current-year")?.value);
      if (Number.isFinite(ty) && Number.isFinite(cy) && cy > ty) {
        showToast("Current year cannot exceed program length.", "error");
        return false;
      }
      const subs = document.querySelectorAll("#uni-subject-chips .chip-subject.is-selected");
      if (subs.length < 1) {
        showToast("Add at least one university subject.", "warning");
        return false;
      }
      const ag = document.querySelector('input[name="after-grad"]:checked');
      if (!ag) {
        showToast("Choose a post-graduation path.", "warning");
        return false;
      }
      if (
        !getRadioGroupPicked("uni-internship") ||
        !getRadioGroupPicked("uni-living")
      ) {
        showToast("Complete internship and living fields.", "warning");
        return false;
      }
      if (selectedMulti(document.getElementById("uni-challenge-chips")).length < 1) {
        showToast("Pick at least one challenge.", "warning");
        return false;
      }
      if (ag.value === "job") {
        const j = document.getElementById("inp-uni-dream-job");
        const c = document.getElementById("inp-uni-dream-company");
        if (!j?.value.trim() || !c?.value.trim()) {
          [j, c].forEach((el) => {
            el?.classList.add("error");
            shake(el);
          });
          return false;
        }
        [j, c].forEach((el) => el?.classList.remove("error"));
      }
      if (ag.value === "business") {
        const b = document.getElementById("inp-uni-business");
        if (!b?.value.trim()) {
          b.classList.add("error");
          shake(b);
          return false;
        }
        b.classList.remove("error");
      }
      if (ag.value === "studies") {
        const f = document.getElementById("inp-uni-further");
        if (!f?.value.trim()) {
          f.classList.add("error");
          shake(f);
          return false;
        }
        f.classList.remove("error");
      }
      return ok;
    }
    if (lf === "job") {
      const ids = [
        "inp-job-title",
        "inp-job-company",
        "sel-job-industry",
        "inp-job-years",
        "inp-job-dream-title",
        "inp-job-dream-company",
      ];
      let ok = true;
      ids.forEach((id) => {
        const el = document.getElementById(id);
        if (!el?.value?.trim()) {
          ok = false;
          el?.classList.add("error");
          shake(el);
        } else el.classList.remove("error");
      });
      if (!ok) return false;
      if (
        !getRadioGroupPicked("job-employment") ||
        !getRadioGroupPicked("job-timeline") ||
        !getRadioGroupPicked("job-side") ||
        !getRadioGroupPicked("job-startup")
      ) {
        showToast("Complete employment, timeline, side project, and startup fields.", "warning");
        return false;
      }
      if (getRadioGroupPicked("job-side") === "Yes") {
        const d = document.getElementById("inp-job-side-desc");
        if (!d?.value.trim()) {
          d?.classList.add("error");
          shake(d);
          return false;
        }
        d.classList.remove("error");
      }
      if (selectedMulti(document.getElementById("job-challenge-chips")).length < 1) {
        showToast("Select at least one work challenge.", "warning");
        return false;
      }
      return ok;
    }
    if (lf === "retired") {
      const ids = [
        "inp-ret-prof",
        "inp-ret-years-worked",
        "sel-ret-industry",
        "inp-ret-age",
      ];
      let ok = true;
      ids.forEach((id) => {
        const el = document.getElementById(id);
        if (!el?.value?.trim()) {
          ok = false;
          el?.classList.add("error");
          shake(el);
        } else el.classList.remove("error");
      });
      if (!ok) return false;
      if (selectedMulti(document.getElementById("ret-goal-chips")).length < 1) {
        showToast("Pick at least one retirement goal.", "warning");
        return false;
      }
      if (!getRadioGroupPicked("ret-health") || !getRadioGroupPicked("ret-finance")) {
        showToast("Complete health and finance questions.", "warning");
        return false;
      }
      if (getRadioGroupPicked("ret-health") === "Yes") {
        const h = document.getElementById("inp-ret-health-text");
        if (!h?.value.trim()) {
          h?.classList.add("error");
          shake(h);
          return false;
        }
        h.classList.remove("error");
      }
      if (selectedMulti(document.getElementById("ret-arch-chips")).length < 1) {
        showToast("Select how ARCHITECT should help.", "warning");
        return false;
      }
      if (
        !getRadioGroupPicked("ret-family") ||
        !getRadioGroupPicked("ret-mentor")
      ) {
        showToast("Complete family and mentoring fields.", "warning");
        return false;
      }
      return ok;
    }
    return false;
  }

  function validateStep5() {
    const o = readDomainOrder();
    if (o.length !== 8) return false;
    return true;
  }

  function validateStep6() {
    const t = document.getElementById("inp-briefing")?.value.trim() || "";
    if (t.length < 1) {
      showToast("Brief ARCHITECT before you deploy.", "warning");
      return false;
    }
    return true;
  }

  function buildPlayer() {
    const nz = (v) => (v === "" || v == null ? null : v);
    const lf = getLifeField();
    const username = document.getElementById("inp-username").value.trim();
    const av = document.querySelector('input[name="avatar"]:checked')?.value || "";
    const [avatarEmoji, avatarRoleEn] = av.split("|");

    const player = {
      realName: document.getElementById("inp-realname").value.trim(),
      username,
      password: document.getElementById("inp-password").value,
      age: Number(document.getElementById("inp-age").value),
      title: document.getElementById("inp-title").value.trim(),
      avatar: avatarEmoji || "🎮",
      avatarRole: avatarRoleEn || "",
      lifeField: lf,
      grade: null,
      subjects: [],
      schoolName: null,
      city: null,
      dreamCollege: null,
      currentGradeScore: null,
      competitiveExams: [],
      academicChallenge: null,
      universityName: null,
      uniCity: null,
      major: null,
      totalYears: null,
      currentYear: null,
      cgpa: null,
      afterGraduation: null,
      dreamJob: null,
      dreamCompany: null,
      businessIdea: null,
      furtherStudiesTarget: null,
      expectedGraduationYear: null,
      internshipStatus: null,
      livingStatus: null,
      uniChallenges: [],
      jobTitle: null,
      company: null,
      industry: null,
      yearsExp: null,
      currentSalary: null,
      employmentType: null,
      dreamJobTitle: null,
      dreamCompanyTarget: null,
      dreamSalary: null,
      timeline: null,
      hasSideProject: null,
      sideProjectDesc: null,
      workChallenges: [],
      wantsStartup: null,
      upskillingGoals: null,
      previousProfession: null,
      yearsWorked: null,
      retiredIndustry: null,
      retiredAt: null,
      retirementGoals: [],
      unfulfilledDream: null,
      healthGoals: null,
      healthGoalsActive: null,
      financesActive: null,
      architectHelp: [],
      familySituation: null,
      mentoring: null,
      legacyGoal: null,
      architectBriefing: document.getElementById("inp-briefing").value.trim(),
      domainPriorities: readDomainOrder(),
      xp: 0,
      level: 1,
      streak: 0,
      lastActive: null,
      domainXP: {
        biological: 0,
        psychological: 0,
        social: 0,
        academic: 0,
        economic: 0,
        time: 0,
        creative: 0,
        existential: 0,
      },
      subjectXP: {},
      achievements: [],
      tasksCompleted: 0,
      bossesDefeated: 0,
      taskHistory: [],
      planHistory: {},
      bosses: [],
      createdAt: Date.now(),
    };

    if (lf === "school") {
      player.grade = Number(getSchoolGrade());
      player.subjects = [
        ...collectSubjectChips(document.getElementById("school-custom-chips")),
        ...[...document.querySelectorAll("#school-subject-chips .chip-toggle.is-selected")].map(
          (c) => ({
            name: c.dataset.name,
            emoji: c.dataset.emoji,
          })
        ),
      ];
      player.schoolName = document.getElementById("inp-school-name").value.trim();
      player.city = document.getElementById("inp-school-city").value.trim();
      player.dreamCollege = document.getElementById("inp-school-dream-college").value.trim();
      const gpa = document.getElementById("inp-school-gpa").value.trim();
      player.currentGradeScore = gpa === "" ? null : Number(gpa);
      player.academicChallenge = document.getElementById("sel-school-challenge").value;
      player.competitiveExams = selectedMulti(document.getElementById("exam-chips"));
    } else if (lf === "university") {
      player.universityName = document.getElementById("inp-uni-name").value.trim();
      player.uniCity = document.getElementById("inp-uni-city").value.trim();
      player.major = document.getElementById("inp-uni-major").value.trim();
      player.totalYears = Number(document.getElementById("inp-uni-total-years").value);
      player.currentYear = Number(document.getElementById("inp-uni-current-year").value);
      const cg = document.getElementById("inp-uni-cgpa").value.trim();
      player.cgpa = cg === "" ? null : Number(cg);
      player.subjects = collectSubjectChips(document.getElementById("uni-subject-chips"));
      const ag = document.querySelector('input[name="after-grad"]:checked')?.value;
      player.afterGraduation = ag;
      if (ag === "job") {
        player.dreamJob = document.getElementById("inp-uni-dream-job").value.trim();
        player.dreamCompany = document.getElementById("inp-uni-dream-company").value.trim();
      }
      if (ag === "business")
        player.businessIdea = document.getElementById("inp-uni-business").value.trim();
      if (ag === "studies")
        player.furtherStudiesTarget = document.getElementById("inp-uni-further").value.trim();
      player.expectedGraduationYear = Number(
        document.getElementById("inp-uni-grad-year").value
      );
      player.internshipStatus = getRadioGroupPicked("uni-internship");
      player.livingStatus = getRadioGroupPicked("uni-living");
      player.uniChallenges = selectedMulti(document.getElementById("uni-challenge-chips"));
    } else if (lf === "job") {
      player.jobTitle = document.getElementById("inp-job-title").value.trim();
      player.company = document.getElementById("inp-job-company").value.trim();
      player.industry = document.getElementById("sel-job-industry").value;
      player.yearsExp = Number(document.getElementById("inp-job-years").value);
      player.currentSalary = document.getElementById("sel-job-salary").value || null;
      player.employmentType = getRadioGroupPicked("job-employment");
      player.dreamJobTitle = document.getElementById("inp-job-dream-title").value.trim();
      player.dreamCompanyTarget = document.getElementById("inp-job-dream-company").value.trim();
      player.dreamSalary = document.getElementById("sel-job-dream-salary").value || null;
      player.timeline = getRadioGroupPicked("job-timeline");
      const side = getRadioGroupPicked("job-side");
      player.hasSideProject = side === "Yes";
      player.sideProjectDesc =
        side === "Yes"
          ? document.getElementById("inp-job-side-desc").value.trim()
          : null;
      player.workChallenges = selectedMulti(document.getElementById("job-challenge-chips"));
      player.wantsStartup = getRadioGroupPicked("job-startup");
      player.upskillingGoals = nz(document.getElementById("inp-job-upskill").value.trim());
    } else if (lf === "retired") {
      player.previousProfession = document.getElementById("inp-ret-prof").value.trim();
      player.yearsWorked = Number(document.getElementById("inp-ret-years-worked").value);
      player.retiredIndustry = document.getElementById("sel-ret-industry").value;
      player.retiredAt = Number(document.getElementById("inp-ret-age").value);
      player.retirementGoals = selectedMulti(document.getElementById("ret-goal-chips"));
      player.unfulfilledDream = nz(
        document.getElementById("inp-ret-unfulfilled").value.trim()
      );
      const h = getRadioGroupPicked("ret-health");
      player.healthGoalsActive = h === "Yes";
      player.healthGoals =
        h === "Yes"
          ? document.getElementById("inp-ret-health-text").value.trim()
          : null;
      player.financesActive = getRadioGroupPicked("ret-finance") === "Yes";
      player.architectHelp = selectedMulti(document.getElementById("ret-arch-chips"));
      player.familySituation = getRadioGroupPicked("ret-family");
      player.mentoring = getRadioGroupPicked("ret-mentor");
      player.legacyGoal = nz(document.getElementById("inp-ret-legacy").value.trim());
    }

    return player;
  }

  function showAgeGate() {
    document.getElementById("signup-wizard-root")?.classList.add("is-hidden");
    const ov = document.getElementById("signup-age-overlay");
    ov?.classList.remove("is-hidden");
    ov?.setAttribute("aria-hidden", "false");
  }

  function showInitOverlay(player) {
    const overlay = document.createElement("div");
    overlay.className = "signup-init-overlay";
    const lf = {
      school: "SCHOOL",
      university: "UNIVERSITY",
      job: "JOB",
      retired: "RETIRED",
    }[player.lifeField] || player.lifeField;
    overlay.innerHTML = `
      <div class="signup-init-overlay__inner">
        <div class="signup-init-overlay__emoji">${player.avatar}</div>
        <div class="signup-init-overlay__name font-orbitron">${player.realName} // ${player.title}</div>
        <div class="signup-init-overlay__badge font-orbitron">${lf}</div>
        <div class="signup-init-overlay__level font-orbitron">LEVEL 1</div>
        <p class="signup-init-overlay__jp jp">始まりだ — It begins.</p>
      </div>`;
    document.body.appendChild(overlay);
    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 2500);
  }

  function initSignupWizard() {
    const root = document.getElementById("signup-wizard-root");
    if (!root) return;

    const viewport = document.getElementById("wizard-viewport");
    const label = document.getElementById("wizard-step-label");
    const progress = document.getElementById("wizard-progress");
    let step = 1;

    function renderProgress() {
      if (!progress) return;
      progress.innerHTML = "";
      for (let i = 1; i <= 6; i++) {
        const s = document.createElement("div");
        s.className = "wizard-progress__seg";
        if (i < step) s.classList.add("is-done");
        if (i === step) s.classList.add("is-active");
        progress.appendChild(s);
      }
    }

    function setStep(n) {
      step = Math.max(1, Math.min(6, n));
      viewport?.style.setProperty("--wiz-step", String(step));
      if (label)
        label.textContent = `STEP ${step} OF 6 — ${STEP_NAMES[step - 1]}`;
      renderProgress();
      if (step === 4) updateFieldPanels();
      if (step === 5) {
        const list = document.getElementById("domain-sort-list");
        const lf = getLifeField() || "school";
        if (list && list.dataset.seeded !== lf) {
          renderDomainList(defaultDomainOrder(lf));
          list.dataset.seeded = lf;
        }
      }
      if (step === 6) updateSummary();
    }

    renderProgress();
    label.textContent = `STEP 1 OF 6 — ${STEP_NAMES[0]}`;

    const schoolWrap = document.getElementById("school-subject-chips");
    schoolWrap.innerHTML = "";
    SCHOOL_SUBJECTS.forEach(([emoji, name]) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "chip chip-toggle";
      b.dataset.emoji = emoji;
      b.dataset.name = name;
      b.innerHTML = `<span class="chip__emo">${emoji}</span><span>${name}</span>`;
      b.addEventListener("click", () => b.classList.toggle("is-selected"));
      schoolWrap.appendChild(b);
    });
    setupMultiChips(document.getElementById("exam-chips"), EXAMS);

    UNI_QUICK.forEach(([emoji, name]) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "chip chip-quick";
      b.textContent = `${emoji} ${name}`;
      b.addEventListener("click", () => {
        const wrap = document.getElementById("uni-subject-chips");
        if ([...wrap.querySelectorAll(".chip-subject")].some((c) => c.dataset.name === name))
          return;
        addSubjectChip(wrap, name, emoji, true);
        b.classList.add("is-selected");
      });
      document.getElementById("uni-quick-chips").appendChild(b);
    });

    setupMultiChips(document.getElementById("uni-challenge-chips"), UNI_CHALL);
    setupMultiChips(document.getElementById("job-challenge-chips"), JOB_CHALL);
    setupMultiChips(document.getElementById("ret-goal-chips"), RET_GOALS);
    setupMultiChips(document.getElementById("ret-arch-chips"), RET_ARCH);

    setupRadioGroup("uni-internship", [
      "None yet",
      "Seeking",
      "Interning now",
      "Completed",
    ]);
    setupRadioGroup("uni-living", [
      "At home",
      "Hostel/Dorm",
      "Shared apt",
      "Alone",
    ]);
    setupRadioGroup("job-employment", [
      "Full-time",
      "Part-time",
      "Freelance",
      "Contract",
      "Remote",
    ]);
    setupRadioGroup("job-timeline", [
      "1 year",
      "2-3 years",
      "5 years",
      "10 years",
      "No deadline",
    ]);
    setupRadioGroup("job-side", ["Yes", "No"]);
    setupRadioGroup("job-startup", ["Yes", "No", "Already doing it"]);
    setupRadioGroup("ret-health", ["Yes", "No"]);
    setupRadioGroup("ret-finance", ["Yes", "No"]);
    setupRadioGroup("ret-family", [
      "Living with family",
      "Living alone",
      "Mixed",
    ]);
    setupRadioGroup("ret-mentor", ["Yes", "No", "Open to it"]);

    document.querySelectorAll('input[name="school-grade"]').forEach((r) => {
      r.addEventListener("change", () => {
        const g = Number(r.value);
        document
          .getElementById("school-custom-subject-row")
          .classList.toggle("is-hidden", g < 11);
      });
    });

    document.querySelectorAll('input[name="after-grad"]').forEach((r) => {
      r.addEventListener("change", () => {
        const v = r.value;
        document.getElementById("uni-extra-job").classList.toggle("is-hidden", v !== "job");
        document
          .getElementById("uni-extra-business")
          .classList.toggle("is-hidden", v !== "business");
        document
          .getElementById("uni-extra-studies")
          .classList.toggle("is-hidden", v !== "studies");
      });
    });

    document
      .querySelector('[data-radio-group="job-side"]')
      ?.addEventListener("click", (e) => {
        const wrap = e.currentTarget;
        queueMicrotask(() => {
          const y = wrap.dataset.picked === "Yes";
          document
            .getElementById("job-side-desc-wrap")
            ?.classList.toggle("is-hidden", !y);
        });
      });

    document
      .querySelector('[data-radio-group="ret-health"]')
      ?.addEventListener("click", (e) => {
        const wrap = e.currentTarget;
        queueMicrotask(() => {
          const y = wrap.dataset.picked === "Yes";
          document
            .getElementById("ret-health-text-wrap")
            ?.classList.toggle("is-hidden", !y);
        });
      });

    document.querySelectorAll('input[name="life-field"]').forEach((r) => {
      r.addEventListener("change", updateFieldPanels);
    });

    const userInp = document.getElementById("inp-username");
    const userStat = document.getElementById("username-status");
    userInp?.addEventListener("input", () => {
      const v = userInp.value.trim();
      userInp.classList.remove("error");
      if (!v) {
        userStat.textContent = "";
        return;
      }
      let ok = v.length >= 3 && !/\s/.test(v) && !getAllPlayers()[v];
      userStat.textContent = ok ? "✓" : "✗";
      userStat.classList.toggle("is-ok", ok);
      userStat.classList.toggle("is-bad", !ok);
    });

    const passInp = document.getElementById("inp-password");
    const pwStr = document.getElementById("pw-strength");
    passInp?.addEventListener("input", () => {
      const len = passInp.value.length;
      let label = "";
      let cls = "";
      if (len === 0) pwStr.textContent = "";
      else if (len < 6) {
        label = "Weak";
        cls = "pw-weak";
      } else if (len < 10) {
        label = "Medium";
        cls = "pw-medium";
      } else {
        label = "Strong";
        cls = "pw-strong";
      }
      pwStr.textContent = label;
      pwStr.className = "pw-strength " + cls;
    });

    document.getElementById("btn-toggle-pass")?.addEventListener("click", () => {
      const t = passInp.type === "password" ? "text" : "password";
      passInp.type = t;
    });

    document.getElementById("btn-step1-next")?.addEventListener("click", () => {
      const age = Number(document.getElementById("inp-age")?.value);
      if (Number.isFinite(age) && age < 13) {
        showAgeGate();
        return;
      }
      if (!validateStep1()) return;
      setStep(2);
    });

    root.addEventListener("click", (e) => {
      if (e.target.closest("[data-wiz-next]")) {
        if (step === 2 && !validateStep2()) return;
        if (step === 3 && !validateStep3()) return;
        if (step === 4 && !validateStep4()) return;
        if (step === 5 && !validateStep5()) return;
        setStep(step + 1);
      }
      if (e.target.closest("[data-wiz-back]")) setStep(step - 1);
    });

    async function onSchoolAddSubject() {
      const inp = document.getElementById("inp-school-custom-subject");
      const name = inp.value.trim();
      if (!name) return;
      inp.value = "";
      const em = await fetchSubjectEmoji(name);
      addSubjectChip(document.getElementById("school-custom-chips"), name, em, true);
    }

    document
      .getElementById("btn-school-add-subject")
      ?.addEventListener("click", onSchoolAddSubject);

    async function onUniAddSubject() {
      const inp = document.getElementById("inp-uni-custom-subject");
      const name = inp.value.trim();
      if (!name) return;
      inp.value = "";
      const em = await fetchSubjectEmoji(name);
      const wrap = document.getElementById("uni-subject-chips");
      if ([...wrap.querySelectorAll(".chip-subject")].some((c) => c.dataset.name === name))
        return;
      addSubjectChip(wrap, name, em, true);
    }

    document.getElementById("btn-uni-add-subject")?.addEventListener("click", onUniAddSubject);

    const briefing = document.getElementById("inp-briefing");
    const bc = document.getElementById("briefing-counter");
    briefing?.addEventListener("input", () => {
      bc.textContent = `${briefing.value.length} / 500`;
      updateSummary();
    });

    document
      .getElementById("btn-initialize-player")
      ?.addEventListener("click", () => {
        if (!validateStep1() || !validateStep2() || !validateStep3()) {
          showToast("Complete earlier steps.", "error");
          return;
        }
        if (!validateStep4() || !validateStep5() || !validateStep6()) return;
        const player = buildPlayer();
        const all = getAllPlayers();
        if (all[player.username]) {
          showToast("Player tag already exists.", "error");
          return;
        }
        all[player.username] = player;
        saveAllPlayers(all);
        savePlayer(player);
        setCurrentUser(player.username);
        showInitOverlay(player);
      });

    [
      "inp-realname",
      "inp-username",
      "inp-title",
      "inp-school-name",
      "inp-uni-name",
      "inp-job-title",
      "inp-ret-prof",
    ].forEach((id) => {
      document.getElementById(id)?.addEventListener("input", () => {
        if (step === 6) updateSummary();
      });
    });
    document.querySelectorAll('input[name="avatar"]').forEach((r) => {
      r.addEventListener("change", () => {
        if (step === 6) updateSummary();
      });
    });
  }

  document.addEventListener("DOMContentLoaded", initSignupWizard);
})();
