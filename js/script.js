console.log('Lets write JavaScript');

let currentSong = new Audio();
let songs;
let currFolder;
let play = document.getElementById("play");
let previous = document.getElementById("previous");
let next = document.getElementById("next");

// Set initial play button image
play.src = "img/play.svg";

async function getSongs(folder) {
    currFolder = folder;
    let response = await fetch(`http://127.0.0.1:3000/${folder}/`);
    let html = await response.text();

    let div = document.createElement("div");
    div.innerHTML = html;
    let as = div.getElementsByTagName("a");
    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(decodeURIComponent(element.href.split(`/${currFolder}/`)[1]));
        }
    }

    // Show all the songs in the playlist
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
    songUL.innerHTML = "";
    for (const song of songs) {
        songUL.innerHTML += `<li>
             <img class="invert" src="img/music.svg" alt="">
             <div class="info">
                 <div>${song.replaceAll("20%", " ")}</div>
                 <div>Artist</div>
             </div>
             <div class="playnow">
                 <span>Play Now</span>
                 <img class="invert" src="img/play.svg" alt="">
             </div>
         </li>`;
    }

    // Attach event listener to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", () => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
        });
    });
    return songs
}

const secondsToMinutesSeconds = (seconds) => {
    let min = Math.floor(seconds / 60);
    let sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
};

const playMusic = (track, pause = false) => {
    currentSong.src = `http://127.0.0.1:3000/${currFolder}/` + track;
    if (!pause) {
        currentSong.play();
        play.src = "img/pause.svg";
    } else {
        play.src = "img/play.svg";
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};

async function displayAlbums() {
    let response = await fetch(`http://127.0.0.1:3000/songs/`);
    let html = await response.text();
    let div = document.createElement("div");
    div.innerHTML = html;
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];


        if (e.href.includes("/songs/")) {
            let folder = e.href.split("/").slice(-2)[0]
            //get the metadata of the folder
            let response = await fetch(`/songs/${folder}/info.json`)
            let html = await response.json();
            console.log(html)

            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
            <div class="play">
                <svg width="50" height="50" viewBox="0 0 50 50" fill="none"
                    xmlns="http://www.w3.org/2000/svg">

                    <path d="M20 15L20 35L35 25L20 15Z" fill="#000" stroke="#141B34" stroke-width="1.5"
                        stroke-linejoin="round" />
                </svg>
            </div>

            <img src="/songs/${folder}/cover.jpg" alt="">
            <h2>${html.title}</h2>
            <p>${html.description}</p>
        </div>`
        }
    }

    // Load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async (item) => {
            try {
                let folder = item.currentTarget.dataset.folder;
                if (folder) {
                    await getSongs(`songs/${folder}`);
                } else {
                    console.error("Folder data attribute is missing.");
                }
            } catch (error) {
                console.error("Error loading songs:", error);
            }
            playMusic(songs[0])
        });
    });
}


async function main() {
    // Get the list of all the songs
    await getSongs("songs/ncs");
    playMusic(songs[0], true);

    //Display all the albums on the page
    displayAlbums()

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
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    // Add an event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = (currentSong.duration * percent) / 100;
    });

    // Add event listener for hamburger menu
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    // Add event listener for close button
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    });

    // Add event listener to the Previous button
    previous.addEventListener("click", () => {
        if (currentSong.src) {
            let currentTrack = decodeURIComponent(currentSong.src.split("/").pop());
            let index = songs.indexOf(currentTrack);
            if (index > 0) {
                playMusic(songs[index - 1]);
            } else {
                console.log("No previous song available");
            }
        } else {
            console.error("currentSong.src is not set");
        }
    });

    // Add event listener to the Next button
    next.addEventListener("click", () => {
        if (currentSong.src) {
            let currentTrack = decodeURIComponent(currentSong.src.split("/").pop());
            let index = songs.indexOf(currentTrack);
            if (index < songs.length - 1) {
                playMusic(songs[index + 1]);
            } else {
                console.log("No next song available");
            }
        } else {
            console.error("currentSong.src is not set");
        }
    });

    // Add event listener to volume control
    document.querySelector(".range input").addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100;
        if (currentSong.volume > 0) {
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("img/mute.svg", "img/volume.svg")
        }
    });

    // Add event listener to mute the track
    document.querySelector(".volume>img").addEventListener("click", e => {
        if (e.target.src.includes("img/volume.svg")) {
            e.target.src = e.target.src.replace("img/volume.svg", "img/mute.svg")
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else {
            e.target.src = e.target.src.replace("img/mute.svg", "img/volume.svg")
            currentSong.volume = .10;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }
    })


}

// Start the application
main();
