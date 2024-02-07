// Round Name
const roundNameEl = document.getElementById("roundName")
setInterval(() => {
    roundNameEl.innerText = getCookie("currentRound")
}, 500)

// Get Cookie
function getCookie(cname) {
    let name = cname + "="
    let ca = document.cookie.split(';')
    for(let i = 0; i < ca.length; i++) {
        let c = ca[i]
        while (c.charAt(0) == ' ') c = c.substring(1)
        if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
    }
    return "";
}

// Socket Events
// Credits: VictimCrasher - https://github.com/VictimCrasher/static/tree/master/WaveTournament
const socket = new ReconnectingWebSocket("ws://" + location.host + "/ws")
socket.onopen = () => { console.log("Successfully Connected") }
socket.onclose = event => { console.log("Socket Closed Connection: ", event); socket.send("Client Closed!") }
socket.onerror = error => { console.log("Socket Error: ", error) }

// Load Mappool
let mapData
let beatmapsData
let modOrderData
let mapDataXhr = new XMLHttpRequest()
mapDataXhr.open("GET", "http://127.0.0.1:24050/5WC2024/_data/beatmaps.json", false)
mapDataXhr.onload = function () {
    if (this.status == 404) return
    if (this.status == 200) {
        mapData = JSON.parse(this.responseText)
        document.cookie = `currentRound=${mapData.roundName}; path=/`
        beatmapsData = mapData.beatmaps
        modOrderData = mapData.modOrder
    }
}
mapDataXhr.send()

// Set mappool
let allBeatmaps = []
for (let i = 0; i < modOrderData.length; i++) allBeatmaps[i] = beatmapsData.filter(map => map.mod == modOrderData[i])
for (let i = 0; i < allBeatmaps.length; i++) allBeatmaps[i].sort((map1, map2) => map1.order - map2.order)

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

// Score visibility
let scoreVisible

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
    }

    // Score visibility
    if (scoreVisible !== data.tourney.manager.bools.scoreVisible) {
        scoreVisible = data.tourney.manager.bools.scoreVisible

        if (scoreVisible) {
            chatContainer.style.width = "610px";
            twitchChatContainer.style.opacity = 1
            tournamentChatContainer.style.opacity = 0
        } else {
            chatContainer.style.width = "1220px";
            twitchChatContainer.style.opacity = 0
            tournamentChatContainer.style.opacity = 1
        }
    }

    // Chat Stuff
    // This is also mostly taken from Victim Crasher: https://github.com/VictimCrasher/static/tree/master/WaveTournament
    if (scoreVisible) {

    } else {
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
            chatLen = data.tourney.manager.chat.length;
            tournamentChatContainer.scrollTop = tournamentChatContainer.scrollHeight;
        }
    }
}

// Twitch Chat
const twitchChatContainer = document.getElementById("twitchChatContainer")
const badgeTypes = ["broadcaster", "mod", "vip", "founder", "subscriber"]
ComfyJS.onChat = ( user, message, flags, self, extra ) => {
    // Set up message container
    const twitchChatMessageContainer = document.createElement("div")
    twitchChatMessageContainer.classList.add("chatMessageContainer", "twitchChatMessageContainer")

    // Flags
    const flagIconsContainer = document.createElement("div")
    flagIconsContainer.classList.add("flagIconsContainer")

    // Individual flags
    badgeTypes.forEach(badgeType => {
        if (flags[badgeType]) {
            const flagImage = document.createElement("img")
            flagImage.classList.add("flagImage")
            flagImage.setAttribute("src", `../shared/static/twitch_badges/${badgeType}.png`)
            flagIconsContainer.append(flagImage)
        }
    })

    // Only append flagIconsContainer if it has child elements
    if (flagIconsContainer.childElementCount > 0) {
        twitchChatMessageContainer.append(flagIconsContainer)
    }

    // Message user
    const messageUser = document.createElement("div")
    messageUser.classList.add("messageDetail", "messageUser")
    messageUser.innerText = `${user}:`

    // Message
    const chatMessage = document.createElement("div")
    chatMessage.classList.add("messageDetail", "chatMessage")
    chatMessage.innerText = message

    // Append everything together
    twitchChatMessageContainer.append(messageUser, chatMessage)
    twitchChatContainer.append(twitchChatMessageContainer)
    twitchChatContainer.scrollTop = twitchChatContainer.scrollHeight
}
ComfyJS.Init("stagetournaments")