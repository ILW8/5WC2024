// Sponsor animations
const sleep = ms => new Promise(res => setTimeout(res, ms))
const sponsors = document.getElementById("sponsors")
const sponsoredByText = document.getElementById("sponsoredByText")
let currentSponsorIndex = -1
let intervalId
function startInterval() {
    if (intervalId) clearInterval(intervalId)
  
    intervalId = setInterval(async () => {
        currentSponsorIndex++

        if (sponsors.childElementCount <= currentSponsorIndex) currentSponsorIndex = 0
        const currentSponsor = sponsors.children[currentSponsorIndex]
        console.log("Current Sponsor Index: " + currentSponsorIndex)

        if (document.contains(sponsoredByText) && currentSponsorIndex === 0) sponsoredByText.style.opacity = 1

        currentSponsor.style.opacity = 1
        await sleep(3750)
        if (document.contains(sponsoredByText) && currentSponsorIndex === 1) sponsoredByText.style.opacity = 0
        currentSponsor.style.opacity = 0
        await sleep(750)
    }, 4500)
}
startInterval()
setInterval(function() {
    startInterval()
}, 18000)