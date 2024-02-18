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
startInterval()
setInterval(function() {
    startInterval()
}, 120000)