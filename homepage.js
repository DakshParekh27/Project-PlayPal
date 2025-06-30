   

let playlists = JSON.parse(localStorage.getItem('playlists')) || [];  //call playlists JSON string as an array of playlists from local storage  

const playlistContainer = document.getElementById('playlistContainer');

window.onload = function () {
    displayPlaylists();   //onload - display stored playlists as cards

};

    // grabbing card container and input form 
const createPlaylistBtn = document.getElementById('createPlaylistBtn');
const playlistForm = document.getElementById('playlistForm');
const daySelectionForm = document.getElementById('daySelectionForm'); 
const cancelBtn = document.querySelector('.cancelBtn');

createPlaylistBtn.addEventListener('click', () => {  //transistion of form-popup after click
    gsap.to(playlistForm, { duration: 0.5, opacity: 1, scale: 1 });
    playlistForm.style.display = 'block';   // display: none --> block
});

// "oncomplete fn" needed in cancel button to ensure display:none after GSAP animation ends
// in create button we dont need it as 1.display then 2.animation order

cancelBtn.addEventListener('click', () => {
    gsap.to(playlistForm, {
        duration: 0.3, opacity: 0, scale: 0.7, onComplete: () => {
            playlistForm.style.display = 'none';    //block --> none in form-popup
        }
    });
    document.getElementById('playlistLink').value = "";  //flushing input name and link after creation of css card
    document.getElementById('playlistName').value = "";
});

document.querySelector('.form-content').addEventListener('submit', async (e) => {  // queryselector selects class shared by two input - link and name IDs
   
    //async to wait for fetching playlist thumbnails for implementation.
    
    e.preventDefault();  //prevent page refresh after submission
    
    const link = document.getElementById('playlistLink').value;
    const name = document.getElementById('playlistName').value;
    const playlistId = extractPlaylistId(link);    //get playlist ID

    document.getElementById('playlistLink').value = "";  //flushing link and name after "create"
    document.getElementById('playlistName').value = "";

    if (!playlistId) {
        alert("Invalid YouTube playlist URL!");
        return;
    }

    const thumbnail = await fetchPlaylistThumbnail(playlistId);   //uses Youtube API to fetch thumbnail of 1st video as jpeg
    tempPlaylist = { name, link, image: thumbnail, days: [] }; // Store in temp variable..array with obj elements

    gsap.to(playlistForm, { // Hide form with animation
        duration: 0.3,
        opacity: 0,
        scale: 0.7,
        onComplete: () => {
            playlistForm.style.display = "none"; 
            showDaySelectionPopup(); // Open day selection popup
        },
    });
});

function showDaySelectionPopup() {
    gsap.to(daySelectionForm, { duration: 0.5, opacity: 1, scale: 1 });
    daySelectionForm.style.display = "block";
}

function closeDaySelectionPopup() {
    gsap.to(daySelectionForm, {
        duration: 0.3,
        opacity: 0,
        scale: 0.7,
        onComplete: () => {
            daySelectionForm.style.display = "none";
        },
    });
}

document.querySelectorAll(".day-btn").forEach((button) => {
    button.addEventListener("click", () => {
        button.classList.toggle("selected");
        button.style.backgroundColor = button.classList.contains("selected") ? "green" : "red";  //day button animation as selected
    });
});

document.getElementById("confirmDaysBtn").addEventListener("click", () => {
    let selectedDays = Array.from(document.querySelectorAll(".day-btn.selected")).map(btn => btn.dataset.day);

    if (selectedDays.length === 0) {
        alert("Please select at least one day.");
        return;
    }

    // Store selected days for the current playlist only
    let newPlaylist = { ...tempPlaylist, days: [...selectedDays] };
    playlists.push(newPlaylist);
    localStorage.setItem("playlists", JSON.stringify(playlists));  //stringified and stored in local storage

    // Close the day selection popup and refresh the playlist display
    closeDaySelectionPopup();
    displayPlaylists();

    // Flush selected days from UI buttons
    document.querySelectorAll(".day-btn").forEach((button) => {
        button.classList.remove("selected"); // Ensure selection is cleared
        button.style.backgroundColor = "red";  
    });

    // Reset tempPlaylist to avoid accidental reuse
    tempPlaylist = {};
});
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

        const studyDays = Array.isArray(playlist.days) ? playlist.days.join(", ") : "No study days set";

        card.innerHTML = `
            <img class="altThumb" onclick="goToPlaylistPage('${playlist.link}')" src="${playlist.image}" alt="Thumbnail">
            <div class="content">
                <p class="playlist-name">${playlist.name}</p>
                <p class="constText">Study Days: ${studyDays}</p> 
                <button onclick="confirmDelete(${index})">Delete</button>
            </div>
        `;
        playlistContainer.appendChild(card);
    });
}

//took help of internet to figure out how to URL --> ID for this function
    function extractPlaylistId(url) {
        const regex = /[?&]list=([a-zA-Z0-9_-]+)/;
        const match = url.match(regex);
        return match ? match[1] : null;
    }

//using YouTube Data API
    
    async function fetchPlaylistThumbnail(playlistId) {
        const API_KEY = "YOUR_API_KEY_HERE";  //our project's API key
        const apiUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=1&key=${API_KEY}`;

        try {
            const response = await fetch(apiUrl);
            const data = await response.json();
            return data.items[0]?.snippet?.thumbnails?.medium?.url || "https://via.placeholder.com/150";
        } catch (error) {
            console.error("Error fetching thumbnail:", error);
            return "https://via.placeholder.com/150";
        }
    }

    //each playlist with img == inputted playlist's first video thumbnail

    
    function goToPlaylistPage(link) {  //clicking the thumbnail, redirecting to "playlistvideos.html" ie page 2

        let playlistId = extractPlaylistId(link);

      if (playlistId) {
        // Redirect to playlistvideos.html with playlistId in the URL
        window.location.href = `playlistvideos.html?playlistId=${playlistId}`;
      } else {
        alert("Please enter a valid YouTube playlist URL!");
      }
    }

    //delete css card functions

    function confirmDelete(index) {
        deleteIndex = index;
        document.getElementById('confirmDialog').style.display = 'block';
        gsap.fromTo('#confirmDialog', { opacity: 0, scale: 0.7 }, { opacity: 1, scale: 1, duration: 0.3 });
    }

    function closeConfirmDialog() {
        gsap.to('#confirmDialog', {
            opacity: 0, scale: 0.7, duration: 0.3, onComplete: () => {
                document.getElementById('confirmDialog').style.display = 'none';
            }
        });
        deleteIndex = null;
    }

    function deleteConfirmed() {
        if (deleteIndex !== null) {
            playlists.splice(deleteIndex, 1);
            localStorage.setItem('playlists', JSON.stringify(playlists));
            displayPlaylists();
        }
        closeConfirmDialog();
    }

    // to execute search bar playlists will be filtered by name
    
function filterPlaylists() {
    const search = document.getElementById('searchBox').value.toLowerCase();
    const filteredPlaylists = playlists.filter(p => p.name.toLowerCase().includes(search));
    displayPlaylists(filteredPlaylists);
}

    document.addEventListener("DOMContentLoaded", function () {
        let playlists = JSON.parse(localStorage.getItem("playlists")) || [];
        displayPlaylists();
    });

    // Dark Mode Toggle, took help from internet how to toggle all elements
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
    const storageKey = 'theme-preference';

    const onClick = () => {
        theme.value = theme.value === 'light' ? 'dark' : 'light';
        setPreference();
    };

    const getColorPreference = () => {
        if (localStorage.getItem(storageKey))
            return localStorage.getItem(storageKey);
        else
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    };

    const setPreference = () => {
        localStorage.setItem(storageKey, theme.value);
        reflectPreference();
    };

    const reflectPreference = () => {
        document.firstElementChild.setAttribute('data-theme', theme.value);
        document.querySelector('#theme-toggle')?.setAttribute('aria-label', theme.value);
    };

    const theme = {
        value: getColorPreference(),
    };

    reflectPreference();

    window.onload = () => {
        reflectPreference();
        document.querySelector('#theme-toggle').addEventListener('click', onClick);
    };

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', ({ matches: isDark }) => {
        theme.value = isDark ? 'dark' : 'light';
        setPreference();
    });
