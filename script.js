// Aurora Game Loader – GitHub Pages Safe Build
// Loads games from /games/ folder

// ================== ELEMENTS ==================
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
const statsTotal = document.getElementById("statsTotal");
const statsPlayable = document.getElementById("statsPlayable");
const statsFav = document.getElementById("statsFav");
const searchInput = document.getElementById("searchInput");
const sortSelect = document.getElementById("sortSelect");
const settingsModal = document.getElementById("settingsModal");
const closeSettingsBtn = document.getElementById("closeSettingsBtn");
const favCount = document.getElementById("favCount");
const gameTitle = document.getElementById("gameTitle");
const sessionTimer = document.getElementById("sessionTimer");

// ================== STATE ==================
let allGames = [];
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
let selectedGameEntry = null;
let selectedGameTitle = null;
let selectedGameIndex = null;
let currentGameIndex = 0;
let sessionStartTime = null;
let sessionTimerInterval = null;

// ================== DEBUG BOX ==================
const debug = document.createElement("div");
debug.style.position = "fixed";
debug.style.bottom = "10px";
debug.style.left = "10px";
debug.style.padding = "10px 14px";
debug.style.background = "rgba(0,0,0,0.85)";
debug.style.color = "white";
debug.style.fontSize = "13px";
debug.style.borderRadius = "8px";
debug.style.zIndex = "9999";
debug.style.opacity = "0";
debug.style.transition = "0.3s";
document.body.appendChild(debug);

let msgTimeout;
function showMsg(msg) {
  debug.textContent = msg;
  debug.style.opacity = "1";
  clearTimeout(msgTimeout);
  msgTimeout = setTimeout(() => debug.style.opacity = "0", 3000);
}

// ================== CLOCK ==================
function updateClock() {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, "0");
  const m = String(now.getMinutes()).padStart(2, "0");
  clockEl.textContent = `${h}:${m}`;
}
setInterval(updateClock, 1000);
updateClock();

// ================== GAME LOADER ==================
async function loadGames() {
  showMsg("Loading games...");

  let gameList;

  try {
    const res = await fetch("games/games.json", { cache: "no-store" });
    if (!res.ok) throw new Error("Primary failed");
    gameList = await res.json();
  } catch {
    try {
      const backup = await fetch("games/games_backup.json", { cache: "no-store" });
      if (!backup.ok) throw new Error("Backup failed");
      gameList = await backup.json();
    } catch {
      showMsg("❌ Failed to load games.json");
      return;
    }
  }

  if (!Array.isArray(gameList)) {
    showMsg("❌ games.json is invalid");
    return;
  }

  allGames = gameList;
  showMsg(`Loaded ${allGames.length} games`);
  renderGames(allGames);
  updateStats();
}

// ================== RENDER ==================
function renderGames(games) {
  gameStrip.innerHTML = "";

  if (games.length === 0) {
    gameStrip.innerHTML = "<div style='padding:20px;color:gray'>No games found</div>";
    return;
  }

  games.forEach((g, idx) => {
    const card = document.createElement("div");
    card.className = "game-card";
    card.dataset.index = idx;

    const img = document.createElement("img");
    img.className = "game-cover";
    img.src = g.cover || "https://via.placeholder.com/300x200?text=" + encodeURIComponent(g.title);
    img.onerror = () => img.src = "https://via.placeholder.com/300x200?text=" + encodeURIComponent(g.title);

    const title = document.createElement("div");
    title.className = "game-title";
    title.textContent = g.title;

    card.appendChild(img);
    card.appendChild(title);

    if (!g.entry) {
      card.style.opacity = "0.5";
    }

    card.onclick = () => {
      selectGame(g, idx);
      if (g.entry) launchGame();
    };

    card.onmouseenter = () => {
      document.querySelectorAll(".game-card.active").forEach(c => c.classList.remove("active"));
      card.classList.add("active");
      selectGame(g, idx);
    };

    gameStrip.appendChild(card);
  });
}

// ================== SELECT ==================
function selectGame(game, index) {
  selectedGameTitle = game.title;
  selectedGameIndex = index;
  selectedGameEntry = game.entry;
  showMsg(`${game.title} selected`);
}

// ================== LAUNCH ==================
function launchGame() {
  if (!selectedGameEntry) {
    showMsg("❌ Game has no entry file");
    return;
  }

  homeSection.style.display = "none";
  playerSection.style.display = "flex";
  gameFrame.src = selectedGameEntry;
  gameTitle.textContent = selectedGameTitle;

  startSessionTimer();
  showMsg("Game loaded");
}

// ================== SESSION TIMER ==================
function startSessionTimer() {
  if (sessionTimerInterval) clearInterval(sessionTimerInterval);

  sessionStartTime = Date.now();
  sessionTimerInterval = setInterval(() => {
    const elapsed = Math.floor((Date.now() - sessionStartTime) / 1000);
    const mins = String(Math.floor(elapsed / 60)).padStart(2, "0");
    const secs = String(elapsed % 60).padStart(2, "0");
    sessionTimer.textContent = `${mins}:${secs}`;
  }, 1000);
}

// ================== CONTROLS ==================
if (backBtn) {
  backBtn.onclick = () => {
    gameFrame.src = "";
    playerSection.style.display = "none";
    homeSection.style.display = "flex";
    showMsg("Home");
  };
}

if (refreshBtn) {
  refreshBtn.onclick = () => {
    if (gameFrame.src) {
      const src = gameFrame.src;
      gameFrame.src = "";
      setTimeout(() => gameFrame.src = src, 50);
      showMsg("Game refreshed");
    }
  };
}

if (fullscreenBtn) {
  fullscreenBtn.onclick = () => {
    if (gameFrame.requestFullscreen) {
      gameFrame.requestFullscreen();
    }
  };
}

if (externalBtn) {
  externalBtn.onclick = () => {
    if (selectedGameEntry) {
      window.open(selectedGameEntry, "_blank");
    }
  };
}

// ================== SEARCH + SORT ==================
searchInput.oninput = () => filterAndRender();
sortSelect.onchange = () => filterAndRender();

function filterAndRender() {
  let filtered = [...allGames];
  const term = searchInput.value.toLowerCase();
  const sort = sortSelect.value;

  if (term) filtered = filtered.filter(g => g.title.toLowerCase().includes(term));
  if (sort === "playable") filtered = filtered.filter(g => g.entry);
  if (sort === "favorites") filtered = filtered.filter(g => favorites.includes(g.title));
  if (sort === "alphabetical") filtered.sort((a,b) => a.title.localeCompare(b.title));

  renderGames(filtered);
}

// ================== STATS ==================
function updateStats() {
  const playable = allGames.filter(g => g.entry).length;
  statsTotal.textContent = allGames.length;
  statsPlayable.textContent = playable;
  statsFav.textContent = favorites.length;
  favCount.textContent = favorites.length;
}

// ================== KEYBOARD ==================
document.addEventListener("keydown", e => {
  const cards = document.querySelectorAll(".game-card");
  if (!cards.length) return;

  if (e.key === "ArrowRight") {
    currentGameIndex = (currentGameIndex + 1) % cards.length;
    focusCard(cards);
  }

  if (e.key === "ArrowLeft") {
    currentGameIndex = (currentGameIndex - 1 + cards.length) % cards.length;
    focusCard(cards);
  }

  if (e.key === "Enter" && selectedGameEntry && playerSection.style.display === "none") {
    launchGame();
  }

  if (e.key === "Escape" && playerSection.style.display === "flex") {
    backBtn.click();
  }
});

function focusCard(cards) {
  cards.forEach(c => c.classList.remove("active"));
  const card = cards[currentGameIndex];
  if (card) {
    card.classList.add("active");
    card.scrollIntoView({ behavior: "smooth", inline: "center" });
    const title = card.querySelector(".game-title").textContent;
    const game = allGames.find(g => g.title === title);
    if (game) selectGame(game, allGames.indexOf(game));
  }
}

// ================== SETTINGS ==================
settingsBtn.onclick = () => settingsModal.style.display = "flex";
closeSettingsBtn.onclick = () => settingsModal.style.display = "none";

// ================== START ==================
loadGames();
