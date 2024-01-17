// Socket Events
// Credits: VictimCrasher - https://github.com/VictimCrasher/static/tree/master/WaveTournament
const socket = new ReconnectingWebSocket("ws://" + location.host + "/ws")
socket.onopen = () => { console.log("Successfully Connected") }
socket.onclose = event => { console.log("Socket Closed Connection: ", event); socket.send("Client Closed!") }
socket.onerror = error => { console.log("Socket Error: ", error) }

// Load in maps
const nowPlayingMapSlide = document.getElementById("nowPlayingMapSlide")
let showcaseMaps
const getMaps = new Promise(async (resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", `http://127.0.0.1:24050/5WC2024/_data/showcaseBeatmaps.json`, false)
    xhr.onload = function xhrLoad()  {
        if (this.status == 404) return
        if (this.status == 200) showcaseMaps = JSON.parse(this.responseText)
    }
    xhr.send();
    resolve(showcaseMaps); 
})
getMaps.then(showcaseMaps => {
    for (let i = 0; i < showcaseMaps.length; i++) {
        const newMapTitle = document.createElement("div")
        const newSongName = showcaseMaps[i].songName.replace(/ /g, "_")
        const newSongDifficulty = showcaseMaps[i].difficulty.replace(/ /g, "_")
        newMapTitle.setAttribute("id", `${newSongName}_${newSongDifficulty}`)
        newMapTitle.innerText = showcaseMaps[i].modid.toUpperCase()
        
        if (i == 0) newMapTitle.classList.add("mapSlideCurrent")
        else if (i == 1) newMapTitle.classList.add("mapSlideRight")
        else newMapTitle.classList.add("mapSlideInvisibleRight")
        nowPlayingMapSlide.append(newMapTitle)
    }
})

socket.onmessage = (event) => {
    const data = JSON.parse(event.data)
    console.log(data)
}