// Twitch Chat
const twitchChatContainer = document.getElementById("twitchChatContainer")
const badgeTypes = ["broadcaster", "mod", "vip", "founder", "subscriber"]
ComfyJS.onChat = ( user, message, flags, self, extra ) => {

    // Get rid of nightbot messages
    if (user === "Nightbot") return

    // Put message in if its the correct ahnenl
    if (getCookie("currentChannel") === extra.roomId) {
        // Set up message container
        const twitchChatMessageContainer = document.createElement("div")
        twitchChatMessageContainer.classList.add("chatMessageContainer", "twitchChatMessageContainer", "twitchChatMessage")
        twitchChatMessageContainer.setAttribute("id", extra.id)
        twitchChatMessageContainer.setAttribute("data-twitch-id", extra.userId)

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
}

// Delete message
ComfyJS.onMessageDeleted = (id, extra) => document.getElementById(id).remove()

// Timeout
ComfyJS.onTimeout = ( timedOutUsername, durationInSeconds, extra ) => deleteAllMessagesFromUser(extra.timedOutUserId)

// Ban
ComfyJS.onBan = (bannedUsername, extra) => deleteAllMessagesFromUser(extra.bannedUserId)

// Delete all messages from user
function deleteAllMessagesFromUser(twitchId) {
    const allTwitchChatMessages = Array.from(document.getElementsByClassName("twitchChatMessage"))
    allTwitchChatMessages.forEach((message) => {
        if (message.dataset.twitchId === twitchId) {
            message.remove()
        }
    })
}

// Get Cookie
function getCookie(cname) {
    let name = cname + "="
    let ca = document.cookie.split(';')
    for(let i = 0; i < ca.length; i++) {
        let c = ca[i]
        while (c.charAt(0) == ' ') c = c.substring(1)
        if (c.indexOf(name) == 0) return c.substring(name.length, c.length)
    }
    return ""
}