/* ============================================================
   Atomic Media — Admin Console Master Controller
   Stitch Professional CMS v2.4.0
   Powers: auth, tab routing, dashboard KPIs, portfolio CRUD,
           work lifecycle table, client inbox, pages copywriting
   ============================================================ */

(function () {
  "use strict";

  /* ── Helpers ── */
  const API = (path) => `/api${path}`;
  let token = sessionStorage.getItem("adminToken") || null;
  let allMessages = [];
  let allProjects = [];

  const authHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  });

  async function apiFetch(path, opts = {}) {
    const res = await fetch(API(path), {
      ...opts,
      headers: { ...authHeaders(), ...(opts.headers || {}) },
    });
    if (res.status === 401) {
      showLogin();
      throw new Error("Session expired. Please log in again.");
    }
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
    return data;
  }

  function showToast(msg = "Done.", isError = false) {
    const toast = document.getElementById("toast");
    const toastText = document.getElementById("toastText");
    if (!toast || !toastText) return;
    toastText.textContent = msg;
    toast.style.background = isError
      ? "rgba(147,0,10,0.95)"
      : "";
    toast.classList.remove("translate-y-32");
    toast.classList.add("translate-y-0");
    setTimeout(() => {
      toast.classList.add("translate-y-32");
      toast.classList.remove("translate-y-0");
    }, 3500);
  }

  /* ── Auth Panel & Console toggle ── */
  const authPanel = document.getElementById("authPanel");
  const appSidebar = document.getElementById("appSidebar");
  const appMain = document.getElementById("appMain");

  function showLogin() {
    authPanel.style.display = "flex";
    appSidebar.style.display = "none";
    appMain.style.display = "none";
    sessionStorage.removeItem("adminToken");
    token = null;
  }

  function showConsole(user) {
    authPanel.style.display = "none";
    appSidebar.style.display = "flex";
    appMain.style.display = "flex";
    if (user) {
      const nameEl = document.getElementById("adminUserDisplayName");
      const avatarEl = document.getElementById("adminUserAvatarText");
      if (nameEl) nameEl.textContent = user.name || "Admin User";
      if (avatarEl) avatarEl.textContent = (user.name || "A")[0].toUpperCase();
    }
    // Activate first tab
    activateTab("dashboard");
  }

  /* ── Login Form ── */
  const authForm = document.getElementById("authForm");
  authForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("adminEmail").value.trim();
    const password = document.getElementById("adminPassword").value;
    const btn = document.getElementById("authSubmitBtn");
    btn.textContent = "VERIFYING CONSOLE...";
    btn.disabled = true;
    try {
      const data = await fetch(API("/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      }).then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.message || "Access denied.");
        return d;
      });
      token = data.token;
      sessionStorage.setItem("adminToken", token);
      showConsole(data.user);
      loadAllData();
    } catch (err) {
      showToast(`Login failed: ${err.message}`, true);
    } finally {
      btn.textContent = "VERIFY IDENTITY";
      btn.disabled = false;
    }
  });

  /* ── Logout ── */
  document.getElementById("logoutBtn").addEventListener("click", showLogin);

  /* ── Tab Routing ── */
  const tabPanes = document.querySelectorAll(".tab-pane");
  const navButtons = document.querySelectorAll("[data-tab]");

  function activateTab(tabId) {
    tabPanes.forEach((p) => p.classList.remove("active"));
    navButtons.forEach((b) => {
      const isActive = b.dataset.tab === tabId;
      b.classList.toggle("border-l-primary", isActive);
      b.classList.toggle("text-primary", isActive);
      b.classList.toggle("bg-surface-container-high", isActive);
      b.classList.toggle("border-l-transparent", !isActive);
      b.classList.toggle("text-on-surface-variant", !isActive);
    });
    const pane = document.getElementById(`tab-${tabId}`);
    if (pane) pane.classList.add("active");

    // Lazy load tab data
    if (tabId === "portfolio" || tabId === "work") renderProjectsUI();
    if (tabId === "clients") renderInboxUI();
    if (tabId === "pages") loadPagesCopy();
    if (tabId === "dashboard") renderDashboardKPIs();
  }

  navButtons.forEach((btn) => {
    btn.addEventListener("click", () => activateTab(btn.dataset.tab));
  });

  /* Sync button */
  const syncBtn = document.getElementById("syncStatsBtn");
  if (syncBtn) syncBtn.addEventListener("click", () => loadAllData());

  /* ── Global Search ── */
  const globalSearch = document.getElementById("globalSearchInput");
  if (globalSearch) {
    globalSearch.addEventListener("input", () => {
      const q = globalSearch.value.toLowerCase().trim();
      if (!q) return;
      // Switch to clients tab and search there
      activateTab("clients");
      const inboxSearch = document.getElementById("inboxSearchInput");
      if (inboxSearch) {
        inboxSearch.value = q;
        filterInboxTable();
      }
    });
  }

  /* ── Load All Data ── */
  async function loadAllData() {
    try {
      const [projects, messages] = await Promise.all([
        apiFetch("/projects"),
        apiFetch("/messages"),
      ]);
      allProjects = Array.isArray(projects) ? projects : [];
      allMessages = Array.isArray(messages) ? messages : [];

      renderDashboardKPIs();
      renderRecentActivity();
      checkDbStatus();
    } catch (err) {
      console.error("Data load error:", err);
    }
  }

  /* ── DB Status Badge ── */
  async function checkDbStatus() {
    try {
      const health = await fetch(API("/health")).then((r) => r.json());
      const badge = document.getElementById("dbStatusBadge");
      const storageText = document.getElementById("sidebarStorageText");
      if (badge) {
        if (health.dbConnected) {
          badge.innerHTML = `<span class="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> DB CONNECTED`;
          badge.className = "flex items-center gap-2 border border-green-950 bg-green-950/20 px-3 py-1 rounded-lg text-green-500 font-semibold text-xs uppercase";
        } else {
          badge.innerHTML = `<span class="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse"></span> OFFLINE MODE`;
          badge.className = "flex items-center gap-2 border border-yellow-900 bg-yellow-900/20 px-3 py-1 rounded-lg text-yellow-400 font-semibold text-xs uppercase";
        }
      }
      if (storageText) {
        storageText.textContent = health.dbConnected ? "MongoDB Atlas — Connected" : "Running in local fallback mode";
      }
    } catch (e) {
      /* ignore */
    }
  }

  /* ── Dashboard KPIs ── */
  function animateCount(el, target) {
    if (!el) return;
    let start = 0;
    const step = Math.ceil(target / 20);
    const timer = setInterval(() => {
      start = Math.min(start + step, target);
      el.textContent = start;
      if (start >= target) clearInterval(timer);
    }, 30);
  }

  function estimateValuation(messages) {
    let sum = 0;
    messages.forEach((m) => {
      const text = ((m.subject || "") + (m.message || "")).toLowerCase();
      
      // Match INR / Rupees
      if (text.includes("< 50,000 inr") || text.includes("under 50k") || text.includes("50,000 inr") && text.includes("<")) {
        sum += 25000;
      } else if (text.includes("50,000 - 1,50,000 inr") || text.includes("50,000 - 1,50,000")) {
        sum += 100000;
      } else if (text.includes("1,50,000 - 5,00,000 inr") || text.includes("1,50,000 - 5,00,000")) {
        sum += 325000;
      } else if (text.includes("5,00,000+ inr") || text.includes("5,00,000+")) {
        sum += 750000;
      }
      // Match Legacy USD (and convert to INR at an exchange rate of 1 USD = 83 INR)
      else if (text.includes("<$5k") || text.includes("< $5,000") || text.includes("under $5k")) {
        sum += 2500 * 83;
      } else if (text.includes("$5k-$15k") || text.includes("$5,000 - $15,000")) {
        sum += 10000 * 83;
      } else if (text.includes("$15k-$50k") || text.includes("$15,000 - $50,000")) {
        sum += 32500 * 83;
      } else if (text.includes("$50k+") || text.includes("$50,000+")) {
        sum += 75000 * 83;
      } else if (text.includes("$")) {
        sum += 5000 * 83;
      }
      // General default fallback in INR
      else {
        sum += 50000;
      }
    });
    return sum.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
  }

  function renderDashboardKPIs() {
    animateCount(document.getElementById("statProjectsCount"), allProjects.length);
    animateCount(document.getElementById("statInquiriesCount"), allMessages.length);
    animateCount(document.getElementById("statPipelineCount"), allMessages.filter((m) => m.status === "new").length);

    const valEl = document.getElementById("statValuation");
    if (valEl) valEl.textContent = estimateValuation(allMessages);

    // Work lifecycle stats
    animateCount(document.getElementById("workStatActiveCount"), allProjects.length);
    const avgProgress = allProjects.length
      ? Math.round(allProjects.reduce((a, p) => a + (p.progress || 100), 0) / allProjects.length)
      : 0;
    const avgEl = document.getElementById("workStatAvgProgress");
    if (avgEl) avgEl.textContent = `${avgProgress}%`;
    const progressBar = document.getElementById("workStatProgressBar");
    if (progressBar) progressBar.style.width = `${avgProgress}%`;
    const pendingEl = document.getElementById("workStatPendingCount");
    if (pendingEl) pendingEl.textContent = allProjects.filter((p) => (p.progress || 100) < 100).length;
  }

  /* ── Recent Activity Feed ── */
  function renderRecentActivity() {
    const list = document.getElementById("recentActivityList");
    if (!list) return;

    const items = [
      ...allMessages.slice(0, 4).map((m) => ({
        icon: "mail",
        title: `New inquiry from ${m.name || "Unknown"}`,
        desc: m.email || "",
        time: formatRelTime(m.createdAt),
      })),
      ...allProjects.slice(0, 3).map((p) => ({
        icon: "folder_shared",
        title: `Portfolio: ${p.title}`,
        desc: p.category || "",
        time: formatRelTime(p.createdAt),
      })),
    ]
      .sort((a, b) => 0)
      .slice(0, 6);

    if (items.length === 0) {
      list.innerHTML = `<p class="text-on-surface-variant text-sm text-center py-8">No recent activity recorded.</p>`;
      return;
    }

    list.innerHTML = items
      .map(
        (it) => `
      <div class="flex gap-4">
        <div class="flex flex-col items-center">
          <div class="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center border border-outline-variant flex-shrink-0">
            <span class="material-symbols-outlined text-primary text-sm">${it.icon}</span>
          </div>
        </div>
        <div class="flex-1 pb-4 border-b border-outline-variant last:border-0">
          <div class="flex justify-between items-start">
            <h4 class="text-sm font-bold text-on-surface">${it.title}</h4>
            <span class="text-xs text-on-surface-variant flex-shrink-0 ml-2">${it.time}</span>
          </div>
          <p class="text-xs text-on-surface-variant mt-1">${it.desc}</p>
        </div>
      </div>`
      )
      .join("");
  }

  function formatRelTime(dateStr) {
    if (!dateStr) return "Unknown";
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return Math.floor(hrs / 24) + "d ago";
  }

  /* ── Animate Infrastructure bars ── */
  function animateInfra() {
    const cpuVal = Math.floor(Math.random() * 35) + 15;
    const ramVal = Math.floor(Math.random() * 30) + 50;
    const cpuBar = document.getElementById("infraCpuBar");
    const cpuText = document.getElementById("infraCpuVal");
    const ramBar = document.getElementById("infraRamBar");
    const ramText = document.getElementById("infraRamVal");
    if (cpuBar) cpuBar.style.width = `${cpuVal}%`;
    if (cpuText) cpuText.textContent = `${cpuVal}%`;
    if (ramBar) ramBar.style.width = `${ramVal}%`;
    if (ramText) ramText.textContent = `${ramVal}%`;
  }
  setInterval(animateInfra, 5000);
  animateInfra();

  /* ═══════════════════════════════════════════════════════════
     PORTFOLIO TAB
  ═══════════════════════════════════════════════════════════ */
  let portfolioCategoryFilter = "all";

  function renderProjectsUI() {
    renderPortfolioGrid();
    renderWorkTable();
  }

  function renderPortfolioGrid() {
    const grid = document.getElementById("portfolioGrid");
    if (!grid) return;
    const filtered =
      portfolioCategoryFilter === "all"
        ? allProjects
        : allProjects.filter((p) => p.category === portfolioCategoryFilter);

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div class="col-span-full text-center py-16 text-on-surface-variant">
          <span class="material-symbols-outlined text-5xl mb-4 block opacity-20">folder_open</span>
          <p class="font-semibold">No portfolio items yet. Add your first piece!</p>
        </div>`;
      return;
    }

    grid.innerHTML = filtered
      .map(
        (p) => `
      <div class="glass-card rounded-xl overflow-hidden group hover:border-primary/50 transition-all duration-300 flex flex-col" data-project-id="${p._id}">
        <div class="relative h-44 bg-surface-container-high overflow-hidden">
          ${
            p.imageUrl
              ? `<img src="${p.imageUrl}" alt="${p.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>`
              : `<div class="w-full h-full flex items-center justify-center"><span class="material-symbols-outlined text-4xl text-on-surface-variant opacity-20">image</span></div>`
          }
          <div class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
            <div class="flex gap-2">
              <button class="px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-lg hover:brightness-110 transition-all edit-project-btn" data-id="${p._id}">EDIT</button>
              <button class="px-3 py-1.5 bg-red-900/80 text-red-300 text-xs font-bold rounded-lg hover:bg-red-800 transition-all delete-project-btn" data-id="${p._id}">DELETE</button>
            </div>
          </div>
          ${p.featured ? `<span class="absolute top-3 left-3 text-[9px] font-black tracking-widest bg-primary text-white px-2 py-1 rounded uppercase">Featured</span>` : ""}
        </div>
        <div class="p-4 flex flex-col flex-grow">
          <p class="text-[10px] text-primary font-bold uppercase tracking-widest mb-1">${p.category || "Uncategorized"}</p>
          <h3 class="text-sm font-bold text-on-surface mb-2 leading-tight">${p.title}</h3>
          <p class="text-xs text-on-surface-variant flex-grow line-clamp-2">${p.summary || ""}</p>
          <div class="mt-3">
            <div class="flex justify-between text-[10px] text-on-surface-variant mb-1">
              <span>Completion</span>
              <span>${p.progress || 100}%</span>
            </div>
            <div class="w-full h-1 bg-surface-container-highest rounded-full overflow-hidden">
              <div class="h-full bg-primary rounded-full transition-all duration-500" style="width:${p.progress || 100}%"></div>
            </div>
          </div>
        </div>
      </div>`
      )
      .join("");

    // Attach edit/delete listeners
    grid.querySelectorAll(".edit-project-btn").forEach((btn) => {
      btn.addEventListener("click", () => openProjectModal(btn.dataset.id));
    });
    grid.querySelectorAll(".delete-project-btn").forEach((btn) => {
      btn.addEventListener("click", () => deleteProject(btn.dataset.id));
    });
  }

  // Category filter buttons
  document.querySelectorAll(".portfolio-filter-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      portfolioCategoryFilter = btn.dataset.category;
      document.querySelectorAll(".portfolio-filter-btn").forEach((b) => {
        b.classList.toggle("bg-primary", b.dataset.category === portfolioCategoryFilter);
        b.classList.toggle("text-white", b.dataset.category === portfolioCategoryFilter);
        b.classList.toggle("border-outline-variant", b.dataset.category !== portfolioCategoryFilter);
      });
      renderPortfolioGrid();
    });
  });

  /* ── Work Lifecycle Table ── */
  function renderWorkTable() {
    const tbody = document.getElementById("workTableBody");
    if (!tbody) return;
    if (allProjects.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="px-6 py-12 text-center text-on-surface-variant text-sm">No projects in lifecycle registry. Create your first entry!</td></tr>`;
      return;
    }
    tbody.innerHTML = allProjects
      .map(
        (p) => `
      <tr class="hover:bg-surface-container-high transition-colors group">
        <td class="px-6 py-4">
          <div class="flex items-center gap-3">
            ${p.imageUrl ? `<img src="${p.imageUrl}" class="w-8 h-8 rounded object-cover flex-shrink-0"/>` : `<div class="w-8 h-8 rounded bg-surface-container-highest flex-shrink-0 flex items-center justify-center"><span class="material-symbols-outlined text-xs text-on-surface-variant">folder</span></div>`}
            <span class="font-bold text-sm text-on-surface">${p.title}</span>
          </div>
        </td>
        <td class="px-6 py-4 text-sm text-on-surface-variant">${p.client || "—"}</td>
        <td class="px-6 py-4"><span class="text-xs font-semibold px-2 py-1 rounded-lg bg-primary/10 text-primary">${p.category || "—"}</span></td>
        <td class="px-6 py-4">
          <div class="flex items-center gap-2">
            <div class="flex-1 h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
              <div class="h-full bg-primary rounded-full" style="width:${p.progress || 100}%"></div>
            </div>
            <span class="text-xs font-bold text-on-surface w-8">${p.progress || 100}%</span>
          </div>
        </td>
        <td class="px-6 py-4">
          <span class="text-[10px] font-bold px-2.5 py-1 rounded-lg ${p.featured ? "bg-green-900/40 text-green-400" : "bg-surface-container-highest text-on-surface-variant"}">
            ${p.featured ? "PUBLISHED" : "DRAFT"}
          </span>
        </td>
        <td class="px-6 py-4 text-right">
          <div class="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button class="p-1.5 rounded hover:bg-primary/10 hover:text-primary transition-colors edit-project-btn" data-id="${p._id}" title="Edit">
              <span class="material-symbols-outlined text-sm">edit</span>
            </button>
            <button class="p-1.5 rounded hover:bg-red-900/20 hover:text-red-400 transition-colors delete-project-btn" data-id="${p._id}" title="Delete">
              <span class="material-symbols-outlined text-sm">delete</span>
            </button>
          </div>
        </td>
      </tr>`
      )
      .join("");

    tbody.querySelectorAll(".edit-project-btn").forEach((btn) => {
      btn.addEventListener("click", () => openProjectModal(btn.dataset.id));
    });
    tbody.querySelectorAll(".delete-project-btn").forEach((btn) => {
      btn.addEventListener("click", () => deleteProject(btn.dataset.id));
    });
  }

  /* ── Project Modal ── */
  const projectModal = document.getElementById("projectModal");
  const projectForm = document.getElementById("projectForm");
  const openModalBtn = document.getElementById("openAddProjectModalBtn");
  const closeModalBtn = document.getElementById("closeProjectModalBtn");

  function openProjectModal(editId = null) {
    projectForm.reset();
    document.getElementById("projectIdField").value = "";
    document.getElementById("projectImageUrl").value = "";
    document.getElementById("projectUploadStatusText").textContent = "Select an image to stream onto Cloudinary secure storage...";
    const preview = document.getElementById("projectImagePreview");
    preview.innerHTML = `<span class="material-symbols-outlined text-on-surface-variant text-xl">image</span>`;
    document.getElementById("projectModalTitle").textContent = editId ? "Edit Portfolio Item" : "Initialize Portfolio Item";
    document.getElementById("saveProjectBtn").textContent = editId ? "SAVE CHANGES" : "COMMIT PORTFOLIO RECORD";

    if (editId) {
      const proj = allProjects.find((p) => p._id === editId);
      if (proj) {
        document.getElementById("projectIdField").value = proj._id;
        document.getElementById("projectTitle").value = proj.title || "";
        document.getElementById("projectCategory").value = proj.category || "Branding";
        document.getElementById("projectProgress").value = proj.progress ?? 100;
        document.getElementById("projectSummary").value = proj.summary || "";
        document.getElementById("projectTags").value = (proj.tags || []).join(", ");
        document.getElementById("projectClient").value = proj.client || "";
        document.getElementById("projectFeatured").checked = !!proj.featured;
        if (proj.imageUrl) {
          document.getElementById("projectImageUrl").value = proj.imageUrl;
          preview.innerHTML = `<img src="${proj.imageUrl}" class="w-full h-full object-cover" alt="Preview"/>`;
          document.getElementById("projectUploadStatusText").textContent = "Image loaded from Cloudinary.";
        }
      }
    }

    projectModal.classList.remove("opacity-0", "pointer-events-none");
    projectModal.classList.add("opacity-100");
  }

  function closeProjectModal() {
    projectModal.classList.add("opacity-0", "pointer-events-none");
    projectModal.classList.remove("opacity-100");
  }

  if (openModalBtn) openModalBtn.addEventListener("click", () => openProjectModal());
  if (closeModalBtn) closeModalBtn.addEventListener("click", closeProjectModal);
  projectModal.addEventListener("click", (e) => {
    if (e.target === projectModal) closeProjectModal();
  });

  /* ── Cloudinary Image Upload ── */
  const imageFileInput = document.getElementById("projectImageFile");
  imageFileInput.addEventListener("change", async () => {
    const file = imageFileInput.files[0];
    if (!file) return;
    const statusEl = document.getElementById("projectUploadStatusText");
    const preview = document.getElementById("projectImagePreview");
    statusEl.textContent = "Uploading to Cloudinary...";

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch(API("/upload"), {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Upload failed");
      document.getElementById("projectImageUrl").value = data.url;
      preview.innerHTML = `<img src="${data.url}" class="w-full h-full object-cover" alt="Uploaded"/>`;
      statusEl.textContent = `✓ Uploaded: ${file.name}`;
    } catch (err) {
      statusEl.textContent = `✗ Upload failed: ${err.message}`;
    }
  });

  /* ── Project Form Submit (Create / Update) ── */
  projectForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = document.getElementById("projectIdField").value;
    const btn = document.getElementById("saveProjectBtn");
    btn.textContent = "COMMITTING...";
    btn.disabled = true;

    const payload = {
      title: document.getElementById("projectTitle").value.trim(),
      category: document.getElementById("projectCategory").value,
      progress: parseInt(document.getElementById("projectProgress").value, 10),
      summary: document.getElementById("projectSummary").value.trim(),
      tags: document.getElementById("projectTags").value.split(",").map((t) => t.trim()).filter(Boolean),
      client: document.getElementById("projectClient").value.trim(),
      featured: document.getElementById("projectFeatured").checked,
      imageUrl: document.getElementById("projectImageUrl").value || "",
    };

    try {
      if (id) {
        const updated = await apiFetch(`/projects/${id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        allProjects = allProjects.map((p) => (p._id === id ? updated : p));
        showToast("Portfolio item updated successfully.");
      } else {
        const created = await apiFetch("/projects", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        allProjects.unshift(created);
        showToast("New portfolio item committed to database.");
      }
      closeProjectModal();
      renderProjectsUI();
      renderDashboardKPIs();
    } catch (err) {
      showToast(`Save failed: ${err.message}`, true);
    } finally {
      btn.textContent = id ? "SAVE CHANGES" : "COMMIT PORTFOLIO RECORD";
      btn.disabled = false;
    }
  });

  async function deleteProject(id) {
    if (!confirm("Permanently delete this portfolio item from MongoDB Atlas?")) return;
    try {
      await apiFetch(`/projects/${id}`, { method: "DELETE" });
      allProjects = allProjects.filter((p) => p._id !== id);
      renderProjectsUI();
      renderDashboardKPIs();
      showToast("Portfolio item permanently removed.");
    } catch (err) {
      showToast(`Delete failed: ${err.message}`, true);
    }
  }

  /* ═══════════════════════════════════════════════════════════
     CLIENTS / INBOX TAB
  ═══════════════════════════════════════════════════════════ */
  function renderInboxUI() {
    renderInboxTable(allMessages);
  }

  function parseInquiryMeta(subject) {
    let service = "General";
    let budget = "—";
    if (subject && subject.includes("Project Inquiry - ")) {
      const part = subject.split("Project Inquiry - ")[1];
      if (part.includes(" [")) {
        service = part.split(" [")[0];
        budget = part.split(" [")[1].replace("]", "");
      } else {
        service = part;
      }
    }
    return { service, budget };
  }

  function renderInboxTable(messages) {
    const tbody = document.getElementById("inboxTableBody");
    if (!tbody) return;
    if (messages.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="px-6 py-12 text-center text-on-surface-variant text-sm">No inquiries found. The inbox is empty.</td></tr>`;
      return;
    }
    tbody.innerHTML = messages
      .map((m) => {
        const { service, budget } = parseInquiryMeta(m.subject);
        const company = m.company && m.company.includes(" || Notes:")
          ? m.company.split(" || Notes:")[0]
          : (m.company || "—");
        const statusClass = {
          new: "bg-primary/10 text-primary border border-primary/30",
          read: "bg-surface-container-highest text-on-surface-variant",
          archived: "bg-surface-container-highest text-on-surface-variant/50 line-through",
        }[m.status || "new"] || "bg-primary/10 text-primary";

        return `
        <tr class="hover:bg-surface-container-high transition-colors group cursor-pointer inbox-row" data-id="${m._id}">
          <td class="px-6 py-4">
            <div>
              <p class="text-sm font-bold text-on-surface">${m.name || "—"}</p>
              <p class="text-xs text-on-surface-variant">${m.email || "—"}</p>
            </div>
          </td>
          <td class="px-6 py-4 text-sm text-on-surface-variant">${company}</td>
          <td class="px-6 py-4 text-sm text-on-surface-variant">${m.email || "—"}</td>
          <td class="px-6 py-4"><span class="text-xs font-semibold">${service}</span></td>
          <td class="px-6 py-4">
            <span class="text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase ${statusClass}">${m.status || "new"}</span>
          </td>
          <td class="px-6 py-4 text-right">
            <div class="flex justify-end gap-2">
              <button class="px-3 py-1 text-xs font-bold bg-surface-container-high border border-outline-variant rounded-lg hover:border-primary hover:text-primary transition-all view-msg-btn" data-id="${m._id}">VIEW</button>
              <button class="px-3 py-1 text-xs font-bold bg-red-900/20 text-red-400 border border-red-900/30 rounded-lg hover:bg-red-900/40 transition-all purge-msg-btn" data-id="${m._id}">PURGE</button>
            </div>
          </td>
        </tr>
        <!-- Expanded detail row (hidden by default) -->
        <tr class="inbox-detail-row hidden bg-surface-container-low" id="detail-${m._id}">
          <td colspan="6" class="px-8 py-6 border-b border-outline-variant">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div class="md:col-span-2">
                <p class="text-[10px] font-bold uppercase tracking-widest text-primary mb-2">Client Brief</p>
                <p class="text-sm text-on-surface-variant leading-relaxed">${m.message || "No message provided."}</p>
                <div class="mt-4">
                  <label class="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-2">Internal Notes</label>
                  <textarea class="w-full bg-[#08080a] border border-outline-variant rounded-lg p-3 text-sm text-white focus:border-primary outline-none resize-none" rows="3" id="notes-${m._id}">${m.company && m.company.includes(" || Notes:") ? m.company.split(" || Notes:")[1] : ""}</textarea>
                </div>
              </div>
              <div>
                <p class="text-[10px] font-bold uppercase tracking-widest text-primary mb-2">Update Status</p>
                <select class="w-full bg-[#08080a] border border-outline-variant rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-primary mb-4" id="status-${m._id}">
                  <option value="new" ${m.status === "new" || !m.status ? "selected" : ""}>NEW</option>
                  <option value="read" ${m.status === "read" ? "selected" : ""}>READ</option>
                  <option value="archived" ${m.status === "archived" ? "selected" : ""}>ARCHIVED</option>
                </select>
                <p class="text-[10px] text-on-surface-variant mb-1">Budget Estimate</p>
                <p class="text-sm font-bold text-primary mb-4">${budget}</p>
                <button class="w-full bg-primary text-white text-xs font-bold py-2.5 rounded-lg hover:brightness-110 transition-all commit-msg-btn" data-id="${m._id}" data-company="${company}">COMMIT CHANGES</button>
              </div>
            </div>
          </td>
        </tr>`;
      })
      .join("");

    // View toggle
    tbody.querySelectorAll(".view-msg-btn, .inbox-row td:not(:last-child)").forEach((el) => {
      el.addEventListener("click", (e) => {
        const id = el.closest("[data-id]")?.dataset.id || el.dataset.id;
        if (!id) return;
        const detailRow = document.getElementById(`detail-${id}`);
        if (detailRow) {
          detailRow.classList.toggle("hidden");
          // Mark as read automatically
          const msg = allMessages.find((m) => m._id === id);
          if (msg && msg.status === "new") {
            updateMessageStatus(id, "read", msg.company);
          }
        }
      });
    });

    // Commit changes
    tbody.querySelectorAll(".commit-msg-btn").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.dataset.id;
        const originalCompany = btn.dataset.company === "—" ? "" : btn.dataset.company;
        const notes = (document.getElementById(`notes-${id}`)?.value || "").trim();
        const status = document.getElementById(`status-${id}`)?.value || "new";
        const companyPayload = notes ? `${originalCompany} || Notes:${notes}` : originalCompany;
        btn.textContent = "COMMITTING...";
        btn.disabled = true;
        try {
          await updateMessageStatus(id, status, companyPayload);
          showToast("Client record updated successfully.");
        } catch (err) {
          showToast(`Commit failed: ${err.message}`, true);
        } finally {
          btn.textContent = "COMMIT CHANGES";
          btn.disabled = false;
        }
      });
    });

    // Purge buttons
    tbody.querySelectorAll(".purge-msg-btn").forEach((btn) => {
      btn.addEventListener("click", () => purgeMessage(btn.dataset.id));
    });
  }

  async function updateMessageStatus(id, status, company) {
    const updated = await apiFetch(`/messages/${id}`, {
      method: "PUT",
      body: JSON.stringify({ status, company }),
    });
    allMessages = allMessages.map((m) => (m._id === id ? { ...m, ...updated } : m));
    renderInboxTable(allMessages);
    renderDashboardKPIs();
  }

  async function purgeMessage(id) {
    if (!confirm("Permanently purge this client inquiry from the database?")) return;
    try {
      await apiFetch(`/messages/${id}`, { method: "DELETE" });
      allMessages = allMessages.filter((m) => m._id !== id);
      renderInboxTable(allMessages);
      renderDashboardKPIs();
      showToast("Inquiry purged from MongoDB Atlas.");
    } catch (err) {
      showToast(`Purge failed: ${err.message}`, true);
    }
  }

  /* Inbox search & filter */
  function filterInboxTable() {
    const q = (document.getElementById("inboxSearchInput")?.value || "").toLowerCase().trim();
    const status = document.getElementById("inboxFilterStatus")?.value || "all";
    const filtered = allMessages.filter((m) => {
      if (status !== "all" && m.status !== status) return false;
      if (q) {
        return (
          (m.name || "").toLowerCase().includes(q) ||
          (m.email || "").toLowerCase().includes(q) ||
          (m.company || "").toLowerCase().includes(q) ||
          (m.message || "").toLowerCase().includes(q)
        );
      }
      return true;
    });
    renderInboxTable(filtered);
  }

  document.getElementById("inboxSearchInput")?.addEventListener("input", filterInboxTable);
  document.getElementById("inboxFilterStatus")?.addEventListener("change", filterInboxTable);

  /* ═══════════════════════════════════════════════════════════
     PAGES COPYWRITING TAB
  ═══════════════════════════════════════════════════════════ */
  async function loadPagesCopy() {
    try {
      const content = await apiFetch("/content/homepage");
      const val = content?.value || {};
      const headlineEl = document.getElementById("copyHeadline");
      const subEl = document.getElementById("copySubheadline");
      const ctaEl = document.getElementById("copyCta");
      if (headlineEl) headlineEl.value = val.headline || "WE CREATE BRANDS PEOPLE CAN'T IGNORE.";
      if (subEl) subEl.value = val.subheadline || "Atomic Media builds high-performance digital experiences powered by creativity, strategy, and AI.";
      if (ctaEl) ctaEl.value = val.cta || "Start the Project";
    } catch (e) {
      /* Use defaults */
    }
  }

  const pageCopyForm = document.getElementById("pageCopyForm");
  if (pageCopyForm) {
    pageCopyForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const btn = document.getElementById("saveCopyBtn");
      btn.textContent = "COMMITTING...";
      btn.disabled = true;
      try {
        await apiFetch("/content/homepage", {
          method: "PUT",
          body: JSON.stringify({
            value: {
              headline: document.getElementById("copyHeadline").value.trim(),
              subheadline: document.getElementById("copySubheadline").value.trim(),
              cta: document.getElementById("copyCta").value.trim(),
            },
          }),
        });
        showToast("Homepage copy committed to MongoDB. Changes live on site.");
      } catch (err) {
        showToast(`Save failed: ${err.message}`, true);
      } finally {
        btn.textContent = "COMMIT SITE COPY";
        btn.disabled = false;
      }
    });
  }

  /* ═══════════════════════════════════════════════════════════
     INITIALIZATION
  ═══════════════════════════════════════════════════════════ */
  async function init() {
    if (!token) {
      showLogin();
      return;
    }
    try {
      const res = await fetch(API("/auth/me"), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        showLogin();
        return;
      }
      const data = await res.json();
      showConsole(data.user);
      await loadAllData();
    } catch {
      showLogin();
    }
  }

  init();
})();
