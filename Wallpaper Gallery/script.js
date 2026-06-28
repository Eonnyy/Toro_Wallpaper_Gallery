// ===== DATA & VARIABLES =====
let wallpapers = [];
let selectedColor = null,
  searchTerm = "";
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

// ===== LOAD WALLPAPERS =====
async function loadWallpapers() {
  try {
    const response = await fetch("data/wallpapers.json");
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data = await response.json();
    wallpapers = data.wallpapers;
    displayWallpapers(wallpapers);
  } catch (error) {
    console.error("Failed loading wallpapers:", error);
    showError("Failed to load wallpapers. Please refresh the page.");
  }
}

// ===== ERROR HANDLING =====
function showError(message) {
  const errorDiv = document.createElement("div");
  errorDiv.className = "error-message";
  errorDiv.textContent = message;
  document.body.insertBefore(errorDiv, document.body.firstChild);
  setTimeout(() => errorDiv.remove(), 5000);
}

// ===== DISPLAY WALLPAPERS =====
function displayWallpapers(list) {
  const gallery = document.getElementById("gallery");
  gallery.innerHTML = "";

  if (list.length === 0) {
    gallery.innerHTML =
      "<p style='text-align:center; grid-column: 1/-1;'>No wallpapers found.</p>";
    return;
  }

  list.forEach((w) => {
    const card = document.createElement("div");
    card.className = "wallpaper-card";
    card.innerHTML = `
      <img 
        src="${w.image}" 
        alt="${w.name}"
        loading="lazy"
        title="${w.name}"
      >
      <div class="card-info">
        <h3>${w.name}</h3>
        <button class="download-btn" aria-label="Download ${w.name}">Download</button>
        <button class="favorite-btn ${favorites.includes(w.id) ? "liked" : ""}" aria-label="Add ${w.name} to favorites">Favourite</button>
      </div>
    `;
    gallery.appendChild(card);

    card.querySelector("img").onclick = () => {
      document.getElementById("previewModal").style.display = "flex";
      document.getElementById("modalImage").src = w.image;
      document.getElementById("modalImage").alt = w.name;
    };

    card.querySelector(".download-btn").onclick = () => {
      const a = document.createElement("a");
      a.href = w.image;
      a.download = w.name + ".jpg";
      a.click();
    };

    card.querySelector(".favorite-btn").onclick = function () {
      if (favorites.includes(w.id)) {
        favorites = favorites.filter((id) => id !== w.id);
        this.classList.remove("liked");
      } else {
        favorites.push(w.id);
        this.classList.add("liked");
      }
      localStorage.setItem("favorites", JSON.stringify(favorites));
    };
  });
}

// ===== FILTER WALLPAPERS =====
function filterWallpapers() {
  displayWallpapers(
    wallpapers.filter(
      (w) =>
        w.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (selectedColor === null || w.color === selectedColor),
    ),
  );
}

document.getElementById("searchInput").addEventListener("input", (e) => {
  searchTerm = e.target.value;
  filterWallpapers();
});

document.getElementById("previewModal").onclick = function () {
  this.style.display = "none";
};

// ===== COLOR FILTER =====
["#A8D8FF", "#FFB7C5"].forEach((color) => {
  const btn = document.createElement("button");
  btn.className = "color-btn";
  btn.style.backgroundColor = color;
  btn.setAttribute("aria-label", `Filter by ${color}`);
  btn.onclick = () => {
    selectedColor = selectedColor === color ? null : color;
    document
      .querySelectorAll(".color-btn")
      .forEach((b) => b.classList.remove("active"));
    if (selectedColor) btn.classList.add("active");
    filterWallpapers();
  };
  document.getElementById("colorFilter").appendChild(btn);
});

// ===== QUOTE =====
const quotes = [
  "Meow! Have a nice day!",
  "Toro likes this wallpaper.",
  "Smile and stay cozy.",
];
document.getElementById("quoteText").textContent =
  quotes[Math.floor(Math.random() * quotes.length)];

// ===== DARK MODE TOGGLE =====
const darkModeBtn = document.getElementById("darkModeToggle");
const savedDarkMode = localStorage.getItem("darkMode");

if (savedDarkMode === "enabled") {
  document.body.classList.add("dark-mode");
  darkModeBtn.textContent = "☀️";
}

darkModeBtn.addEventListener("click", function () {
  document.body.classList.toggle("dark-mode");
  if (document.body.classList.contains("dark-mode")) {
    localStorage.setItem("darkMode", "enabled");
    darkModeBtn.textContent = "☀️";
  } else {
    localStorage.setItem("darkMode", "disabled");
    darkModeBtn.textContent = "🌙";
  }
});

// ===== FLOATING EMOJI =====
const floatingEmojis = [
  "🎵",
  "🎶",
  "✨",
  "💫",
  "⭐",
  "🎨",
  "🌸",
  "💖",
  "🎀",
  "🦋",
];

function createEmoji() {
  const emoji = document.createElement("div");
  emoji.className = "floating-emoji";
  emoji.innerText =
    floatingEmojis[Math.floor(Math.random() * floatingEmojis.length)];
  emoji.style.left = Math.random() * 100 + "vw";
  emoji.style.animationDuration = 8 + Math.random() * 7 + "s";
  document.body.appendChild(emoji);
  setTimeout(() => emoji.remove(), 15000);
}

createEmoji();
setInterval(() => createEmoji(), 2500);

// ===== MUSIC PLAYER =====
const playlist = [
  {
    title: "Relaxed",
    artist: "MC Mablo Dos Paredões",
    file: "music/Relaxed.mp3",
  },
  {
    title: "Can't Take My Eyes Off You",
    artist: "Craymer, AIIVAWN",
    file: "music/Cant_Take_My_Eyes.mp3",
  },
  { title: "Tired Boy", artist: "Joey Pecoraro", file: "music/Tired_Boy.mp3" },
];

let currentSongIndex = 0;
const audioPlayer = document.getElementById("audioPlayer");
const playBtn = document.getElementById("playBtn");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const songTitle = document.querySelector(".song-title");
const artistName = document.querySelector(".artist-name");
const progressBar = document.getElementById("progressBar");
const currentTimeSpan = document.querySelector(".current-time");
const durationTimeSpan = document.querySelector(".duration-time");
const volumeSlider = document.getElementById("volumeSlider");

const savedVolume = localStorage.getItem("playerVolume") || 70;
const savedSongIndex = localStorage.getItem("currentSongIndex") || 0;
volumeSlider.value = savedVolume;
audioPlayer.volume = savedVolume / 100;
currentSongIndex = parseInt(savedSongIndex);

loadSong(currentSongIndex);

function loadSong(index) {
  const song = playlist[index];
  audioPlayer.src = song.file;
  audioPlayer.load();
  songTitle.textContent = song.title;
  artistName.textContent = song.artist;
  localStorage.setItem("currentSongIndex", index);
}

async function playSong() {
  try {
    await audioPlayer.play();
    playBtn.textContent = "⏸";
  } catch (err) {
    showError("Failed to play music. Check file path.");
  }
}

function pauseSong() {
  audioPlayer.pause();
  playBtn.textContent = "▶";
}

function nextSong() {
  currentSongIndex = (currentSongIndex + 1) % playlist.length;
  loadSong(currentSongIndex);
  playSong();
}

function prevSong() {
  currentSongIndex = (currentSongIndex - 1 + playlist.length) % playlist.length;
  loadSong(currentSongIndex);
  playSong();
}

function formatTime(seconds) {
  if (isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

playBtn.addEventListener("click", () => {
  if (audioPlayer.paused) playSong();
  else pauseSong();
});

nextBtn.addEventListener("click", nextSong);
prevBtn.addEventListener("click", prevSong);

audioPlayer.addEventListener("timeupdate", () => {
  const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
  progressBar.value = progress;
  currentTimeSpan.textContent = formatTime(audioPlayer.currentTime);
});

audioPlayer.addEventListener("loadedmetadata", () => {
  durationTimeSpan.textContent = formatTime(audioPlayer.duration);
});

progressBar.addEventListener("change", () => {
  audioPlayer.currentTime = (progressBar.value / 100) * audioPlayer.duration;
});

volumeSlider.addEventListener("input", function () {
  audioPlayer.volume = volumeSlider.value / 100;
  localStorage.setItem("playerVolume", volumeSlider.value);
});

audioPlayer.addEventListener("ended", nextSong);

audioPlayer.addEventListener("error", () => {
  showError("Error loading audio. Please check the file path.");
});

// ===== INITIALIZE =====
loadWallpapers();
