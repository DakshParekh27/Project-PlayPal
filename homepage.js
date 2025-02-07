let playlists = JSON.parse(localStorage.getItem("playlists")) || [];  //call playlists JSON string as an array of playlists from local storage  

window.onload = function () {
  displayPlaylists();
};         //onload - display stored playlists as cards


const playlistContainer = document.getElementById("playlistContainer");   //grab card container
const playlistForm = document.getElementById("playlistForm");    //grab input form to create playlist
const createPlaylistBtn = document.getElementById("createPlaylistBtn");   
const cancelBtn = document.querySelector(".cancelBtn");

createPlaylistBtn.addEventListener("click", () => {
  gsap.to(playlistForm, { duration: 0.5, opacity: 1, scale: 1 });  //transistion of form-popup after click
  playlistForm.style.display = "block";    // display: none --> block
});

// "oncomplete fn" needed in cancel button to ensure display:none after animation ends
// in create button we dont need it as 1.display then 2.animation order

cancelBtn.addEventListener("click", () => {
  gsap.to(playlistForm, {duration: 0.3, opacity: 0, scale: 0.7,
    onComplete: () => {
      playlistForm.style.display = "none";   //block --> none in form-popup
    },
  });
  document.getElementById("playlistLink").value = "";     //to flush
  document.getElementById("playlistName").value = "";     // earlier inputted name and link
});

document
  .querySelector(".form-content")  //selects class shared by two input - link and name IDs
  .addEventListener("submit", async (submit) => {  //async to wait for fetching playlist thumbnails for implim
    
    submit.preventDefault();  //dont refresh page after submit
    
    const link = document.getElementById("playlistLink").value;
    const name = document.getElementById("playlistName").value;
    const playlistId = extractPlaylistId(link);  //get playlist ID
    
    
    if (playlistId) {
        
        document.getElementById("playlistLink").value = "";  //flushing link and name after "create"
        document.getElementById("playlistName").value = "";
      
      const thumbnail = await fetchPlaylistThumbnail(playlistId);  //uses Youtube API to fetch thumbnail of 1st video as jpeg
      const newPlaylist = { name, link, image: thumbnail };  //array element as playlist object..for local storage
      playlists.push(newPlaylist);
      localStorage.setItem("playlists", JSON.stringify(playlists));  //stringified and stored
      displayPlaylists();  //update the UI

      playlistForm.style.display = "block"; //ensure GSAP animation to run on blocked form

      gsap.to(playlistForm, {
        duration: 0.5,
        opacity: 0,
        scale: 0.7,
        onComplete: () => {
          playlistForm.style.display = "none"; //block --> none in form-popup
        },
      });

    } else {
      alert("Invalid YouTube playlist URL!");
    }
  });

function extractPlaylistId(url) {
  const regex = /[?&]list=([a-zA-Z0-9_-]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

async function fetchPlaylistThumbnail(playlistId) {
  const API_KEY = "AIzaSyDEN8VXe2Bda0rD8h7P6H_AeuQjw5IPYs4";  //YouTube Data API key
  const apiUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=1&key=${API_KEY}`;  //internal working

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    return (
      data.items[0]?.snippet?.thumbnails?.medium?.url ||
      "https://via.placeholder.com/150"
    );
  } catch (error) {
    console.error("Error fetching thumbnail:", error);
    return "https://via.placeholder.com/150";
  }
}

function displayPlaylists(filteredPlaylists = playlists) {
  playlistContainer.innerHTML = ""; // Clear previous content

  if (filteredPlaylists.length === 0) {
    const noPlaylistsMessage = document.createElement("p");
    noPlaylistsMessage.classList.add("no-playlists-message");
    noPlaylistsMessage.textContent = "No Playlists Found!";
    playlistContainer.appendChild(noPlaylistsMessage);
    return;
  }

  filteredPlaylists.forEach((playlist, index) => {
    const card = document.createElement("div");
    card.classList.add("playlist-card");
    card.innerHTML = `
            <img class="altThumb" onclick="goToPlaylistPage('${playlist.link}')" src="${playlist.image}" alt="Thumbnail">
            <div class="content">
                <p class="playlist-name">${playlist.name}</p>
                <button onclick="confirmDelete(${index})">Delete</button>
            </div>
        `;
    playlistContainer.appendChild(card);
  });
}

function goToPlaylistPage(link) {
  let playlistId = extractPlaylistId(link);

  if (playlistId) {
    // Redirect to videos.html with playlistId in the URL
    window.location.href = `videos.html?playlistId=${playlistId}`;
  } else {
    alert("Please enter a valid YouTube playlist URL!");
  }
}

function confirmDelete(index) {
  deleteIndex = index;
  document.getElementById("confirmDialog").style.display = "block";
  gsap.fromTo(
    "#confirmDialog",
    { opacity: 0, scale: 0.7 },
    { opacity: 1, scale: 1, duration: 0.3 }
  );
}

function closeConfirmDialog() {
  gsap.to("#confirmDialog", {
    opacity: 0,
    scale: 0.7,
    duration: 0.3,
    onComplete: () => {
      document.getElementById("confirmDialog").style.display = "none";
    },
  });
  deleteIndex = null;
}

function deleteConfirmed() {
  if (deleteIndex !== null) {
    playlists.splice(deleteIndex, 1);
    localStorage.setItem("playlists", JSON.stringify(playlists));
    displayPlaylists();
  }
  closeConfirmDialog();
}
function filterPlaylists() {
  const search = document.getElementById("searchBox").value.toLowerCase();
  const filteredPlaylists = playlists.filter((p) =>
    p.name.toLowerCase().includes(search)
  );
  displayPlaylists(filteredPlaylists);
}

document.addEventListener("DOMContentLoaded", function () {
  let playlists = JSON.parse(localStorage.getItem("playlists")) || [];
  displayPlaylists();
});

// Dark Mode Toggle
const toggleButton = document.getElementById("darkModeToggle");

if (localStorage.getItem("darkMode") === "enabled") {
  document.body.classList.add("dark-mode");
  toggleButton.textContent = "☀️";
}

toggleButton.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");

  if (document.body.classList.contains("dark-mode")) {
    localStorage.setItem("darkMode", "enabled");
    toggleButton.textContent = "☀️";
  } else {
    localStorage.setItem("darkMode", "disabled");
    toggleButton.textContent = "🌙";
  }
});

// Theme Preference
const storageKey = "theme-preference";

const onClick = () => {
  theme.value = theme.value === "light" ? "dark" : "light";
  setPreference();
};

const getColorPreference = () => {
  if (localStorage.getItem(storageKey)) return localStorage.getItem(storageKey);
  else
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
};

const setPreference = () => {
  localStorage.setItem(storageKey, theme.value);
  reflectPreference();
};

const reflectPreference = () => {
  document.firstElementChild.setAttribute("data-theme", theme.value);
  document
    .querySelector("#theme-toggle")
    ?.setAttribute("aria-label", theme.value);
};

const theme = {
  value: getColorPreference(),
};

reflectPreference();

window.onload = () => {
  reflectPreference();
  document.querySelector("#theme-toggle").addEventListener("click", onClick);
};

window
  .matchMedia("(prefers-color-scheme: dark)")
  .addEventListener("change", ({ matches: isDark }) => {
    theme.value = isDark ? "dark" : "light";
    setPreference();
  });
