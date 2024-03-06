// Socket Events
// Credits: VictimCrasher - https://github.com/VictimCrasher/static/tree/master/WaveTournament
const socket = new ReconnectingWebSocket("ws://" + location.host + "/ws")
socket.onopen = () => { console.log("Successfully Connected") }
socket.onclose = event => { console.log("Socket Closed Connection: ", event); socket.send("Client Closed!") }
socket.onerror = error => { console.log("Socket Error: ", error) }

// Load mappool
let mapData
let beatmapsData
let modOrderData
let allBeatmaps = []
fetch("http://127.0.0.1:24050/5WC2024/_data/beatmaps.json")
    .then(response => {
        if (!response.ok) throw new Error(`Failed to fetch beatmaps data: ${response.status}`)
        return response.json()
    })
    .then(data => {
        // Extract data
        const { roundName, beatmaps: beatmapsData, modOrder: modOrderData } = data

        // Set cookie
        document.cookie = `currentRound=${roundName}; path=/`

        // Sort by mod, then by order
        const allBeatmaps = modOrderData.map(mod => beatmapsData.filter(map => map.mod === mod).sort((map1, map2) => map1.order - map2.order))

        // Create map cards
        allBeatmaps.forEach((maps, i) => {
            if (i === 0 && maps.length === 5) {
                // 5 Map NM
                maps.forEach(map => createMapCard(map, "nmExtendedMapCard", "nmExtendedMapCardName", FiveNMMapContainerEl))
            } else if (i === 0 && maps.length === 6) {
                // 6 Map NM
                const [container1, container2] = [maps.slice(0, 3), maps.slice(3)]
                container1.forEach(map => createMapCard(map, "normalMapCard", "normalMapCardName", SixNMMapContainer1El))
                container2.forEach(map => createMapCard(map, "normalMapCard", "normalMapCardName", SixNMMapContainer2El))
            } else if (i === 1 || i === 2) {
                // HD / HR
                maps.forEach(map => createMapCard(map, "normalMapCard", "normalMapCardName", i === 1? HDMapContainerEl : HRMapContainerEl))
            } else if (i === 3) {
                // DT
                maps.forEach(map => {
                    createMapCard(map, maps.length === 3? "bottom3MapsMapCard" : "normalMapCard", maps.length === 3? "bottom3MapsMapCardName" : "normalMapCardName", DTMapContainerEl)
                })
            } else if (i === 4) {
                // FM
                maps.forEach(map => createMapCard(map, maps.length === 2 ? "fm2MapsMapCard" : "bottom3MapsMapCard", maps.length === 2 ? "fm2MapsMapCardName" : "bottom3MapsMapCardName", FMMapContainerEl))
            } else if (i === 5) {
                // TB
                const tbMap = maps[0]
                TBContainerEl.setAttribute("id", tbMap.beatmapID)
                tbMapCardImageEl.style.backgroundImage = `url("${tbMap.imgURL}")`
                tbMapCardNameEl.innerText = `${tbMap.artist} - ${tbMap.songName}`
                tbMapCardDifficultyEl.innerText = tbMap.difficultyname
                TBContainerEl.addEventListener("click", function(event) {
                    event.preventDefault()
                    handleTeamAction(event, currentRedTeamCode, this)
                })
                TBContainerEl.addEventListener("contextmenu", function(event) {
                    event.preventDefault()
                    handleTeamAction(event, currentBlueTeamCode, this)
                }.bind(this))
            }
        })
    })

const FiveNMMapContainerEl = document.getElementById("FiveNMMapContainer")
const SixNMMapContainer1El = document.getElementById("SixNMMapContainer1")
const SixNMMapContainer2El = document.getElementById("SixNMMapContainer2")
const HDMapContainerEl = document.getElementById("HDMapContainer")
const HRMapContainerEl = document.getElementById("HRMapContainer")
const DTMapContainerEl = document.getElementById("DTMapContainer")
const FMMapContainerEl = document.getElementById("FMMapContainer")
const TBContainerEl = document.getElementsByClassName("TBContainer")[0]
const tbMapCardImageEl = document.getElementById("tbMapCardImage")
const tbMapCardNameEl = document.getElementById("tbMapCardName")
const tbMapCardDifficultyEl = document.getElementById("tbMapCardDifficulty")

const containers = [FiveNMMapContainerEl, SixNMMapContainer2El, HDMapContainerEl, HRMapContainerEl, DTMapContainerEl, FMMapContainerEl]
// Taken from font-awesome
const svgs = {
    protect: `<svg class="pickBanProtectSVG" xmlns="http://www.w3.org/2000/svg" height="25" width="25" viewBox="0 0 512 512"><path fill="#ffffff" d="M256 0c4.6 0 9.2 1 13.4 2.9L457.7 82.8c22 9.3 38.4 31 38.3 57.2c-.5 99.2-41.3 280.7-213.6 363.2c-16.7 8-36.1 8-52.8 0C57.3 420.7 16.5 239.2 16 140c-.1-26.2 16.3-47.9 38.3-57.2L242.7 2.9C246.8 1 251.4 0 256 0z"/></svg>`,
    ban: `<svg class="pickBanProtectSVG" xmlns="http://www.w3.org/2000/svg" height="32" width="24" viewBox="0 0 384 512"><path fill="#ffffff" d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/></svg>`,
    pick: `<svg class="pickBanProtectSVG" xmlns="http://www.w3.org/2000/svg" height="32" width="28" viewBox="0 0 448 512"><path fill="#ffffff" d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"/></svg>`
}
function createMapCard(currentMap, cardClass, nameClass, container) {
	// Create new card
    const newMapCard = document.createElement("div")
    newMapCard.classList.add("mapCard", cardClass)
    newMapCard.setAttribute("id", currentMap.beatmapID)
    newMapCard.addEventListener("click", function (event) {
		event.preventDefault()
		handleTeamAction(event, currentRedTeamCode, this)
	})
    newMapCard.addEventListener("contextmenu", function (event) {
		event.preventDefault()
		handleTeamAction(event, currentBlueTeamCode, this)
	})

    // Top pick ban protect container
    const pickBanProtectContainer = document.createElement("div")
    pickBanProtectContainer.classList.add("pickBanProtectContainer")

	// Top pick ban protect elements
    const pickBanProtectElement = document.createElement("div")
    pickBanProtectElement.classList.add("pickBanProtectElement")
    pickBanProtectContainer.append(pickBanProtectElement)

    const pickBanProtectFlag = document.createElement("div")
    pickBanProtectFlag.classList.add("pickBanProtectFlag")

    const pickBanProtectText = document.createElement("div")
    pickBanProtectText.classList.add("pickBanProtectText")
    pickBanProtectElement.append(pickBanProtectFlag, pickBanProtectText)

	// Bottom left rectangle
    const newMapCardRectangle = document.createElement("div")
    newMapCardRectangle.classList.add("mapCardRectangle")

	// Image and layer
    const mapCardImage = document.createElement("div")
    mapCardImage.classList.add("mapCardImage")
    mapCardImage.style.backgroundImage = `url("${currentMap.imgURL}")`

    const mapCardImageLayer = document.createElement("div")
    mapCardImageLayer.classList.add("mapCardLayer")
    
	// Mod
    const mapCardMod = document.createElement("div")
    mapCardMod.classList.add("normalMapCardMod")
    mapCardMod.innerText = `${currentMap.mod.toUpperCase()}${currentMap.order}`
    mapCardMod.style.color = `var(--${currentMap.mod.toUpperCase()}Colour)`
    mapCardMod.style.textShadow = `0 0 30px var(--${currentMap.mod.toUpperCase()}Colour-60), 0 0 35px var(--${currentMap.mod.toUpperCase()}Colour-80)`

	// Map name
    const mapCardName = document.createElement("div")
    mapCardName.classList.add("mapCardName", nameClass)
    mapCardName.innerText = `${currentMap.artist} - ${currentMap.songName}`

	// Map difficulty
    const mapCardDifficulty = document.createElement("div")
    mapCardDifficulty.classList.add("normalMapCardDifficulty")
    mapCardDifficulty.innerText = currentMap.difficultyname

	// Append everything together
    mapCardImage.append(mapCardImageLayer, mapCardMod)
    newMapCard.append(pickBanProtectContainer, newMapCardRectangle, mapCardImage, mapCardName, mapCardDifficulty)
    container.append(newMapCard)
}
// Red Team
function handleTeamAction(event, teamCode, element) {
    const pickBanProtectContainer = element.children[0]
	const pickBanProtectElement = pickBanProtectContainer.children[0]

    pickBanProtectContainer.classList.remove("pickBanAnimationForwards")
    pickBanProtectContainer.classList.remove("pickBanAnimationBackwards")

	// Remove map
	if (event.shiftKey) {
        pickBanProtectContainer.classList.add("pickBanAnimationBackwards")
        pickBanProtectContainer.style.clipPath = "polygon(0% 0%, 0% 100%, 0% 100%, 0% 0%)"
		return
	}

	// Tiebreaker map
	if (element.id == TBContainerEl.id) return

	// Pick ban Protect String
	let pickBanProtectString
	if (event.ctrlKey) pickBanProtectString = "ban"
    else if (event.altKey) pickBanProtectString = "protect"
    else pickBanProtectString = "pick"

	// Apply information
	pickBanProtectElement.style.backgroundColor = `var(--${pickBanProtectString}Colour)`
	pickBanProtectElement.style.boxShadow = `0 0 20px var(--${pickBanProtectString}Colour)`

	pickBanProtectElement.children[0].style.backgroundImage = `url("https://osuflags.omkserver.nl/${teamCode}-42.png")`
	pickBanProtectElement.children[1].innerText = pickBanProtectString.toUpperCase()
	if (pickBanProtectElement.childElementCount > 2) pickBanProtectElement.children[2].remove()
	pickBanProtectElement.innerHTML += svgs[pickBanProtectString]

    pickBanProtectContainer.classList.add("pickBanAnimationForwards")
    pickBanProtectContainer.style.clipPath = "polygon(0% 0%, 0% 100%, 100% 100%, 100% 0%)"

    // Set cookie
    if (teamCode === currentRedTeamCode) document.cookie = "currentTeamPick=red; path=/"
    else document.cookie = "currentTeamPick=blue; path=/"
}

// Load country data
let allCountries
let allCountriesXhr = new XMLHttpRequest()
allCountriesXhr.open("GET", "http://127.0.0.1:24050/5WC2024/_data/countries.json", false)
allCountriesXhr.onload = function () {
    if (this.status == 404) return
    if (this.status == 200) allCountries = JSON.parse(this.responseText)
}
allCountriesXhr.send()

// Side Bar
// Next Picker
const nextPickerTeam = document.getElementById("nextPickerTeam")
function setNextPicker(colour) {
    nextPickerTeam.innerText = `${colour.toUpperCase()} TEAM`
    nextPickerTeam.style.color = `var(--main${colour})`
}
// Toggle Autopick
const toggleAutoPickButton = document.getElementById("toggleAutoPickButton")
const toggleAutoPickText = document.getElementById("toggleAutoPickText")
function toggleAutoPick() {
    if (toggleAutoPickText.innerText == "ON") {
        toggleAutoPickButton.style.borderColor = "var(--banColour)"
        toggleAutoPickText.style.color = "var(--banColour)"
        toggleAutoPickText.innerText = "OFF"
    } else if (toggleAutoPickText.innerText == "OFF") {
        toggleAutoPickButton.style.borderColor = "var(--pickColour)"
        toggleAutoPickText.style.color = "var(--pickColour)"
        toggleAutoPickText.innerText = "ON"
    }
}

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

// Chat 
const chatContainer = document.getElementById("chatContainer")
let chatLen

// Map Changes
let beatmapID

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
                teamFlagEl.style.backgroundImage = `url("https://osuflags.omkserver.nl/${allCountries[i].code}-181.png")`
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

    // Chat Stuff
    // This is also mostly taken from Victim Crasher: https://github.com/VictimCrasher/static/tree/master/WaveTournament
    if (chatLen !== data.tourney.manager.chat.length) {
        (chatLen === 0 || chatLen > data.tourney.manager.chat.length) ? (chatContainer.innerHTML = "", chatLen = 0) : null;
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

        chatContainer.append(fragment)
        chatLen = data.tourney.manager.chat.length;
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    if (beatmapID !== data.menu.bm.id && data.menu.bm.id !== 0) { 
        beatmapID = data.menu.bm.id

        const targetElement = document.getElementById(`${beatmapID}`);

        if (document.contains(targetElement) && toggleAutoPickText.innerText == "ON") {
            if (nextPickerTeam.innerText == "RED TEAM") {
                targetElement.click()
                setNextPicker('Blue')
            } else if (nextPickerTeam.innerText == "BLUE TEAM") {
                const contextMenuEvent = new Event('contextmenu');
                targetElement.dispatchEvent(contextMenuEvent)
                setNextPicker('Red')
            }
        }
    }
}