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
let showcaseMapsArray
let currentMapSlot = 0
let toMapSlot = 0
let mapSlotDifference = 0
let animTime
const directions = ["InvisibleLeft", "ExtremeLeft", "Left", "Current", "Right", "InvisibleRight"]

const getMaps = fetch("http://127.0.0.1:24050/5WC2024/_data/showcaseBeatmaps.json")
    .then(response => {
        if (!response.ok) throw new Error(`Failed to fetch showcase beatmaps: ${response.status}`)
        return response.json()
    })
    .then(showcaseMaps => {
        document.getElementById("roundName").innerText = showcaseMaps.roundName
        return showcaseMaps.beatmaps
    })
getMaps.then(showcaseMapsArray => {
    showcaseMaps = showcaseMapsArray
    for (let i = 0; i < showcaseMapsArray.length; i++) {
        const newMapTitle = document.createElement("div")
        const newSongName = showcaseMapsArray[i].songName.replace(/ /g, "_")
        const newSongDifficulty = showcaseMapsArray[i].difficulty.replace(/ /g, "_")
        newMapTitle.setAttribute("id", `${newSongName}_${newSongDifficulty}`)
        if (showcaseMapsArray[i].modid.toUpperCase().includes("TB")) newMapTitle.innerText = "TB"
        else newMapTitle.innerText = showcaseMapsArray[i].modid.toUpperCase()
        
        if (i == 0) newMapTitle.classList.add("mapSlideCurrent")
        else if (i == 1) newMapTitle.classList.add("mapSlideRight")
        else newMapTitle.classList.add("mapSlideInvisibleRight")
        nowPlayingMapSlide.append(newMapTitle)
    }
})

// Current map
let currentSongTitle, currentSongDifficulty, currentMd5
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

// Strains
const progressChart = document.getElementById("progress")
let tempStrains, seek, fullTime
let changeStats = false
let statsCheck = false
let last_strain_update = 0

window.onload = function () {
	let ctx = document.getElementById('strain').getContext('2d')
	window.strainGraph = new Chart(ctx, config)

	let ctxProgress = document.getElementById('strainProgress').getContext('2d')
	window.strainGraphProgress = new Chart(ctxProgress, configProgress)
}

socket.onmessage = async (event) => {
    const data = JSON.parse(event.data)

    if (currentSongTitle !== data.menu.bm.metadata.title || currentMd5 !== data.menu.bm.md5) {
        currentSongTitle = data.menu.bm.metadata.title
        currentSongDifficulty = data.menu.bm.metadata.difficulty
        currentMd5 = data.menu.bm.md5
        isMapFound = false

        // set background image
        const currentImage = data.menu.bm.path.full.replace(/#/g,'%23').replace(/%/g,'%25').replace(/\\/g,'/').replace(/'/g, "\\'")
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
                lengthNumberEl.innerText = `${Math.floor(currentLen / 60)}:${(secondsCounter < 10) ? '0': ''}${secondsCounter}`
                break
            }
        }

        // Calculate difference between number of slots
        mapSlotDifference = Math.abs(currentMapSlot - toMapSlot)

        // Moving to next maps in carousel
        function animateMapSlot(searchMap, classesToRemove, classesToAdd) {
            if (document.body.contains(searchMap)) {
                searchMap.classList.remove(classesToRemove)
                classesToAdd.forEach(classAdd => searchMap.classList.add(classAdd))
                searchMap.style.animationDuration = `${animTime}ms`
            }
        }
        if (currentMapSlot < toMapSlot) {
            for (let i = 0; i < mapSlotDifference; i++) {
                removeAnimationClasses()
                animTime = Math.round(1000 / Math.abs(currentMapSlot - toMapSlot))

                for (let j = -2; j <= 2; j++) {
                    const searchMap = allMapSlots[currentMapSlot + j]
                    const fromClass = `mapSlide${directions[j + 3]}`
                    const toClasses = [`from${directions[j + 3]}To${directions[j + 2]}`, `mapSlide${directions[j + 2]}`]

                    animateMapSlot(searchMap, fromClass, toClasses)
                }

                await sleep(animTime)
                currentMapSlot++
            }
        } else if (currentMapSlot > toMapSlot) {
            for (let i = 0; i < mapSlotDifference; i++) {
                removeAnimationClasses()
                animTime = Math.round(1000 / Math.abs(currentMapSlot - toMapSlot))

                for (let j = 1; j >= -3; j--) {
                    const searchMap = allMapSlots[currentMapSlot + j]
                    const fromClass = `mapSlide${directions[directions.length - 3 + j]}`
                    const toClasses = [`from${directions[directions.length - 3 + j]}To${directions[directions.length - 2 + j]}`, `mapSlide${directions[directions.length - 2 + j]}`]

                    animateMapSlot(searchMap, fromClass, toClasses)
                }

                await sleep(animTime)
                currentMapSlot--
            }
        }
    }

    if (!isMapFound) {
        replayerEl.style.display = "none"
        if (currentSR !== data.menu.bm.stats.fullSR) {
            currentSR = data.menu.bm.stats.fullSR
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
            lengthNumberEl.innerText = `${Math.floor(currentLen / 60)}:${(secondsCounter < 10) ? '0': ''}${secondsCounter}`
        }
    }

    if (tempStrains != JSON.stringify(data.menu.pp.strains) && window.strainGraph) {
        tempStrains = JSON.stringify(data.menu.pp.strains)
        if (data.menu.pp.strains) {
            let temp_strains = smooth(data.menu.pp.strains, 5)
			let new_strains = []
			for (let i = 0; i < 60; i++) {
				new_strains.push(temp_strains[Math.floor(i * (temp_strains.length / 60))])
			}
			new_strains = [0, ...new_strains, 0]

			config.data.datasets[0].data = new_strains
			config.data.labels = new_strains
			config.options.scales.y.max = Math.max(...new_strains)
			configProgress.data.datasets[0].data = new_strains
			configProgress.data.labels = new_strains
			configProgress.options.scales.y.max = Math.max(...new_strains)
			window.strainGraph.update()
			window.strainGraphProgress.update()
        } else {
			config.data.datasets[0].data = []
			config.data.labels = []
			configProgress.data.datasets[0].data = []
			configProgress.data.labels = []
			window.strainGraph.update()
			window.strainGraphProgress.update()
		}
    }

    let now = Date.now()
	if (fullTime !== data.menu.bm.time.mp3) { fullTime = data.menu.bm.time.mp3; onepart = 847 / fullTime }
	if (seek !== data.menu.bm.time.current && fullTime && now - last_strain_update > 300) {
		last_strain_update = now
		seek = data.menu.bm.time.current

		if (data.menu.state !== 2) {
			progressChart.style.maskPosition = '-847px 0px'
			progressChart.style.webkitMaskPosition = '-847px 0px'
		}
		else {
			let maskPosition = `${-847 + onepart * seek}px 0px`
			progressChart.style.maskPosition = maskPosition
			progressChart.style.webkitMaskPosition = maskPosition
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
    new Promise((resolve) => {
        for (let i = 0; i < allMapSlots.length; i++) {
            for (let j = 0; j < directions.length - 1; j++) {
                allMapSlots[i].classList.remove(`from${directions[j]}To${directions[j + 1]}`)
                allMapSlots[i].classList.remove(`from${directions[j + 1]}To${directions[j]}`)
            }
        }
        resolve(showcaseMaps)
    })
}

// Set BPM Texts
function setBPMStats() {
    currentMinBPM = Math.round(currentMinBPM * 100) / 100
    currentMaxBPM = Math.round(currentMaxBPM * 100) / 100
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

// Configs are for strain graphs
let config = {
	type: 'line',
	data: {
		labels: [],
		datasets: [{
			borderColor: 'rgba(245, 245, 245, 0)',
			backgroundColor: 'rgb(254, 147, 147)',
			data: [],
			fill: true,
			stepped: false,
		}]
	},
	options: {
		tooltips: { enabled: false },
		legend: { display: false, },
		elements: { point: { radius: 0 } },
		responsive: false,
		scales: {
			x: { display: false, },
			y: {
				display: false,
				min: 0,
				max: 100
			}
		},
		animation: { duration: 0 }
	}
}

let configProgress = {
	type: 'line',
	data: {
		labels: [],
		datasets: [{
			borderColor: 'rgba(245, 245, 245, 0)',
			backgroundColor: 'rgb(254, 36, 86)',
			data: [],
			fill: true,
			stepped: false,
		}]
	},
	options: {
		tooltips: { enabled: false },
		legend: { display: false, },
		elements: { point: { radius: 0 } },
		responsive: false,
		scales: {
			x: { display: false, },
			y: {
				display: false,
				min: 0,
				max: 100
			}
		},
		animation: { duration: 0 }
	}
}

// Join stagetournaments
ComfyJS.Init( "stagetournaments" )
document.cookie = `currentChannel=241444981; path=/`