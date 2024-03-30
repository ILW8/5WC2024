// Twitch Chat
ComfyJS.Init( "stagetournaments", null , ["stagetournaments", "stagetournaments2"] )

// Round Name
const roundNameEl = document.getElementById("roundName")

// Socket Events
// Credits: VictimCrasher - https://github.com/VictimCrasher/static/tree/master/WaveTournament
const socket = new ReconnectingWebSocket("ws://" + location.host + "/ws")
socket.onopen = () => { console.log("Successfully Connected") }
socket.onclose = event => { console.log("Socket Closed Connection: ", event); socket.send("Client Closed!") }
socket.onerror = error => { console.log("Socket Error: ", error) }

// Load mappool
let mapData
let beatmapsData

fetch("http://127.0.0.1:24050/5WC2024/_data/beatmaps.json")
    .then(response => {
        if (!response.ok) throw new Error(`Failed to fetch beatmaps data: ${response.status}`)
        return response.json()
    })
    .then(data => {
        mapData = data
        document.cookie = `currentRound=${mapData.roundName}; path=/`
        beatmapsData = mapData.beatmaps
    })

// Find map from mappool
function findMapInMappool(beatmapID) {
    for (let i = 0; i < beatmapsData.length; i++) {
        if (beatmapID == beatmapsData[i].beatmapID) return beatmapsData[i]
    }
    return
}

// Now Playing
const nowPlaying = document.getElementById("nowPlaying")
const nowPlayingMod = document.getElementById("nowPlayingMod")
const nowPlayingSongName = document.getElementById("nowPlayingSongName")
const nowPlayingArtistName = document.getElementById("nowPlayingArtistName")
const nowPlayingStatsSRNumber = document.getElementById("nowPlayingStatsSRNumber")
const nowPlayingStatsARNumber = document.getElementById("nowPlayingStatsARNumber")
const nowPlayingStatsODNumber = document.getElementById("nowPlayingStatsODNumber")
const nowPlayingStatsCSNumber = document.getElementById("nowPlayingStatsCSNumber")
const nowPlayingStatsBPMNumber = document.getElementById("nowPlayingStatsBPMNumber")
let currentSR, currentAR, currentOD, currentCS, currentBPM
let mapTitle, mapMd5
let mappoolMapDataFound
let triggerStatShowingFunction = false

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
let currentRedTeamCode, currentBlueTeamCode

// Team Stars
const redTeamStarsEl = document.getElementById("redTeamStars")
const teamMiddleStarLeftEl = document.getElementById("teamMiddleStarLeft")
const blueTeamStarsEl = document.getElementById("blueTeamStars")
const teamMiddleStarRightEl = document.getElementById("teamMiddleStarRight")
let currentBestOf = 0
let currentFirstTo = 0
let currentRedStars = 0
let currentBlueStars = 0

// Map Changes
let beatmapID

// Chat 
const chatContainer = document.getElementById("chatContainer")
const tournamentChatContainer = document.getElementById("tournamentChatContainer")
let chatLen

// Scores
let scoreVisible
const playingScores = document.getElementById("playingScores")
const playingScoreRed = document.getElementById("playingScoreRed")
const playingScoreBlue = document.getElementById("playingScoreBlue")
const playingScoreDifference = document.getElementById("playingScoreDifference")
let currentRedScore = 0
let currentBlueScore = 0
let currentScoreDifference = 0
let scoreAnimation = {
    playingScoreRed: new CountUp(playingScoreRed, 0, 0, 0, 0.2, { useEasing: true, useGrouping: true, separator: ",", decimal: "." }),
    playingScoreBlue: new CountUp(playingScoreBlue, 0, 0, 0, 0.2, { useEasing: true, useGrouping: true, separator: ",", decimal: "." }),
    playingScoreDifference: new CountUp(playingScoreDifference, 0, 0, 0, 0.2, { useEasing: true, useGrouping: true, separator: ",", decimal: "." })
}

// Moving score bars
const movingScoreBarRed = document.getElementById("movingScoreBarRed")
const movingScoreBarBlue = document.getElementById("movingScoreBarBlue")
const movingScoreBarRedRectangle = document.getElementById("movingScoreBarRedRectangle")
const movingScoreBarBlueRectangle = document.getElementById("movingScoreBarBlueRectangle")
const movingScoreBarRedArrow = document.getElementById("movingScoreBarRedArrow")
const movingScoreBarBlueArrow = document.getElementById("movingScoreBarBlueArrow")

// Main Red Colours 
const mainRedRed = 254
const mainRedGreen = 36
const mainRedBlue = 86
// Main Blue Colours
const mainBlueRed = 36
const mainBlueGreen = 196
const mainBlueBlue = 254
// Main Red Colours Inverse
const mainRedRedInverse = 255 - mainRedRed
const mainRedGreenInverse = 255 - mainRedGreen
const mainRedBlueInverse = 255 - mainRedBlue
// Main Blue Colours Inverse
const mainBlueRedInverse = 255 - mainBlueRed
const mainBlueGreenInverse = 255 - mainBlueGreen
const mainBlueBlueInverse = 255 - mainBlueBlue

// Picked By
const pickedBy = document.getElementById("pickedBy")
const pickedByText = document.getElementById("pickedByText")
const pickedByFlag = document.getElementById("pickedByFlag")

// Setting current picker
const currentPickerRed = document.getElementById("currentPickerRed")
const currentPickerBlue = document.getElementById("currentPickerBlue")
setCurrentPicker("none")


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
                if (currentTeam == currentRedTeam) currentRedTeamCode = allCountries[i].code
                else if (currentTeam == currentBlueTeam) currentBlueTeamCode = allCountries[i].code
                teamFlagEl.style.backgroundImage = `url("https://osuflags.omkserver.nl/${allCountries[i].code}-237.png")`
                break
            }
        }
    }
    // Update red and blue teams
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

		// Set star information
        currentBestOf = data.tourney.manager.bestOF
        currentFirstTo = Math.ceil(currentBestOf / 2)
        currentRedStars = data.tourney.manager.stars.left
        currentBlueStars = data.tourney.manager.stars.right

        // Middle elements
        teamMiddleStarLeftEl.innerText = currentRedStars
        teamMiddleStarRightEl.innerText = currentBlueStars
        redTeamStarsEl.innerHTML = ""

        // Create star images
        function createStarImages(starElement, start, end, leftStarSrc, rightStarSrc) {
            starElement.innerHTML = ""
            for (let i = 0; i < end; i++) {
                const starImage = document.createElement("img");
                starImage.setAttribute("src", `static/${i < start ? leftStarSrc : rightStarSrc}`);
                starElement.append(starImage)
            }
        }
        createStarImages(redTeamStarsEl, currentRedStars, currentFirstTo, "red_star.png", "white_star.png")
        createStarImages(blueTeamStarsEl, currentFirstTo - currentBlueStars, currentFirstTo, "white_star.png", "blue_star.png")

        // Set winner information
        if (currentRedStars == currentFirstTo) {
            document.cookie = `currentWinner=${currentRedTeamCode}; path=/`
        } else if (currentBlueStars == currentFirstTo) {
            document.cookie = `currentWinner=${currentBlueTeamCode}; path=/`
        } else {
            document.cookie = `currentWinner=none; path=/`
        }
    }

    // Score visibility
    if (scoreVisible !== data.tourney.manager.bools.scoreVisible) {
        scoreVisible = data.tourney.manager.bools.scoreVisible

        if (scoreVisible) {
            chatContainer.style.width = "910px"
            chatContainer.style.left = "0px"
            twitchChatContainer.style.opacity = 1
            tournamentChatContainer.style.opacity = 0

            playingScores.style.opacity = 1
            movingScoreBarRed.style.opacity = 1
            movingScoreBarBlue.style.opacity = 1
        } else {
            chatContainer.style.width = "1220px"
            chatContainer.style.left = "300px"
            twitchChatContainer.style.opacity = 0
            tournamentChatContainer.style.opacity = 1

            playingScores.style.opacity = 0
            movingScoreBarRed.style.opacity = 0
            movingScoreBarBlue.style.opacity = 0
        }
    }

    if (scoreVisible) {
        // All things related to scores
        currentRedScore = 0
        currentBlueScore = 0
        currentScoreDifference = 0

        // Set scores
        for (let i = 0; i < data.tourney.ipcClients.length; i++) {
            const client = data.tourney.ipcClients[i]
            const scoreMultiplier = client.gameplay.mods.str.includes("EZ") ? 1.75 : 1
            const score = client.gameplay.score * scoreMultiplier
        
            if (i < data.tourney.ipcClients.length / 2) currentRedScore += score
            else currentBlueScore += score
        }
        currentScoreDifference = Math.abs(currentRedScore - currentBlueScore)

        // Update scores
        scoreAnimation.playingScoreRed.update(currentRedScore)
        scoreAnimation.playingScoreBlue.update(currentBlueScore)
        scoreAnimation.playingScoreDifference.update(currentScoreDifference)

        // Update score bar and difference
        const movingScoreBarDifferencePercent = Math.min(currentScoreDifference / 1000000, 1)
        let movingScoreBarRectangleWidth = Math.min(Math.pow(movingScoreBarDifferencePercent, 0.5) * 0.8 * 936, 936)
        const movingScoreBarArrowPositionHorizontal = movingScoreBarRectangleWidth + 31

        let scoreBarColour
        if (currentRedScore > currentBlueScore) {
            // Moving score bar
            movingScoreBarRed.style.display = "block"
            movingScoreBarBlue.style.display = "none"

            movingScoreBarRedArrow.style.right = `${movingScoreBarArrowPositionHorizontal}px`
            movingScoreBarRedRectangle.style.width = `${movingScoreBarRectangleWidth}px`

            scoreBarColour = [
                255 - Math.round(movingScoreBarDifferencePercent * mainRedRedInverse),
                255 - Math.round(movingScoreBarDifferencePercent * mainRedGreenInverse),
                255 - Math.round(movingScoreBarDifferencePercent * mainRedBlueInverse)
            ]
        } else if (currentRedScore == currentBlueScore) {
            // Moving score bar
            movingScoreBarRed.style.display = "none"
            movingScoreBarBlue.style.display = "none"
            scoreBarColour = [255,255,255]
        } else if (currentRedScore < currentBlueScore) {
            // Moving score bar
            movingScoreBarRed.style.display = "none"
            movingScoreBarBlue.style.display = "block"

            movingScoreBarBlueArrow.style.left = `${movingScoreBarArrowPositionHorizontal}px`
            movingScoreBarBlueRectangle.style.width = `${movingScoreBarRectangleWidth}px`
            scoreBarColour = [
                255 - Math.round(movingScoreBarDifferencePercent * mainBlueRedInverse),
                255 - Math.round(movingScoreBarDifferencePercent * mainBlueGreenInverse),
                255 - Math.round(movingScoreBarDifferencePercent * mainBlueBlueInverse)
            ]
        }

        playingScoreDifference.style.color = `rgb(${scoreBarColour.join(', ')})`
    } else {
        // Chat Stuff
        // This is also mostly taken from Victim Crasher: https://github.com/VictimCrasher/static/tree/master/WaveTournament
        if (chatLen !== data.tourney.manager.chat.length) {
            (chatLen === 0 || chatLen > data.tourney.manager.chat.length) ? (tournamentChatContainer.innerHTML = "", chatLen = 0) : null;
            const fragment = document.createDocumentFragment()
    
            for (let i = chatLen; i < data.tourney.manager.chat.length; i++) {
                const chatColour = data.tourney.manager.chat[i].team
    
                // Chat message container
                const chatMessageContainer = document.createElement("div")
                chatMessageContainer.classList.add("chatMessageContainer")
    
                // Time
                const chatDisplayTime = document.createElement("div")
                chatDisplayTime.classList.add("chatDisplayTime")
                chatDisplayTime.innerText = data.tourney.manager.chat[i].time
    
                // Whole Message
                const chatDisplayWholeMessage = document.createElement("div")
                chatDisplayWholeMessage.classList.add("chatDisplayWholeMessage")  
                
                // Name
                const chatDisplayName = document.createElement("span")
                chatDisplayName.classList.add("chatDisplayName", chatColour)
                chatDisplayName.innerText = data.tourney.manager.chat[i].name + ": "
    
                // Message
                const chatDisplayMessage = document.createElement("span")
                chatDisplayMessage.classList.add("chatDisplayMessage")
                chatDisplayMessage.innerText = data.tourney.manager.chat[i].messageBody
    
                chatDisplayWholeMessage.append(chatDisplayName, chatDisplayMessage)
                chatMessageContainer.append(chatDisplayTime, chatDisplayWholeMessage)
                fragment.append(chatMessageContainer)
            }
    
            tournamentChatContainer.append(fragment)
            chatLen = data.tourney.manager.chat.length
            tournamentChatContainer.scrollTo({
                top: tournamentChatContainer.scrollHeight,
                behavior: 'smooth'
            })
        }
    }

    function addRemoveSlide(element, text) {
        element.innerText = text
        if (element.getBoundingClientRect().width > 700) element.classList.add("nowPlayingSongWrap")
        else element.classList.remove("nowPlayingSongWrap")
    }

    // Beatmap data
    if (mapTitle !== data.menu.bm.metadata.title || mapMd5 !== data.menu.bm.md5) {
        await sleep(500)
        mapTitle = data.menu.bm.metadata.title
        mapMd5 = data.menu.bm.md5

        nowPlaying.style.backgroundImage = `url("https://assets.ppy.sh/beatmaps/${data.menu.bm.set}/covers/cover.jpg")`
        addRemoveSlide(nowPlayingSongName, mapTitle)
        addRemoveSlide(nowPlayingArtistName, data.menu.bm.metadata.artist)

        mappoolMapDataFound = undefined
        statsTimeoutSet = false
        if (beatmapsData) mappoolMapData = findMapInMappool(data.menu.bm.id)
        if (mappoolMapData) {
            mappoolMapDataFound = true

            pickedBy.style.display = "block"
            nowPlayingMod.style.display = "block"
            nowPlayingMod.innerText = `${mappoolMapData.mod}${mappoolMapData.order}`

            currentSR = Math.round(parseFloat(mappoolMapData.difficultyrating) * 100) / 100
            currentAR = Math.round(parseFloat(mappoolMapData.ar) * 10 ) / 10
            currentOD = Math.round(parseFloat(mappoolMapData.od) * 10) / 10
            currentCS = Math.round(parseFloat(mappoolMapData.cs) * 10) / 10
            currentBPM = Math.round(parseFloat(mappoolMapData.bpm) * 10) / 10

            nowPlayingStatsSRNumber.innerText = currentSR
            nowPlayingStatsARNumber.innerText = currentAR
            nowPlayingStatsODNumber.innerText = currentOD
            nowPlayingStatsCSNumber.innerText = currentCS
            nowPlayingStatsBPMNumber.innerText = currentBPM

            // Check whether to display picked by
            if (mappoolMapData.mod == "TB") {
                pickedByText.innerText = "TIEBREAKER"
                pickedByText.style.right = "157px"
                pickedByFlag.style.display = "none"
                nowPlayingMod.innerText = mappoolMapData.mod
            }
            else {
                pickedByText.innerText = "PICKED BY"
                pickedByFlag.style.display = "block"
            }
        } 
        else {
            pickedBy.style.display = "none"
            nowPlayingMod.style.display = "none"
        }
    }

    // If map is not found
    if (!mappoolMapDataFound) {
        triggerStatShowingFunction
        if (currentSR !== data.menu.bm.stats.fullSR) {
            currentSR = data.menu.bm.stats.fullSR
            nowPlayingStatsSRNumber.innerText = currentSR
        }
        if (currentAR !== data.menu.bm.stats.AR) {
            currentAR = data.menu.bm.stats.AR
            nowPlayingStatsARNumber.innerText = currentAR
        }
        if (currentOD !== data.menu.bm.stats.OD) {
            currentOD = data.menu.bm.stats.OD
            nowPlayingStatsODNumber.innerText = currentOD
        }
        if (currentCS !== data.menu.bm.stats.CS) {
            currentCS = data.menu.bm.stats.CS
            nowPlayingStatsCSNumber.innerText = currentCS
        }
        if (currentBPM !== data.menu.bm.stats.BPM.common) {
            currentBPM = data.menu.bm.stats.BPM.common
            nowPlayingStatsBPMNumber.innerText = currentBPM
        }
    }
}

// register current channel text element for update
const currentChannelName = document.getElementById("currentChannelName")

// get cookie information
setInterval(() => {
    // set round name
    roundNameEl.innerText = getCookie("currentRound")

    // Set twitch channel
    setChannelId(getCookie("currentChannel"))

    // Set current picker
    setCurrentPicker(getCookie("currentTeamPick"))
}, 500)