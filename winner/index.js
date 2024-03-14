// Socket Events
// Credits: VictimCrasher - https://github.com/VictimCrasher/static/tree/master/WaveTournament
const socket = new ReconnectingWebSocket("ws://" + location.host + "/ws")
socket.onopen = () => { console.log("Successfully Connected") }
socket.onclose = event => { console.log("Socket Closed Connection: ", event); socket.send("Client Closed!") }
socket.onerror = error => { console.log("Socket Error: ", error) }

// Load country data
let allCountries
fetch("http://127.0.0.1:24050/5WC2024/_data/countries.json")
    .then(response => {
        if (!response.ok) throw new Error('Network response was not ok')
        return response.json()
    })
    .then(data => allCountries = data)
    .catch(error => console.error('Error:', error) )

// Load player data
let allPlayers
fetch("http://127.0.0.1:24050/5WC2024/_data/players.json")
    .then(response => {
        if (!response.ok) throw new Error('Network response was not ok')
        return response.json()
    })
    .then(data => allPlayers = data)
    .catch(error => console.error('Error:', error) )


// Now playing
const nowPlayingImage = document.getElementById("nowPlayingImage")
const nowPlayingSongName = document.getElementById("nowPlayingSongName")
const nowPlayingArtistName = document.getElementById("nowPlayingArtistName")
let currentNowPlayingMd5
let currentNowPlayingSongName

function addRemoveTextSlide(element) {
    if (element.getBoundingClientRect().width > 600) {
        element.classList.add("textSlide")
        return
    }
    element.classList.remove("textSlide")
}

socket.onmessage = event => {
    const data = JSON.parse(event.data)
    
    if (currentNowPlayingSongName !== data.menu.bm.metadata.title || currentNowPlayingMd5 !== data.menu.bm.md5) {
        currentNowPlayingSongName = data.menu.bm.metadata.title
        currentNowPlayingMd5 = data.menu.bm.md5

        // set now playing image
        nowPlayingImage.style.backgroundImage = `url("https://assets.ppy.sh/beatmaps/${data.menu.bm.set}/covers/cover.jpg")`

        // Set song and artist name
        nowPlayingSongName.innerText = currentNowPlayingSongName
        nowPlayingArtistName.innerText = data.menu.bm.metadata.artist

        addRemoveTextSlide(nowPlayingSongName)
        addRemoveTextSlide(nowPlayingArtistName)
    }
}

// Get Cookie
function getCookie(cname) {
    let name = cname + "="
    let ca = document.cookie.split(';')
    for(let i = 0; i < ca.length; i++) {
        let c = ca[i]
        while (c.charAt(0) == ' ') c = c.substring(1)
        if (c.indexOf(name) == 0) return c.substring(name.length, c.length)
    }
    return ""
}

// Set winner information
const countryFlagImage = document.getElementById("countryFlagImage")
const countryNameFirstLetter = document.getElementById("countryNameFirstLetter")
const countryNameRest = document.getElementById("countryNameRest")
let currentCountryCode

// Round information
const roundName = document.getElementById("roundName")
const playerNames = document.getElementById("playerNames")
setInterval(() => {

    // Set new country
    let newCountryCode = getCookie("currentWinner")
    if (newCountryCode !== "none" && currentCountryCode !== newCountryCode && allCountries && allPlayers) {
        currentCountryCode = newCountryCode

        // Set country flag
        countryFlagImage.style.backgroundImage = `url("https://osuflags.omkserver.nl/${newCountryCode}-1000.png")`

        // Set country name
        for (let i = 0; i < allCountries.length; i++) {
            if (allCountries[i].code === currentCountryCode) {
                countryNameFirstLetter.innerText = allCountries[i].name[0]
                countryNameRest.innerText = allCountries[i].name.substring(1)
                break
            }
        }

        // Reset country players
        for (let i = 0; i < playerNames.childElementCount; i++) {
            playerNames.children[i].innerText = ""
        }

        // Set country players
        let playerCounter = 0
        for (let i = 0; i < allPlayers.length; i++) {
            if (allPlayers[i].osu_flag !== currentCountryCode) continue
            for (let j = 0; j < allPlayers[i].players.length; j++) {
                playerCounter++
                document.getElementById(`playerName${playerCounter}`).innerText = allPlayers[i].players[j]
                if (playerCounter >= 8) break
            }
            if (playerCounter >= 8) break
        }
    }

    // set current round
    let newRound = getCookie("currentRound")
    if (roundName.innerText !== newRound) roundName.innerText = newRound

}, 500)