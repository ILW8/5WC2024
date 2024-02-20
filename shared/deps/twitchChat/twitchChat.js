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
ComfyJS.Init( "stagetournaments" )