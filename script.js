// Aurora Game Loader – No DevTools Needed
// All errors + status will appear on screen

const gameStrip = document.getElementById("gameStrip");
const gameFrame = document.getElementById("gameFrame");
const playerSection = document.getElementById("playerSection");
const homeSection = document.querySelector(".home");
const backBtn = document.getElementById("backBtn");
const refreshBtn = document.getElementById("refreshBtn");
const fullscreenBtn = document.getElementById("fullscreenBtn");
const externalBtn = document.getElementById("externalBtn");
const clockEl = document.getElementById("clock");
const settingsBtn = document.getElementById("settingsBtn");
const helpBtn = document.getElementById("helpBtn");
const helpModal = document.getElementById("helpModal");
const closeHelpBtn = document.getElementById("closeHelpBtn");
const statsDisplay = document.getElementById("stats");
const searchInput = document.getElementById("searchInput");
const sortSelect = document.getElementById("sortSelect");
const settingsModal = document.getElementById("settingsModal");
const closeSettingsBtn = document.getElementById("closeSettingsBtn");
const statsTotal = document.getElementById("statsTotal");
const statsPlayable = document.getElementById("statsPlayable");
const statsFav = document.getElementById("statsFav");
const modeDisplay = document.getElementById("modeDisplay");
const soundToggle = document.getElementById("soundToggle");
const darkModeToggle = document.getElementById("darkModeToggle");
const cloakToggle = document.getElementById("cloakToggle");
const clearFavoritesBtn = document.getElementById("clearFavoritesBtn");
const resetBtn = document.getElementById("resetBtn");
const favCount = document.getElementById("favCount");

let selectedGameEntry = null;
let selectedGameTitle = null;
let selectedGameIndex = null;
let currentGameIndex = 0;
let allGames = [];
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
let currentTheme = localStorage.getItem("theme") || "dark";
let colorTheme = localStorage.getItem("colorTheme") || "cyberpunk";
let soundEnabled = JSON.parse(localStorage.getItem("soundEnabled")) !== false;
let cloakEnabled = JSON.parse(localStorage.getItem("cloakEnabled")) || false;
let cloakName = localStorage.getItem("cloakName") || "Google Classroom";
let uploadedFaviconImage = localStorage.getItem("uploadedFaviconImage") || null;
let recentlyPlayed = JSON.parse(localStorage.getItem("recentlyPlayed")) || [];
let playtimeData = JSON.parse(localStorage.getItem("playtimeData")) || {};
let gameStartTime = null;
let gameCards = [];

const originalTitle = document.title;
const originalIcon = document.querySelector("link[rel='shortcut icon']");
const cloakInputContainer = document.getElementById("cloakInputContainer");
const cloakNameInput = document.getElementById("cloakNameInput");
const faviconUpload = document.getElementById("faviconUpload");
const clearImageFaviconBtn = document.getElementById("clearImageFaviconBtn");
const recentBtn = document.getElementById("recentBtn");
const recentModal = document.getElementById("recentModal");
const closeRecentBtn = document.getElementById("closeRecentBtn");
const recentListBody = document.getElementById("recentListBody");
const playtimeDisplay = document.getElementById("playtime-display");
const exportBtn = document.getElementById("exportBtn");
const importBtn = document.getElementById("importBtn");
const randomBtn = document.getElementById("randomBtn");
const sessionTimer = document.getElementById("sessionTimer");
const gameTitle = document.getElementById("gameTitle");

let sessionStartTime = null;
let sessionTimerInterval = null;
let audioContext = null;

// Sound effects with error handling
function playSound(type) {
  if (!soundEnabled) return;
  try {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    const now = audioContext.currentTime;
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.connect(gain);
    gain.connect(audioContext.destination);

    if (type === 'click') {
      osc.frequency.value = 600;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      gain.start(now);
      gain.stop(now + 0.1);
    } else if (type === 'hover') {
      osc.frequency.value = 800;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.05);
    } else if (type === 'launch') {
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.3);
      osc.type = 'triangle';
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    }
  } catch (e) {
    // Silently fail if audio not supported
  }
}

// Initialize theme and settings
function initTheme() {
  document.documentElement.setAttribute("data-theme", currentTheme);
  document.documentElement.setAttribute("data-color-theme", colorTheme);
  
  // Apply background
  const savedBg = localStorage.getItem("customWallpaper");
  if (savedBg) applyWallpaper(savedBg);

  // Apply logo
  const savedLogo = localStorage.getItem("customLogo");
  if (savedLogo) applyLogo(savedLogo);

  // Apply grid size
  const savedGrid = localStorage.getItem("gridSize") || "normal";
  document.documentElement.setAttribute("data-grid", savedGrid);
  if (document.getElementById("gridSizeSelect")) {
    document.getElementById("gridSizeSelect").value = savedGrid;
  }

  // Apply RGB border
  const rgbEnabled = JSON.parse(localStorage.getItem("rgbEnabled")) !== false;
  document.documentElement.setAttribute("data-rgb", rgbEnabled ? "on" : "off");
  if (document.getElementById("rgbToggle")) {
    document.getElementById("rgbToggle").checked = rgbEnabled;
  }

  // Apply animations
  if (animationsToggle) {
    animationsToggle.checked = animationsEnabled;
    document.body.style.animation = animationsEnabled ? "" : "none";
  }

  // Apply timer
  if (timerToggle) {
    timerToggle.checked = timerEnabled;
    sessionTimer.style.display = timerEnabled ? "block" : "none";
  }

  // Apply auto-play
  if (autoPlayToggle) {
    autoPlayToggle.checked = autoPlayEnabled;
  }
}

function applyWallpaper(data) {
  if (data) {
    document.body.classList.add('custom-bg');
    document.body.style.setProperty('--custom-bg', `url(${data})`);
    localStorage.setItem("customWallpaper", data);
  } else {
    document.body.classList.remove('custom-bg');
    document.body.style.removeProperty('--custom-bg');
    localStorage.removeItem("customWallpaper");
  }
}

function applyLogo(data) {
  const logoContainer = document.querySelector(".logo");
  if (!logoContainer) return;
  if (data) {
    logoContainer.innerHTML = `<img src="${data}" class="logo-img" alt="Aurora">`;
  } else {
    logoContainer.textContent = "Aurora";
  }
}

function toggleTheme() {
  currentTheme = currentTheme === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", currentTheme);
  localStorage.setItem("theme", currentTheme);
  showMsg("Theme switched to " + (currentTheme === "light" ? "light" : "dark"));
}

function updateFavicon() {
  if (originalIcon && uploadedFaviconImage) {
    originalIcon.href = uploadedFaviconImage;
  }
}

function updateTabCloak() {
  if (cloakEnabled) {
    document.title = cloakName;
    if (originalIcon) originalIcon.href = "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect fill='%234d90fe' width='100' height='100'/><text x='50' y='60' font-size='60' fill='white' text-anchor='middle'>C</text></svg>";
  } else {
    document.title = originalTitle;
    updateFavicon();
  }
}

// Update clock every second
function updateClock() {
  const now = new Date();
  let hours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, '0');
  let ampm = "";

  const use24Hour = JSON.parse(localStorage.getItem("use24Hour")) || false;

  if (!use24Hour) {
    ampm = (hours >= 12 ? " PM" : " AM");
    hours = hours % 12;
    hours = hours ? hours : 12;
  }

  const hourStr = String(hours).padStart(2, '0');
  clockEl.textContent = hourStr + ':' + minutes + ampm;
}
updateClock();
setInterval(updateClock, 1000);
const backToTopBtn = document.getElementById("backToTopBtn");
if (backToTopBtn) {
  gameStrip.onscroll = () => {
    if (gameStrip.scrollTop > 300 && playerSection.style.display === "none") {
      backToTopBtn.style.display = "flex";
    } else {
      backToTopBtn.style.display = "none";
    }
  };
  backToTopBtn.onclick = () => {
    gameStrip.scrollTo({ top: 0, behavior: 'smooth' });
  };
}

document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.key === 'f') {
    e.preventDefault();
    searchInput.focus();
    showMsg("Search focus");
  }
});

// Create a visible debug message box
const debug = document.createElement("div");
debug.style.position = "fixed";
debug.style.bottom = "10px";
debug.style.left = "10px";
debug.style.padding = "12px 16px";
debug.style.background = "rgba(0,0,0,0.85)";
debug.style.color = "white";
debug.style.fontSize = "13px";
debug.style.borderRadius = "10px";
debug.style.zIndex = "9999";
debug.style.maxWidth = "320px";
debug.style.pointerEvents = "none";
debug.style.border = "1px solid rgba(10,185,230,0.3)";
debug.style.boxShadow = "0 8px 24px rgba(0,0,0,0.6)";
debug.style.animation = "slideInLeft 0.3s ease";
debug.style.fontWeight = "500";
debug.style.opacity = "0";
debug.style.transition = "opacity 0.3s ease";
document.body.appendChild(debug);

let msgTimeout;
function showMsg(msg) {
  debug.textContent = msg;
  debug.style.opacity = "1";
  clearTimeout(msgTimeout);
  msgTimeout = setTimeout(() => {
    debug.style.opacity = "0";
  }, 3000);
}

const style = document.createElement("style");
style.textContent = `@keyframes slideInLeft {from{transform:translateX(-40px);opacity:0}to{transform:translateX(0);opacity:1}}`;
document.head.appendChild(style);

// Load the game list
async function loadGames() {
  showMsg("Loading games...");

  try {
    const res = await fetch("games.json", { cache: "no-store" });

    if (!res.ok) {
      showMsg("Error: Could not load games");
      return;
    }

    const gameList = await res.json();

    if (!Array.isArray(gameList)) {
      showMsg("Error: Games list is not an array");
      return;
    }

    if (gameList.length === 0) {
      showMsg("Error: No games found");
      return;
    }

    allGames = gameList;
    showMsg("Loaded " + gameList.length + " games");
    initTheme();
    updateStats();
    updatePlaytimeDisplay();
    filterAndRenderGames();

    // Check for game ID in URL
    const urlParams = new URLSearchParams(window.location.search);
    const gameId = urlParams.get('game');
    if (gameId) {
      const gameIdx = parseInt(gameId) - 1;
      if (gameIdx >= 0 && gameIdx < allGames.length) {
        const game = allGames[gameIdx];
        if (game && game.entry) {
          selectGame(game, gameIdx);
          launchGame();
        }
      }
    }
  } catch (e) {
    showMsg("Error: " + e.message);
  }
}

function filterAndRenderGames() {
  let filtered = [...allGames];
  const searchTerm = searchInput.value.toLowerCase();
  const sortBy = sortSelect.value;

  // Filter by search
  if (searchTerm) {
    filtered = filtered.filter(g => g.title.toLowerCase().includes(searchTerm));
  }

  // Filter by sort
  if (sortBy === "playable") {
    filtered = filtered.filter(g => g.entry);
  } else if (sortBy === "favorites") {
    filtered = filtered.filter(g => favorites.includes(g.title));
  } else if (sortBy === "alphabetical") {
    filtered = [...filtered].sort((a, b) => a.title.localeCompare(b.title));
  } else if (sortBy.startsWith("genre-")) {
    const genre = sortBy.replace("genre-", "");
    filtered = filtered.filter(g => g.genre && g.genre.toLowerCase() === genre);
  }

  renderGames(filtered);
}

function renderGames(games) {
  gameStrip.innerHTML = "";
  currentGameIndex = 0; // Reset nav index on render

  if (games.length === 0) {
    const empty = document.createElement("div");
    empty.style.padding = "20px";
    empty.style.color = "var(--muted)";
    empty.textContent = "No games found";
    gameStrip.appendChild(empty);
    return;
  }

  games.forEach((g, idx) => {
    const template = document.getElementById("cardTemplate");
    const card = template.content.cloneNode(true);

    const img = card.querySelector(".game-cover");
    img.src = g.cover || "https://via.placeholder.com/300x200?text=" + encodeURIComponent(g.title);
    img.alt = g.title;

    img.onerror = () => {
      img.src = "https://via.placeholder.com/300x200?text=" + encodeURIComponent(g.title);
    };

    const titleEl = card.querySelector(".game-title");
    titleEl.textContent = g.title;

    const cardDiv = card.querySelector(".game-card");
    cardDiv.dataset.index = idx;
    cardDiv.onclick = () => {
      const gameId = allGames.indexOf(g) + 1;
      const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?game=' + gameId;
      window.history.pushState({ path: newUrl }, '', newUrl);
      selectGame(g, allGames.indexOf(g));
      if (g.entry) launchGame();
    };

    cardDiv.onmouseenter = () => {
      document.querySelectorAll('.game-card.active').forEach(c => c.classList.remove('active'));
      cardDiv.classList.add('active');
      playSound('hover');
    };

    if (!g.entry) {
      cardDiv.style.opacity = "0.5";
    }

    if (playtimeData[g.title] > 0) {
      const badge = document.createElement('div');
      badge.className = 'stat-badge';
      badge.textContent = playtimeData[g.title].toFixed(1) + 'h';
      const imgContainer = cardDiv.querySelector('.game-card-image');
      if (imgContainer) imgContainer.appendChild(badge);
    }

    gameStrip.appendChild(card);
  });

  renderFavoritesBar();
}

function selectGame(game, index) {
  selectedGameTitle = game.title;
  selectedGameIndex = index;
  selectedGameEntry = game.entry;
  showMsg(game.title + " selected");
}

function addToRecentlyPlayed(title) {
  recentlyPlayed = recentlyPlayed.filter(g => g !== title);
  recentlyPlayed.unshift(title);
  recentlyPlayed = recentlyPlayed.slice(0, 10);
  localStorage.setItem("recentlyPlayed", JSON.stringify(recentlyPlayed));
  gameStartTime = Date.now();
}

function updatePlaytime(title) {
  if (sessionStartTime && title) {
    const elapsed = (Date.now() - sessionStartTime) / 3600000;
    playtimeData[title] = (playtimeData[title] || 0) + elapsed;
    localStorage.setItem("playtimeData", JSON.stringify(playtimeData));
    updatePlaytimeDisplay();
  }
}

function updatePlaytimeDisplay() {
  const total = Object.values(playtimeData).reduce((a, b) => a + b, 0);
  playtimeDisplay.textContent = total.toFixed(1) + "h";
}

function launchGame() {
  if (!selectedGameEntry) {
    showMsg("Error: Game files not found");
    return;
  }

  playSound('launch');
  homeSection.style.display = "none";
  playerSection.style.display = "flex";
  if (backToTopBtn) backToTopBtn.style.display = "none";
  gameFrame.src = selectedGameEntry;
  gameTitle.textContent = selectedGameTitle;
  addToRecentlyPlayed(selectedGameTitle);

  // Clean up old timer if exists
  if (sessionTimerInterval) {
    clearInterval(sessionTimerInterval);
    sessionTimerInterval = null;
  }

  // Start session timer
  sessionStartTime = Date.now();
  updateSessionTimer();
  sessionTimerInterval = setInterval(updateSessionTimer, 1000);

  showMsg("Game loaded");
}

function updateSessionTimer() {
  if (sessionStartTime) {
    const elapsed = Math.floor((Date.now() - sessionStartTime) / 1000);
    const mins = Math.floor(elapsed / 60);
    const secs = elapsed % 60;
    sessionTimer.textContent = String(mins).padStart(2, '0') + ':' + String(secs).padStart(2, '0');
  }
}

if (backBtn) {
  backBtn.onclick = () => {
    playSound('click');
    updatePlaytime(selectedGameTitle);
    if (sessionTimerInterval) clearInterval(sessionTimerInterval);
    sessionStartTime = null;
    gameFrame.src = "";
    playerSection.style.display = "none";
    homeSection.style.display = "flex";
    if (backToTopBtn) gameStrip.onscroll();
    showMsg("Home");

    // Remove game ID from URL
    const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
    window.history.pushState({ path: newUrl }, '', newUrl);
  };
}

if (fullscreenBtn) {
  fullscreenBtn.onclick = () => {
    playSound('click');
    if (gameFrame.requestFullscreen) {
      gameFrame.requestFullscreen().catch(err => showMsg("Fullscreen not available"));
    } else {
      showMsg("Fullscreen not supported");
    }
  };
}

if (refreshBtn) {
  refreshBtn.onclick = (e) => {
    e.preventDefault();
    playSound('click');
    if (gameFrame.src) {
      const current = gameFrame.src;
      gameFrame.src = "";
      setTimeout(() => {
        gameFrame.src = current;
      }, 50);
      showMsg("Game refreshed");
    } else if (selectedGameEntry) {
      gameFrame.src = selectedGameEntry;
      showMsg("Game loaded");
    }
  };
}

if (externalBtn) {
  externalBtn.onclick = () => {
    playSound('click');
    if (selectedGameEntry) {
      window.open(selectedGameEntry, '_blank');
      showMsg("Opening in new tab...");
    } else {
      showMsg("No game selected");
    }
  };
}

randomBtn.onclick = () => {
  playSound('click');
  const playableGames = allGames.filter(g => g.entry);
  if (playableGames.length === 0) {
    showMsg("No playable games available");
    return;
  }
  const randomGame = playableGames[Math.floor(Math.random() * playableGames.length)];
  selectGame(randomGame, allGames.indexOf(randomGame));
  launchGame();
};

settingsBtn.onclick = () => {
  openSettings();
};

closeSettingsBtn.onclick = () => {
  settingsModal.style.display = "none";
};

helpBtn.onclick = () => {
  helpModal.style.display = "flex";
};

closeHelpBtn.onclick = () => {
  helpModal.style.display = "none";
};

helpModal.addEventListener("click", (e) => {
  if (e.target === helpModal) {
    helpModal.style.display = "none";
  }
});

recentBtn.onclick = () => {
  recentModal.style.display = "flex";
  renderRecentlyPlayed();
};

closeRecentBtn.onclick = () => {
  recentModal.style.display = "none";
};

recentModal.addEventListener("click", (e) => {
  if (e.target === recentModal) {
    recentModal.style.display = "none";
  }
});

function renderRecentlyPlayed() {
  if (recentlyPlayed.length === 0) {
    recentListBody.innerHTML = "<div style='color:var(--muted);text-align:center;padding:20px;'>No recently played games yet</div>";
    return;
  }
  recentListBody.innerHTML = recentlyPlayed.map(title => {
    const hours = playtimeData[title] ? playtimeData[title].toFixed(1) : "0.0";
    return "<div class='recent-item'><div class='recent-title'>" + title + "</div><div class='recent-time'>" + hours + "h</div></div>";
  }).join("");
}

exportBtn.onclick = () => {
  const backup = {
    favorites: favorites,
    theme: currentTheme,
    soundEnabled: soundEnabled,
    cloakEnabled: cloakEnabled,
    cloakName: cloakName,
    recentlyPlayed: recentlyPlayed,
    playtimeData: playtimeData,
    uploadedFaviconImage: uploadedFaviconImage
  };
  const dataStr = JSON.stringify(backup, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "aurora-backup-" + new Date().toISOString().split("T")[0] + ".json";
  a.click();
  showMsg("Settings exported");
};

importBtn.onchange = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const backup = JSON.parse(event.target.result);
      favorites = backup.favorites || [];
      currentTheme = backup.theme || "dark";
      soundEnabled = backup.soundEnabled !== false;
      cloakEnabled = backup.cloakEnabled || false;
      cloakName = backup.cloakName || "Google Classroom";
      recentlyPlayed = backup.recentlyPlayed || [];
      playtimeData = backup.playtimeData || {};
      uploadedFaviconImage = backup.uploadedFaviconImage || null;

      localStorage.setItem("favorites", JSON.stringify(favorites));
      localStorage.setItem("theme", currentTheme);
      localStorage.setItem("soundEnabled", JSON.stringify(soundEnabled));
      localStorage.setItem("cloakEnabled", JSON.stringify(cloakEnabled));
      localStorage.setItem("cloakName", cloakName);
      localStorage.setItem("recentlyPlayed", JSON.stringify(recentlyPlayed));
      localStorage.setItem("playtimeData", JSON.stringify(playtimeData));
      localStorage.setItem("uploadedFaviconImage", uploadedFaviconImage);

      document.documentElement.setAttribute("data-theme", currentTheme);
      updateFavicon();
      updateTabCloak();
      updateStats();
      updatePlaytimeDisplay();
      openSettings();
      showMsg("Settings imported successfully");
    } catch (err) {
      showMsg("Error: Invalid backup file");
    }
  };
  reader.readAsText(file);
  importBtn.value = "";
};

function updateStats() {
  const playableCount = allGames.filter(g => g.entry).length;
  if (statsTotal) statsTotal.textContent = allGames.length;
  if (statsPlayable) statsPlayable.textContent = playableCount;
  if (statsFav) statsFav.textContent = favorites.length;
  if (favCount) favCount.textContent = favorites.length;
  if (modeDisplay) modeDisplay.textContent = currentTheme === "dark" ? "Dark" : "Light";
}

function openSettings() {
  settingsModal.style.display = "flex";
  soundToggle.checked = soundEnabled;
  darkModeToggle.checked = currentTheme === "dark";
  cloakToggle.checked = cloakEnabled;
  cloakNameInput.value = cloakName;
  cloakInputContainer.style.display = cloakEnabled ? "block" : "none";
  updateStats();
}

function closeSettings() {
  settingsModal.style.display = "none";
}

soundToggle.addEventListener("change", () => {
  soundEnabled = soundToggle.checked;
  localStorage.setItem("soundEnabled", soundEnabled);
  showMsg(soundEnabled ? "Sound enabled" : "Sound disabled");
});

darkModeToggle.addEventListener("change", () => {
  if (darkModeToggle.checked) {
    currentTheme = "dark";
  } else {
    currentTheme = "light";
  }
  document.documentElement.setAttribute("data-theme", currentTheme);
  localStorage.setItem("theme", currentTheme);
  showMsg(currentTheme === "dark" ? "Dark mode enabled" : "Light mode enabled");
});

cloakToggle.addEventListener("change", () => {
  cloakEnabled = cloakToggle.checked;
  localStorage.setItem("cloakEnabled", cloakEnabled);
  cloakInputContainer.style.display = cloakEnabled ? "block" : "none";
  updateTabCloak();
  showMsg(cloakEnabled ? "Tab cloaked" : "Cloak disabled");
});

cloakNameInput.addEventListener("input", () => {
  cloakName = cloakNameInput.value || "Google Classroom";
  localStorage.setItem("cloakName", cloakName);
  if (cloakEnabled) {
    updateTabCloak();
  }
});

faviconUpload.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      uploadedFaviconImage = event.target.result;
      localStorage.setItem("uploadedFaviconImage", uploadedFaviconImage);
      updateFavicon();
      showMsg("Favicon uploaded");
      faviconUpload.value = "";
    };
    reader.readAsDataURL(file);
  }
});

clearImageFaviconBtn.addEventListener("click", () => {
  uploadedFaviconImage = null;
  localStorage.removeItem("uploadedFaviconImage");
  updateFavicon();
  showMsg("Custom image cleared");
});

clearFavoritesBtn.onclick = () => {
  if (confirm("Clear all " + favorites.length + " favorites?")) {
    favorites = [];
    localStorage.setItem("favorites", JSON.stringify(favorites));
    favCount.textContent = "0";
    showMsg("All favorites cleared");
    filterAndRenderGames();
  }
};

const clearRecentHistoryBtn = document.getElementById("clearRecentBtn");
if (clearRecentHistoryBtn) {
  clearRecentHistoryBtn.onclick = () => {
    if (confirm("Clear " + recentlyPlayed.length + " recently played games?")) {
      recentlyPlayed = [];
      localStorage.setItem("recentlyPlayed", JSON.stringify(recentlyPlayed));
      showMsg("Recent history cleared");
      updateSettingsDisplay();
    }
  };
}

const animationsToggle = document.getElementById("animationsToggle");
const timerToggle = document.getElementById("timerToggle");
const autoPlayToggle = document.getElementById("autoPlayToggle");
let animationsEnabled = JSON.parse(localStorage.getItem("animationsEnabled")) !== false;
let timerEnabled = JSON.parse(localStorage.getItem("timerEnabled")) !== false;
let autoPlayEnabled = JSON.parse(localStorage.getItem("autoPlayEnabled")) || false;

if (animationsToggle) {
  animationsToggle.checked = animationsEnabled;
  animationsToggle.onchange = () => {
    animationsEnabled = animationsToggle.checked;
    localStorage.setItem("animationsEnabled", animationsEnabled);
    document.body.style.animation = animationsEnabled ? "" : "none";
    showMsg(animationsEnabled ? "Animations enabled" : "Animations disabled");
  };
}

if (timerToggle) {
  timerToggle.checked = timerEnabled;
  timerToggle.onchange = () => {
    timerEnabled = timerToggle.checked;
    localStorage.setItem("timerEnabled", timerEnabled);
    sessionTimer.style.display = timerEnabled ? "block" : "none";
    showMsg(timerEnabled ? "Session timer enabled" : "Session timer disabled");
  };
}

if (autoPlayToggle) {
  autoPlayToggle.checked = autoPlayEnabled;
  autoPlayToggle.onchange = () => {
    autoPlayEnabled = autoPlayToggle.checked;
    localStorage.setItem("autoPlayEnabled", autoPlayEnabled);
    showMsg(autoPlayEnabled ? "Auto-play enabled" : "Auto-play disabled");
  };
}

function getStorageUsage() {
  let total = 0;
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      total += localStorage[key].length + key.length;
    }
  }
  return (total / 1024).toFixed(2);
}

function getTotalPlaytime() {
  const total = Object.values(playtimeData).reduce((a, b) => a + b, 0);
  return total.toFixed(1);
}

function updateSettingsDisplay() {
  const statsRecent = document.getElementById("statsRecent");
  const storageUsage = document.getElementById("storageUsage");
  const totalPlaytime = document.getElementById("totalPlaytime");

  if (statsRecent) statsRecent.textContent = recentlyPlayed.length;
  if (storageUsage) storageUsage.textContent = getStorageUsage() + " KB";
  if (totalPlaytime) totalPlaytime.textContent = getTotalPlaytime() + "h";
}

settingsBtn.addEventListener("click", () => {
  updateSettingsDisplay();
  const colorThemeSelect = document.getElementById("colorThemeSelect");
  if (colorThemeSelect) colorThemeSelect.value = colorTheme;
  const bgUploadBtn = document.getElementById("bgUploadBtn");
  const bgResetBtn = document.getElementById("bgResetBtn");
  if (bgUploadBtn) {
    bgUploadBtn.onclick = () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const bgData = event.target.result;
            localStorage.setItem("customWallpaper", bgData);
            applyWallpaper(bgData);
            showMsg("Wallpaper updated");
          };
          reader.readAsDataURL(file);
        }
      };
      input.click();
    };
  }

  if (bgResetBtn) {
    bgResetBtn.onclick = () => {
      applyWallpaper(null);
      showMsg("Wallpaper reset");
    };
  }

  const logoUploadBtn = document.getElementById("logoUploadBtn");
  const logoResetBtn = document.getElementById("logoResetBtn");
  if (logoUploadBtn) {
    logoUploadBtn.onclick = () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const logoData = event.target.result;
            localStorage.setItem("customLogo", logoData);
            applyLogo(logoData);
            showMsg("Logo updated");
          };
          reader.readAsDataURL(file);
        }
      };
      input.click();
    };
  }

  if (logoResetBtn) {
    logoResetBtn.onclick = () => {
      localStorage.removeItem("customLogo");
      applyLogo(null);
      showMsg("Logo reset");
    };
  }

  // Add Logo reset to the resetBtn logic
  const originalReset = resetBtn.onclick;
  resetBtn.onclick = () => {
    if (confirm("Reset all settings to default?")) {
      localStorage.removeItem("customWallpaper");
      localStorage.removeItem("customLogo");
      applyWallpaper(null);
      applyLogo(null);
      if (originalReset) originalReset();
    }
  };

  const gridSizeSelect = document.getElementById("gridSizeSelect");
  let gridSize = localStorage.getItem("gridSize") || "normal";
  if (gridSizeSelect) {
    gridSizeSelect.value = gridSize;
    document.documentElement.setAttribute("data-grid", gridSize);
    gridSizeSelect.onchange = () => {
      gridSize = gridSizeSelect.value;
      localStorage.setItem("gridSize", gridSize);
      document.documentElement.setAttribute("data-grid", gridSize);
      showMsg("Grid size: " + gridSize);
    };
  }

  const hourFormatToggle = document.getElementById("hourFormatToggle");
  let use24Hour = JSON.parse(localStorage.getItem("use24Hour")) || false;
  if (hourFormatToggle) {
    hourFormatToggle.checked = use24Hour;
    hourFormatToggle.onchange = () => {
      use24Hour = hourFormatToggle.checked;
      localStorage.setItem("use24Hour", use24Hour);
      updateClock();
      showMsg(use24Hour ? "24-hour clock enabled" : "12-hour clock enabled");
    };
  }

  settingsModal.style.display = "flex";
  playSound('click');
});

const colorThemeSelect = document.getElementById("colorThemeSelect");
if (colorThemeSelect) {
  colorThemeSelect.onchange = () => {
    colorTheme = colorThemeSelect.value;
    localStorage.setItem("colorTheme", colorTheme);
    document.documentElement.setAttribute("data-color-theme", colorTheme);
    showMsg("Theme: " + colorTheme);
  };
}

const rgbToggle = document.getElementById("rgbToggle");
let rgbEnabled = JSON.parse(localStorage.getItem("rgbEnabled")) !== false;

const particlesToggle = document.getElementById("particlesToggle");
let particlesEnabled = JSON.parse(localStorage.getItem("particlesEnabled")) !== false;

if (rgbToggle) {
  rgbToggle.checked = rgbEnabled;
  document.documentElement.setAttribute("data-rgb", rgbEnabled ? "on" : "off");

  rgbToggle.onchange = () => {
    rgbEnabled = rgbToggle.checked;
    localStorage.setItem("rgbEnabled", rgbEnabled);
    document.documentElement.setAttribute("data-rgb", rgbEnabled ? "on" : "off");
    showMsg(rgbEnabled ? "RGB Border enabled" : "RGB Border disabled");
  };
}

if (particlesToggle) {
  particlesToggle.checked = particlesEnabled;
  particlesToggle.onchange = () => {
    particlesEnabled = particlesToggle.checked;
    localStorage.setItem("particlesEnabled", particlesEnabled);
    showMsg(particlesEnabled ? "Particles enabled" : "Particles disabled");
  };
}

// Enhanced Particle System
let lastParticleTime = 0;
document.addEventListener('mousemove', (e) => {
  if (!particlesEnabled) return;
  const now = Date.now();
  if (now - lastParticleTime > 20) {
    lastParticleTime = now;
    const p = document.createElement('div');
    p.className = 'particle';
    const size = Math.random() * 4 + 2;
    p.style.width = size + 'px';
    p.style.height = size + 'px';
    p.style.left = e.clientX + 'px';
    p.style.top = e.clientY + 'px';

    const angle = Math.random() * Math.PI * 2;
    const distance = 30 + Math.random() * 50;
    const tx = Math.cos(angle) * distance;
    const ty = Math.sin(angle) * distance;

    p.style.setProperty('--tx', tx + 'px');
    p.style.setProperty('--ty', ty + 'px');
    p.style.setProperty('--scale', Math.random() * 0.5 + 0.5);

    // Match current accent color via CSS variable
    p.style.background = 'var(--accent)';
    p.style.boxShadow = `0 0 10px var(--accent)`;

    document.body.appendChild(p);
    setTimeout(() => p.remove(), 2000);
  }
});

function renderFavoritesBar() {
  const favBar = document.getElementById("favoritesBar");
  if (!favBar) return;
  const favGames = allGames.filter(g => favorites.includes(g.title)).slice(0, 9);
  if (favGames.length === 0) {
    favBar.innerHTML = '<span style="color:var(--muted);font-size:0.9rem;">⭐ Add games to favorites to see them here</span>';
    return;
  }
  favBar.innerHTML = '<span style="color:var(--muted);font-size:0.85rem;white-space:nowrap;">⭐ Quick Favorites:</span>';
  favGames.forEach((game, idx) => {
    const btn = document.createElement("button");
    btn.className = "sort-select";
    btn.style.cssText = "padding:8px 12px;";
    btn.textContent = (idx + 1) + ". " + game.title;
    btn.onclick = () => {
      selectGame(game, allGames.indexOf(game));
      if (game.entry) {
        playSound('launch');
        launchGame();
      }
    };
    favBar.appendChild(btn);
  });
}

document.addEventListener('keydown', (e) => {
  if (playerSection.style.display === "none" && /^[1-9]$/.test(e.key)) {
    const gameNum = parseInt(e.key) - 1;
    const gameCards = document.querySelectorAll(".game-card");
    if (gameNum < gameCards.length && gameNum < allGames.length) {
      const cardTitles = Array.from(gameCards).map(c => c.querySelector(".game-title").textContent);
      const selectedTitle = cardTitles[gameNum];
      const idx = allGames.findIndex(g => g.title === selectedTitle);
      if (idx >= 0) {
        selectGame(allGames[idx], idx);
        if (allGames[idx].entry) {
          playSound('launch');
          launchGame();
        }
      }
    }
  }
}, true);

resetBtn.onclick = () => {
  if (confirm("Reset all settings to default? This will:\n- Clear favorites\n- Reset theme to dark\n- Enable sound\n- Disable tab cloak\n- Clear uploaded favicon\n- Clear recent history")) {
    localStorage.clear();
    location.reload(); // Hard reset is safest to clear all memory states
  }
};

settingsModal.addEventListener("click", (e) => {
  if (e.target === settingsModal) {
    closeSettings();
  }
});

searchInput.addEventListener("input", () => {
  filterAndRenderGames();
});

sortSelect.addEventListener("change", () => {
  filterAndRenderGames();
});


// Keyboard navigation for game strip
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && selectedGameEntry && playerSection.style.display === "none") {
    e.preventDefault();
    launchGame();
  } else if (e.key === 'Escape' && playerSection.style.display === "flex") {
    e.preventDefault();
    backBtn.click();
  }
});

// Scroll buttons
const scrollLeftBtn = document.getElementById('scrollLeftBtn');
const scrollRightBtn = document.getElementById('scrollRightBtn');

if (scrollLeftBtn) {
  scrollLeftBtn.onclick = () => {
    if (gameStrip) gameStrip.scrollLeft -= 300;
  };
}

if (scrollRightBtn) {
  scrollRightBtn.onclick = () => {
    if (gameStrip) gameStrip.scrollLeft += 300;
  };
}

// Remove duplicate particle and keyboard listeners below

// Konami Code Easter Egg
let konamiCode = [];
const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
document.addEventListener('keydown', (e) => {
  konamiCode.push(e.key.toLowerCase());
  konamiCode = konamiCode.slice(-10);
  if (konamiCode.join(',') === konamiSequence.join(',')) {
    triggerKonamiMode();
  }
});

function triggerKonamiMode() {
  playSound('click');
  showMsg('🎮 KONAMI CODE ACTIVATED! 🎮');
  document.querySelectorAll('.game-card').forEach(card => {
    card.style.animation = 'cardSpin 0.8s ease-in-out';
  });
  setTimeout(() => {
    document.querySelectorAll('.game-card').forEach(card => {
      card.style.animation = '';
    });
  }, 800);
}


// Start loading when page opens
loadGames();

// Enhanced Keyboard Navigation
document.addEventListener('keydown', (e) => {
  const cards = document.querySelectorAll('.game-card');
  if (cards.length === 0) return;

  if (e.key === 'ArrowRight') {
    currentGameIndex = (currentGameIndex + 1) % cards.length;
    updateFocusedCard(cards);
  } else if (e.key === 'ArrowLeft') {
    currentGameIndex = (currentGameIndex - 1 + cards.length) % cards.length;
    updateFocusedCard(cards);
  } else if (e.key === 'Enter') {
    const activeCard = document.querySelector('.game-card.active');
    if (activeCard && playerSection.style.display === "none") {
      activeCard.click();
      if (selectedGameEntry) launchGame();
    }
  }
});

function updateFocusedCard(cards) {
  cards.forEach(c => c.classList.remove('active'));
  const card = cards[currentGameIndex];
  if (card) {
    card.classList.add('active');
    card.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    const title = card.querySelector('.game-title').textContent;
    const game = allGames.find(g => g.title === title);
    if (game) selectGame(game, allGames.indexOf(game));
  }
}
