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

socket.onmessage = async (event) => {
    const data = JSON.parse(event.data)
    console.log(data)

    // Update team data
    function updateTeamData(teamNameSide, teamFlagEl, teamNameEl, currentTeam) {
        currentTeam = data.tourney.manager.teamName[teamNameSide]
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
                teamFlagEl.style.bacgroundImage = `url("https://osuflags.omkserver.nl/${allCountries[i].code}-181.png")`
                break;
            }
        }
    }
    if (currentRedTeam !== data.tourney.manager.teamName.left) updateTeamData("left", redTeamFlagEl, redTeamNameEl, currentRedTeam)
    if (currentBlueTeam !== data.tourney.manager.teamName.right) updateTeamData("right", blueTeamFlagEl, blueTeamNameEl, currentBlueTeam)
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