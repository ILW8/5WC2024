// Socket Events
// Credits: VictimCrasher - https://github.com/VictimCrasher/static/tree/master/WaveTournament
const socket = new ReconnectingWebSocket("ws://" + location.host + "/ws")
socket.onopen = () => { console.log("Successfully Connected") }
socket.onclose = event => { console.log("Socket Closed Connection: ", event); socket.send("Client Closed!") }
socket.onerror = error => { console.log("Socket Error: ", error) }

// Load in maps
const nowPlayingMapSlide = document.getElementById("nowPlayingMapSlide")
let allMapSlots = nowPlayingMapSlide.children
let showcaseMaps
let currentMapSlot = 0
let toMapSlot = 0
let mapSlotDifference = 0
let animTime;
const delay = ms => new Promise(res => setTimeout(res, ms))

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

// Current map
let currentSongTitle, currentSongDifficulty
let isMapFound = false
const replayerEl = document.getElementById("replayer")
const nowPlayingMapEl = document.getElementById("nowPlayingMap")
const replayerUsernameEl = document.getElementById("replayerUsername")
const nowPlayingMapSongNameEl = document.getElementById("nowPlayingMapSongName")
const nowPlayingMapDifficultyNameEl = document.getElementById("nowPlayingMapDifficultyName")
const nowPlayingMapMapperNameEl = document.getElementById("nowPlayingMapMapperName")
let currentSR, currentCS, currentAR, currentOD, currentMinBPM, currentMaxBPM, currentLen
const starRatingNumberEl = document.getElementById("starRatingNumber")
const circleSizeNumberEl = document.getElementById("circleSizeNumber")
const approachRateNumberEl = document.getElementById("approachRateNumber")
const overallDifficultyNumberEl = document.getElementById("overallDifficultyNumber")
const bpmNumberMinEl = document.getElementById("bpmNumberMin")
const bpmDashEl = document.getElementById("bpmDash")
const bpmNumberMaxEl = document.getElementById("bpmNumberMax")
const lengthNumberEl = document.getElementById("lengthNumber")

socket.onmessage = async (event) => {
    const data = JSON.parse(event.data)
    console.log(data)

    if (currentSongTitle !== data.menu.bm.metadata.title || currentSongDifficulty !== data.menu.bm.metadata.difficulty) {
        currentSongTitle = data.menu.bm.metadata.title
        currentSongDifficulty = data.menu.bm.metadata.difficulty
        isMapFound = false

        // set background image
        const currentImage = data.menu.bm.path.full.replace(/#/g,'%23').replace(/%/g,'%25').replace(/\\/g,'/').replace(/'/g, "\\'");
        nowPlayingMapEl.style.backgroundImage = `url('http://${location.host}/Songs/${currentImage}?a=${Math.random(10000)}')`

        // set song name / difficulty / mapper
        nowPlayingMapSongNameEl.innerText = `${data.menu.bm.metadata.artist} - ${currentSongTitle}`
        nowPlayingMapDifficultyNameEl.innerText = `[${currentSongDifficulty}]`
        nowPlayingMapMapperNameEl.innerText = data.menu.bm.metadata.mapper

        // set textSlide class
        nowPlayingDetailTextSlide(nowPlayingMapSongNameEl)
        nowPlayingDetailTextSlide(nowPlayingMapDifficultyNameEl)
        nowPlayingDetailTextSlide(nowPlayingMapMapperNameEl)

        for (let i = 0; i < showcaseMaps.length; i++) {
            if (currentSongTitle == showcaseMaps[i].songName && currentSongDifficulty == showcaseMaps[i].difficulty) {
                // set to map slot for map slot scrolling
                toMapSlot = i
                isMapFound = true

                // set replayer name
                replayerEl.style.display = "block"
                replayerUsernameEl.innerText = showcaseMaps[i].replayer.toUpperCase()

                // Set main stats
                currentSR = Math.round(parseFloat(showcaseMaps[i].sr * 100)) / 100
                currentCS = Math.round(parseFloat(showcaseMaps[i].cs) * 10) / 10
                currentAR = Math.round(parseFloat(showcaseMaps[i].ar) * 10) / 10
                currentOD = Math.round(parseFloat(showcaseMaps[i].od) * 10) / 10
                currentMinBPM = showcaseMaps[i].bpm
                currentMaxBPM = showcaseMaps[i].bpm

                starRatingNumberEl.innerText = `${currentSR}*`
                circleSizeNumberEl.innerText = currentCS
                approachRateNumberEl.innerText = currentAR
                overallDifficultyNumberEl.innerText = currentOD
                setBPMStats()

                // Length
                currentLen = parseInt(showcaseMaps[i].len)
                const secondsCounter = currentLen % 60
                lengthNumberEl.innerText = `${Math.floor(currentLen / 60)}:${(secondsCounter < 10) ? '0': '' + secondsCounter}`
                break
            }
        }

        // Calculate difference between number of slots
        mapSlotDifference = Math.abs(currentMapSlot - toMapSlot)

        // Moving to next maps
        if (currentMapSlot < toMapSlot) {
            for (let i = 0; i < mapSlotDifference; i++) {
                removeAnimationClasses()
                animTime = Math.round(1000 / Math.abs(currentMapSlot - toMapSlot))

                let searchMap = allMapSlots[currentMapSlot - 2]
                if (document.body.contains(searchMap)) {
                    searchMap.classList.remove("mapSlideExtremeLeft")
                    searchMap.classList.add("fromExtremeLeftToInvisibleLeft", "mapSlideInvisibleLeft")
                    searchMap.style.animationDuration = `${animTime}ms`
                }

                searchMap = allMapSlots[currentMapSlot - 1]
                if (document.body.contains(searchMap)) {
                    searchMap.classList.remove("mapSlideLeft")
                    searchMap.classList.add("fromLeftToExtremeLeft", "mapSlideExtremeLeft")
                    searchMap.style.animationDuration = `${animTime}ms`
                }

                searchMap = allMapSlots[currentMapSlot]
                searchMap.classList.remove("mapSlideCurrent")
                searchMap.classList.add("fromCurrentToLeft", "mapSlideLeft")
                searchMap.style.animationDuration = `${animTime}ms`

                searchMap = allMapSlots[currentMapSlot + 1]
                if (document.body.contains(searchMap)) {
                    searchMap.classList.remove("mapSlideRight")
                    searchMap.classList.add("fromRightToCurrent", "mapSlideCurrent")
                    searchMap.style.animationDuration = `${animTime}ms`
                }

                searchMap = allMapSlots[currentMapSlot + 2]
                if (document.body.contains(searchMap)) {
                    searchMap.classList.remove("mapSlideInvisibleRight")
                    searchMap.classList.add("fromInvisibleRightToRight", "mapSlideRight")
                    searchMap.style.animationDuration = `${animTime}ms`
                }

                await delay(animTime)
                currentMapSlot++
            }
        } else if (currentMapSlot > toMapSlot) {
            for (let i = 0; i < mapSlotDifference; i++) {
                removeAnimationClasses()
                animTime = Math.round(1000 / Math.abs(currentMapSlot - toMapSlot))

                let searchMap = allMapSlots[currentMapSlot + 1]
                if (document.body.contains(searchMap)) {
                    searchMap.classList.remove("mapSlideRight")
                    searchMap.classList.add("fromRightToInvisibleRight", "mapSlideInvisibleRight")
                    searchMap.style.animationDuration = `${animTime}ms`
                }

                searchMap = allMapSlots[currentMapSlot]
                searchMap.classList.remove("mapSlideCurrent")
                searchMap.classList.add("fromCurrentToRight", "mapSlideRight")   
                searchMap.style.animationDuration = `${animTime}ms`
                
                searchMap = allMapSlots[currentMapSlot - 1]
                if (document.body.contains(searchMap)) {
                    searchMap.classList.remove("mapSlideLeft")
                    searchMap.classList.add("fromLeftToCurrent", "mapSlideCurrent")
                    searchMap.style.animationDuration = `${animTime}ms`
                }

                searchMap = allMapSlots[currentMapSlot - 2]
                if (document.body.contains(searchMap)) {
                    searchMap.classList.remove("mapSlideExtremeLeft")
                    searchMap.classList.add("fromExtremeLeftToLeft", "mapSlideLeft")
                    searchMap.style.animationDuration = `${animTime}ms`
                }

                searchMap = allMapSlots[currentMapSlot - 3]
                if (document.body.contains(searchMap)) {
                    searchMap.classList.remove("mapSlideInvisibleLeft")
                    searchMap.classList.add("fromInvisibleLeftToExtremeLeft", "mapSlideExtremeLeft")
                    searchMap.style.animationDuration = `${animTime}ms`
                }

                await delay(animTime)
                currentMapSlot--
            }
        }
    }

    if (!isMapFound) {
        replayerEl.style.display = "none"
        if (currentSR !== data.menu.bm.stats.SR) {
            currentSR = data.menu.bm.stats.SR
            starRatingNumberEl.innerText = currentSR
        }
        if (currentCS !== data.menu.bm.stats.CS) {
            currentCS = data.menu.bm.stats.CS
            circleSizeNumberEl.innerText = currentCS
        }
        if (currentAR !== data.menu.bm.stats.AR) {
            currentAR = data.menu.bm.stats.AR
            approachRateNumberEl.innerText = currentAR
        }
        if (currentOD !== data.menu.bm.stats.OD) {
            currentOD = data.menu.bm.stats.OD
            overallDifficultyNumberEl.innerText = currentOD
        }
        if (currentMinBPM !== data.menu.bm.stats.BPM.min || currentMaxBPM !== data.menu.bm.stats.BPM.max) {
            currentMinBPM = data.menu.bm.stats.BPM.min
            currentMaxBPM = data.menu.bm.stats.BPM.max

            setBPMStats()
        }
        const currentSeconds = Math.round(data.menu.bm.time.full / 1000)
        if (currentLen !== currentSeconds) {
            currentLen = currentSeconds
            const secondsCounter = currentLen % 60
            lengthNumberEl.innerText = `${Math.floor(currentLen / 60)}:${(secondsCounter < 10) ? '0': '' + secondsCounter}`
        }
    }
}

// Add or remove textSlide class for each element
function nowPlayingDetailTextSlide(element) {
    if (element.getBoundingClientRect().width > 859) element.classList.add("textSlide")
    else element.classList.remove("textSlide")
}

// Remove All Animation Classes
function removeAnimationClasses() {
    new Promise((resolve, reject) => {
        for (let i = 0; i < allMapSlots.length; i++) {
            allMapSlots[i].classList.remove("fromInvisibleLeftToExtremeLeft")
            allMapSlots[i].classList.remove("fromExtremeLeftToLeft")
            allMapSlots[i].classList.remove("fromLeftToCurrent")
            allMapSlots[i].classList.remove("fromCurrentToRight")
            allMapSlots[i].classList.remove("fromRightToInvisibleRight")
            allMapSlots[i].classList.remove("fromExtremeLeftToInvisibleLeft")
            allMapSlots[i].classList.remove("fromLeftToExtremeLeft")
            allMapSlots[i].classList.remove("fromCurrentToLeft")
            allMapSlots[i].classList.remove("fromRightToCurrent")
            allMapSlots[i].classList.remove("fromInvisibleRightToRight")
        }
        resolve(showcaseMaps)
    })
}

// Set BPM Texts
function setBPMStats() {
    bpmNumberMinEl.innerText = currentMinBPM
    bpmNumberMaxEl.innerText = currentMaxBPM

    if (currentMinBPM == currentMaxBPM) {
        bpmDashEl.style.display = "none"
        bpmNumberMaxEl.style.display = "none"
    } else {
        bpmDashEl.style.display = "inline"
        bpmNumberMaxEl.style.display = "inline"
    }
}

// Sponsor animations
const sponsors = document.getElementById("sponsors")
let currentSponsorIndex = 0
function sponsorAnimations() {
    setInterval(async () => {
        if (sponsors.childElementCount <= currentSponsorIndex) currentSponsorIndex = 0
        const currentSponsor = sponsors.children[currentSponsorIndex]
        currentSponsor.style.opacity = 1
        await delay(5000)
        currentSponsor.style.opacity = 0
        await delay(1000)
        currentSponsorIndex++
    }, 6000)
}
sponsorAnimations()
