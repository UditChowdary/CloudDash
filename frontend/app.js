const config = window.APP_CONFIG || { apiBaseUrl: "" };
const apiBaseUrl = (config.apiBaseUrl || "").replace(/\/$/, "");

const storageKeyBase = "dashboard:data";
const settingsKey = "dashboard:settings";
const uiKeyBase = "dashboard:ui";
const profileKey = "dashboard:profiles";
const activeProfileKey = "dashboard:activeProfile";

const defaultSettings = {
  theme: "light",
  themePreset: "default",
  locale: "en-US",
  currency: "USD",
  reminders: false,
  collapsed: {},
  tourSeen: false,
  animatedBackground: false,
  reduceMotion: false,
  masonry: false,
  widgetOrder: [],
  shortcuts: {
    search: "/",
    quickAdd: "n",
    tour: "?",
  },
  encryptionEnabled: false,
  calendarOffset: 0,
};

const state = {
  tasks: [],
  habits: [],
  finances: [],
  activity: [],
  notes: "",
  notesUpdatedAt: null,
  habitLog: [],
  useLocal: !apiBaseUrl,
  profileId: "default",
  encryptionPassphrase: "",
  settings: { ...defaultSettings },
  reminderTimer: null,
  tourStep: 0,
  filters: {
    taskQuery: "",
    taskStatus: "all",
    taskShowArchived: false,
    habitQuery: "",
    habitShowArchived: false,
    financeQuery: "",
    financeType: "all",
    financeMonth: "",
    financeShowArchived: false,
  },
  editing: {
    taskId: null,
    habitId: null,
    financeId: null,
  },
};

const elements = {
  apiStatus: document.getElementById("apiStatus"),
  grid: document.getElementById("dashboardGrid"),
  kpiActiveTasks: document.getElementById("kpiActiveTasks"),
  kpiHabitStreak: document.getElementById("kpiHabitStreak"),
  kpiMonthlyNet: document.getElementById("kpiMonthlyNet"),
  profileSelect: document.getElementById("profileSelect"),
  addProfile: document.getElementById("addProfile"),
  deleteProfile: document.getElementById("deleteProfile"),
  taskCount: document.getElementById("taskCount"),
  habitCount: document.getElementById("habitCount"),
  financeTotal: document.getElementById("financeTotal"),
  taskList: document.getElementById("taskList"),
  habitList: document.getElementById("habitList"),
  financeList: document.getElementById("financeList"),
  activityList: document.getElementById("activityList"),
  notesInput: document.getElementById("notesInput"),
  notesSave: document.getElementById("notesSave"),
  notesStatus: document.getElementById("notesStatus"),
  calendarGrid: document.getElementById("calendarGrid"),
  calendarMonth: document.getElementById("calendarMonth"),
  calendarPrev: document.getElementById("calendarPrev"),
  calendarNext: document.getElementById("calendarNext"),
  heatmapGrid: document.getElementById("heatmapGrid"),
  monthlyIncome: document.getElementById("monthlyIncome"),
  monthlyExpense: document.getElementById("monthlyExpense"),
  monthlyNet: document.getElementById("monthlyNet"),
  themeToggle: document.getElementById("themeToggle"),
  themePreset: document.getElementById("themePreset"),
  localeSelect: document.getElementById("localeSelect"),
  currencySelect: document.getElementById("currencySelect"),
  remindersToggle: document.getElementById("remindersToggle"),
  backgroundToggle: document.getElementById("backgroundToggle"),
  motionToggle: document.getElementById("motionToggle"),
  masonryToggle: document.getElementById("masonryToggle"),
  shortcutSearch: document.getElementById("shortcutSearch"),
  shortcutQuickAdd: document.getElementById("shortcutQuickAdd"),
  shortcutTour: document.getElementById("shortcutTour"),
  exportAll: document.getElementById("exportAll"),
  importAll: document.getElementById("importAll"),
  exportJson: document.getElementById("exportJson"),
  importJson: document.getElementById("importJson"),
  exportPdf: document.getElementById("exportPdf"),
  encryptionToggle: document.getElementById("encryptionToggle"),
  encryptionPassphrase: document.getElementById("encryptionPassphrase"),
  applyEncryption: document.getElementById("applyEncryption"),
  startTour: document.getElementById("startTour"),
  quickAddButton: document.getElementById("quickAddButton"),
  quickAddModal: document.getElementById("quickAddModal"),
  quickAddForm: document.getElementById("quickAddForm"),
  quickAddType: document.getElementById("quickAddType"),
  quickAddTitle: document.getElementById("quickAddTitle"),
  quickAddCategory: document.getElementById("quickAddCategory"),
  quickAddAmount: document.getElementById("quickAddAmount"),
  voiceInput: document.getElementById("voiceInput"),
  closeQuickAdd: document.getElementById("closeQuickAdd"),
  tourModal: document.getElementById("tourModal"),
  tourText: document.getElementById("tourText"),
  tourPrev: document.getElementById("tourPrev"),
  tourNext: document.getElementById("tourNext"),
  closeTour: document.getElementById("closeTour"),
  weeklyTasks: document.getElementById("weeklyTasks"),
  weeklyHabits: document.getElementById("weeklyHabits"),
  activeTasks: document.getElementById("activeTasks"),
  taskSearch: document.getElementById("taskSearch"),
  taskStatus: document.getElementById("taskStatus"),
  taskShowArchived: document.getElementById("taskShowArchived"),
  taskExport: document.getElementById("taskExport"),
  taskImport: document.getElementById("taskImport"),
  habitSearch: document.getElementById("habitSearch"),
  habitShowArchived: document.getElementById("habitShowArchived"),
  habitExport: document.getElementById("habitExport"),
  habitImport: document.getElementById("habitImport"),
  financeSearch: document.getElementById("financeSearch"),
  financeTypeFilter: document.getElementById("financeTypeFilter"),
  financeMonth: document.getElementById("financeMonth"),
  financeShowArchived: document.getElementById("financeShowArchived"),
  financeExport: document.getElementById("financeExport"),
  financeImport: document.getElementById("financeImport"),
};

const habitChart = new Chart(document.getElementById("habitChart"), {
  type: "bar",
  data: {
    labels: [],
    datasets: [
      {
        label: "Streak",
        data: [],
        backgroundColor: "#4f46e5",
      },
    ],
  },
  options: {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
  },
});

const financeChart = new Chart(document.getElementById("financeChart"), {
  type: "pie",
  data: {
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: ["#4f46e5", "#22c55e", "#f59e0b", "#ef4444", "#0ea5e9"],
      },
    ],
  },
  options: { responsive: true },
});

const financeTrendChart = new Chart(document.getElementById("financeTrendChart"), {
  type: "line",
  data: {
    labels: [],
    datasets: [
      {
        label: "Net",
        data: [],
        borderColor: "#4f46e5",
        backgroundColor: "rgba(79, 70, 229, 0.2)",
        tension: 0.3,
        fill: true,
      },
    ],
  },
  options: {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true } },
  },
});

const productivityChartEl = document.getElementById("productivityChart");
const productivityChart = productivityChartEl
  ? new Chart(productivityChartEl, {
      type: "bar",
      data: {
        labels: [],
        datasets: [
          {
            label: "Completed",
            data: [],
            backgroundColor: "#4f46e5",
          },
        ],
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
      },
    })
  : null;

const localStore = {
  getStorageKey(profileId) {
    return `${storageKeyBase}:${profileId}`;
  },
  getUiKey(profileId) {
    return `${uiKeyBase}:${profileId}`;
  },
  getEncryptedKey(profileId, type) {
    return `${type}:${profileId}:enc`;
  },
  getSaltKey(profileId, type) {
    return `${type}:${profileId}:salt`;
  },
  read(profileId) {
    const raw = localStorage.getItem(this.getStorageKey(profileId));
    if (!raw) {
      return { tasks: [], habits: [], finances: [] };
    }
    try {
      return JSON.parse(raw);
    } catch {
      return { tasks: [], habits: [], finances: [] };
    }
  },
  write(profileId, data) {
    localStorage.setItem(this.getStorageKey(profileId), JSON.stringify(data));
  },
  readSettings() {
    const raw = localStorage.getItem(settingsKey);
    if (!raw) return { ...defaultSettings };
    try {
      return { ...defaultSettings, ...JSON.parse(raw) };
    } catch {
      return { ...defaultSettings };
    }
  },
  writeSettings(settings) {
    localStorage.setItem(settingsKey, JSON.stringify(settings));
  },
  readUi(profileId) {
    const raw = localStorage.getItem(this.getUiKey(profileId));
    if (!raw) {
      return { activity: [], notes: "", notesUpdatedAt: null, habitLog: [], widgetOrder: [] };
    }
    try {
      return { activity: [], notes: "", notesUpdatedAt: null, habitLog: [], widgetOrder: [], ...JSON.parse(raw) };
    } catch {
      return { activity: [], notes: "", notesUpdatedAt: null, habitLog: [], widgetOrder: [] };
    }
  },
  writeUi(profileId, payload) {
    localStorage.setItem(this.getUiKey(profileId), JSON.stringify(payload));
  },
  readProfiles() {
    const raw = localStorage.getItem(profileKey);
    if (!raw) return [{ id: "default", name: "Default" }];
    try {
      const parsed = JSON.parse(raw);
      return parsed.length ? parsed : [{ id: "default", name: "Default" }];
    } catch {
      return [{ id: "default", name: "Default" }];
    }
  },
  writeProfiles(profiles) {
    localStorage.setItem(profileKey, JSON.stringify(profiles));
  },
  readActiveProfile() {
    return localStorage.getItem(activeProfileKey) || "default";
  },
  writeActiveProfile(profileId) {
    localStorage.setItem(activeProfileKey, profileId);
  },
};

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function base64ToArrayBuffer(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

async function deriveKey(passphrase, salt) {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey("raw", enc.encode(passphrase), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

async function encryptPayload(passphrase, payload) {
  const enc = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(passphrase, salt);
  const data = enc.encode(JSON.stringify(payload));
  const cipher = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, data);
  return {
    cipher: arrayBufferToBase64(cipher),
    iv: arrayBufferToBase64(iv),
    salt: arrayBufferToBase64(salt),
  };
}

async function decryptPayload(passphrase, encrypted) {
  const dec = new TextDecoder();
  const salt = new Uint8Array(base64ToArrayBuffer(encrypted.salt));
  const iv = new Uint8Array(base64ToArrayBuffer(encrypted.iv));
  const cipher = base64ToArrayBuffer(encrypted.cipher);
  const key = await deriveKey(passphrase, salt);
  const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, cipher);
  return JSON.parse(dec.decode(plain));
}

async function storeEncrypted(type, profileId, payload, passphrase) {
  const encrypted = await encryptPayload(passphrase, payload);
  localStorage.setItem(localStore.getEncryptedKey(profileId, type), JSON.stringify(encrypted));
}

async function readEncrypted(type, profileId, passphrase) {
  const raw = localStorage.getItem(localStore.getEncryptedKey(profileId, type));
  if (!raw) return null;
  const encrypted = JSON.parse(raw);
  return decryptPayload(passphrase, encrypted);
}

function clearPlain(type, profileId) {
  if (type === storageKeyBase) {
    localStorage.removeItem(localStore.getStorageKey(profileId));
  }
  if (type === uiKeyBase) {
    localStorage.removeItem(localStore.getUiKey(profileId));
  }
}

function setStatus(ok, message) {
  elements.apiStatus.textContent = message;
  elements.apiStatus.classList.remove("ok", "error");
  elements.apiStatus.classList.add(ok ? "ok" : "error");
}

function formatCurrency(value) {
  return new Intl.NumberFormat(state.settings.locale, {
    style: "currency",
    currency: state.settings.currency,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDate(dateValue) {
  if (!dateValue) return "";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(state.settings.locale);
}

function setTheme(theme) {
  document.body.classList.toggle("dark", theme === "dark");
  state.settings.theme = theme;
  localStore.writeSettings(state.settings);
}

function setThemePreset(preset) {
  const presets = ["theme-ocean", "theme-sunset", "theme-forest", "theme-rose"];
  document.body.classList.remove(...presets);
  if (preset && preset !== "default") {
    document.body.classList.add(`theme-${preset}`);
  }
  state.settings.themePreset = preset;
  localStore.writeSettings(state.settings);
}

function setAnimatedBackground(enabled) {
  document.body.classList.toggle("animated-bg", !!enabled);
  state.settings.animatedBackground = !!enabled;
  localStore.writeSettings(state.settings);
}

function setReducedMotion(enabled) {
  document.body.classList.toggle("reduce-motion", !!enabled);
  state.settings.reduceMotion = !!enabled;
  localStore.writeSettings(state.settings);
}

function setMasonryLayout(enabled) {
  if (elements.grid) {
    elements.grid.classList.toggle("masonry", !!enabled);
  }
  state.settings.masonry = !!enabled;
  localStore.writeSettings(state.settings);
}

function applyWidgetOrder() {
  if (!elements.grid) return;
  const order = state.settings.widgetOrder || [];
  if (!order.length) return;
  order.forEach((id) => {
    const card = document.getElementById(id);
    if (card) elements.grid.append(card);
  });
}

function saveWidgetOrder() {
  if (!elements.grid) return;
  const ids = Array.from(elements.grid.children)
    .filter((child) => child.classList.contains("card"))
    .map((child) => child.id);
  state.settings.widgetOrder = ids;
  localStore.writeSettings(state.settings);
  saveUi();
}

function initParallaxBlobs() {
  const blobs = Array.from(document.querySelectorAll(".blob"));
  if (!blobs.length) return;

  window.addEventListener("mousemove", (event) => {
    if (!state.settings.animatedBackground || state.settings.reduceMotion) return;
    const x = (event.clientX / window.innerWidth - 0.5) * 20;
    const y = (event.clientY / window.innerHeight - 0.5) * 20;
    blobs.forEach((blob, index) => {
      const depth = (index + 1) * 0.6;
      blob.style.transform = `translate(${x * depth}px, ${y * depth}px)`;
    });
  });
}

async function apiRequest(path, options = {}) {
  if (state.useLocal) {
    return { local: true };
  }
  const response = await fetch(`${apiBaseUrl}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.status === 204 ? null : response.json();
}

function ensureId(entry) {
  return { ...entry, id: entry.id || crypto.randomUUID() };
}

function parseTags(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return String(value)
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function normalizeTask(task) {
  const base = ensureId(task);
  return {
    id: base.id,
    title: base.title || "",
    category: base.category || "",
    tags: Array.isArray(base.tags) ? base.tags : parseTags(base.tags),
    priority: base.priority || "medium",
    completed: !!base.completed,
    archived: !!base.archived,
    dueDate: base.dueDate || "",
    recurrence: base.recurrence || "none",
    reminderTime: base.reminderTime || "",
    lastCompleted: base.lastCompleted || null,
    createdAt: base.createdAt || new Date().toISOString(),
    lastNotified: base.lastNotified || null,
  };
}

function normalizeHabit(habit) {
  const base = ensureId(habit);
  return {
    id: base.id,
    title: base.title || "",
    tags: Array.isArray(base.tags) ? base.tags : parseTags(base.tags),
    streak: Number(base.streak || 0),
    goal: Number(base.goal || 0),
    lastCompleted: base.lastCompleted || null,
    archived: !!base.archived,
    recurrence: base.recurrence || "daily",
    reminderTime: base.reminderTime || "",
    createdAt: base.createdAt || new Date().toISOString(),
    lastNotified: base.lastNotified || null,
  };
}

function normalizeFinance(entry) {
  const base = ensureId(entry);
  return {
    id: base.id,
    title: base.title || "",
    type: base.type || "expense",
    amount: Number(base.amount || 0),
    category: base.category || "General",
    tags: Array.isArray(base.tags) ? base.tags : parseTags(base.tags),
    date: base.date || base.createdAt || new Date().toISOString(),
    archived: !!base.archived,
    createdAt: base.createdAt || new Date().toISOString(),
  };
}

async function loadAll() {
  state.settings = localStore.readSettings();
  const profiles = localStore.readProfiles();
  state.profileId = localStore.readActiveProfile();
  if (!profiles.find((profile) => profile.id === state.profileId)) {
    state.profileId = profiles[0]?.id || "default";
    localStore.writeActiveProfile(state.profileId);
  }
  const uiState = { activity: [], notes: "", notesUpdatedAt: null, habitLog: [], widgetOrder: [] };

  if (state.settings.encryptionEnabled && state.encryptionPassphrase) {
    try {
      const decryptedData = await readEncrypted(storageKeyBase, state.profileId, state.encryptionPassphrase);
      const decryptedUi = await readEncrypted(uiKeyBase, state.profileId, state.encryptionPassphrase);
      if (decryptedData) {
        state.tasks = (decryptedData.tasks || []).map(normalizeTask);
        state.habits = (decryptedData.habits || []).map(normalizeHabit);
        state.finances = (decryptedData.finances || []).map(normalizeFinance);
      }
      if (decryptedUi) {
        Object.assign(uiState, decryptedUi);
      }
    } catch (error) {
      console.warn(error);
      setStatus(false, "Encrypted data locked");
    }
  } else {
    const data = localStore.read(state.profileId);
    state.tasks = (data.tasks || []).map(normalizeTask);
    state.habits = (data.habits || []).map(normalizeHabit);
    state.finances = (data.finances || []).map(normalizeFinance);
    Object.assign(uiState, localStore.readUi(state.profileId));
  }
  state.activity = uiState.activity || [];
  state.notes = uiState.notes || "";
  state.notesUpdatedAt = uiState.notesUpdatedAt || null;
  state.habitLog = uiState.habitLog || [];
  if (uiState.widgetOrder?.length) {
    state.settings.widgetOrder = uiState.widgetOrder;
  }
  applySettingsToUI();

  try {
    if (state.useLocal) {
      setStatus(true, "Local mode");
    } else {
      const [tasks, habits, finances] = await Promise.all([
        apiRequest("/tasks"),
        apiRequest("/habits"),
        apiRequest("/finances"),
      ]);
      state.tasks = (tasks.items || tasks || []).map(normalizeTask);
      state.habits = (habits.items || habits || []).map(normalizeHabit);
      state.finances = (finances.items || finances || []).map(normalizeFinance);
      setStatus(true, "API: Connected");
    }
  } catch (error) {
    console.warn(error);
    state.useLocal = true;
    setStatus(false, "API: Offline (local mode)");
  }

  renderAll();
  initReminderLoop();
  if (!state.settings.tourSeen) {
    state.settings.tourSeen = true;
    localStore.writeSettings(state.settings);
  }
}

async function saveLocal() {
  const payload = { tasks: state.tasks, habits: state.habits, finances: state.finances };
  if (state.settings.encryptionEnabled && state.encryptionPassphrase) {
    await storeEncrypted(storageKeyBase, state.profileId, payload, state.encryptionPassphrase);
    clearPlain(storageKeyBase, state.profileId);
    return;
  }
  localStore.write(state.profileId, payload);
}

async function saveUi() {
  const payload = {
    activity: state.activity,
    notes: state.notes,
    notesUpdatedAt: state.notesUpdatedAt,
    habitLog: state.habitLog,
    widgetOrder: state.settings.widgetOrder || [],
  };
  if (state.settings.encryptionEnabled && state.encryptionPassphrase) {
    await storeEncrypted(uiKeyBase, state.profileId, payload, state.encryptionPassphrase);
    clearPlain(uiKeyBase, state.profileId);
    return;
  }
  localStore.writeUi(state.profileId, payload);
}

function applySettingsToUI() {
  renderProfiles();
  elements.localeSelect.value = state.settings.locale;
  elements.currencySelect.value = state.settings.currency;
  elements.remindersToggle.checked = !!state.settings.reminders;
  if (elements.themePreset) {
    elements.themePreset.value = state.settings.themePreset || "default";
  }
  if (elements.backgroundToggle) {
    elements.backgroundToggle.checked = !!state.settings.animatedBackground;
  }
  if (elements.motionToggle) {
    elements.motionToggle.checked = !!state.settings.reduceMotion;
  }
  if (elements.masonryToggle) {
    elements.masonryToggle.checked = !!state.settings.masonry;
  }
  if (elements.encryptionToggle) {
    elements.encryptionToggle.checked = !!state.settings.encryptionEnabled;
  }
  if (elements.shortcutSearch) {
    elements.shortcutSearch.value = state.settings.shortcuts.search;
    elements.shortcutQuickAdd.value = state.settings.shortcuts.quickAdd;
    elements.shortcutTour.value = state.settings.shortcuts.tour;
  }
  setTheme(state.settings.theme);
  setThemePreset(state.settings.themePreset || "default");
  setAnimatedBackground(state.settings.animatedBackground);
  setReducedMotion(state.settings.reduceMotion);
  setMasonryLayout(state.settings.masonry);
  if (elements.notesInput) {
    elements.notesInput.value = state.notes || "";
  }
  if (elements.notesStatus && state.notesUpdatedAt) {
    elements.notesStatus.textContent = `Saved ${formatDate(state.notesUpdatedAt)}`;
  }
  applyCollapsedState();
  if (!state.settings.widgetOrder?.length && elements.grid) {
    state.settings.widgetOrder = Array.from(elements.grid.children)
      .filter((child) => child.classList.contains("card"))
      .map((child) => child.id);
    localStore.writeSettings(state.settings);
    saveUi();
  }
  applyWidgetOrder();
}

function renderProfiles() {
  if (!elements.profileSelect) return;
  const profiles = localStore.readProfiles();
  elements.profileSelect.innerHTML = "";
  profiles.forEach((profile) => {
    const option = document.createElement("option");
    option.value = profile.id;
    option.textContent = profile.name;
    if (profile.id === state.profileId) option.selected = true;
    elements.profileSelect.append(option);
  });
}

function addProfile() {
  const name = window.prompt("Profile name?");
  if (!name) return;
  const profiles = localStore.readProfiles();
  const id = crypto.randomUUID();
  profiles.push({ id, name });
  localStore.writeProfiles(profiles);
  localStore.writeActiveProfile(id);
  state.profileId = id;
  loadAll();
}

function deleteProfile() {
  if (state.profileId === "default") return;
  const confirmDelete = window.confirm("Delete this profile and its data?");
  if (!confirmDelete) return;
  const profiles = localStore.readProfiles().filter((profile) => profile.id !== state.profileId);
  localStore.writeProfiles(profiles);
  localStorage.removeItem(localStore.getStorageKey(state.profileId));
  localStorage.removeItem(localStore.getUiKey(state.profileId));
  localStorage.removeItem(localStore.getEncryptedKey(state.profileId, storageKeyBase));
  localStorage.removeItem(localStore.getEncryptedKey(state.profileId, uiKeyBase));
  state.profileId = profiles[0]?.id || "default";
  localStore.writeActiveProfile(state.profileId);
  loadAll();
}

async function applyEncryption() {
  state.settings.encryptionEnabled = elements.encryptionToggle.checked;
  state.encryptionPassphrase = elements.encryptionPassphrase.value.trim();
  localStore.writeSettings(state.settings);
  if (!state.settings.encryptionEnabled) {
    const data = state.tasks.length ? { tasks: state.tasks, habits: state.habits, finances: state.finances } : null;
    const ui = { activity: state.activity, notes: state.notes, notesUpdatedAt: state.notesUpdatedAt, habitLog: state.habitLog, widgetOrder: state.settings.widgetOrder || [] };
    if (data) localStore.write(state.profileId, data);
    localStore.writeUi(state.profileId, ui);
    localStorage.removeItem(localStore.getEncryptedKey(state.profileId, storageKeyBase));
    localStorage.removeItem(localStore.getEncryptedKey(state.profileId, uiKeyBase));
    return;
  }
  if (!state.encryptionPassphrase) {
    setStatus(false, "Passphrase required");
    return;
  }
  await saveLocal();
  await saveUi();
  setStatus(true, "Encrypted");
}

function renderAll() {
  renderTasks();
  renderHabits();
  renderFinances();
  renderInsights();
  renderProductivity();
  renderActivity();
  renderCalendar();
  renderHeatmap();
  renderKpis();
}

function filterTasks() {
  return state.tasks.filter((task) => {
    if (!state.filters.taskShowArchived && task.archived) return false;
    if (state.filters.taskQuery) {
      const query = state.filters.taskQuery.toLowerCase();
      const tagMatch = (task.tags || []).some((tag) => tag.toLowerCase().includes(query));
      if (!task.title.toLowerCase().includes(query) && !task.category.toLowerCase().includes(query) && !tagMatch) {
        return false;
      }
    }
    if (state.filters.taskStatus === "active" && task.completed) return false;
    if (state.filters.taskStatus === "completed" && !task.completed) return false;
    return true;
  });
}

function filterHabits() {
  return state.habits.filter((habit) => {
    if (!state.filters.habitShowArchived && habit.archived) return false;
    if (state.filters.habitQuery) {
      const query = state.filters.habitQuery.toLowerCase();
      const tagMatch = (habit.tags || []).some((tag) => tag.toLowerCase().includes(query));
      if (!habit.title.toLowerCase().includes(query) && !tagMatch) return false;
    }
    return true;
  });
}

function filterFinances() {
  return state.finances.filter((entry) => {
    if (!state.filters.financeShowArchived && entry.archived) return false;
    if (state.filters.financeQuery) {
      const query = state.filters.financeQuery.toLowerCase();
      const tagMatch = (entry.tags || []).some((tag) => tag.toLowerCase().includes(query));
      if (!entry.title.toLowerCase().includes(query) && !entry.category.toLowerCase().includes(query) && !tagMatch) {
        return false;
      }
    }
    if (state.filters.financeType !== "all" && entry.type !== state.filters.financeType) return false;
    if (state.filters.financeMonth) {
      const value = entry.date ? entry.date.slice(0, 7) : "";
      if (value !== state.filters.financeMonth) return false;
    }
    return true;
  });
}

function renderTasks() {
  const visibleTasks = filterTasks();
  const activeCount = state.tasks.filter((task) => !task.archived).length;
  elements.taskCount.textContent = activeCount;
  elements.taskList.innerHTML = "";

  visibleTasks.forEach((task) => {
    elements.taskList.append(createTaskRow(task));
  });
}

function createTaskRow(task) {
  const li = document.createElement("li");
  li.className = `list-item${task.archived ? " archived" : ""}`;
  li.draggable = true;
  li.dataset.id = task.id;
  li.dataset.type = "tasks";

  if (state.editing.taskId === task.id) {
    const form = document.createElement("div");
    form.className = "meta";

    const titleInput = document.createElement("input");
    titleInput.value = task.title;
    const categoryInput = document.createElement("input");
    categoryInput.value = task.category;
    const tagsInput = document.createElement("input");
    tagsInput.value = (task.tags || []).join(", ");
    const prioritySelect = document.createElement("select");
    ["low", "medium", "high"].forEach((value) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      if (value === task.priority) option.selected = true;
      prioritySelect.append(option);
    });
    const dueInput = document.createElement("input");
    dueInput.type = "date";
    dueInput.value = task.dueDate || "";
    const recurrenceSelect = document.createElement("select");
    ["none", "daily", "weekly", "monthly"].forEach((value) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      if (value === task.recurrence) option.selected = true;
      recurrenceSelect.append(option);
    });
    const reminderInput = document.createElement("input");
    reminderInput.type = "time";
    reminderInput.value = task.reminderTime || "";

    form.append(titleInput, categoryInput, tagsInput, prioritySelect, dueInput, recurrenceSelect, reminderInput);

    const actions = document.createElement("div");
    actions.className = "actions";
    const saveBtn = createActionButton("Save", () => {
      const title = titleInput.value.trim();
      if (!title) return;
      updateTask({
        ...task,
        title,
        category: categoryInput.value.trim(),
        tags: parseTags(tagsInput.value),
        priority: prioritySelect.value,
        dueDate: dueInput.value,
        recurrence: recurrenceSelect.value,
        reminderTime: reminderInput.value,
      }, "Task updated");
      state.editing.taskId = null;
    });
    const cancelBtn = createActionButton("Cancel", () => {
      state.editing.taskId = null;
      renderTasks();
    }, "ghost");
    actions.append(saveBtn, cancelBtn);
    li.append(form, actions);
    return li;
  }

  const meta = document.createElement("div");
  meta.className = "meta";
  const due = task.dueDate ? ` • Due: ${formatDate(task.dueDate)}` : "";
  const recurrence = task.recurrence !== "none" ? ` • ${task.recurrence}` : "";
  meta.innerHTML = `<strong>${task.title}</strong><small>${task.category || "General"} • ${task.priority}${due}${recurrence}</small>`;
  const tagList = createTagList(task.tags);
  if (tagList) meta.append(tagList);

  const actions = document.createElement("div");
  actions.className = "actions";

  if (!task.archived) {
    const toggleBtn = createActionButton(task.completed ? "Undo" : "Done", () => toggleTask(task));
    const editBtn = createActionButton("Edit", () => {
      state.editing.taskId = task.id;
      renderTasks();
    }, "ghost");
    const archiveBtn = createActionButton("Archive", () => archiveTask(task), "ghost");
    actions.append(toggleBtn, editBtn, archiveBtn);
  } else {
    const restoreBtn = createActionButton("Restore", () => restoreTask(task), "ghost");
    const deleteBtn = createActionButton("Delete", () => deleteTaskForever(task));
    actions.append(restoreBtn, deleteBtn);
  }

  li.append(meta, actions);
  return li;
}

function renderHabits() {
  const visibleHabits = filterHabits();
  const activeCount = state.habits.filter((habit) => !habit.archived).length;
  elements.habitCount.textContent = activeCount;
  elements.habitList.innerHTML = "";

  visibleHabits.forEach((habit) => {
    elements.habitList.append(createHabitRow(habit));
  });

  habitChart.data.labels = state.habits.filter((habit) => !habit.archived).map((habit) => habit.title);
  habitChart.data.datasets[0].data = state.habits.filter((habit) => !habit.archived).map((habit) => habit.streak);
  habitChart.update();
}

function createHabitRow(habit) {
  const li = document.createElement("li");
  li.className = `list-item${habit.archived ? " archived" : ""}`;
  li.draggable = true;
  li.dataset.id = habit.id;
  li.dataset.type = "habits";

  if (state.editing.habitId === habit.id) {
    const form = document.createElement("div");
    form.className = "meta";
    const titleInput = document.createElement("input");
    titleInput.value = habit.title;
    const tagsInput = document.createElement("input");
    tagsInput.value = (habit.tags || []).join(", ");
    const goalInput = document.createElement("input");
    goalInput.type = "number";
    goalInput.min = "0";
    goalInput.value = habit.goal || 0;
    const recurrenceSelect = document.createElement("select");
    ["daily", "weekly", "monthly"].forEach((value) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      if (value === habit.recurrence) option.selected = true;
      recurrenceSelect.append(option);
    });
    const reminderInput = document.createElement("input");
    reminderInput.type = "time";
    reminderInput.value = habit.reminderTime || "";
    form.append(titleInput, tagsInput, goalInput, recurrenceSelect, reminderInput);

    const actions = document.createElement("div");
    actions.className = "actions";
    const saveBtn = createActionButton("Save", () => {
      const title = titleInput.value.trim();
      if (!title) return;
      updateHabit({
        ...habit,
        title,
        tags: parseTags(tagsInput.value),
        goal: parseInt(goalInput.value || "0", 10),
        recurrence: recurrenceSelect.value,
        reminderTime: reminderInput.value,
      }, "Habit updated");
      state.editing.habitId = null;
    });
    const cancelBtn = createActionButton("Cancel", () => {
      state.editing.habitId = null;
      renderHabits();
    }, "ghost");
    actions.append(saveBtn, cancelBtn);
    li.append(form, actions);
    return li;
  }

  const meta = document.createElement("div");
  meta.className = "meta";
  const last = habit.lastCompleted ? formatDate(habit.lastCompleted) : "Never";
  const recurrence = habit.recurrence ? ` • ${habit.recurrence}` : "";
  const goalText = habit.goal ? ` • Goal: ${habit.streak}/${habit.goal}` : "";
  meta.innerHTML = `<strong>${habit.title}</strong><small>Streak: ${habit.streak} • Last: ${last}${recurrence}${goalText}</small>`;
  const tagList = createTagList(habit.tags);
  if (tagList) meta.append(tagList);

  const actions = document.createElement("div");
  actions.className = "actions";

  if (!habit.archived) {
    const checkBtn = createActionButton("Check-in", () => checkHabit(habit));
    const editBtn = createActionButton("Edit", () => {
      state.editing.habitId = habit.id;
      renderHabits();
    }, "ghost");
    const archiveBtn = createActionButton("Archive", () => archiveHabit(habit), "ghost");
    actions.append(checkBtn, editBtn, archiveBtn);
  } else {
    const restoreBtn = createActionButton("Restore", () => restoreHabit(habit), "ghost");
    const deleteBtn = createActionButton("Delete", () => deleteHabitForever(habit));
    actions.append(restoreBtn, deleteBtn);
  }

  li.append(meta, actions);
  return li;
}

function renderFinances() {
  const visibleFinances = filterFinances();
  const total = state.finances
    .filter((entry) => !entry.archived)
    .reduce((sum, entry) => sum + (entry.type === "income" ? entry.amount : -entry.amount), 0);
  elements.financeTotal.textContent = formatCurrency(total);
  elements.financeList.innerHTML = "";

  visibleFinances.forEach((entry) => {
    elements.financeList.append(createFinanceRow(entry));
  });

  const categoryTotals = {};
  state.finances
    .filter((entry) => entry.type === "expense" && !entry.archived)
    .forEach((entry) => {
      const key = entry.category || "General";
      categoryTotals[key] = (categoryTotals[key] || 0) + entry.amount;
    });

  financeChart.data.labels = Object.keys(categoryTotals);
  financeChart.data.datasets[0].data = Object.values(categoryTotals);
  financeChart.update();
}

function createFinanceRow(entry) {
  const li = document.createElement("li");
  li.className = `list-item${entry.archived ? " archived" : ""}`;
  li.draggable = true;
  li.dataset.id = entry.id;
  li.dataset.type = "finances";

  if (state.editing.financeId === entry.id) {
    const form = document.createElement("div");
    form.className = "meta";
    const titleInput = document.createElement("input");
    titleInput.value = entry.title;
    const tagsInput = document.createElement("input");
    tagsInput.value = (entry.tags || []).join(", ");
    const typeSelect = document.createElement("select");
    ["income", "expense"].forEach((value) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      if (value === entry.type) option.selected = true;
      typeSelect.append(option);
    });
    const amountInput = document.createElement("input");
    amountInput.type = "number";
    amountInput.step = "0.01";
    amountInput.value = entry.amount;
    const categoryInput = document.createElement("input");
    categoryInput.value = entry.category || "";
    const dateInput = document.createElement("input");
    dateInput.type = "date";
    dateInput.value = entry.date ? entry.date.slice(0, 10) : "";
    form.append(titleInput, tagsInput, typeSelect, amountInput, categoryInput, dateInput);

    const actions = document.createElement("div");
    actions.className = "actions";
    const saveBtn = createActionButton("Save", () => {
      const title = titleInput.value.trim();
      if (!title) return;
      updateFinance({
        ...entry,
        title,
        tags: parseTags(tagsInput.value),
        type: typeSelect.value,
        amount: parseFloat(amountInput.value || "0"),
        category: categoryInput.value.trim() || "General",
        date: dateInput.value || entry.date,
      }, "Finance updated");
      state.editing.financeId = null;
    });
    const cancelBtn = createActionButton("Cancel", () => {
      state.editing.financeId = null;
      renderFinances();
    }, "ghost");
    actions.append(saveBtn, cancelBtn);
    li.append(form, actions);
    return li;
  }

  const meta = document.createElement("div");
  meta.className = "meta";
  const dateLabel = entry.date ? ` • ${formatDate(entry.date)}` : "";
  meta.innerHTML = `<strong>${entry.title}</strong><small>${entry.category || "General"} • ${entry.type}${dateLabel}</small>`;
  const tagList = createTagList(entry.tags);
  if (tagList) meta.append(tagList);

  const actions = document.createElement("div");
  actions.className = "actions";
  const amount = document.createElement("span");
  amount.textContent = `${entry.type === "income" ? "+" : "-"}${formatCurrency(entry.amount)}`;

  if (!entry.archived) {
    const editBtn = createActionButton("Edit", () => {
      state.editing.financeId = entry.id;
      renderFinances();
    }, "ghost");
    const archiveBtn = createActionButton("Archive", () => archiveFinance(entry), "ghost");
    actions.append(amount, editBtn, archiveBtn);
  } else {
    const restoreBtn = createActionButton("Restore", () => restoreFinance(entry), "ghost");
    const deleteBtn = createActionButton("Delete", () => deleteFinanceForever(entry));
    actions.append(amount, restoreBtn, deleteBtn);
  }

  li.append(meta, actions);
  return li;
}

function renderInsights() {
  const now = new Date();
  const currentMonth = now.toISOString().slice(0, 7);
  const monthEntries = state.finances.filter((entry) => !entry.archived && entry.date?.startsWith(currentMonth));
  const income = monthEntries.filter((entry) => entry.type === "income").reduce((sum, entry) => sum + entry.amount, 0);
  const expense = monthEntries.filter((entry) => entry.type === "expense").reduce((sum, entry) => sum + entry.amount, 0);
  const net = income - expense;
  elements.monthlyIncome.textContent = formatCurrency(income);
  elements.monthlyExpense.textContent = formatCurrency(expense);
  elements.monthlyNet.textContent = formatCurrency(net);

  const months = [];
  const netValues = [];
  for (let i = 5; i >= 0; i -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = date.toISOString().slice(0, 7);
    months.push(date.toLocaleDateString(state.settings.locale, { month: "short" }));
    const entries = state.finances.filter((entry) => !entry.archived && entry.date?.startsWith(key));
    const monthIncome = entries.filter((entry) => entry.type === "income").reduce((sum, entry) => sum + entry.amount, 0);
    const monthExpense = entries.filter((entry) => entry.type === "expense").reduce((sum, entry) => sum + entry.amount, 0);
    netValues.push(monthIncome - monthExpense);
  }
  financeTrendChart.data.labels = months;
  financeTrendChart.data.datasets[0].data = netValues;
  financeTrendChart.update();
}

function renderProductivity() {
  if (!productivityChart || !elements.weeklyTasks || !elements.weeklyHabits || !elements.activeTasks) return;
  const now = new Date();
  const days = [];
  const completed = [];
  let weeklyTaskCount = 0;
  let weeklyHabitCount = 0;
  for (let i = 6; i >= 0; i -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const key = date.toISOString().slice(0, 10);
    days.push(date.toLocaleDateString(state.settings.locale, { weekday: "short" }));
    const tasksDone = state.tasks.filter((task) => task.lastCompleted?.startsWith(key)).length;
    completed.push(tasksDone);
    weeklyTaskCount += tasksDone;
  }
  const weekAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6).toISOString().slice(0, 10);
  weeklyHabitCount = state.habits.filter((habit) => habit.lastCompleted?.slice(0, 10) >= weekAgo).length;
  elements.weeklyTasks.textContent = weeklyTaskCount;
  elements.weeklyHabits.textContent = weeklyHabitCount;
  elements.activeTasks.textContent = state.tasks.filter((task) => !task.archived && !task.completed).length;

  productivityChart.data.labels = days;
  productivityChart.data.datasets[0].data = completed;
  productivityChart.update();
}

function logActivity(label, detail) {
  const entry = {
    id: crypto.randomUUID(),
    label,
    detail,
    timestamp: new Date().toISOString(),
  };
  state.activity.unshift(entry);
  state.activity = state.activity.slice(0, 40);
  saveUi();
  renderActivity();
}

function renderActivity() {
  if (!elements.activityList) return;
  elements.activityList.innerHTML = "";
  if (!state.activity.length) {
    const empty = document.createElement("li");
    empty.className = "list-item";
    empty.textContent = "No activity yet.";
    elements.activityList.append(empty);
    return;
  }
  state.activity.forEach((entry) => {
    const li = document.createElement("li");
    li.className = "list-item";
    const meta = document.createElement("div");
    meta.className = "meta";
    const time = formatDate(entry.timestamp);
    meta.innerHTML = `<strong>${entry.label}</strong><small>${entry.detail || ""} • ${time}</small>`;
    li.append(meta);
    elements.activityList.append(li);
  });
}

function addHabitLog(dateValue) {
  const date = dateValue ? new Date(dateValue) : new Date();
  const key = date.toISOString().slice(0, 10);
  state.habitLog.push(key);
  state.habitLog = state.habitLog.slice(-60);
  saveUi();
}

function renderHeatmap() {
  if (!elements.heatmapGrid) return;
  elements.heatmapGrid.innerHTML = "";
  const today = new Date();
  const counts = {};
  state.habitLog.forEach((day) => {
    counts[day] = (counts[day] || 0) + 1;
  });
  for (let i = 29; i >= 0; i -= 1) {
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
    const key = date.toISOString().slice(0, 10);
    const count = counts[key] || 0;
    const cell = document.createElement("div");
    cell.className = "cell";
    const intensity = Math.min(4, count);
    if (intensity > 0) {
      cell.style.background = `rgba(34, 197, 94, ${0.15 + intensity * 0.18})`;
      cell.style.borderColor = `rgba(34, 197, 94, ${0.35 + intensity * 0.1})`;
    }
    cell.title = `${key}: ${count} check-in(s)`;
    elements.heatmapGrid.append(cell);
  }
}

function renderCalendar() {
  if (!elements.calendarGrid) return;
  const now = new Date();
  const offset = state.settings.calendarOffset || 0;
  const monthStart = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + offset + 1, 0);
  const startDay = monthStart.getDay();
  const totalDays = monthEnd.getDate();
  elements.calendarMonth.textContent = monthStart.toLocaleDateString(state.settings.locale, {
    month: "long",
    year: "numeric",
  });
  elements.calendarGrid.innerHTML = "";

  for (let i = 0; i < startDay; i += 1) {
    const filler = document.createElement("div");
    filler.className = "day muted";
    filler.textContent = "";
    elements.calendarGrid.append(filler);
  }

  for (let day = 1; day <= totalDays; day += 1) {
    const date = new Date(monthStart.getFullYear(), monthStart.getMonth(), day);
    const key = date.toISOString().slice(0, 10);
    const cell = document.createElement("div");
    cell.className = "day";
    cell.textContent = String(day);
    const hasTask = state.tasks.some((task) => !task.archived && task.dueDate === key);
    const hasHabit = state.habitLog.includes(key);
    if (hasTask) cell.classList.add("has-task");
    if (hasHabit) cell.classList.add("has-habit");
    elements.calendarGrid.append(cell);
  }
}

function renderKpis() {
  if (!elements.kpiActiveTasks) return;
  const activeTasks = state.tasks.filter((task) => !task.archived && !task.completed).length;
  const streakSum = state.habits.filter((habit) => !habit.archived).reduce((sum, habit) => sum + habit.streak, 0);
  const now = new Date();
  const currentMonth = now.toISOString().slice(0, 7);
  const monthEntries = state.finances.filter((entry) => !entry.archived && entry.date?.startsWith(currentMonth));
  const income = monthEntries.filter((entry) => entry.type === "income").reduce((sum, entry) => sum + entry.amount, 0);
  const expense = monthEntries.filter((entry) => entry.type === "expense").reduce((sum, entry) => sum + entry.amount, 0);
  elements.kpiActiveTasks.textContent = activeTasks;
  elements.kpiHabitStreak.textContent = streakSum;
  elements.kpiMonthlyNet.textContent = formatCurrency(income - expense);
}

function saveNotes() {
  if (!elements.notesInput) return;
  state.notes = elements.notesInput.value;
  state.notesUpdatedAt = new Date().toISOString();
  saveUi();
  if (elements.notesStatus) {
    elements.notesStatus.textContent = `Saved ${formatDate(state.notesUpdatedAt)}`;
  }
  logActivity("Notes updated", "Notes widget");
}

function createActionButton(label, onClick, extraClass = "") {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = label;
  if (extraClass) button.classList.add(extraClass);
  button.onclick = onClick;
  return button;
}

function tagColor(tag) {
  let hash = 0;
  for (let i = 0; i < tag.length; i += 1) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue} 70% 50%)`;
}

function createTagList(tags) {
  if (!tags || !tags.length) return null;
  const wrap = document.createElement("div");
  wrap.className = "tags";
  tags.forEach((tag) => {
    const chip = document.createElement("span");
    chip.className = "tag";
    chip.textContent = tag;
    const color = tagColor(tag);
    chip.style.borderColor = `color-mix(in srgb, ${color}, transparent 35%)`;
    chip.style.background = `color-mix(in srgb, ${color}, transparent 82%)`;
    chip.style.color = color;
    wrap.append(chip);
  });
  return wrap;
}

function getNextDate(dateValue, recurrence) {
  const date = dateValue ? new Date(dateValue) : new Date();
  if (Number.isNaN(date.getTime())) return new Date();
  if (recurrence === "daily") date.setDate(date.getDate() + 1);
  if (recurrence === "weekly") date.setDate(date.getDate() + 7);
  if (recurrence === "monthly") date.setMonth(date.getMonth() + 1);
  return date;
}

async function addTask(task) {
  const payload = normalizeTask({ ...task, completed: false });
  if (state.useLocal) {
    state.tasks.unshift(payload);
    saveLocal();
  } else {
    const result = await apiRequest("/tasks", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    state.tasks.unshift(normalizeTask(result));
  }
  logActivity("Task added", payload.title);
  renderTasks();
}

async function updateTask(task, activityLabel) {
  const payload = normalizeTask(task);
  if (state.useLocal) {
    state.tasks = state.tasks.map((item) => (item.id === payload.id ? payload : item));
    saveLocal();
  } else {
    await apiRequest(`/tasks/${payload.id}`, { method: "PUT", body: JSON.stringify(payload) });
    state.tasks = state.tasks.map((item) => (item.id === payload.id ? payload : item));
  }
  if (activityLabel) {
    logActivity(activityLabel, payload.title);
  }
  renderTasks();
  renderCalendar();
  renderKpis();
}

async function toggleTask(task) {
  let updated = { ...task, completed: !task.completed };
  const label = task.completed ? "Task reopened" : "Task completed";
  if (!task.completed && task.recurrence !== "none") {
    const nextDate = getNextDate(task.dueDate || new Date(), task.recurrence);
    updated = {
      ...task,
      completed: false,
      lastCompleted: new Date().toISOString(),
      dueDate: nextDate.toISOString().slice(0, 10),
    };
  }
  await updateTask(updated, label);
}

async function archiveTask(task) {
  await updateTask({ ...task, archived: true }, "Task archived");
}

async function restoreTask(task) {
  await updateTask({ ...task, archived: false }, "Task restored");
}

async function deleteTaskForever(task) {
  if (state.useLocal) {
    state.tasks = state.tasks.filter((item) => item.id !== task.id);
    saveLocal();
  } else {
    await apiRequest(`/tasks/${task.id}`, { method: "DELETE" });
    state.tasks = state.tasks.filter((item) => item.id !== task.id);
  }
  logActivity("Task deleted", task.title);
  renderTasks();
  renderCalendar();
  renderKpis();
}

async function addHabit(habit) {
  const payload = normalizeHabit({ ...habit, streak: 0, lastCompleted: null });
  if (state.useLocal) {
    state.habits.unshift(payload);
    saveLocal();
  } else {
    const result = await apiRequest("/habits", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    state.habits.unshift(normalizeHabit(result));
  }
  logActivity("Habit added", payload.title);
  renderHabits();
}

function calculateHabitStreak(habit) {
  if (!habit.lastCompleted) return habit.streak + 1;
  const last = new Date(habit.lastCompleted);
  const now = new Date();
  const diffDays = Math.floor((now - last) / (1000 * 60 * 60 * 24));
  if (diffDays <= 1) return habit.streak + 1;
  return 1;
}

async function updateHabit(habit, activityLabel) {
  const payload = normalizeHabit(habit);
  if (state.useLocal) {
    state.habits = state.habits.map((item) => (item.id === payload.id ? payload : item));
    saveLocal();
  } else {
    await apiRequest(`/habits/${payload.id}`, { method: "PUT", body: JSON.stringify(payload) });
    state.habits = state.habits.map((item) => (item.id === payload.id ? payload : item));
  }
  if (activityLabel) {
    logActivity(activityLabel, payload.title);
  }
  renderHabits();
  renderHeatmap();
  renderCalendar();
  renderKpis();
}

async function checkHabit(habit) {
  const updated = {
    ...habit,
    streak: calculateHabitStreak(habit),
    lastCompleted: new Date().toISOString(),
  };
  addHabitLog(updated.lastCompleted);
  await updateHabit(updated, "Habit check-in");
}

async function archiveHabit(habit) {
  await updateHabit({ ...habit, archived: true }, "Habit archived");
}

async function restoreHabit(habit) {
  await updateHabit({ ...habit, archived: false }, "Habit restored");
}

async function deleteHabitForever(habit) {
  if (state.useLocal) {
    state.habits = state.habits.filter((item) => item.id !== habit.id);
    saveLocal();
  } else {
    await apiRequest(`/habits/${habit.id}`, { method: "DELETE" });
    state.habits = state.habits.filter((item) => item.id !== habit.id);
  }
  logActivity("Habit deleted", habit.title);
  renderHabits();
  renderHeatmap();
  renderCalendar();
  renderKpis();
}

async function addFinance(entry) {
  const payload = normalizeFinance(entry);
  if (state.useLocal) {
    state.finances.unshift(payload);
    saveLocal();
  } else {
    const result = await apiRequest("/finances", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    state.finances.unshift(normalizeFinance(result));
  }
  logActivity("Finance entry added", payload.title);
  renderFinances();
  renderInsights();
}

async function updateFinance(entry, activityLabel) {
  const payload = normalizeFinance(entry);
  if (state.useLocal) {
    state.finances = state.finances.map((item) => (item.id === payload.id ? payload : item));
    saveLocal();
  } else {
    await apiRequest(`/finances/${payload.id}`, { method: "PUT", body: JSON.stringify(payload) });
    state.finances = state.finances.map((item) => (item.id === payload.id ? payload : item));
  }
  if (activityLabel) {
    logActivity(activityLabel, payload.title);
  }
  renderFinances();
  renderInsights();
  renderKpis();
}

async function archiveFinance(entry) {
  await updateFinance({ ...entry, archived: true }, "Finance archived");
}

async function restoreFinance(entry) {
  await updateFinance({ ...entry, archived: false }, "Finance restored");
}

async function deleteFinanceForever(entry) {
  if (state.useLocal) {
    state.finances = state.finances.filter((item) => item.id !== entry.id);
    saveLocal();
  } else {
    await apiRequest(`/finances/${entry.id}`, { method: "DELETE" });
    state.finances = state.finances.filter((item) => item.id !== entry.id);
  }
  logActivity("Finance deleted", entry.title);
  renderFinances();
  renderInsights();
  renderKpis();
}

function downloadCSV(filename, rows, headers) {
  const escapeValue = (value) => {
    if (value === null || value === undefined) return "";
    const text = String(value);
    if (text.includes(",") || text.includes("\n") || text.includes('"')) {
      return `"${text.replace(/"/g, '""')}"`;
    }
    return text;
  };
  const content = [headers.join(","), ...rows.map((row) => headers.map((h) => escapeValue(row[h])).join(","))].join("\n");
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function parseCSV(text) {
  const rows = [];
  let current = [];
  let value = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];
    if (char === '"' && inQuotes && next === '"') {
      value += '"';
      i += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      current.push(value);
      value = "";
    } else if ((char === "\n" || char === "\r") && !inQuotes) {
      if (value || current.length) {
        current.push(value);
        rows.push(current);
        current = [];
        value = "";
      }
    } else {
      value += char;
    }
  }
  if (value || current.length) {
    current.push(value);
    rows.push(current);
  }
  const [headerRow, ...dataRows] = rows;
  if (!headerRow) return [];
  return dataRows.map((row) => {
    const entry = {};
    headerRow.forEach((header, index) => {
      entry[header] = row[index] ?? "";
    });
    return entry;
  });
}

function exportTasks() {
  const headers = ["id", "title", "category", "tags", "priority", "completed", "dueDate", "recurrence", "reminderTime", "archived", "createdAt"];
  downloadCSV("tasks.csv", state.tasks, headers);
}

function exportHabits() {
  const headers = ["id", "title", "tags", "goal", "streak", "lastCompleted", "recurrence", "reminderTime", "archived", "createdAt"];
  downloadCSV("habits.csv", state.habits, headers);
}

function exportFinances() {
  const headers = ["id", "title", "tags", "type", "amount", "category", "date", "archived", "createdAt"];
  downloadCSV("finances.csv", state.finances, headers);
}

function exportAll() {
  const headers = [
    "dataset",
    "id",
    "title",
    "category",
    "tags",
    "priority",
    "goal",
    "completed",
    "dueDate",
    "recurrence",
    "reminderTime",
    "streak",
    "lastCompleted",
    "type",
    "amount",
    "date",
    "archived",
    "createdAt",
  ];
  const rows = [
    ...state.tasks.map((item) => ({ dataset: "tasks", ...item })),
    ...state.habits.map((item) => ({ dataset: "habits", ...item })),
    ...state.finances.map((item) => ({ dataset: "finances", ...item })),
  ];
  downloadCSV("dashboard-export.csv", rows, headers);
}

async function importItems(file, dataset) {
  const text = await file.text();
  const rows = parseCSV(text);
  if (!rows.length) return;

  if (dataset === "tasks") {
    const items = rows.map((row) =>
      normalizeTask({
        ...row,
        completed: row.completed === "true" || row.completed === true,
        archived: row.archived === "true" || row.archived === true,
      })
    );
    await upsertImportedItems("tasks", items);
  }

  if (dataset === "habits") {
    const items = rows.map((row) =>
      normalizeHabit({
        ...row,
        streak: Number(row.streak || 0),
        archived: row.archived === "true" || row.archived === true,
      })
    );
    await upsertImportedItems("habits", items);
  }

  if (dataset === "finances") {
    const items = rows.map((row) =>
      normalizeFinance({
        ...row,
        amount: Number(row.amount || 0),
        archived: row.archived === "true" || row.archived === true,
      })
    );
    await upsertImportedItems("finances", items);
  }
}

async function importAll(file) {
  const text = await file.text();
  const rows = parseCSV(text);
  if (!rows.length) return;
  const grouped = {
    tasks: [],
    habits: [],
    finances: [],
  };
  rows.forEach((row) => {
    if (row.dataset === "tasks") grouped.tasks.push(normalizeTask(row));
    if (row.dataset === "habits") grouped.habits.push(normalizeHabit(row));
    if (row.dataset === "finances") grouped.finances.push(normalizeFinance(row));
  });
  await upsertImportedItems("tasks", grouped.tasks);
  await upsertImportedItems("habits", grouped.habits);
  await upsertImportedItems("finances", grouped.finances);
}

async function upsertImportedItems(dataset, items) {
  if (!items.length) return;
  if (state.useLocal) {
    if (dataset === "tasks") state.tasks = [...items, ...state.tasks];
    if (dataset === "habits") state.habits = [...items, ...state.habits];
    if (dataset === "finances") state.finances = [...items, ...state.finances];
    saveLocal();
  } else {
    const route = dataset === "tasks" ? "/tasks" : dataset === "habits" ? "/habits" : "/finances";
    await Promise.all(items.map((item) => apiRequest(route, { method: "POST", body: JSON.stringify(item) })));
    await loadAll();
  }
  renderAll();
}

function initReminderLoop() {
  if (state.reminderTimer) {
    clearInterval(state.reminderTimer);
    state.reminderTimer = null;
  }
  if (!state.settings.reminders || !("Notification" in window)) return;
  if (Notification.permission === "default") {
    Notification.requestPermission();
  }
  state.reminderTimer = setInterval(() => {
    if (!state.settings.reminders || Notification.permission !== "granted") return;
    const now = new Date();
    const time = now.toTimeString().slice(0, 5);
    const today = now.toISOString().slice(0, 10);

    state.tasks.forEach((task) => {
      if (task.archived || task.completed) return;
      if (!task.reminderTime || task.reminderTime !== time) return;
      if (task.dueDate && task.dueDate !== today) return;
      if (task.lastNotified === today) return;
      new Notification("Task reminder", { body: task.title });
      task.lastNotified = today;
    });

    state.habits.forEach((habit) => {
      if (habit.archived) return;
      if (!habit.reminderTime || habit.reminderTime !== time) return;
      if (habit.lastNotified === today) return;
      new Notification("Habit reminder", { body: habit.title });
      habit.lastNotified = today;
    });

    if (state.useLocal) saveLocal();
  }, 60000);
}

function applyCollapsedState() {
  document.querySelectorAll("[data-collapsible]").forEach((card) => {
    const id = card.id;
    if (!id) return;
    const isCollapsed = !!state.settings.collapsed?.[id];
    card.classList.toggle("collapsed", isCollapsed);
    const toggle = card.querySelector(".collapse-toggle");
    if (toggle) toggle.textContent = isCollapsed ? "Expand" : "Collapse";
  });
}

function toggleCollapse(cardId) {
  state.settings.collapsed = state.settings.collapsed || {};
  state.settings.collapsed[cardId] = !state.settings.collapsed[cardId];
  localStore.writeSettings(state.settings);
  applyCollapsedState();
}

function downloadJSON(filename, payload) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function exportJson() {
  downloadJSON("dashboard-backup.json", {
    version: 1,
    settings: state.settings,
    ui: {
      activity: state.activity,
      notes: state.notes,
      notesUpdatedAt: state.notesUpdatedAt,
      habitLog: state.habitLog,
      widgetOrder: state.settings.widgetOrder || [],
    },
    data: {
      tasks: state.tasks,
      habits: state.habits,
      finances: state.finances,
    },
  });
}

async function importJson(file) {
  const text = await file.text();
  const payload = JSON.parse(text || "{}");
  if (!payload.data) return;
  state.tasks = (payload.data.tasks || []).map(normalizeTask);
  state.habits = (payload.data.habits || []).map(normalizeHabit);
  state.finances = (payload.data.finances || []).map(normalizeFinance);
  if (payload.ui) {
    state.activity = payload.ui.activity || [];
    state.notes = payload.ui.notes || "";
    state.notesUpdatedAt = payload.ui.notesUpdatedAt || null;
    state.habitLog = payload.ui.habitLog || [];
    state.settings.widgetOrder = payload.ui.widgetOrder || state.settings.widgetOrder;
    saveUi();
  }
  if (payload.settings) {
    state.settings = { ...defaultSettings, ...payload.settings };
    localStore.writeSettings(state.settings);
  }
  if (state.useLocal) saveLocal();
  applySettingsToUI();
  renderAll();
}

function setModalOpen(modal, isOpen) {
  if (!modal) return;
  modal.classList.toggle("active", isOpen);
  modal.setAttribute("aria-hidden", String(!isOpen));
}

function openQuickAdd() {
  if (!elements.quickAddModal || !elements.quickAddTitle) return;
  setModalOpen(elements.quickAddModal, true);
  updateQuickAddFields();
  elements.quickAddTitle.focus();
}

function closeQuickAdd() {
  if (!elements.quickAddModal || !elements.quickAddForm) return;
  setModalOpen(elements.quickAddModal, false);
  elements.quickAddForm.reset();
}

function updateQuickAddFields() {
  if (!elements.quickAddType || !elements.quickAddAmount) return;
  const type = elements.quickAddType.value;
  elements.quickAddAmount.style.display = type === "finances" ? "block" : "none";
}

function startVoiceInput() {
  if (!elements.quickAddTitle) return;
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    setStatus(false, "Voice input not supported");
    return;
  }
  const recognition = new SpeechRecognition();
  recognition.lang = state.settings.locale || "en-US";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  recognition.onresult = (event) => {
    const transcript = event.results?.[0]?.[0]?.transcript || "";
    elements.quickAddTitle.value = transcript;
  };
  recognition.start();
}

function handleQuickAddSubmit(event) {
  if (!elements.quickAddType || !elements.quickAddTitle || !elements.quickAddCategory || !elements.quickAddAmount) return;
  event.preventDefault();
  const type = elements.quickAddType.value;
  const title = elements.quickAddTitle.value.trim();
  if (!title) return;
  const category = elements.quickAddCategory.value.trim();
  if (type === "tasks") {
    addTask({ title, category, tags: parseTags(category), priority: "medium" });
  }
  if (type === "habits") {
    addHabit({ title, tags: parseTags(category), recurrence: "daily" });
  }
  if (type === "finances") {
    const amount = parseFloat(elements.quickAddAmount.value || "0");
    addFinance({
      title,
      amount,
      type: amount >= 0 ? "income" : "expense",
      category: category || "General",
      tags: parseTags(category),
      date: new Date().toISOString().slice(0, 10),
    });
  }
  closeQuickAdd();
}

const tourSteps = [
  "Use the sidebar to jump between widgets and export backups.",
  "Add items with the main forms or the + quick add button.",
  "Use tags (comma separated) to organize items and search across them.",
  "Collapse cards to focus, and drag list items to reorder.",
  "Use / to focus search, N for quick add, and ? to start this tour anytime.",
];

function openTour(step = 0) {
  if (!elements.tourModal || !elements.tourText || !elements.tourPrev || !elements.tourNext) return;
  state.tourStep = step;
  setModalOpen(elements.tourModal, true);
  renderTour();
}

function closeTour() {
  if (!elements.tourModal) return;
  setModalOpen(elements.tourModal, false);
}

function renderTour() {
  if (!elements.tourText || !elements.tourPrev || !elements.tourNext) return;
  elements.tourText.textContent = tourSteps[state.tourStep] || "";
  elements.tourPrev.disabled = state.tourStep === 0;
  elements.tourNext.textContent = state.tourStep === tourSteps.length - 1 ? "Done" : "Next";
}

function reorderList(type, draggedId, targetId) {
  if (!draggedId || !targetId || draggedId === targetId) return;
  const list = type === "tasks" ? state.tasks : type === "habits" ? state.habits : state.finances;
  const draggedIndex = list.findIndex((item) => item.id === draggedId);
  const targetIndex = list.findIndex((item) => item.id === targetId);
  if (draggedIndex === -1 || targetIndex === -1) return;
  const [moved] = list.splice(draggedIndex, 1);
  list.splice(targetIndex, 0, moved);
  if (state.useLocal) saveLocal();
  renderAll();
}

function handleDragEvents(listElement) {
  let draggedId = null;
  listElement.addEventListener("dragstart", (event) => {
    const target = event.target.closest(".list-item");
    if (!target) return;
    draggedId = target.dataset.id;
    target.classList.add("dragging");
  });
  listElement.addEventListener("dragend", (event) => {
    const target = event.target.closest(".list-item");
    if (target) target.classList.remove("dragging");
  });
  listElement.addEventListener("dragover", (event) => {
    event.preventDefault();
  });
  listElement.addEventListener("drop", (event) => {
    event.preventDefault();
    const target = event.target.closest(".list-item");
    if (!target) return;
    const type = listElement.dataset.draggable;
    reorderList(type, draggedId, target.dataset.id);
  });
}

function handleWidgetDrag(grid) {
  if (!grid) return;
  let draggedId = null;
  grid.addEventListener("dragstart", (event) => {
    const handle = event.target.closest(".drag-handle");
    if (!handle) {
      event.preventDefault();
      return;
    }
    const card = event.target.closest(".card");
    if (!card) return;
    draggedId = card.id;
    card.classList.add("dragging");
  });
  grid.addEventListener("dragend", (event) => {
    const card = event.target.closest(".card");
    if (card) card.classList.remove("dragging");
  });
  grid.addEventListener("dragover", (event) => {
    event.preventDefault();
  });
  grid.addEventListener("drop", (event) => {
    event.preventDefault();
    const targetCard = event.target.closest(".card");
    if (!targetCard || !draggedId) return;
    const draggedCard = document.getElementById(draggedId);
    if (!draggedCard || draggedCard === targetCard) return;
    const children = Array.from(grid.children);
    const draggedIndex = children.indexOf(draggedCard);
    const targetIndex = children.indexOf(targetCard);
    if (draggedIndex < targetIndex) {
      grid.insertBefore(draggedCard, targetCard.nextSibling);
    } else {
      grid.insertBefore(draggedCard, targetCard);
    }
    saveWidgetOrder();
  });
}

function handleShortcuts(event) {
  if (event.target.matches("input, select, textarea")) return;
  const key = event.key.toLowerCase();
  if (key === (state.settings.shortcuts.search || "/").toLowerCase()) {
    event.preventDefault();
    if (elements.taskSearch) elements.taskSearch.focus();
  }
  if (key === (state.settings.shortcuts.quickAdd || "n").toLowerCase()) {
    event.preventDefault();
    openQuickAdd();
  }
  if (key === (state.settings.shortcuts.tour || "?").toLowerCase()) {
    event.preventDefault();
    openTour(0);
  }
}

function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./service-worker.js");
    });
  }
}

function wireControls() {
  if (elements.profileSelect) {
    elements.profileSelect.addEventListener("change", (event) => {
      state.profileId = event.target.value;
      localStore.writeActiveProfile(state.profileId);
      loadAll();
    });
  }
  if (elements.addProfile) {
    elements.addProfile.addEventListener("click", addProfile);
  }
  if (elements.deleteProfile) {
    elements.deleteProfile.addEventListener("click", deleteProfile);
  }
  if (elements.themeToggle) {
    elements.themeToggle.addEventListener("click", () => {
      const next = state.settings.theme === "light" ? "dark" : "light";
      setTheme(next);
    });
  }

  if (elements.themePreset) {
    elements.themePreset.addEventListener("change", (event) => {
      setThemePreset(event.target.value);
    });
  }

  if (elements.localeSelect) {
    elements.localeSelect.addEventListener("change", (event) => {
      state.settings.locale = event.target.value;
      localStore.writeSettings(state.settings);
      renderAll();
    });
  }

  if (elements.currencySelect) {
    elements.currencySelect.addEventListener("change", (event) => {
      state.settings.currency = event.target.value;
      localStore.writeSettings(state.settings);
      renderAll();
    });
  }

  if (elements.remindersToggle) {
    elements.remindersToggle.addEventListener("change", (event) => {
      state.settings.reminders = event.target.checked;
      localStore.writeSettings(state.settings);
      initReminderLoop();
    });
  }

  if (elements.backgroundToggle) {
    elements.backgroundToggle.addEventListener("change", (event) => {
      setAnimatedBackground(event.target.checked);
    });
  }

  if (elements.motionToggle) {
    elements.motionToggle.addEventListener("change", (event) => {
      setReducedMotion(event.target.checked);
    });
  }

  if (elements.masonryToggle) {
    elements.masonryToggle.addEventListener("change", (event) => {
      setMasonryLayout(event.target.checked);
    });
  }

  if (elements.encryptionToggle) {
    elements.encryptionToggle.addEventListener("change", () => {
      state.settings.encryptionEnabled = elements.encryptionToggle.checked;
      localStore.writeSettings(state.settings);
    });
  }
  if (elements.applyEncryption) {
    elements.applyEncryption.addEventListener("click", async () => {
      await applyEncryption();
      if (state.settings.encryptionEnabled) {
        await loadAll();
      }
    });
  }

  if (elements.exportPdf) {
    elements.exportPdf.addEventListener("click", () => {
      window.print();
    });
  }

  if (elements.exportAll) {
    elements.exportAll.addEventListener("click", exportAll);
  }
  if (elements.importAll) {
    elements.importAll.addEventListener("change", (event) => {
      if (event.target.files?.[0]) importAll(event.target.files[0]);
      event.target.value = "";
    });
  }

  if (elements.exportJson) {
    elements.exportJson.addEventListener("click", exportJson);
  }
  if (elements.importJson) {
    elements.importJson.addEventListener("change", (event) => {
      if (event.target.files?.[0]) importJson(event.target.files[0]);
      event.target.value = "";
    });
  }

  if (elements.shortcutSearch) {
    elements.shortcutSearch.addEventListener("input", (event) => {
      state.settings.shortcuts.search = event.target.value || "/";
      localStore.writeSettings(state.settings);
    });
    elements.shortcutQuickAdd.addEventListener("input", (event) => {
      state.settings.shortcuts.quickAdd = event.target.value.toLowerCase() || "n";
      localStore.writeSettings(state.settings);
    });
    elements.shortcutTour.addEventListener("input", (event) => {
      state.settings.shortcuts.tour = event.target.value || "?";
      localStore.writeSettings(state.settings);
    });
  }

  if (elements.startTour) {
    elements.startTour.addEventListener("click", () => openTour(0));
  }
  if (elements.closeTour) {
    elements.closeTour.addEventListener("click", closeTour);
  }
  if (elements.tourPrev) {
    elements.tourPrev.addEventListener("click", () => {
      if (state.tourStep > 0) {
        state.tourStep -= 1;
        renderTour();
      }
    });
  }
  if (elements.tourNext) {
    elements.tourNext.addEventListener("click", () => {
      if (state.tourStep >= tourSteps.length - 1) {
        closeTour();
        return;
      }
      state.tourStep += 1;
      renderTour();
    });
  }

  if (elements.quickAddButton) {
    elements.quickAddButton.addEventListener("click", openQuickAdd);
  }
  if (elements.closeQuickAdd) {
    elements.closeQuickAdd.addEventListener("click", closeQuickAdd);
  }
  if (elements.quickAddType) {
    elements.quickAddType.addEventListener("change", updateQuickAddFields);
  }
  if (elements.quickAddForm) {
    elements.quickAddForm.addEventListener("submit", handleQuickAddSubmit);
  }
  if (elements.voiceInput) {
    elements.voiceInput.addEventListener("click", startVoiceInput);
  }

  if (elements.notesSave) {
    elements.notesSave.addEventListener("click", saveNotes);
  }

  if (elements.quickAddModal) {
    elements.quickAddModal.addEventListener("click", (event) => {
      if (event.target === elements.quickAddModal) closeQuickAdd();
    });
  }
  if (elements.tourModal) {
    elements.tourModal.addEventListener("click", (event) => {
      if (event.target === elements.tourModal) closeTour();
    });
  }

  if (elements.calendarPrev) {
    elements.calendarPrev.addEventListener("click", () => {
      state.settings.calendarOffset -= 1;
      localStore.writeSettings(state.settings);
      renderCalendar();
    });
  }
  if (elements.calendarNext) {
    elements.calendarNext.addEventListener("click", () => {
      state.settings.calendarOffset += 1;
      localStore.writeSettings(state.settings);
      renderCalendar();
    });
  }

  document.querySelectorAll(".collapse-toggle").forEach((button) => {
    button.addEventListener("click", () => {
      const target = button.dataset.target;
      if (target) toggleCollapse(target);
    });
  });

  document.querySelectorAll("[data-draggable]").forEach((list) => handleDragEvents(list));
  handleWidgetDrag(elements.grid);
  document.addEventListener("keydown", handleShortcuts);

  if (elements.taskSearch) {
    elements.taskSearch.addEventListener("input", (event) => {
      state.filters.taskQuery = event.target.value;
      renderTasks();
    });
  }
  if (elements.taskStatus) {
    elements.taskStatus.addEventListener("change", (event) => {
      state.filters.taskStatus = event.target.value;
      renderTasks();
    });
  }
  if (elements.taskShowArchived) {
    elements.taskShowArchived.addEventListener("change", (event) => {
      state.filters.taskShowArchived = event.target.checked;
      renderTasks();
    });
  }
  if (elements.taskExport) {
    elements.taskExport.addEventListener("click", exportTasks);
  }
  if (elements.taskImport) {
    elements.taskImport.addEventListener("change", (event) => {
      if (event.target.files?.[0]) importItems(event.target.files[0], "tasks");
      event.target.value = "";
    });
  }

  if (elements.habitSearch) {
    elements.habitSearch.addEventListener("input", (event) => {
      state.filters.habitQuery = event.target.value;
      renderHabits();
    });
  }
  if (elements.habitShowArchived) {
    elements.habitShowArchived.addEventListener("change", (event) => {
      state.filters.habitShowArchived = event.target.checked;
      renderHabits();
    });
  }
  if (elements.habitExport) {
    elements.habitExport.addEventListener("click", exportHabits);
  }
  if (elements.habitImport) {
    elements.habitImport.addEventListener("change", (event) => {
      if (event.target.files?.[0]) importItems(event.target.files[0], "habits");
      event.target.value = "";
    });
  }

  if (elements.financeSearch) {
    elements.financeSearch.addEventListener("input", (event) => {
      state.filters.financeQuery = event.target.value;
      renderFinances();
    });
  }
  if (elements.financeTypeFilter) {
    elements.financeTypeFilter.addEventListener("change", (event) => {
      state.filters.financeType = event.target.value;
      renderFinances();
    });
  }
  if (elements.financeMonth) {
    elements.financeMonth.addEventListener("change", (event) => {
      state.filters.financeMonth = event.target.value;
      renderFinances();
    });
  }
  if (elements.financeShowArchived) {
    elements.financeShowArchived.addEventListener("change", (event) => {
      state.filters.financeShowArchived = event.target.checked;
      renderFinances();
    });
  }
  if (elements.financeExport) {
    elements.financeExport.addEventListener("click", exportFinances);
  }
  if (elements.financeImport) {
    elements.financeImport.addEventListener("change", (event) => {
      if (event.target.files?.[0]) importItems(event.target.files[0], "finances");
      event.target.value = "";
    });
  }
}

function wireForms() {
  document.getElementById("taskForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const title = document.getElementById("taskTitle").value.trim();
    if (!title) return;
    const category = document.getElementById("taskCategory").value.trim();
    const taskTagsInput = document.getElementById("taskTags");
    const tags = taskTagsInput ? parseTags(taskTagsInput.value) : [];
    const priority = document.getElementById("taskPriority").value;
    const dueDate = document.getElementById("taskDueDate").value;
    const recurrence = document.getElementById("taskRecurrence").value;
    const reminderTime = document.getElementById("taskReminder").value;
    addTask({ title, category, tags, priority, dueDate, recurrence, reminderTime });
    event.target.reset();
  });

  document.getElementById("habitForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const title = document.getElementById("habitTitle").value.trim();
    if (!title) return;
    const habitTagsInput = document.getElementById("habitTags");
    const tags = habitTagsInput ? parseTags(habitTagsInput.value) : [];
    const habitGoalInput = document.getElementById("habitGoal");
    const goal = parseInt(habitGoalInput?.value || "0", 10);
    const recurrence = document.getElementById("habitRecurrence").value;
    const reminderTime = document.getElementById("habitReminder").value;
    addHabit({ title, tags, goal, recurrence, reminderTime });
    event.target.reset();
  });

  document.getElementById("financeForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const title = document.getElementById("financeTitle").value.trim();
    const type = document.getElementById("financeType").value;
    const amount = parseFloat(document.getElementById("financeAmount").value);
    const category = document.getElementById("financeCategory").value.trim();
    const financeTagsInput = document.getElementById("financeTags");
    const tags = financeTagsInput ? parseTags(financeTagsInput.value) : [];
    const date = document.getElementById("financeDate").value;
    if (!title || Number.isNaN(amount)) return;
    addFinance({ title, type, amount, category, tags, date: date || new Date().toISOString().slice(0, 10) });
    event.target.reset();
  });
}

wireControls();
wireForms();
registerServiceWorker();
initParallaxBlobs();
loadAll();
