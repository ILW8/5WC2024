// honestly should split setting cookie and setting display value into different funcs
const setChannelId = channelId => {
    document.cookie = `currentChannel=${channelId}; path=/`

    if (!currentChannelName)
        return;

    if (parseInt(channelId) === 241444981) currentChannelName.innerText = "1st Channel"
    else currentChannelName.innerText = "2nd Channel"
}

function getCookie(cname) {
    let name = cname + "="
    let ca = document.cookie.split(';')
    for(let i = 0; i < ca.length; i++) {
        let c = ca[i]
        while (c.charAt(0) === ' ') c = c.substring(1)
        if (c.indexOf(name) === 0) return c.substring(name.length, c.length);
    }
    return "";
}

function setCurrentPicker(teamColour) {
    // reset colours
    currentPickerRed.style.color = "white"
    currentPickerRed.style.borderColor = "white"
    currentPickerBlue.style.color = "white"
    currentPickerBlue.style.borderColor = "white"

    // if tiebreaker, nothing happens
    if (pickedByText === "TIEBREAKER") return

    // Set cookie
    document.cookie = `currentTeamPick=${teamColour}; path=/`
    if (teamColour === "red") {
        if (pickedByFlag)
            pickedByFlag.style.backgroundImage = `url("https://osuflags.omkserver.nl/${currentRedTeamCode}-126.png")`;
        currentPickerRed.style.color = "var(--mainRed)"
        currentPickerRed.style.borderColor = "var(--mainRed)"
    } else if (teamColour === "blue") {
        if (pickedByFlag)
            pickedByFlag.style.backgroundImage = `url("https://osuflags.omkserver.nl/${currentBlueTeamCode}-126.png")`;
        currentPickerBlue.style.color = "var(--mainBlue)"
        currentPickerBlue.style.borderColor = "var(--mainBlue)"
    } else if (teamColour === "none" && pickedBy) {
        pickedBy.style.display = "none"
    }
}