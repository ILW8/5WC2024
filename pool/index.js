// Socket Events
// Credits: VictimCrasher - https://github.com/VictimCrasher/static/tree/master/WaveTournament
const socket = new ReconnectingWebSocket("ws://" + location.host + "/ws")
socket.onopen = () => { console.log("Successfully Connected") }
socket.onclose = event => { console.log("Socket Closed Connection: ", event); socket.send("Client Closed!") }
socket.onerror = error => { console.log("Socket Error: ", error) }

// Load mappool data
let modOrder
let modOrderXhr = new XMLHttpRequest()
modOrderXhr.open("GET", "http://127.0.0.1:24050/5WC2024/_data/modOrder.json", false)
modOrderXhr.onload = function () {
    if (this.status == 404) return
    if (this.status == 200) modOrder = JSON.parse(this.responseText)
}
modOrderXhr.send()

let allMaps
let allMapsXhr = new XMLHttpRequest()
allMapsXhr.open("GET", "http://127.0.0.1:24050/5WC2024/_data/beatmaps.json", false)
allMapsXhr.onload = function () {
    if (this.status == 404) return
    if (this.status == 200) allMaps = JSON.parse(this.responseText)
}
allMapsXhr.send()

let allBeatmaps = []
for (let i = 0; i < modOrder.length; i++) allBeatmaps[i] = allMaps.filter(x => x.mod.toLowerCase() == modOrder[i].toLowerCase())
// sort maps by order
for (let i = 0; i < allBeatmaps.length; i++) allBeatmaps[i].sort((map1, map2) => map1.order - map2.order)

const FiveNMMapContainerEl = document.getElementById("FiveNMMapContainer")
const SixNMMapContainer1El = document.getElementById("SixNMMapContainer1")
const SixNMMapContainer2El = document.getElementById("SixNMMapContainer2")
const HDMapContainerEl = document.getElementById("HDMapContainer")
const HRMapContainerEl = document.getElementById("HRMapContainer")
const DTMapContainerEl = document.getElementById("DTMapContainer")
const FMMapContainerEl = document.getElementById("FMMapContainer")
const tbMapCardImageEl = document.getElementById("tbMapCardImage")
const tbMapCardNameEl = document.getElementById("tbMapCardName")
const tbMapCardDifficultyEl = document.getElementById("tbMapCardDifficulty")

const containers = [FiveNMMapContainerEl, SixNMMapContainer2El, HDMapContainerEl, HRMapContainerEl, DTMapContainerEl, FMMapContainerEl]

function createMapCard(currentMap, cardClass, nameClass, container) {
    const newMapCard = document.createElement("div")
    newMapCard.classList.add("mapCard", cardClass)

    const newMapCardRectangle = document.createElement("div")
    newMapCardRectangle.classList.add("mapCardRectangle")

    const mapCardImage = document.createElement("div")
    mapCardImage.classList.add("mapCardImage")
    mapCardImage.style.backgroundImage = `url("${currentMap.imgURL}")`

    const mapCardImageLayer = document.createElement("div")
    mapCardImageLayer.classList.add("mapCardLayer")
    mapCardImage.appendChild(mapCardImageLayer)

    const mapCardName = document.createElement("div")
    mapCardName.classList.add("mapCardName", nameClass)
    mapCardName.innerText = `${currentMap.artist} - ${currentMap.songName}`

    const mapCardDifficulty = document.createElement("div")
    mapCardDifficulty.classList.add("normalMapCardDifficulty")
    mapCardDifficulty.innerText = currentMap.difficultyname

    const mapCardMod = document.createElement("div")
    mapCardMod.classList.add("normalMapCardMod")
    mapCardMod.innerText = `${currentMap.mod.toUpperCase()}${currentMap.order}`
    mapCardMod.style.color = `var(--${currentMap.mod.toUpperCase()}Colour)`

    newMapCard.append(newMapCardRectangle, mapCardImage, mapCardName, mapCardDifficulty, mapCardMod)
    container.append(newMapCard)
}

allBeatmaps.forEach((maps, i) => {
    if (i === 0 && maps.length === 5) {
        maps.forEach(map => createMapCard(map, "nmExtendedMapCard", "nmExtendedMapCardName", FiveNMMapContainerEl))
    } else if (i === 0 && maps.length === 6) {
        const container1 = maps.slice(0, 3)
        const container2 = maps.slice(3)
        container1.forEach(map => createMapCard(map, "normalMapCard", "normalMapCardName", SixNMMapContainer1El))
        container2.forEach(map => createMapCard(map, "normalMapCard", "normalMapCardName", SixNMMapContainer2El))
    } else if (i === 1 || i === 2) {
        maps.forEach(map => createMapCard(map, "normalMapCard", "normalMapCardName", (i === 1)? HDMapContainerEl : HRMapContainerEl))
    } else if (i === 3) {
        maps.forEach(map => {
            createMapCard(map, (maps.length === 3)? "bottom3MapsMapCard" : "normalMapCard", (maps.length === 3)? "bottom3MapsMapCardName" : "normalMapCardName", DTMapContainerEl)
        })
    } else if (i === 4) {
        maps.forEach(map => createMapCard(map, (maps.length === 2) ? "fm2MapsMapCard" : "bottom3MapsMapCard", (maps.length === 2) ? "fm2MapsMapCardName" : "bottom3MapsMapCardName", FMMapContainerEl))
    } else if (i === 5) {
        maps.forEach(map => {
            tbMapCardImageEl.style.backgroundImage = `url("${map.imgURL}")`
            tbMapCardNameEl.innerText = `${map.artist} - ${map.songName}`
            tbMapCardDifficultyEl.innerText = map.difficultyname
        })
    }
})

// Load country data
let allCountries
let allCountriesXhr = new XMLHttpRequest()
allCountriesXhr.open("GET", "http://127.0.0.1:24050/5WC2024/_data/countries.json", false)
allCountriesXhr.onload = function () {
    if (this.status == 404) return
    if (this.status == 200) allCountries = JSON.parse(this.responseText)
}
allCountriesXhr.send()

// Team Data
const redTeamFlagEl = document.getElementById("redTeamFlag")
const redTeamNameEl = document.getElementById("redTeamName")
const blueTeamNameEl = document.getElementById("blueTeamName")
const blueTeamFlagEl = document.getElementById("blueTeamFlag")
let currentRedTeam, currentBlueTeam

// Team Stars
const redTeamStarsEl = document.getElementById("redTeamStars")
const teamMiddleStarLeftEl = document.getElementById("teamMiddleStarLeft")
const blueTeamStarsEl = document.getElementById("blueTeamStars")
const teamMiddleStarRightEl = document.getElementById("teamMiddleStarRight")
let currentBestOf = 0
let currentFirstTo = 0
let currentRedStars = 0
let currentBlueStars = 0

socket.onmessage = async (event) => {
    const data = JSON.parse(event.data)
    console.log(data)

    // Update team data
    function updateTeamData(teamFlagEl, teamNameEl, currentTeam) {
        teamNameEl.innerText = currentTeam
    
        // Check if team name is anything
        if (currentTeam === "") {
            teamFlagEl.style.display = "none"
            return
        }

        // Check for ISO country code
        
        for (let i = 0; i < allCountries.length; i++) {
            if (currentTeam.toLowerCase() === allCountries[i].name.toLowerCase()) {
                teamFlagEl.style.display = "block"
                teamFlagEl.style.backgroundImage = `url("https://osuflags.omkserver.nl/${allCountries[i].code}-181.png")`
                break
            }
        }
    }
    if (currentRedTeam !== data.tourney.manager.teamName.left) {
        currentRedTeam = data.tourney.manager.teamName.left
        updateTeamData(redTeamFlagEl, redTeamNameEl, currentRedTeam)
    }
    if (currentBlueTeam !== data.tourney.manager.teamName.right) {
        currentBlueTeam = data.tourney.manager.teamName.right
        updateTeamData(blueTeamFlagEl, blueTeamNameEl, currentBlueTeam)
    }

    // Update star information
    if (currentBestOf !== data.tourney.manager.bestOF ||
        currentRedStars !== data.tourney.manager.stars.left ||
        currentBlueStars !== data.tourney.manager.stars.right) {

            currentBestOf = data.tourney.manager.bestOF
            currentFirstTo = Math.ceil(currentBestOf / 2)
            currentRedStars = data.tourney.manager.stars.left
            currentBlueStars = data.tourney.manager.stars.right

            // Middle elements
            teamMiddleStarLeftEl.innerText = currentRedStars
            teamMiddleStarRightEl.innerText = currentBlueStars

            redTeamStarsEl.innerHTML = ""
            let i
            for (i = 0; i < currentRedStars; i++) {
                const starImage = document.createElement("img")
                starImage.setAttribute("src", "static/red_star.png")
                redTeamStarsEl.append(starImage)
            }
            for (i; i < currentFirstTo; i++) {
                const starImage = document.createElement("img")
                starImage.setAttribute("src", "static/white_star.png")
                redTeamStarsEl.append(starImage)
            }

            blueTeamStarsEl.innerHTML = ""
            for (i = 0; i < currentFirstTo - currentBlueStars; i++) {
                const starImage = document.createElement("img")
                starImage.setAttribute("src", "static/white_star.png")
                blueTeamStarsEl.append(starImage)
            }
            for (i; i < currentFirstTo; i++) {
                const starImage = document.createElement("img")
                starImage.setAttribute("src", "static/blue_star.png")
                blueTeamStarsEl.append(starImage)
            }
    }
}

// Sponsor animations
const sleep = ms => new Promise(res => setTimeout(res, ms))
const sponsors = document.getElementById("sponsors")
let currentSponsorIndex = 0
let intervalId
function startInterval() {
    if (intervalId) clearInterval(intervalId)
  
    intervalId = setInterval(async () => {
        if (sponsors.childElementCount <= currentSponsorIndex) currentSponsorIndex = 0
        const currentSponsor = sponsors.children[currentSponsorIndex]
        currentSponsor.style.opacity = 1
        await sleep(5000)
        currentSponsor.style.opacity = 0
        await sleep(1000)
        currentSponsorIndex++
    }, 6000)
}
startInterval();
setInterval(function() {
    startInterval()
}, 120000)