let predictionTeams = []
let playerData
let controlPanelSectionTwo = document.getElementById("controlPanelSectionTwo")

let currentTeamLocation = 0

let setPastName = document.getElementById("pastviewName");
let setPastFlag = document.getElementById("pastviewFlag");

let setPreviewName = document.getElementById("previewName");
let setPreviewFlag = document.getElementById("previewFlag");

let setTeamName = document.getElementById("currentTeamName");
let setTeamFlag = document.getElementById("currentTeamFlag");
let caster1 = document.getElementById("caster1");
let caster2 = document.getElementById("caster2");
let caster3 = document.getElementById("caster3");
let caster4 = document.getElementById("caster4");
let caster5 = document.getElementById("caster5");


let getplayerData = new Promise(async (resolve, reject) => {
    let xhr = new XMLHttpRequest();
    xhr.open("GET","http://localhost:24050/2024Overlay/_data/predictions.json", false);
    xhr.onload = function xhrLoad()  {
        if (this.status == 404) return
        if (this.status == 200) {
        playerData = JSON.parse(this.responseText)
        resolve(playerData);
        }
    }
    xhr.send(); 
})
getplayerData.then(playerData => {
    for (var i = 0; i < playerData.length; i++) {
        let teamObject = []
        teamObject.push(playerData[i].flag_code)
        teamObject.push(playerData[i].country_name)
        predictionTeams.push(teamObject)
        console.log(teamObject)
    }

    // Create Select List
    let selectList = document.createElement("select")
    selectList.setAttribute("id","selectList")

    for (var i = 0; i < predictionTeams.length; i++) {
        let selectOption = document.createElement("option")
        selectOption.setAttribute("value",`${predictionTeams[i]}`)
        selectOption.setAttribute("id",`${predictionTeams[i]}SelectOption`)
        selectOption.innerText = predictionTeams[i]
        selectList.append(selectOption)
    }

    selectList.setAttribute("size",`${selectList.childElementCount}`)
    controlPanelSectionTwo.append(selectList)

    // Set Previous Country Preview
    setPastName.innerText = predictionTeams[predictionTeams.length - 1][1]
    setPastFlag.style.backgroundImage = `url("https://osuflags.omkserver.nl/${predictionTeams[predictionTeams.length - 1][0]}-200.png")`;

    // Set Next Country Preview
    setPreviewName.innerText = predictionTeams[currentTeamLocation + 1][1]
    setPreviewFlag.style.backgroundImage = `url("https://osuflags.omkserver.nl/${predictionTeams[currentTeamLocation + 1][0]}-200.png")`;

    // Set First Country
    setTeamName.innerText = predictionTeams[currentTeamLocation][1];
    //setTeamFlag.style.backgroundImage = `url("static/flags/${predictionTeams[currentTeamLocation]}.png")`;
    setTeamFlag.style.backgroundImage = `url("https://osuflags.omkserver.nl/${predictionTeams[currentTeamLocation][0]}-200.png")`;
    console.log(predictionTeams);
    document.getElementById(`${predictionTeams[currentTeamLocation]}SelectOption`).selected = true

    generateRoster()
})

let compareBox = document.getElementById("compareBox")

function predictionPlacement(caster, string){
    caster.innerText = string;
}

function predictionClear(){
    caster1.innerHTML = ``;
    caster2.innerHTML = ``;
    caster3.innerHTML = ``;
    caster4.innerHTML = ``;
    caster5.innerHTML = ``;
}

function generateRoster() {

    let rightbox = document.querySelectorAll('.rightbox')
    if (rightbox.length > 0) rightbox.forEach(element => element.remove())
    let pointer = document.querySelectorAll('.pointer')
    if (pointer.length > 0) pointer.forEach(element => element.remove())
    let leftbox = document.querySelectorAll('.leftbox')
    if (leftbox.length > 0) leftbox.forEach(element => element.remove())

    let currentTeam = predictionTeams[currentTeamLocation]
    for (var i = 0; i < playerData.length; i++) {
        // Creating Green Boxes
        if (currentTeam == playerData[i].country_name) {
            let playersFromLastYearNotInThisYear = []
            let playersFromLastYearAndThisYear = []
            let playersFromLastYear = []
            let lastyearseed = document.getElementById("lastyearplacement");
            lastyearseed.innerHTML = `Last Year: ${playerData[i].last_seed}`;

            for (var j = 0; j < playerData[i].last_year.length; j++) {
                playersFromLastYear.push(playerData[i].last_year[j][0])
                if (!playerData[i].last_year[j][1]) playersFromLastYearNotInThisYear.push(playerData[i].last_year[j][0])
                else playersFromLastYearAndThisYear.push(playerData[i].last_year[j][0])
            }

            // Generate Right Boxes
            for (var j = 0; j < playerData[i].current_year.length; j++) {
                let rightBox = document.createElement("div")
                rightBox.classList.add("rightbox")
                rightBox.setAttribute("id",`rightPlayer${j+1}`)
                rightBox.innerText = playerData[i].current_year[j]
                rightBox.style.top = `${10 + j * 60}px`
                compareBox.append(rightBox)

                if (!playersFromLastYear.includes(playerData[i].current_year[j])) {
                    let pointer = document.createElement("div")
                    pointer.classList.add("pointer")
                    pointer.setAttribute("id",`pointer${j+1}`)
                    pointer.style.top = `${25 + j * 60}px`
                    compareBox.append(pointer)
                }
            }

            // Generate Left Boxes
            let redBoxCounter = 0
            // Where they are both there
            for (var j = 0; j < playerData[i].current_year.length; j++) {
                if (playerData[i].last_year.length == 0) break
                if (playersFromLastYearAndThisYear.includes(playerData[i].current_year[j])) continue
                let leftBox = document.createElement("div")
                leftBox.classList.add("leftbox")
                leftBox.setAttribute("id",`leftPlayer${j+1}`)
                leftBox.innerText = playersFromLastYearNotInThisYear[redBoxCounter]
                leftBox.style.top = `${10 + j * 60}px`
                compareBox.append(leftBox)
                redBoxCounter++

                // Generating Arrows
                let pointer = document.createElement("div")
                pointer.classList.add("pointer")
                pointer.setAttribute("id",`pointer${j+1}`)
                pointer.style.top = `${25 + j * 60}px`
                compareBox.append(pointer)
            }
            // When they are not there
            let currentNo = j;
            let currentRemaining = playersFromLastYearNotInThisYear.length - redBoxCounter
            if (redBoxCounter < playersFromLastYearNotInThisYear.length) {
                for (var k = 0; k < currentRemaining; k++) {
                    let leftBox = document.createElement("div")
                    leftBox.classList.add("leftbox")
                    leftBox.setAttribute("id",`leftPlayer${j+1}`)
                    leftBox.innerText = playersFromLastYearNotInThisYear[redBoxCounter]
                    leftBox.style.top = `${10 + (currentNo + k)* 60}px`
                    compareBox.append(leftBox)
                    redBoxCounter++

                    // Generating Arrows
                    let pointer = document.createElement("div")
                    pointer.classList.add("pointer")
                    pointer.setAttribute("id",`pointer${j+1}`)
                    pointer.style.top = `${25 + j * 60}px`
                    compareBox.append(pointer)
                }
            }

            // Remove all undefined left boxes
            leftbox = document.querySelectorAll('.leftbox')
            pointer = document.querySelectorAll('.pointer')
            if (leftbox.length > 0) {
                for (var j = 0; j < leftbox.length; j++) {
                    if (leftbox[j].innerText == "undefined") {
                        leftbox[j].remove()
                        pointer[j].remove()
                    }
                }
            }
        }
    }
}

function teamDisplayleft(){
    currentTeamLocation = currentTeamLocation - 1;
    if (currentTeamLocation < 0) {currentTeamLocation = (predictionTeams.length - 1)};

    if (currentTeamLocation == 0) {
        setPastName.innerText = predictionTeams[predictionTeams.length - 1][1];
        setPastFlag.style.backgroundImage = `url("https://osuflags.omkserver.nl/${predictionTeams[predictionTeams.length - 1][0]}-200.png")`;
    }
    else {
        setPastName.innerText = predictionTeams[currentTeamLocation - 1][1];
        setPastFlag.style.backgroundImage = `url("https://osuflags.omkserver.nl/${predictionTeams[currentTeamLocation - 1][0]}-200.png")`;
    }
    
    setTeamName.innerText = predictionTeams[currentTeamLocation][1];
    setTeamFlag.style.backgroundImage = `url("https://osuflags.omkserver.nl/${predictionTeams[currentTeamLocation][0]}-200.png")`;
    document.getElementById(`${predictionTeams[currentTeamLocation]}SelectOption`).selected = true
    
    if (currentTeamLocation == (predictionTeams.length - 1)) {
        setPreviewName.innerText = predictionTeams[0][1];
        setPreviewFlag.style.backgroundImage = `url("https://osuflags.omkserver.nl/${predictionTeams[0][0]}-200.png")`;
    }
    else {
        setPreviewName.innerText = predictionTeams[currentTeamLocation + 1][1];
        setPreviewFlag.style.backgroundImage = `url("https://osuflags.omkserver.nl/${predictionTeams[currentTeamLocation + 1][0]}-200.png")`;
    }
    generateRoster()
}
function teamDisplayright(){
    currentTeamLocation = currentTeamLocation + 1;
    if (currentTeamLocation > (predictionTeams.length - 1)) {currentTeamLocation = 0};

    if (currentTeamLocation == 0){
        setPastName.innerText = predictionTeams[predictionTeams.length - 1][1];
        setPastFlag.style.backgroundImage = `url("https://osuflags.omkserver.nl/${predictionTeams[predictionTeams.length - 1][0]}-200.png")`;
    }
    else {
        setPastName.innerText = predictionTeams[currentTeamLocation - 1][1];
        setPastFlag.style.backgroundImage = `url("https://osuflags.omkserver.nl/${predictionTeams[currentTeamLocation - 1][0]}-200.png")`;
    }
    
    setTeamName.innerText = predictionTeams[currentTeamLocation][1];
    setTeamFlag.style.backgroundImage = `url("https://osuflags.omkserver.nl/${predictionTeams[currentTeamLocation][0]}-200.png")`;
    document.getElementById(`${predictionTeams[currentTeamLocation]}SelectOption`).selected = true

    if (currentTeamLocation == (predictionTeams.length - 1)) {
        setPreviewName.innerText = predictionTeams[0][1];
        setPreviewFlag.style.backgroundImage = `url("https://osuflags.omkserver.nl/${predictionTeams[0][0]}-200.png")`;
    }
    else {
        setPreviewName.innerText = predictionTeams[currentTeamLocation + 1][1];
        setPreviewFlag.style.backgroundImage = `url("https://osuflags.omkserver.nl/${predictionTeams[currentTeamLocation + 1][0]}-200.png")`;
    }
    generateRoster()
}

let socket = new ReconnectingWebSocket("ws://" + location.host + "/ws");
let currentSongImage = document.getElementById("currentSongImage");
let currentSongName = document.getElementById("currentSongName");
let currentSongArtist = document.getElementById("currentSongArtist");
let currentSongID;
socket.onopen = () => console.log("Successfully Connected");
socket.onerror = error => console.log("Socket Error: ", error);
socket.onclose = event => {
    console.log("Socket Closed Connection: ", event);
    socket.send("Client Closed!");
};
socket.onmessage = event => {
    let data = JSON.parse(event.data);
    if (currentSongID !== data.menu.bm.id) {
        currentSongID = data.menu.bm.id
        currentSongImage.style.backgroundImage =  `url("https://assets.ppy.sh/beatmaps/${data.menu.bm.set}/covers/cover.jpg")`
        currentSongTitle.innerText = data.menu.bm.metadata.title
        currentSongArtist.innerText = data.menu.bm.metadata.artist
        if (currentSongTitle.getBoundingClientRect().width > 323) currentSongTitle.classList.add("currentSongTextWrap")
        else currentSongTitle.classList.remove("currentSongTextWrap")

        if (currentSongArtist.getBoundingClientRect().width > 323) currentSongArtist.classList.add("currentSongTextWrap")
        else currentSongArtist.classList.remove("currentSongTextWrap")
    }
}

// All Containers
let onePlaceRow = document.getElementById("onePlaceRow")
let twoPlaceRow = document.getElementById("twoPlaceRow")
let threePlaceRow = document.getElementById("threePlaceRow")
let fourPlaceRow = document.getElementById("fourPlaceRow")
let fivetosixPlaceRow = document.getElementById("fivetosixPlaceRow")
let seventoeightPlaceRow = document.getElementById("seventoeightPlaceRow")
let ninetotwelvePlaceRow = document.getElementById("ninetotwelvePlaceRow")
let thirteentosixteenPlaceRow = document.getElementById("thirteentosixteenPlaceRow")
let seventeentotwentyfourPlaceRow = document.getElementById("seventeentotwentyfourPlaceRow")
let twentyfivetothrirtytwoPlaceRow = document.getElementById("twentyfivetothrirtytwoPlaceRow")
let dnqPlaceRow = document.getElementById("dnqPlaceRow")

let seventeentotwentyfourPlaceRowImages = seventeentotwentyfourPlaceRow.children
let twentyfivetothrirtytwoPlaceRowImages = twentyfivetothrirtytwoPlaceRow.children
let dnqPlaceRowImages = dnqPlaceRow.children

function dnqPlaceRowCheckImageSize(container) {
    if (container.length <= 5) {
        for (var i = 0; i < container.length; i++) {
            container[i].style.width = "70px"
            container[i].style.height = "50.4px"
        }
    } else if (container.length == 6) {
        for (var i = 0; i < container.length; i++) {
            container[i].style.width = "60px"
            container[i].style.height = "43.2px"
        }
    } else if (container.length == 7) {
        for (var i = 0; i < container.length; i++) {
            container[i].style.width = "50px"
            container[i].style.height = "36px"
        }
    } else if (container.length == 8) {
        for (var i = 0; i < container.length; i++) {
            container[i].style.width = "45px"
            container[i].style.height = "32.4px"
        }
    } else if (container.length >= 9 && container.length <= 16) {
        for (var i = 0; i < container.length; i++) {
            container[i].style.width = "40px"
            container[i].style.height = "29.6px"
        }
    } else if (container.length >= 17 && container.length <= 18) {
        for (var i = 0; i < container.length; i++) {
            container[i].style.width = "35px"
            container[i].style.height = "25.2px"
        }
    } else {
        for (var i = 0; i < container.length; i++) {
            container[i].style.width = "30px"
            container[i].style.height = "21.6px"
        }
    }
}

function standardCheckImageSize(container) {
    if (container.length <= 7) {
        for (var i = 0; i < container.length; i++) {
            container[i].style.width = "80px"
            container[i].style.height = "70px"
        }
    } else if (container.length == 8) {
        for (var i = 0; i < container.length; i++) {
            container[i].style.width = "40px"
            container[i].style.height = "29.6px"
        }
    } else if (container.length == 9) {
        for (var i = 0; i < container.length; i++) {
            container[i].style.width = "35px"
            container[i].style.height = "25.2px"
        }
    } else {
        for (var i = 0; i < container.length; i++) {
            container[i].style.width = "30px"
            container[i].style.height = "21.6px"
        }
    }
}

function changeFlagToLocation(number) {
    let selectedFlag = document.getElementById("selectList").value
    // Remove From Previous Element
    let previousImageElement = document.getElementById(`${selectedFlag}TierListImage`)
    let previousImageParentElement = ""
    if (document.contains(previousImageElement)) {
        previousImageParentElement = previousImageElement.parentElement
        previousImageElement.remove()
    }

    // Image Appending
    let newTierListImage = document.createElement("div")
    if (number == 33) newTierListImage.classList.add("tierListBottomRowImage")
    else newTierListImage.classList.add("tierListStandardRowImage")
    console.log(selectedFlag)
    newTierListImage.style.backgroundImage = `url("https://osuflags.omkserver.nl/${selectedFlag[0]+selectedFlag[1]}-200.png")`
    newTierListImage.setAttribute("id",`${selectedFlag}TierListImage`)
    let imageAppendedInto;

    switch (number) {
        case 1: imageAppendedInto = onePlaceRow; break;
        case 2: imageAppendedInto = twoPlaceRow; break;
        case 3: imageAppendedInto = threePlaceRow; break;
        case 4: imageAppendedInto = fourPlaceRow; break;
        case 5: imageAppendedInto = fivetosixPlaceRow; break;
        case 7: imageAppendedInto = seventoeightPlaceRow; break;
        case 9: imageAppendedInto = ninetotwelvePlaceRow; break;
        case 13: imageAppendedInto = thirteentosixteenPlaceRow; break;
        case 17: imageAppendedInto = seventeentotwentyfourPlaceRow; break;
        case 25: imageAppendedInto = twentyfivetothrirtytwoPlaceRow; break;
        case 33: imageAppendedInto = dnqPlaceRow; break;
    }

    imageAppendedInto.append(newTierListImage)

    // Checking Image Sizes For New Page
    if (number == 33) dnqPlaceRowCheckImageSize(dnqPlaceRowImages)
    else if (number == 25) standardCheckImageSize(twentyfivetothrirtytwoPlaceRowImages)
    else if (number == 17) standardCheckImageSize(seventeentotwentyfourPlaceRowImages)

    if (previousImageParentElement == dnqPlaceRow) dnqPlaceRowCheckImageSize(dnqPlaceRowImages)
    else if (previousImageParentElement == twentyfivetothrirtytwoPlaceRow) standardCheckImageSize(twentyfivetothrirtytwoPlaceRowImages)
    else if (previousImageParentElement == seventeentotwentyfourPlaceRow) standardCheckImageSize(seventeentotwentyfourPlaceRowImages)
}

function removeFlag(number) {
    let selectedFlag = document.getElementById(`${document.getElementById("selectList").value}TierListImage`)
    let parentElement

    switch (number) {
        case 1: parentElement = onePlaceRow; break;
        case 2: parentElement = twoPlaceRow; break;
        case 3: parentElement = threePlaceRow; break;
        case 4: parentElement = fourPlaceRow; break;
        case 5: parentElement = fivetosixPlaceRow; break;
        case 7: parentElement = seventoeightPlaceRow; break;
        case 9: parentElement = ninetotwelvePlaceRow; break;
        case 13: parentElement = thirteentosixteenPlaceRow; break;
        case 17: parentElement = seventeentotwentyfourPlaceRow; break;
        case 25: parentElement = twentyfivetothrirtytwoPlaceRow; break;
        case 33: parentElement = dnqPlaceRow; break;
    }

    for (var i = 0; i < parentElement.childElementCount; i++) {
        if (parentElement.children[i] == selectedFlag) {
            selectedFlag.remove()
            break
        }
    }
}