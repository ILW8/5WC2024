// Socket Events
// Credits: VictimCrasher - https://github.com/VictimCrasher/static/tree/master/WaveTournament
const socket = new ReconnectingWebSocket("ws://" + location.host + "/ws")
socket.onopen = () => { console.log("Successfully Connected") }
socket.onclose = event => { console.log("Socket Closed Connection: ", event); socket.send("Client Closed!") }
socket.onerror = error => { console.log("Socket Error: ", error) }

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
            console.log(currentTeam.toLowerCase(), allCountries[i].name.toLowerCase())
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