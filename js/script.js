console.log("Let's write JavaScript");

let currentSong = new Audio();
let songs = [];
let currFolder = "";
let play = document.getElementById("play");
let previous = document.getElementById("previous");
let next = document.getElementById("next");

// Set initial play button image
play.src = "img/play.svg";

// Define folder names
const folderNames = [
  "Angry_(mood)",
  "Bright_(mood)",
  "Chill_(mood)",
  "Dark_(mood)",
  "Funky_(mood)",
  "Love_(mood)",
  "Uplifting_(mood)",
  "Arjit singh",
  "Diljit",
];

// Manually define songs for now
const songsByFolder = {
  "Angry_(mood)": ["angry-hard-epic-piano-music.mp3", "angry-robot-iii.mp3"],
  "Bright_(mood)": ["bright-business.mp3"],
  "Love_(mood)": ["song1.mp3", "song2.mp3"],
  // Add other folders here similarly
};

async function getSongs(folder) {
  try {
    currFolder = folder;

    // Use predefined list
    let songList = songsByFolder[folder] || [];
    songs = songList.map((song) => `songs/${folder}/${song}`);

    // Display all the songs in the playlist
    let songUL = document.querySelector(".songList ul");
    songUL.innerHTML = "";
    for (const song of songs) {
      const songName = song.split("/").pop().replaceAll("%20", " "); // Remove folder path and replace encoding
      songUL.innerHTML += `<li>
           <img class="invert" src="img/music.svg" alt="">
           <div class="info">
               <div>${songName}</div>
               <div>${folder}</div>
           </div>
           <div class="playnow">
               <span>Play Now</span>
               <img class="invert" src="img/play.svg" alt="">
           </div>
       </li>`;
    }

    // Attach event listener to each song
    Array.from(songUL.getElementsByTagName("li")).forEach((e, index) => {
      e.addEventListener("click", () => {
        playMusic(songs[index]);
      });
    });

    return songs;
  } catch (error) {
    console.error("Error loading songs:", error);
  }
}

const secondsToMinutesSeconds = (seconds) => {
  let min = Math.floor(seconds / 60);
  let sec = Math.floor(seconds % 60);
  return `${min}:${sec < 10 ? "0" : ""}${sec}`;
};

const playMusic = (track, pause = false) => {
  currentSong.src = track;
  if (!pause) {
    currentSong.play();
    play.src = "img/pause.svg";
  } else {
    play.src = "img/play.svg";
  }
  document.querySelector(".songinfo").innerHTML = decodeURI(track.split("/").pop());
  document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};

async function main() {
  try {
    // Example: Load songs from the "Angry_(mood)" folder by default
    await getSongs("Angry_(mood)");
    playMusic(songs[0], true);

    // Attach event listener to play button
    play.addEventListener("click", () => {
      if (currentSong.paused) {
        currentSong.play();
        play.src = "img/pause.svg";
      } else {
        currentSong.pause();
        play.src = "img/play.svg";
      }
    });

    // Listen for timeupdate event
    currentSong.addEventListener("timeupdate", () => {
      document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(
        currentSong.currentTime
      )} / ${secondsToMinutesSeconds(currentSong.duration)}`;
      document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    // Add event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", (e) => {
      let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
      document.querySelector(".circle").style.left = percent + "%";
      currentSong.currentTime = (currentSong.duration * percent) / 100;
    });

    // Add event listener to the Previous button
    previous.addEventListener("click", () => {
      let index = songs.indexOf(currentSong.src);
      if (index > 0) {
        playMusic(songs[index - 1]);
      }
    });

    // Add event listener to the Next button
    next.addEventListener("click", () => {
      let index = songs.indexOf(currentSong.src);
      if (index < songs.length - 1) {
        playMusic(songs[index + 1]);
      }
    });

    // Add volume control functionality
    document.querySelector(".range input").addEventListener("change", (e) => {
      currentSong.volume = parseInt(e.target.value) / 100;
      if (currentSong.volume > 0) {
        document.querySelector(".volume>img").src = "img/volume.svg";
      }
    });

    // Add mute/unmute functionality
    document.querySelector(".volume>img").addEventListener("click", (e) => {
      if (e.target.src.includes("volume.svg")) {
        e.target.src = "img/mute.svg";
        currentSong.volume = 0;
        document.querySelector(".range input").value = 0;
      } else {
        e.target.src = "img/volume.svg";
        currentSong.volume = 0.5;
        document.querySelector(".range input").value = 50;
      }
    });
  } catch (error) {
    console.error("Error initializing application:", error);
  }
}

// Start the application
main();
